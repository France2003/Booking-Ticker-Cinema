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
exports.isShowtimeConflict = void 0;
const showtime_model_1 = require("../../models/showtimes/showtime.model");
const isShowtimeConflict = (roomId, date, startTime, endTime, movieId) => __awaiter(void 0, void 0, void 0, function* () {
    // 🔹 Giới hạn trong cùng ngày
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    // 🔹 Buffer tránh trùng sát nhau
    const bufferMs = 5 * 60 * 1000;
    const startWithBuffer = new Date(startTime.getTime() - bufferMs);
    const endWithBuffer = new Date(endTime.getTime() + bufferMs);
    // =============== 1️⃣ Kiểm tra trùng giờ trong cùng phòng ===============
    const roomConflict = yield showtime_model_1.Showtime.exists({
        roomId,
        date: { $gte: dayStart, $lte: dayEnd },
        $or: [
            // bắt đầu trước khi kết thúc và kết thúc sau khi bắt đầu
            { startTime: { $lt: endWithBuffer, $gte: startWithBuffer } },
            { endTime: { $gt: startWithBuffer, $lte: endWithBuffer } },
            { $and: [{ startTime: { $lte: startWithBuffer } }, { endTime: { $gte: endWithBuffer } }] },
        ],
    });
    if (roomConflict)
        return true;
    // =============== 2️⃣ Kiểm tra trùng cùng phim khác phòng ===============
    if (movieId) {
        // ⏱️ Cho phép chiếu lại nếu cách nhau ≥ 3 giờ
        const minGapMs = 3 * 60 * 60 * 1000;
        const gapStart = new Date(startTime.getTime() - minGapMs);
        const gapEnd = new Date(endTime.getTime() + minGapMs);
        const sameMovieConflict = yield showtime_model_1.Showtime.exists({
            movieId,
            roomId: { $ne: roomId },
            date: { $gte: dayStart, $lte: dayEnd },
            $or: [
                { startTime: { $lt: endWithBuffer, $gte: startWithBuffer } },
                { endTime: { $gt: startWithBuffer, $lte: endWithBuffer } },
                { $and: [{ startTime: { $lte: startWithBuffer } }, { endTime: { $gte: endWithBuffer } }] },
                { startTime: { $lt: gapEnd, $gt: gapStart } },
            ],
        });
        if (sameMovieConflict)
            return true;
    }
    return false;
});
exports.isShowtimeConflict = isShowtimeConflict;
