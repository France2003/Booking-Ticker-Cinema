import { Request, Response } from "express";
import { Showtime } from "./showtime.model";
import { Movie } from "../movies/movie.model";
import { Room } from "../room/room.model";
export const getAllShowtimes = async (req: Request, res: Response): Promise<void> => {
    try {
        const showtimes = await Showtime.find()
            .populate("movieId", "tieuDe theLoai isHot thoiLuong anhPoster")
            .populate("roomId", "name type")
            .sort({ date: 1, startTime: 1 });

        res.status(200).json({
            message: "Danh sách tất cả suất chiếu",
            total: showtimes.length,
            data: showtimes,
        });
    } catch (error: any) {
        console.error("❌ Lỗi lấy suất chiếu:", error);
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};;
export const getShowtimeById = async (req: Request, res: Response): Promise<void> => {
    try {
        const showtime = await Showtime.findById(req.params.id)
            .populate("movieId", "tieuDe theLoai thoiLuong isHot anhPoster")
            .populate("roomId", "name type");

        if (!showtime) {
            res.status(404).json({ message: "Không tìm thấy suất chiếu" });
            return;
        }

        res.status(200).json({
            message: "Chi tiết suất chiếu",
            data: showtime,
        });
    } catch (error: any) {
        console.error("❌ Lỗi lấy suất chiếu:", error);
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};
/** 🎥 Lấy tất cả suất chiếu theo phim */
export const getShowtimesByMovie = async (req: Request, res: Response): Promise<void> => {
    try {
        const { movieId } = req.params;

        const movie = await Movie.findById(movieId);
        if (!movie) {
            res.status(404).json({ message: "Không tìm thấy phim" });
            return;
        }
        const showtimes = await Showtime.find({ movieId })
            .populate("roomId", "name type")
            .sort({ date: 1, startTime: 1 });

        // 🧠 Dùng host thật thay vì localhost cố định
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        if (movie.anhPoster && !movie.anhPoster.startsWith("http")) {
            movie.anhPoster = `${baseUrl}${movie.anhPoster.startsWith("/") ? movie.anhPoster : "/" + movie.anhPoster}`;
        }
        res.status(200).json({
            message: `Danh sách suất chiếu cho phim: ${movie.tieuDe}`,
            total: showtimes.length,
            movie,
            data: showtimes,
        });
    } catch (error: any) {
        console.error("❌ getShowtimesByMovie:", error);
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};
/** 🗓️ Lấy suất chiếu theo phim và ngày */
export const getShowtimesByMovieAndDate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { movieId } = req.params;
        const { date } = req.query;

        if (!date) {
            res.status(400).json({ message: "Thiếu tham số ?date=yyyy-mm-dd" });
            return;
        }

        const d = new Date(date as string);
        const next = new Date(d);
        next.setDate(d.getDate() + 1);

        const showtimes = await Showtime.find({
            movieId,
            startTime: { $gte: d, $lt: next },
        })
            .populate("roomId", "name type")
            .sort({ startTime: 1 });

        res.status(200).json({
            message: `Danh sách suất chiếu phim theo ngày ${d.toDateString()}`,
            total: showtimes.length,
            data: showtimes,
        });
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};
/** 🏢 Lấy suất chiếu theo phòng */
export const getShowtimesByRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId } = req.params;

        const room = await Room.findById(roomId);
        if (!room) {
            res.status(404).json({ message: "Không tìm thấy phòng" });
            return;
        }

        const showtimes = await Showtime.find({ roomId })
            .populate("movieId", "tieuDe theLoai isHot")
            .sort({ date: 1, startTime: 1 });

        res.status(200).json({
            message: `Danh sách suất chiếu tại phòng ${room.name}`,
            total: showtimes.length,
            data: showtimes,
        });
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};
export const deleteAllShowtimes = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await Showtime.deleteMany({});
        res.status(200).json({
            message: `Đã xóa toàn bộ ${result.deletedCount} suất chiếu trong hệ thống.`,
        });
    } catch (error: any) {
        console.error("❌ Lỗi khi xóa toàn bộ suất chiếu:", error);
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};
//trả về sơ đồ ghế theo suất chiếu.
export const getShowtimeSeats = async (req: Request, res: Response): Promise<void> => {
    try {
        const showtime = await Showtime.findById(req.params.id)
            .populate("movieId", "tieuDe anhPoster thoiLuong isHot")
            .populate("roomId", "name type");

        if (!showtime) {
            res.status(404).json({ message: "Không tìm thấy suất chiếu" });
            return
        }

        res.status(200).json({
            message: "Lấy thông tin ghế thành công",
            showtime: {
                _id: showtime._id,
                date: showtime.date,
                startTime: showtime.startTime,
                endTime: showtime.endTime,
                price: showtime.price,
                movieId: showtime.movieId,
                roomId: showtime.roomId,
                seats: showtime.bookedSeats, // ✅ dùng ghế thật có giá động
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};
