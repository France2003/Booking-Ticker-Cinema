export type TrangThai = "dangChieu" | "sapChieu";
export interface Movie {
    _id: string;
    maPhim: number;
    tieuDe: string;
    moTa: string;
    daoDien: string;
    dienVien: string;
    theLoai: string;
    thoiLuong?: number;
    ngonNgu: string;
    ngayKhoiChieu: string; // ISO string
    danhGia?: number;
    Age?: number;
    anhPoster: string;
    Trailer: string;
    trangThai: TrangThai;
    isHot?: boolean;
    likesCount?: number;
    isLiked?: boolean;
}
