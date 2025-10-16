// src/models/movies/movie.validation.ts
import { body, Meta } from "express-validator";
import { Movie } from "./movie.model";
export const validateMovie = [
    body("maPhim")
        .isInt({ min: 1 }).withMessage("Mã phim phải là số nguyên dương")
        .custom(async (value: number) => {
            const existing = await Movie.findOne({ maPhim: value });
            if (existing) {
                throw new Error("Mã phim đã tồn tại");
            }
            return true;
        }),
    body("tieuDe").notEmpty().withMessage("Tiêu đề phim không được để trống"),
    body("daoDien").notEmpty().withMessage("Đạo diễn không được để trống"),
    body("dienVien").notEmpty().withMessage("Diễn viên không được để trống"),
    body("theLoai").notEmpty().withMessage("Thể loại không được để trống"),
    body("thoiLuong").isInt({ min: 1 }).withMessage("Thời lượng phải lớn hơn 0"),
    body("ngayKhoiChieu").isISO8601().withMessage("Ngày khởi chiếu phải đúng định dạng YYYY-MM-DD").custom((value: string, meta: Meta) => {
        const ngayKhoiChieu = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const trangThai = meta.req.body.trangThai;

        if (trangThai === "sapChieu" && ngayKhoiChieu <= today) {
            throw new Error("Ngày khởi chiếu phim sắp chiếu phải lớn hơn ngày hiện tại");
        }
        if (trangThai === "dangChieu" && ngayKhoiChieu > today) {
            throw new Error("Ngày khởi chiếu phim đang chiếu phải nhỏ hơn hoặc bằng ngày hiện tại");
        }
        return true;
    }),

    body("trangThai")
        .isIn(["dangChieu", "sapChieu"])
        .withMessage("Trạng thái chỉ nhận 'dangChieu' hoặc 'sapChieu'")
];
