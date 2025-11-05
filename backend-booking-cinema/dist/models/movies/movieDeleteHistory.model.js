"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieDeleteHistory = void 0;
const mongoose_1 = require("mongoose");
const MovieDeleteHistorySchema = new mongoose_1.Schema({
    movieId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Movie" },
    tieuDe: String,
    trangThai: String,
    ngayKhoiChieu: Date,
    thoiLuong: Number,
    deletedBy: String,
    reason: String,
    deletedAt: { type: Date, default: Date.now },
});
exports.MovieDeleteHistory = (0, mongoose_1.model)("MovieDeleteHistory", MovieDeleteHistorySchema);
