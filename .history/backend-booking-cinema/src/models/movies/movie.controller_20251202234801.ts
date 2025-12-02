import { Request, Response } from "express";
import { Movie } from "./movie.model";
import { validationResult } from "express-validator";
import { MovieDeleteHistory } from "./movieDeleteHistory.model";
import { logShowtime } from "../../utils/showtimes/showtimeLogger";
import { autoShowtimeJob } from "../showtimes/jobs.autoShowtimeJob";
import { AuthRequest } from "middlewares/auth.middleware";
import mongoose from "mongoose";
// Thêm phim
export const createMovie = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: errors.array() });
        return;
    }
    try {
        const { isHot = false } = req.body;
        const movie = new Movie({ ...req.body, isHot });
        await movie.save();
        // 🚀 Nếu phim đang chiếu => tạo suất chiếu ngay
        if (movie.trangThai === "dangChieu") {
            logShowtime(`🚀 Phim mới thêm: ${movie.tieuDe} — tạo suất chiếu ngay`);
            await autoShowtimeJob();
        }
        res.status(201).json({
            message: "🎬 Thêm phim thành công và tạo suất chiếu (nếu đang chiếu)",
            movie,
        });
    } catch (error: any) {
        console.error("❌ Lỗi khi thêm phim:", error);
        res.status(500).json({ message: "Lỗi server khi thêm phim", error: error.message });
    }
};
// Lấy danh sách phim (có filter theo trạng thái)
export const getMovies = async (req: Request, res: Response) => {
    try {
        const { page, limit, keyword } = (req as any).pagination;

        const searchCondition = keyword
            ? { tieuDe: { $regex: keyword, $options: "i" } }
            : {};
        const skip = (page - 1) * limit;
        // 🎬 Query phim đang chiếu
        const queryDangChieu = { ...searchCondition, trangThai: "dangChieu" };
        const moviesDangChieu = await Movie.find(queryDangChieu)
            .skip(skip)
            .limit(limit);
        const totalDangChieu = await Movie.countDocuments(queryDangChieu);
        // 🍿 Query phim sắp chiếu
        const querySapChieu = { ...searchCondition, trangThai: "sapChieu" };
        const moviesSapChieu = await Movie.find(querySapChieu)
            .skip(skip)
            .limit(limit);
        const totalSapChieu = await Movie.countDocuments(querySapChieu);

        // ❤️ Thêm trường likesCount cho từng phim
        const addLikeField = (list: any[]) =>
            list.map((m) => ({
                ...m.toObject(),
                likesCount: m.likes?.length || 0,
            }));

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
    } catch (error: any) {
        console.error("❌ Lỗi khi lấy danh sách phim:", error);
        res.status(500).json({
            message: "Lỗi khi lấy danh sách phim",
            error: error.message,
        });
    }
};
export const getMovieById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const movie = await Movie.findById(id);

        if (!movie) {
            res.status(404).json({ message: "Không tìm thấy phim!" });
            return;
        }

        // 🧠 Kiểm tra người dùng đã thích phim này chưa (nếu có đăng nhập)
        let isLiked = false;
        if (req.user) {
            isLiked = movie.likes.some(
                (u) => u.toString() === req.user!.id.toString()
            );
        }

        // 🟢 Trả về thông tin phim kèm lượt thích & trạng thái thích
        res.status(200).json({
            ...movie.toObject(),
            likesCount: movie.likes.length,
            isLiked,
        });
    } catch (error: any) {
        console.error("❌ Lỗi getMovieById:", error);
        res.status(500).json({
            message: "Lỗi khi lấy phim!",
            error: error.message,
        });
    }
};
// Cập nhật phim
export const updateMovie = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const movie = await Movie.findByIdAndUpdate(id, updateData, { new: true });
        if (!movie) {
            res.status(404).json({ message: "❌ Không tìm thấy phim" });
            return;
        }

        res.status(200).json({
            message: "✅ Cập nhật phim thành công",
            movie,
        });
    } catch (error: any) {
        console.error("❌ Lỗi cập nhật phim:", error);
        res.status(500).json({
            message: "Lỗi server khi cập nhật phim",
            error: error.message,
        });
    }
};
// Xóa phim
export const deleteMovie = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const movie = await Movie.findByIdAndDelete(id);
        if (!movie) res.status(404).json({ message: "Không tìm thấy phim" });
        res.status(200).json({ message: "Xóa phim thành công" });
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi khi xóa phim", error: error.message });
    }
};
// Lịch sử xóa phim
export const getMovieDeleteHistory = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, deletedBy, from, to } = req.query;

        const query: any = {};

        if (deletedBy) query.deletedBy = { $regex: new RegExp(deletedBy as string, "i") };

        if (from && to) {
            query.deletedAt = {
                $gte: new Date(from as string),
                $lte: new Date(to as string),
            };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [data, total] = await Promise.all([
            MovieDeleteHistory.find(query)
                .sort({ deletedAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            MovieDeleteHistory.countDocuments(query),
        ]);

        res.json({
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data,
        });
    } catch (error) {
        console.error("❌ Lỗi khi lấy lịch sử xóa phim:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};
// 🟢 Like / Unlike phim
export const toggleLikeMovie = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Chưa đăng nhập!" });
            return;
        }

        const { id } = req.params;
        const movie = await Movie.findById(id);

        if (!movie) {
            res.status(404).json({ message: "Không tìm thấy phim!" });
            return;
        }

        const userId = new mongoose.Types.ObjectId(req.user.id);
        const alreadyLiked = movie.likes.some((u) => u.toString() === userId.toString());

        if (alreadyLiked) {
            movie.likes = movie.likes.filter((u) => u.toString() !== userId.toString());
        } else {
            movie.likes.push(userId);
        }

        await movie.save();

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
    } catch (err) {
        console.error("❌ Lỗi toggleLikeMovie:", err);
        res.status(500).json({
            message: "Lỗi khi like/unlike phim!",
            error: err,
        });
    }
};