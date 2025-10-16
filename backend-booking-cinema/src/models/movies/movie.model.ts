import { Schema, model, Document } from "mongoose";
import { IMovie } from "./movie.types";
export interface IMovieDocument extends IMovie, Document { }
const MovieSchema = new Schema<IMovieDocument>(
    {
        maPhim: { type: Number, required: true, unique: true },
        tieuDe: { type: String, required: true },
        moTa: { type: String },
        daoDien: { type: String },
        dienVien: { type: String },
        theLoai: { type: String },
        thoiLuong: { type: Number },
        ngonNgu: { type: String },
        ngayKhoiChieu: { type: Date },
        danhGia: { type: String },
        Age: { type: Number },
        anhPoster: { type: String },
        Trailer: { type: String },
        trangThai: {
            type: String,
            enum: ["dangChieu", "sapChieu"],
            required: true,
        },
    },
    { timestamps: true }
);
export const Movie = model<IMovieDocument>("Movie", MovieSchema);
