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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleLikeMovie = exports.getMovieDeleteHistory = exports.deleteMovie = exports.updateMovie = exports.getMovieById = exports.getMovies = exports.createMovie = void 0;
const movie_model_1 = require("./movie.model");
const express_validator_1 = require("express-validator");
const movieDeleteHistory_model_1 = require("./movieDeleteHistory.model");
const showtimeLogger_1 = require("../../utils/showtimes/showtimeLogger");
const jobs_autoShowtimeJob_1 = require("../showtimes/jobs.autoShowtimeJob");
const mongoose_1 = __importDefault(require("mongoose"));
// Thêm phim
const createMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: errors.array() });
        return;
    }
    try {
        const { isHot = false } = req.body;
        const movie = new movie_model_1.Movie(Object.assign(Object.assign({}, req.body), { isHot }));
        yield movie.save();
        // 🚀 Nếu phim đang chiếu => tạo suất chiếu ngay
        if (movie.trangThai === "dangChieu") {
            (0, showtimeLogger_1.logShowtime)(`🚀 Phim mới thêm: ${movie.tieuDe} — tạo suất chiếu ngay`);
            yield (0, jobs_autoShowtimeJob_1.autoShowtimeJob)();
        }
        res.status(201).json({
            message: "🎬 Thêm phim thành công và tạo suất chiếu (nếu đang chiếu)",
            movie,
        });
    }
    catch (error) {
        console.error("❌ Lỗi khi thêm phim:", error);
        res.status(500).json({ message: "Lỗi server khi thêm phim", error: error.message });
    }
});
exports.createMovie = createMovie;
// Lấy danh sách phim (có filter theo trạng thái)
const getMovies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, keyword } = req.pagination;
        const searchCondition = keyword
            ? { tieuDe: { $regex: keyword, $options: "i" } }
            : {};
        const skip = (page - 1) * limit;
        // 🎬 Query phim đang chiếu
        const queryDangChieu = Object.assign(Object.assign({}, searchCondition), { trangThai: "dangChieu" });
        const moviesDangChieu = yield movie_model_1.Movie.find(queryDangChieu)
            .skip(skip)
            .limit(limit);
        const totalDangChieu = yield movie_model_1.Movie.countDocuments(queryDangChieu);
        // 🍿 Query phim sắp chiếu
        const querySapChieu = Object.assign(Object.assign({}, searchCondition), { trangThai: "sapChieu" });
        const moviesSapChieu = yield movie_model_1.Movie.find(querySapChieu)
            .skip(skip)
            .limit(limit);
        const totalSapChieu = yield movie_model_1.Movie.countDocuments(querySapChieu);
        // ❤️ Thêm trường likesCount cho từng phim
        const addLikeField = (list) => list.map((m) => {
            var _a;
            return (Object.assign(Object.assign({}, m.toObject()), { likesCount: ((_a = m.likes) === null || _a === void 0 ? void 0 : _a.length) || 0 }));
        });
        res.status(200).json({
            dangChieu: {
                page,
                limit,
                total: totalDangChieu,
                data: addLikeField(moviesDangChieu),
            },
            sapChieu: {
                page,
                limit,
                total: totalSapChieu,
                data: addLikeField(moviesSapChieu),
            },
        });
    }
    catch (error) {
        console.error("❌ Lỗi khi lấy danh sách phim:", error);
        res.status(500).json({
            message: "Lỗi khi lấy danh sách phim",
            error: error.message,
        });
    }
});
exports.getMovies = getMovies;
const getMovieById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const movie = yield movie_model_1.Movie.findById(id);
        if (!movie) {
            res.status(404).json({ message: "Không tìm thấy phim!" });
            return;
        }
        // 🧠 Kiểm tra người dùng đã thích phim này chưa (nếu có đăng nhập)
        let isLiked = false;
        if (req.user) {
            isLiked = movie.likes.some((u) => u.toString() === req.user.id.toString());
        }
        // 🟢 Trả về thông tin phim kèm lượt thích & trạng thái thích
        res.status(200).json(Object.assign(Object.assign({}, movie.toObject()), { likesCount: movie.likes.length, isLiked }));
    }
    catch (error) {
        console.error("❌ Lỗi getMovieById:", error);
        res.status(500).json({
            message: "Lỗi khi lấy phim!",
            error: error.message,
        });
    }
});
exports.getMovieById = getMovieById;
// Cập nhật phim
const updateMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const movie = yield movie_model_1.Movie.findByIdAndUpdate(id, updateData, { new: true });
        if (!movie) {
            res.status(404).json({ message: "❌ Không tìm thấy phim" });
            return;
        }
        res.status(200).json({
            message: "✅ Cập nhật phim thành công",
            movie,
        });
    }
    catch (error) {
        console.error("❌ Lỗi cập nhật phim:", error);
        res.status(500).json({
            message: "Lỗi server khi cập nhật phim",
            error: error.message,
        });
    }
});
exports.updateMovie = updateMovie;
// Xóa phim
const deleteMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const movie = yield movie_model_1.Movie.findByIdAndDelete(id);
        if (!movie)
            res.status(404).json({ message: "Không tìm thấy phim" });
        res.status(200).json({ message: "Xóa phim thành công" });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa phim", error: error.message });
    }
});
exports.deleteMovie = deleteMovie;
// Lịch sử xóa phim
const getMovieDeleteHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, deletedBy, from, to } = req.query;
        const query = {};
        if (deletedBy)
            query.deletedBy = { $regex: new RegExp(deletedBy, "i") };
        if (from && to) {
            query.deletedAt = {
                $gte: new Date(from),
                $lte: new Date(to),
            };
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [data, total] = yield Promise.all([
            movieDeleteHistory_model_1.MovieDeleteHistory.find(query)
                .sort({ deletedAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            movieDeleteHistory_model_1.MovieDeleteHistory.countDocuments(query),
        ]);
        res.json({
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data,
        });
    }
    catch (error) {
        console.error("❌ Lỗi khi lấy lịch sử xóa phim:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
});
exports.getMovieDeleteHistory = getMovieDeleteHistory;
// 🟢 Like / Unlike phim
const toggleLikeMovie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Chưa đăng nhập!" });
            return;
        }
        const { id } = req.params;
        const movie = yield movie_model_1.Movie.findById(id);
        if (!movie) {
            res.status(404).json({ message: "Không tìm thấy phim!" });
            return;
        }
        const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
        const alreadyLiked = movie.likes.some((u) => u.toString() === userId.toString());
        if (alreadyLiked) {
            movie.likes = movie.likes.filter((u) => u.toString() !== userId.toString());
        }
        else {
            movie.likes.push(userId);
        }
        yield movie.save();
        const likesCount = movie.likes.length;
        // 🔄 Emit realtime tới admin dashboard
        const io = req.app.locals.io;
        if (io) {
            io.emit("movieLikeUpdated", {
                movieId: movie._id,
                likesCount,
            });
        }
        res.json({
            liked: !alreadyLiked,
            likesCount,
        });
    }
    catch (err) {
        console.error("❌ Lỗi toggleLikeMovie:", err);
        res.status(500).json({
            message: "Lỗi khi like/unlike phim!",
            error: err,
        });
    }
});
exports.toggleLikeMovie = toggleLikeMovie;
