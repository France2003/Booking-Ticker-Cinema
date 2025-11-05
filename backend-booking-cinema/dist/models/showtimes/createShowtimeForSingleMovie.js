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
exports.createShowtimeForSingleMovie = void 0;
const showtime_model_1 = require("../../models/showtimes/showtime.model");
const room_model_1 = require("../room/room.model");
const getTimeSlots_1 = require("../../utils/showtimes/getTimeSlots");
const priceCalculator_1 = require("../../utils/showtimes/priceCalculator");
const movieUtils_1 = require("../../utils/showtimes/movieUtils");
const checkShowtime_1 = require("../../utils/showtimes/checkShowtime");
const showtimeLogger_1 = require("../../utils/showtimes/showtimeLogger");
/** 💡 Trọng số cho ngày (cuối tuần nhiều suất hơn) */
const getDayWeight = (weekday) => {
    switch (weekday) {
        case 5: return 1.5; // Thứ 6
        case 6: return 1.8; // Thứ 7
        case 0: return 1.7; // Chủ nhật
        default: return 1.0; // T2–T5
    }
};
const createShowtimeForSingleMovie = (movie) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let rooms = yield room_model_1.Room.find();
        if (!rooms.length) {
            (0, showtimeLogger_1.logShowtime)("⚠️ Không có phòng chiếu nào, tạo phòng mặc định.");
            const defaultRoom = yield room_model_1.Room.create({
                name: "Phòng 1",
                type: "2D",
                seats: Array.from({ length: 50 }, (_, i) => ({
                    seatNumber: `A${i + 1}`,
                    type: "Normal",
                    price: 80000,
                })),
            });
            rooms = [defaultRoom];
        }
        // --- Xử lý mốc ngày chiếu ---
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const releaseDate = movie.ngayKhoiChieu ? new Date(movie.ngayKhoiChieu) : today;
        releaseDate.setHours(0, 0, 0, 0);
        const startDate = releaseDate > today ? releaseDate : today;
        const sunday = new Date(today);
        sunday.setDate(sunday.getDate() + (7 - sunday.getDay() || 7));
        sunday.setHours(0, 0, 0, 0);
        if (startDate > sunday) {
            (0, showtimeLogger_1.logShowtime)(`⏸ Phim ${movie.tieuDe} khởi chiếu sau tuần này (${releaseDate.toLocaleDateString("vi-VN")}) → sẽ được thêm vào tuần kế tiếp.`);
            return;
        }
        // --- Cấu hình phim ---
        const isHot = (0, movieUtils_1.isHotMovie)(movie);
        const maxPerDay = isHot ? 8 : 6;
        const movieTitle = `${isHot ? "🔥" : ""} ${movie.tieuDe}`;
        (0, showtimeLogger_1.logShowtime)(`🎬 Bắt đầu tạo lịch chiếu cho phim mới: ${movieTitle}`);
        let totalCreated = 0;
        // --- Tạo suất chiếu ---
        for (let d = new Date(startDate); d <= sunday; d.setDate(d.getDate() + 1)) {
            const date = new Date(d);
            const weekday = date.getDay();
            const weight = getDayWeight(weekday);
            const timeSlots = (0, getTimeSlots_1.getTimeSlotsForDay)(weekday);
            if (!timeSlots.length)
                continue;
            // Random số phòng chiếu cho ngày này
            const roomCountToday = Math.floor(Math.random() * (isHot ? 3 : 2) + (isHot ? 3 : 2)); // hot: 3–5 phòng, thường: 2–4 phòng
            const randomRooms = [...rooms].sort(() => Math.random() - 0.5).slice(0, roomCountToday);
            (0, showtimeLogger_1.logShowtime)(`📅 ${date.toLocaleDateString("vi-VN")} (${weekday === 0 ? "CN" : `T${weekday + 1}`}) — ${movie.tieuDe} chiếu tại ${randomRooms.length} phòng`);
            for (const room of randomRooms) {
                const randomSlots = [...timeSlots].sort(() => Math.random() - 0.5);
                const dailyLimit = Math.round(maxPerDay * weight);
                let createdForRoom = 0;
                for (const slot of randomSlots) {
                    if (createdForRoom >= dailyLimit)
                        break;
                    const [hour, minute] = slot.split(":").map(Number);
                    const startTime = new Date(date);
                    startTime.setHours(hour, minute, 0, 0);
                    const duration = movie.thoiLuong || 100;
                    const endTime = new Date(startTime.getTime() + (duration + 15) * 60000);
                    if (endTime.getHours() >= 24)
                        continue;
                    // Nếu là phim thường thì giảm xác suất suất chiếu trong giờ vàng
                    if (hour >= 18 && hour <= 22 && !isHot && Math.random() < 0.3)
                        continue;
                    const conflict = yield (0, checkShowtime_1.isShowtimeConflict)(room._id, date, startTime, endTime, movie._id);
                    if (conflict)
                        continue;
                    // --- ✅ Tính giá vé động theo loại phòng, giờ và độ hot --
                    // --- ✅ Tính giá từng ghế theo loại ---
                    const SEAT_MULTIPLIER = {
                        normal: 1.0,
                        vip: 1.3,
                        double: 1.2,
                        triple: 1.5,
                    };
                    const basePrice = priceCalculator_1.BASE_PRICE[room.type] || 80000;
                    const dynamicPrice = (0, priceCalculator_1.getDynamicPrice)(basePrice, hour, isHot);
                    const bookedSeats = room.seats.map((s) => {
                        const seatType = s.type.toLowerCase();
                        const seatMultiplier = SEAT_MULTIPLIER[seatType] || 1;
                        const finalSeatPrice = Math.round((dynamicPrice * seatMultiplier) / 1000) * 1000;
                        return {
                            seatNumber: s.seatNumber,
                            isBooked: false,
                            type: s.type,
                            price: finalSeatPrice,
                        };
                    });
                    // --- Lưu vào database ---
                    yield showtime_model_1.Showtime.create({
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
                    (0, showtimeLogger_1.logShowtime)(`🎥 ${movieTitle} | ${room.name} | ${startTime.toLocaleTimeString("vi-VN", {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                    })} → ${endTime.toLocaleTimeString("vi-VN", {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                    })} | 💰 ${dynamicPrice.toLocaleString("vi-VN")}đ`);
                }
                if (createdForRoom > 0)
                    (0, showtimeLogger_1.logShowtime)(`📽️ ${room.name}: ${createdForRoom}/${dailyLimit} suất cho ${movie.tieuDe}`);
            }
        }
        if (totalCreated)
            (0, showtimeLogger_1.logShowtime)(`✅ Hoàn tất tạo ${totalCreated} suất chiếu cho phim: ${movie.tieuDe}`);
        else
            (0, showtimeLogger_1.logShowtime)(`⚠️ Không có suất chiếu nào được tạo cho phim: ${movie.tieuDe}`);
    }
    catch (err) {
        (0, showtimeLogger_1.logUnknownError)(err, `createShowtimeForSingleMovie(${(movie === null || movie === void 0 ? void 0 : movie.tieuDe) || "unknown"})`);
    }
});
exports.createShowtimeForSingleMovie = createShowtimeForSingleMovie;
