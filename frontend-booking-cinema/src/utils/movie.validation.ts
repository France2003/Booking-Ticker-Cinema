import type { Movie } from "../types/movies/movie.types";
export const validateMovieForm = (movie: Partial<Movie>): string | null => {
    const requiredFields: (keyof Movie)[] = [
        "maPhim",
        "tieuDe",
        "moTa",
        "daoDien",
        "dienVien",
        "theLoai",
        "thoiLuong",
        "ngonNgu",
        "ngayKhoiChieu",
        "danhGia",
        "Age",
        "trangThai",
    ];
    for (const field of requiredFields as (keyof Movie)[]) {
        if (!movie[field]) {
            return `Vui lòng điền ${field}`;
        }
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (movie.trangThai === "sapChieu" && new Date(movie.ngayKhoiChieu!) <= today) {
        return "Ngày khởi chiếu phim sắp chiếu phải lớn hơn ngày hiện tại";
    }
    if (movie.trangThai === "dangChieu" && new Date(movie.ngayKhoiChieu!) > today) {
        return "Ngày khởi chiếu phim đang chiếu phải nhỏ hơn hoặc bằng ngày hiện tại";
    }

    if (!movie.anhPoster) return "Vui lòng upload Poster";
    if (!movie.Trailer) return "Vui lòng upload Trailer";

    return null; // Hợp lệ
};
