import mongoose, { Schema, model, Document, Types } from "mongoose";
import { IMovie } from "./movie.types";
import { Showtime } from "../showtimes/showtime.model";
import { MovieDeleteHistory } from "./movieDeleteHistory.model";
import { logShowtime } from "../../utils/showtimes/showtimeLogger";

export interface IMovieDocument extends IMovie, Document {
    _id: Types.ObjectId;
}

const MovieSchema = new Schema<IMovieDocument>(
    {
        maPhim: { type: Number, required: true, unique: true },
        tieuDe: { type: String, required: true },
        moTa: String,
        daoDien: String,
        dienVien: String,
        theLoai: String,
        thoiLuong: Number,
        ngonNgu: String,
        ngayKhoiChieu: Date,
        danhGia: { type: Number, default: 0 },
        luotXem: { type: Number, default: 0 },
        Age: Number,
        anhPoster: String,
        Trailer: String,
        trangThai: {
            type: String,
            enum: ["dangChieu", "sapChieu"],
            required: true,
        },
        isHot: { type: Boolean, default: false },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

// 🔧 Middleware xóa phim -> xóa suất chiếu + lưu lịch sử
MovieSchema.pre("findOneAndDelete", async function (next) {
    try {
        const filter = this.getFilter();
        const movie = await this.model.findOne(filter);
        if (!movie) {
            logShowtime("⚠️ Không tìm thấy phim để xóa.", "ERROR");
            return next();
        }

        const movieId = movie._id;
        const movieTitle = movie.tieuDe || "(Không rõ tiêu đề)";

        // 🧹 Xóa suất chiếu liên quan
        const deletedShowtimes = await Showtime.deleteMany({ movieId });

        // 🧾 Lưu lịch sử xóa
        await MovieDeleteHistory.create({
            movieId,
            tieuDe: movie.tieuDe,
            trangThai: movie.trangThai,
            ngayKhoiChieu: movie.ngayKhoiChieu,
            thoiLuong: movie.thoiLuong,
            deletedBy: "Hệ thống", // Hoặc lấy từ req.user nếu bạn có auth
            reason: "Xóa phim thủ công hoặc hết thời gian chiếu",
        });

        // 🧠 Ghi log ra file
        logShowtime(
            [
                "🎬 Đã xóa phim:",
                `📌 ${movieTitle}`,
                `🆔 ${movieId}`,
                `🧹 Số suất chiếu bị xóa: ${deletedShowtimes.deletedCount}`,
                `⏰ Thời điểm: ${new Date().toLocaleString("vi-VN", { hour12: false })}`,
            ].join(" | ")
        );

        next();
    } catch (err) {
        logShowtime(`❌ Lỗi khi xóa phim và suất chiếu liên quan: ${err}`, "ERROR");
        next(err as any);
    }
});

export const Movie = model<IMovieDocument>("Movie", MovieSchema);
