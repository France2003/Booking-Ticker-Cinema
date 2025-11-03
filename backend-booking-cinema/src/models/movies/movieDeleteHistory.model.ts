import { Schema, model, Document, Types } from "mongoose";

export interface IMovieDeleteHistory extends Document {
    movieId: Types.ObjectId;
    tieuDe: string;
    trangThai: string;
    ngayKhoiChieu?: Date;
    thoiLuong?: number;
    deletedBy?: string;
    reason?: string;
    deletedAt: Date;
}

const MovieDeleteHistorySchema = new Schema<IMovieDeleteHistory>({
    movieId: { type: Schema.Types.ObjectId, ref: "Movie" },
    tieuDe: String,
    trangThai: String,
    ngayKhoiChieu: Date,
    thoiLuong: Number,
    deletedBy: String,
    reason: String,
    deletedAt: { type: Date, default: Date.now },
});

export const MovieDeleteHistory = model<IMovieDeleteHistory>(
    "MovieDeleteHistory",
    MovieDeleteHistorySchema
);
