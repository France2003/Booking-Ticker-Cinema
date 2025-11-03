import mongoose from "mongoose";
import { Movie } from "../movies/movie.model";
import { Showtime } from "./showtime.model";
import { Room } from "../room/room.model";
import { getTimeSlotsForDay } from "../../utils/showtimes/getTimeSlots";
import { getDynamicPrice, BASE_PRICE } from "../../utils/showtimes/priceCalculator";
import { isShowtimeConflict } from "../../utils/showtimes/checkShowtime";
import { logShowtime, logUnknownError } from "../../utils/showtimes/showtimeLogger";
import { isHotMovie } from "../../utils/showtimes/movieUtils";

/**
 * 🎬 AUTO SHOWTIME JOB (v5)
 * ✅ Phim hot xuất hiện ở nhiều phòng hơn, giờ vàng ưu tiên hơn
 * ✅ Cuối tuần nhiều suất hơn (7–8 suất/phòng)
 * ✅ Tự bù nếu phòng chưa đủ suất
 * ✅ Không trùng giờ, không chiếu quá nửa đêm
 * ✅ Tổng suất 294–340/tuần
 */
export const autoShowtimeJob = async (): Promise<void> => {
    try {
        logShowtime("🕒 Bắt đầu tạo suất chiếu cho tuần hiện tại...");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 📅 Xác định đầu & cuối tuần
        const monday = new Date(today);
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        // 🧹 Xoá suất chiếu cũ hơn 1 tuần
        const oldLimit = new Date(monday);
        oldLimit.setDate(oldLimit.getDate() - 7);
        await Showtime.deleteMany({ date: { $lt: oldLimit } });
        logShowtime("🧹 Đã xoá toàn bộ suất chiếu cũ hơn 1 tuần.");

        // 🎞️ Lấy danh sách phim
        const movies = await Movie.find({ trangThai: "dangChieu" }).sort({ ngayKhoiChieu: 1 });
        if (!movies.length) {
            logShowtime("⚠️ Không có phim nào đang chiếu!", "WARN");
            return;
        }

        // 🏢 Lấy danh sách phòng
        const rooms = await Room.find();
        if (!rooms.length) {
            logShowtime("⚠️ Không có phòng chiếu nào trong hệ thống!", "ERROR");
            return;
        }

        // 🔀 Hàm random
        const shuffle = <T>(arr: T[]): T[] =>
            arr
                .map((v) => ({ v, r: Math.random() }))
                .sort((a, b) => a.r - b.r)
                .map((x) => x.v);

        // 🧮 Trọng số cho từng ngày (cuối tuần nhiều suất hơn)
        const dayWeight = [1.0, 1.0, 1.1, 1.2, 1.5, 1.9, 2.2];

        let totalShowtimes = 0;
        logShowtime(`📆 Tuần ${monday.toLocaleDateString("vi-VN")} → ${sunday.toLocaleDateString("vi-VN")}`);
        const existing = await Showtime.findOne({
            date: { $gte: monday, $lte: sunday },
        });

        if (existing) {
            logShowtime("⏩ Đã có suất chiếu cho tuần hiện tại, bỏ qua tạo mới.");
            return;
        }

        // 📅 Duyệt từng ngày
        for (let d = new Date(monday); d <= sunday; d.setDate(d.getDate() + 1)) {
            const date = new Date(d);
            const weekday = date.getDay();
            const isWeekend = weekday === 0 || weekday === 6;
            const dayStr = date.toLocaleDateString("vi-VN");
            const weight = dayWeight[weekday];

            logShowtime(`\n📅 Ngày ${dayStr} (${weekday === 0 ? "CN" : "T" + (weekday + 1)})`);

            const timeSlots = getTimeSlotsForDay(weekday);
            if (!timeSlots.length) continue;

            // 🎯 số suất mỗi phòng
            const slotsPerRoom = isWeekend ? 7 : 6;
            const shuffledRooms = shuffle([...rooms]);

            for (const room of shuffledRooms) {
                const roomSlots = shuffle([...timeSlots]).slice(0, slotsPerRoom);
                let createdCount = 0;

                for (const slot of roomSlots) {
                    const weightedMovies = movies.flatMap((m) =>
                        isHotMovie(m) ? [m, m, m, m] : [m, m]
                    );
                    const movie = weightedMovies[Math.floor(Math.random() * weightedMovies.length)];
                    const isHot = isHotMovie(movie);

                    // 🎲 xác suất phòng được chọn
                    const chance = isHot ? 0.95 : 0.85;
                    if (Math.random() > chance && createdCount < slotsPerRoom - 1) continue;

                    const [hour, minute] = slot.split(":").map(Number);
                    const startTime = new Date(date);
                    startTime.setHours(hour, minute, 0, 0);
                    const endTime = new Date(startTime.getTime() + (movie.thoiLuong + 15) * 60000);
                    if (endTime.getHours() >= 24) continue;

                    // 🎯 bias giờ vàng (18–22h)
                    if (hour >= 18 && hour <= 22 && !isHot && Math.random() < 0.1) continue;

                    // ❌ Check trùng
                    const conflict = await isShowtimeConflict(
                        room._id as mongoose.Types.ObjectId,
                        date,
                        startTime,
                        endTime,
                        movie._id
                    );
                    if (conflict) continue;

                    // 💰 Tính giá vé
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

                    createdCount++;
                    totalShowtimes++;

                    logShowtime(
                        `🎬 ${isHot ? "🔥" : ""} ${movie.tieuDe} | ${room.name} | ${slot} → ${endTime
                            .toLocaleTimeString("vi-VN", { hour12: false })
                            .slice(0, 5)}`
                    );
                }

                // 🧩 Bổ sung suất nếu phòng chưa đủ
                if (createdCount < slotsPerRoom) {
                    const missing = slotsPerRoom - createdCount;
                    const availableSlots = shuffle([...timeSlots]).slice(0, missing);

                    for (const slot of availableSlots) {
                        const movie = movies[Math.floor(Math.random() * movies.length)];
                        const [hour, minute] = slot.split(":").map(Number);
                        const startTime = new Date(date);
                        startTime.setHours(hour, minute, 0, 0);
                        const endTime = new Date(startTime.getTime() + (movie.thoiLuong + 15) * 60000);
                        if (endTime.getHours() >= 24) continue;

                        const basePrice = BASE_PRICE[room.type as keyof typeof BASE_PRICE] || 80000;
                        const price = getDynamicPrice(basePrice, hour, isHotMovie(movie));

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

                        createdCount++;
                        totalShowtimes++;
                        logShowtime(
                            `🎬 ${movie.tieuDe} | ${room.name} | ${slot} → ${endTime
                                .toLocaleTimeString("vi-VN", { hour12: false })
                                .slice(0, 5)}`
                        );
                    }
                }

                logShowtime(`📽️ ${room.name}: ${createdCount}/${slotsPerRoom} suất`);
            }
        }

        logShowtime(`✅ Hoàn tất tạo suất chiếu cho tuần mới — Tổng cộng: ${totalShowtimes} suất!`);
    } catch (err: unknown) {
        logUnknownError(err, "autoShowtimeJob");
    }
};
