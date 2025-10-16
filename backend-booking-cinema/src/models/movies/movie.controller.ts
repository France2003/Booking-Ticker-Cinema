import { Request, Response } from "express";
import { Movie } from "./movie.model";
import { validationResult } from "express-validator";
// Thêm phim
export const createMovie = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Dữ liệu không hợp lệ",
            errors: errors.array(),
        });
    }
    try {
        const movie = new Movie(req.body);
        await movie.save();

        res.status(201).json({
            message: "Thêm phim thành công",
            movie,
        });
    } catch (error: any) {
        console.error("❌ Lỗi khi thêm phim:", error);
        res.status(500).json({
            message: "Lỗi khi thêm phim",
            error: error.message,
        });
    }
};
// Lấy danh sách phim (có filter theo trạng thái)
export const getMovies = async (req: Request, res: Response) => {
    try {
        const { page, limit, keyword } = (req as any).pagination;
        const searchCondition = keyword
            ? { tieuDe: { $regex: keyword, $options: "i" } }
            : {};
        const queryDangChieu = { ...searchCondition, trangThai: "dangChieu" };
        const querySapChieu = { ...searchCondition, trangThai: "sapChieu" };
        // Count tổng số
        const totalDangChieu = await Movie.countDocuments(queryDangChieu);
        const totalSapChieu = await Movie.countDocuments(querySapChieu);
        // Lấy danh sách phim theo phân trang
        const moviesDangChieu = await Movie.find(queryDangChieu)
            .skip((page - 1) * limit)
            .limit(limit);

        const moviesSapChieu = await Movie.find(querySapChieu)
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            dangChieu: {
                page,
                limit,
                total: totalDangChieu,
                data: moviesDangChieu,
            },
            sapChieu: {
                page,
                limit,
                total: totalSapChieu,
                data: moviesSapChieu,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách phim", error: error.message });
    }
};
export const getMovieById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const movie = await Movie.findById(id);

        if (!movie) {
            res.status(404).json({ message: "Không tìm thấy phim" });
            return;
        }
        res.status(200).json(movie);
    } catch (error: any) {
        res.status(500).json({ message: "Lỗi khi lấy phim", error: error.message });
    }
};
// Cập nhật phim
export const updateMovie = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const movie = await Movie.findByIdAndUpdate(id, req.body, { new: true });
        if (!movie) res.status(404).json({ message: "Không tìm thấy phim" });
        res.status(200).json({ message: "Cập nhật thành công", movie: updateMovie });
    } catch (error: any) {
        res.status(400).json({ message: "Lỗi khi cập nhật phim", error: error.message });
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
