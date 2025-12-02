import mongoose from "mongoose";
import { Showtime } from "../../models/showtimes/showtime.model";
import { Room } from "../room/room.model";
import { getTimeSlotsForDay } from "../../utils/showtimes/getTimeSlots";
import { getDynamicPrice, BASE_PRICE } from "../../utils/showtimes/priceCalculator";
import { isHotMovie } from "../../utils/showtimes/movieUtils";
import { isShowtimeConflict } from "../../utils/showtimes/checkShowtime";
import { logShowtime, logUnknownError } from "../../utils/showtimes/showtimeLogger";

/** 💡 Trọng số cho ngày (cuối tuần có nhiều suất hơn) */
const getDayWeight = (weekday: number): number => {
    switch (weekday) {
        case 5:
            return 1.5; // Thứ 6
        case 6:
            return 1.8; // Thứ 7
        case 0:
            return 1.7; // Chủ nhật
        default:
            return 1.0; // T2–T5
    }
};
export const createShowtimeForSingleMovie = async (movie: any): Promise<void> => {
    try {
        let rooms = await Room.find();

        // Nếu chưa có phòng -> tạo mặc định
        if (!rooms.length) {
            logShowtime("⚠️ Không có phòng chiếu nào, tạo phòng mặc định...");
            const defaultRoom = await Room.create({
                name: "Phòng 1",
                type: "2D",
                seats: Array.from({ length: 50 }, (_, i) => ({
                    seatNumber: `A${i + 1}`,
                    type: "Normal",
                    price: 40000,
                })),
            });
            rooms = [defaultRoom];
        }

        // 🕒 Xác định thời gian khởi chiếu
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const releaseDate = movie.ngayKhoiChieu ? new Date(movie.ngayKhoiChieu) : today;
        releaseDate.setHours(0, 0, 0, 0);

        const startDate = releaseDate > today ? releaseDate : today;

        const sunday = new Date(today);
        sunday.setDate(sunday.getDate() + (7 - sunday.getDay() || 7));
        sunday.setHours(0, 0, 0, 0);

        if (startDate > sunday) {
            logShowtime(`⏸ Phim ${movie.tieuDe} khởi chiếu sau tuần này → sẽ lên lịch tuần kế.`);
            return;
        }

        // 🔥 Phim hot => nhiều suất hơn
        const isHot = isHotMovie(movie);
        const maxPerDay = isHot ? 8 : 6;
        const movieTitle = `${isHot ? "🔥" : ""} ${movie.tieuDe}`;
        logShowtime(`🎬 Tạo lịch chiếu cho phim: ${movieTitle}`);

        let totalCreated = 0;

        // Vòng lặp từng ngày trong tuần
        for (let d = new Date(startDate); d <= sunday; d.setDate(d.getDate() + 1)) {
            const date = new Date(d);
            const weekday = date.getDay();
            const weight = getDayWeight(weekday);

            const timeSlots = getTimeSlotsForDay(weekday);
            if (!timeSlots.length) continue;

            const roomCountToday = Math.floor(Math.random() * (isHot ? 3 : 2) + (isHot ? 3 : 2));
            const randomRooms = [...rooms].sort(() => Math.random() - 0.5).slice(0, roomCountToday);

            logShowtime(
                `📅 ${date.toLocaleDateString("vi-VN")} — ${movie.tieuDe} chiếu tại ${randomRooms.length} phòng`
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

                    // Nếu không hot thì giảm tỉ lệ suất giờ vàng
                    if (hour >= 18 && hour <= 22 && !isHot && Math.random() < 0.3) continue;

                    // Kiểm tra trùng suất chiếu
                    const conflict = await isShowtimeConflict(
                        room._id as mongoose.Types.ObjectId,
                        date,
                        startTime,
                        endTime,
                        movie._id
                    );
                    if (conflict) continue;

                    // 💰 Tính giá động theo giờ và loại phòng
                    const basePrice = BASE_PRICE[room.type as keyof typeof BASE_PRICE] || 60000;
                    const weekday = date.getDay();
                    const dynamicPrice = getDynamicPrice(basePrice, hour, isHot, weekday);
                    // 🎟️ Hệ số loại ghế
                    const SEAT_MULTIPLIER = {
                        Normal: 1.0,
                        VIP: 1.35,
                        Double: 1.3,
                        Triple: 1.5,
                    } as const;
                    // 🪑 Tính lại giá từng ghế
                    const bookedSeats = room.seats.map((s) => {
                        const rawType = (s.type || "").toUpperCase();
                        let seatKey: keyof typeof SEAT_MULTIPLIER = "Normal";
                        switch (rawType) {
                            case "VIP":
                                seatKey = "VIP";
                                break;
                            case "DOUBLE":
                                seatKey = "Double";
                                break;
                            case "TRIPLE":
                                seatKey = "Triple";
                                break;
                            default:
                                seatKey = "Normal";
                                break;
                        }

                        const seatMultiplier = SEAT_MULTIPLIER[seatKey];

                        const finalSeatPrice = Math.round((dynamicPrice * seatMultiplier) / 1000) * 1000;
                        // console.log(
                        //     `💺 ${s.seatNumber} (${seatKey}) => ${finalSeatPrice.toLocaleString("vi-VN")}đ (Dynamic ${dynamicPrice.toLocaleString("vi-VN")}đ)`
                        // );
                        return {
                            seatNumber: s.seatNumber,
                            isBooked: false,
                            type: seatKey,
                            price: finalSeatPrice,
                        };

                    });

                    // 💾 Lưu suất chiếu
                    await Showtime.create({
                        movieId: movie._id,
                        roomId: room._id,
                        date,
                        startTime,
                        endTime,
                        price: dynamicPrice,
                        bookedSeats,
                    });

                    createdForRoom++;
                    totalCreated++;

                    logShowtime(
                        `🎥 ${movie.tieuDe} | ${room.name} | ${startTime.toLocaleTimeString("vi-VN", {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit",
                        })} → ${endTime.toLocaleTimeString("vi-VN", {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit",
                        })} | 💰 ${dynamicPrice.toLocaleString("vi-VN")}đ`
                    );
                }

                if (createdForRoom > 0)
                    logShowtime(`📽️ ${room.name}: ${createdForRoom}/${dailyLimit} suất.`);
            }
        }

        if (totalCreated)
            logShowtime(`✅ Hoàn tất tạo ${totalCreated} suất chiếu cho phim: ${movie.tieuDe}`);
        else logShowtime(`⚠️ Không tạo được suất chiếu cho phim: ${movie.tieuDe}`);
    } catch (err: unknown) {
        logUnknownError(err, `createShowtimeForSingleMovie(${movie?.tieuDe || "unknown"})`);
    }
};
