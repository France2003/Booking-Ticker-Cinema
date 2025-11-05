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
exports.getShowtimeSeats = exports.deleteAllShowtimes = exports.getShowtimesByRoom = exports.getShowtimesByMovieAndDate = exports.getShowtimesByMovie = exports.getShowtimeById = exports.getAllShowtimes = void 0;
const showtime_model_1 = require("./showtime.model");
const movie_model_1 = require("../movies/movie.model");
const room_model_1 = require("../room/room.model");
const getAllShowtimes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const showtimes = yield showtime_model_1.Showtime.find()
            .populate("movieId", "tieuDe theLoai isHot thoiLuong anhPoster")
            .populate("roomId", "name type")
            .sort({ date: 1, startTime: 1 });
        res.status(200).json({
            message: "Danh sách tất cả suất chiếu",
            total: showtimes.length,
            data: showtimes,
        });
    }
    catch (error) {
        console.error("❌ Lỗi lấy suất chiếu:", error);
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getAllShowtimes = getAllShowtimes;
;
const getShowtimeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const showtime = yield showtime_model_1.Showtime.findById(req.params.id)
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
    }
    catch (error) {
        console.error("❌ Lỗi lấy suất chiếu:", error);
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getShowtimeById = getShowtimeById;
/** 🎥 Lấy tất cả suất chiếu theo phim */
const getShowtimesByMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { movieId } = req.params;
        const movie = yield movie_model_1.Movie.findById(movieId);
        if (!movie) {
            res.status(404).json({ message: "Không tìm thấy phim" });
            return;
        }
        const showtimes = yield showtime_model_1.Showtime.find({ movieId })
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
    }
    catch (error) {
        console.error("❌ getShowtimesByMovie:", error);
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getShowtimesByMovie = getShowtimesByMovie;
/** 🗓️ Lấy suất chiếu theo phim và ngày */
const getShowtimesByMovieAndDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { movieId } = req.params;
        const { date } = req.query;
        if (!date) {
            res.status(400).json({ message: "Thiếu tham số ?date=yyyy-mm-dd" });
            return;
        }
        const d = new Date(date);
        const next = new Date(d);
        next.setDate(d.getDate() + 1);
        const showtimes = yield showtime_model_1.Showtime.find({
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
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getShowtimesByMovieAndDate = getShowtimesByMovieAndDate;
/** 🏢 Lấy suất chiếu theo phòng */
const getShowtimesByRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId } = req.params;
        const room = yield room_model_1.Room.findById(roomId);
        if (!room) {
            res.status(404).json({ message: "Không tìm thấy phòng" });
            return;
        }
        const showtimes = yield showtime_model_1.Showtime.find({ roomId })
            .populate("movieId", "tieuDe theLoai isHot")
            .sort({ date: 1, startTime: 1 });
        res.status(200).json({
            message: `Danh sách suất chiếu tại phòng ${room.name}`,
            total: showtimes.length,
            data: showtimes,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getShowtimesByRoom = getShowtimesByRoom;
const deleteAllShowtimes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield showtime_model_1.Showtime.deleteMany({});
        res.status(200).json({
            message: `Đã xóa toàn bộ ${result.deletedCount} suất chiếu trong hệ thống.`,
        });
    }
    catch (error) {
        console.error("❌ Lỗi khi xóa toàn bộ suất chiếu:", error);
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
});
exports.deleteAllShowtimes = deleteAllShowtimes;
//trả về sơ đồ ghế theo suất chiếu.
const getShowtimeSeats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const showtime = yield showtime_model_1.Showtime.findById(req.params.id)
            .populate("movieId", "tieuDe anhPoster thoiLuong isHot")
            .populate("roomId", "name type");
        if (!showtime) {
            res.status(404).json({ message: "Không tìm thấy suất chiếu" });
            return;
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
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
});
exports.getShowtimeSeats = getShowtimeSeats;
