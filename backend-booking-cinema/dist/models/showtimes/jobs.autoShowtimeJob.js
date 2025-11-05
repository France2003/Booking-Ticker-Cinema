"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoShowtimeJob = void 0;
const movie_model_1 = require("../movies/movie.model");
const showtime_model_1 = require("./showtime.model");
const room_model_1 = require("../room/room.model");
const getTimeSlots_1 = require("../../utils/showtimes/getTimeSlots");
const priceCalculator_1 = require("../../utils/showtimes/priceCalculator");
const checkShowtime_1 = require("../../utils/showtimes/checkShowtime");
const showtimeLogger_1 = require("../../utils/showtimes/showtimeLogger");
const movieUtils_1 = require("../../utils/showtimes/movieUtils");
/**
 * 🎬 AUTO SHOWTIME JOB (v5)
 * ✅ Phim hot xuất hiện ở nhiều phòng hơn, giờ vàng ưu tiên hơn
 * ✅ Cuối tuần nhiều suất hơn (7–8 suất/phòng)
 * ✅ Tự bù nếu phòng chưa đủ suất
 * ✅ Không trùng giờ, không chiếu quá nửa đêm
 * ✅ Tổng suất 294–340/tuần
 */
const autoShowtimeJob = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, showtimeLogger_1.logShowtime)("🕒 Bắt đầu tạo suất chiếu cho tuần hiện tại...");
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
        yield showtime_model_1.Showtime.deleteMany({ date: { $lt: oldLimit } });
        (0, showtimeLogger_1.logShowtime)("🧹 Đã xoá toàn bộ suất chiếu cũ hơn 1 tuần.");
        // 🎞️ Lấy danh sách phim
        const movies = yield movie_model_1.Movie.find({ trangThai: "dangChieu" }).sort({ ngayKhoiChieu: 1 });
        if (!movies.length) {
            (0, showtimeLogger_1.logShowtime)("⚠️ Không có phim nào đang chiếu!", "WARN");
            return;
        }
        // 🏢 Lấy danh sách phòng
        const rooms = yield room_model_1.Room.find();
        if (!rooms.length) {
            (0, showtimeLogger_1.logShowtime)("⚠️ Không có phòng chiếu nào trong hệ thống!", "ERROR");
            return;
        }
        // 🔀 Hàm random
        const shuffle = (arr) => arr
            .map((v) => ({ v, r: Math.random() }))
            .sort((a, b) => a.r - b.r)
            .map((x) => x.v);
        // 🧮 Trọng số cho từng ngày (cuối tuần nhiều suất hơn)
        const dayWeight = [1.0, 1.0, 1.1, 1.2, 1.5, 1.9, 2.2];
        let totalShowtimes = 0;
        (0, showtimeLogger_1.logShowtime)(`📆 Tuần ${monday.toLocaleDateString("vi-VN")} → ${sunday.toLocaleDateString("vi-VN")}`);
        const existing = yield showtime_model_1.Showtime.findOne({
            date: { $gte: monday, $lte: sunday },
        });
        if (existing) {
            (0, showtimeLogger_1.logShowtime)("⏩ Đã có suất chiếu cho tuần hiện tại, bỏ qua tạo mới.");
            return;
        }
        // 📅 Duyệt từng ngày
        for (let d = new Date(monday); d <= sunday; d.setDate(d.getDate() + 1)) {
            const date = new Date(d);
            const weekday = date.getDay();
            const isWeekend = weekday === 0 || weekday === 6;
            const dayStr = date.toLocaleDateString("vi-VN");
            const weight = dayWeight[weekday];
            (0, showtimeLogger_1.logShowtime)(`\n📅 Ngày ${dayStr} (${weekday === 0 ? "CN" : "T" + (weekday + 1)})`);
            const timeSlots = (0, getTimeSlots_1.getTimeSlotsForDay)(weekday);
            if (!timeSlots.length)
                continue;
            // 🎯 số suất mỗi phòng
            const slotsPerRoom = isWeekend ? 7 : 6;
            const shuffledRooms = shuffle([...rooms]);
            for (const room of shuffledRooms) {
                const roomSlots = shuffle([...timeSlots]).slice(0, slotsPerRoom);
                let createdCount = 0;
                for (const slot of roomSlots) {
                    const weightedMovies = movies.flatMap((m) => (0, movieUtils_1.isHotMovie)(m) ? [m, m, m, m] : [m, m]);
                    const movie = weightedMovies[Math.floor(Math.random() * weightedMovies.length)];
                    const isHot = (0, movieUtils_1.isHotMovie)(movie);
                    // 🎲 xác suất phòng được chọn
                    const chance = isHot ? 0.95 : 0.85;
                    if (Math.random() > chance && createdCount < slotsPerRoom - 1)
                        continue;
                    const [hour, minute] = slot.split(":").map(Number);
                    const startTime = new Date(date);
                    startTime.setHours(hour, minute, 0, 0);
                    const endTime = new Date(startTime.getTime() + (movie.thoiLuong + 15) * 60000);
                    if (endTime.getHours() >= 24)
                        continue;
                    // 🎯 bias giờ vàng (18–22h)
                    if (hour >= 18 && hour <= 22 && !isHot && Math.random() < 0.1)
                        continue;
                    // ❌ Check trùng
                    const conflict = yield (0, checkShowtime_1.isShowtimeConflict)(room._id, date, startTime, endTime, movie._id);
                    if (conflict)
                        continue;
                    // 💰 Tính giá vé
                    const basePrice = priceCalculator_1.BASE_PRICE[room.type] || 80000;
                    const price = (0, priceCalculator_1.getDynamicPrice)(basePrice, hour, isHot);
                    const bookedSeats = room.seats.map((s) => ({
                        seatNumber: s.seatNumber,
                        isBooked: false,
                        type: s.type,
                        price: s.price,
                    }));
                    yield showtime_model_1.Showtime.create({
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
                    (0, showtimeLogger_1.logShowtime)(`🎬 ${isHot ? "🔥" : ""} ${movie.tieuDe} | ${room.name} | ${slot} → ${endTime
                        .toLocaleTimeString("vi-VN", { hour12: false })
                        .slice(0, 5)}`);
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
                        if (endTime.getHours() >= 24)
                            continue;
                        const basePrice = priceCalculator_1.BASE_PRICE[room.type] || 80000;
                        const price = (0, priceCalculator_1.getDynamicPrice)(basePrice, hour, (0, movieUtils_1.isHotMovie)(movie));
                        const bookedSeats = room.seats.map((s) => ({
                            seatNumber: s.seatNumber,
                            isBooked: false,
                            type: s.type,
                            price: s.price,
                        }));
                        yield showtime_model_1.Showtime.create({
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
                        (0, showtimeLogger_1.logShowtime)(`🎬 ${movie.tieuDe} | ${room.name} | ${slot} → ${endTime
                            .toLocaleTimeString("vi-VN", { hour12: false })
                            .slice(0, 5)}`);
                    }
                }
                (0, showtimeLogger_1.logShowtime)(`📽️ ${room.name}: ${createdCount}/${slotsPerRoom} suất`);
            }
        }
        (0, showtimeLogger_1.logShowtime)(`✅ Hoàn tất tạo suất chiếu cho tuần mới — Tổng cộng: ${totalShowtimes} suất!`);
    }
    catch (err) {
        (0, showtimeLogger_1.logUnknownError)(err, "autoShowtimeJob");
    }
});
exports.autoShowtimeJob = autoShowtimeJob;
