import mongoose from "mongoose";
import { Showtime } from "../../models/showtimes/showtime.model";

export const isShowtimeConflict = async (
    roomId: mongoose.Types.ObjectId,
    date: Date,
    startTime: Date,
    endTime: Date,
    movieId?: mongoose.Types.ObjectId
): Promise<boolean> => {
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
    const roomConflict = await Showtime.exists({
        roomId,
        date: { $gte: dayStart, $lte: dayEnd },
        $or: [
            // bắt đầu trước khi kết thúc và kết thúc sau khi bắt đầu
            { startTime: { $lt: endWithBuffer, $gte: startWithBuffer } },
            { endTime: { $gt: startWithBuffer, $lte: endWithBuffer } },
            { $and: [{ startTime: { $lte: startWithBuffer } }, { endTime: { $gte: endWithBuffer } }] },
        ],
    });

    if (roomConflict) return true;

    // =============== 2️⃣ Kiểm tra trùng cùng phim khác phòng ===============
    if (movieId) {
        // ⏱️ Cho phép chiếu lại nếu cách nhau ≥ 3 giờ
        const minGapMs = 3 * 60 * 60 * 1000;
        const gapStart = new Date(startTime.getTime() - minGapMs);
        const gapEnd = new Date(endTime.getTime() + minGapMs);

        const sameMovieConflict = await Showtime.exists({
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

        if (sameMovieConflict) return true;
    }

    return false;
};
