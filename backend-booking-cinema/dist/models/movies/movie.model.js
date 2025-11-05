"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.Movie = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const showtime_model_1 = require("../showtimes/showtime.model");
const movieDeleteHistory_model_1 = require("./movieDeleteHistory.model");
const showtimeLogger_1 = require("../../utils/showtimes/showtimeLogger");
const MovieSchema = new mongoose_1.Schema({
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
    likes: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
// 🔧 Middleware xóa phim -> xóa suất chiếu + lưu lịch sử
MovieSchema.pre("findOneAndDelete", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const filter = this.getFilter();
            const movie = yield this.model.findOne(filter);
            if (!movie) {
                (0, showtimeLogger_1.logShowtime)("⚠️ Không tìm thấy phim để xóa.", "ERROR");
                return next();
            }
            const movieId = movie._id;
            const movieTitle = movie.tieuDe || "(Không rõ tiêu đề)";
            // 🧹 Xóa suất chiếu liên quan
            const deletedShowtimes = yield showtime_model_1.Showtime.deleteMany({ movieId });
            // 🧾 Lưu lịch sử xóa
            yield movieDeleteHistory_model_1.MovieDeleteHistory.create({
                movieId,
                tieuDe: movie.tieuDe,
                trangThai: movie.trangThai,
                ngayKhoiChieu: movie.ngayKhoiChieu,
                thoiLuong: movie.thoiLuong,
                deletedBy: "Hệ thống", // Hoặc lấy từ req.user nếu bạn có auth
                reason: "Xóa phim thủ công hoặc hết thời gian chiếu",
            });
            // 🧠 Ghi log ra file
            (0, showtimeLogger_1.logShowtime)([
                "🎬 Đã xóa phim:",
                `📌 ${movieTitle}`,
                `🆔 ${movieId}`,
                `🧹 Số suất chiếu bị xóa: ${deletedShowtimes.deletedCount}`,
                `⏰ Thời điểm: ${new Date().toLocaleString("vi-VN", { hour12: false })}`,
            ].join(" | "));
            next();
        }
        catch (err) {
            (0, showtimeLogger_1.logShowtime)(`❌ Lỗi khi xóa phim và suất chiếu liên quan: ${err}`, "ERROR");
            next(err);
        }
    });
});
exports.Movie = (0, mongoose_1.model)("Movie", MovieSchema);
