import mongoose from "mongoose";
import { Showtime } from "../../models/showtimes/showtime.model";
import { Room } from "../room/room.model";
import { getTimeSlotsForDay } from "../../utils/showtimes/getTimeSlots";
import { getDynamicPrice, BASE_PRICE } from "../../utils/showtimes/priceCalculator";
import { isHotMovie } from "../../utils/showtimes/movieUtils";
import { isShowtimeConflict } from "../../utils/showtimes/checkShowtime";
import { logShowtime, logUnknownError } from "../../utils/showtimes/showtimeLogger";

/** 💡 Trọng số cho ngày (cuối tuần nhiều suất hơn) */
const getDayWeight = (weekday: number): number => {
    switch (weekday) {
        case 5: return 1.5; // Thứ 6
        case 6: return 1.8; // Thứ 7
        case 0: return 1.7; // Chủ nhật
        default: return 1.0; // T2–T5
    }
};
export const createShowtimeForSingleMovie = async (movie: any): Promise<void> => {
    try {
        let rooms = await Room.find();
        if (!rooms.length) {
            logShowtime("⚠️ Không có phòng chiếu nào, tạo phòng mặc định.");
            const defaultRoom = await Room.create({
                name: "Phòng 1",
                type: "2D",
                seats: Array.from({ length: 50 }, (_, i) => ({
                    seatNumber: `A${i + 1}`,
                    type: "normal",
                    price: 80000,
                })),
            });
            rooms = [defaultRoom];
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const releaseDate = movie.ngayKhoiChieu ? new Date(movie.ngayKhoiChieu) : today;
        releaseDate.setHours(0, 0, 0, 0);
        const startDate = releaseDate > today ? releaseDate : today;

        const sunday = new Date(today);
        sunday.setDate(sunday.getDate() + (7 - sunday.getDay() || 7));
        sunday.setHours(0, 0, 0, 0);

        if (startDate > sunday) {
            logShowtime(
                `⏸ Phim ${movie.tieuDe} khởi chiếu sau tuần này (${releaseDate.toLocaleDateString(
                    "vi-VN"
                )}) → sẽ được thêm vào tuần kế tiếp.`
            );
            return;
        }

        const isHot = isHotMovie(movie);
        const maxPerDay = isHot ? 8 : 6;
        const movieTitle = `${isHot ? "🔥" : ""} ${movie.tieuDe}`;
        logShowtime(`🎬 Bắt đầu tạo lịch chiếu cho phim mới: ${movieTitle}`);

        let totalCreated = 0;

        for (let d = new Date(startDate); d <= sunday; d.setDate(d.getDate() + 1)) {
            const date = new Date(d);
            const weekday = date.getDay();
            const weight = getDayWeight(weekday);

            const timeSlots = getTimeSlotsForDay(weekday);
            if (!timeSlots.length) continue;

            // 🎲 Random số phòng chiếu hôm nay cho phim này
            const roomCountToday = Math.floor(
                Math.random() * (isHot ? 3 : 2) + (isHot ? 3 : 2) // hot: 3–5 phòng, thường: 2–4 phòng
            );
            const randomRooms = [...rooms].sort(() => Math.random() - 0.5).slice(0, roomCountToday);

            logShowtime(
                `📅 ${date.toLocaleDateString("vi-VN")} (${weekday === 0 ? "CN" : `T${weekday + 1}`}) — ${movie.tieuDe} chiếu tại ${randomRooms.length} phòng`
            );

            for (const room of randomRooms) {
                const randomSlots = [...timeSlots].sort(() => Math.random() - 0.5);
                const dailyLimit = Math.round(maxPerDay * weight);
                let createdForRoom = 0;

                for (const slot of randomSlots) {
                    if (createdForRoom >= dailyLimit) break;

                    const [hour, minute] = slot.split(":").map(Number);
                    const startTime = new Date(date);
                    startTime.setHours(hour, minute, 0, 0);

                    const duration = movie.thoiLuong || 100;
                    const endTime = new Date(startTime.getTime() + (duration + 15) * 60000);
                    if (endTime.getHours() >= 24) continue;

                    // giờ vàng: hot ưu tiên, thường giảm tần suất
                    if (hour >= 18 && hour <= 22 && !isHot && Math.random() < 0.3) continue;

                    const conflict = await isShowtimeConflict(
                        room._id as mongoose.Types.ObjectId,
                        date,
                        startTime,
                        endTime,
                        movie._id
                    );
                    if (conflict) continue;

                    const basePrice = BASE_PRICE[room.type as keyof typeof BASE_PRICE] || 80000;
                    const price = getDynamicPrice(basePrice, hour, isHot);

                    const bookedSeats = room.seats.map((s) => ({
                        seatNumber: s.seatNumber,
                        isBooked: false,
                        type: s.type,
                        price: s.price,
                    }));

                    await Showtime.create({
                        movieId: movie._id,
                        roomId: room._id,
                        date,
                        startTime,
                        endTime,
                        price,
                        bookedSeats,
                    });

                    createdForRoom++;
                    totalCreated++;

                    logShowtime(
                        `🎥 ${movieTitle} | ${room.name} | ${startTime.toLocaleTimeString("vi-VN", {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit",
                        })} → ${endTime.toLocaleTimeString("vi-VN", {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit",
                        })} | 💰 ${price.toLocaleString("vi-VN")}đ`
                    );
                }

                if (createdForRoom > 0)
                    logShowtime(`📽️ ${room.name}: ${createdForRoom}/${dailyLimit} suất cho ${movie.tieuDe}`);
            }
        }

        if (totalCreated)
            logShowtime(`✅ Hoàn tất tạo ${totalCreated} suất chiếu cho phim: ${movie.tieuDe}`);
        else logShowtime(`⚠️ Không có suất chiếu nào được tạo cho phim: ${movie.tieuDe}`);
    } catch (err: unknown) {
        logUnknownError(err, `createShowtimeForSingleMovie(${movie?.tieuDe || "unknown"})`);
    }
};
