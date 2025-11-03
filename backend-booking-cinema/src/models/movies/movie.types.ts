import { Types } from "mongoose";
export interface IMovie {
    maPhim: number;
    tieuDe: string;
    moTa: string;
    daoDien: string;
    dienVien: string;
    theLoai: string;
    thoiLuong: number;
    ngonNgu: string;
    ngayKhoiChieu: Date;
    danhGia: number;            // Điểm đánh giá (IMDb, hoặc trung bình)
    luotXem: number; 
    Age: number;
    anhPoster: string;
    Trailer: string;
    trangThai: "dangChieu" | "sapChieu";
    isHot: boolean;   
    likes: Types.ObjectId[]
}