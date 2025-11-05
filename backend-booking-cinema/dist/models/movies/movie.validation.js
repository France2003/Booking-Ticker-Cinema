"use strict";
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
exports.validateMovie = void 0;
// src/models/movies/movie.validation.ts
const express_validator_1 = require("express-validator");
const movie_model_1 = require("./movie.model");
exports.validateMovie = [
    (0, express_validator_1.body)("maPhim")
        .isInt({ min: 1 }).withMessage("Mã phim phải là số nguyên dương")
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        const existing = yield movie_model_1.Movie.findOne({ maPhim: value });
        if (existing) {
            throw new Error("Mã phim đã tồn tại");
        }
        return true;
    })),
    (0, express_validator_1.body)("tieuDe").notEmpty().withMessage("Tiêu đề phim không được để trống"),
    (0, express_validator_1.body)("daoDien").notEmpty().withMessage("Đạo diễn không được để trống"),
    (0, express_validator_1.body)("dienVien").notEmpty().withMessage("Diễn viên không được để trống"),
    (0, express_validator_1.body)("theLoai").notEmpty().withMessage("Thể loại không được để trống"),
    (0, express_validator_1.body)("thoiLuong").isInt({ min: 1 }).withMessage("Thời lượng phải lớn hơn 0"),
    (0, express_validator_1.body)("ngayKhoiChieu").isISO8601().withMessage("Ngày khởi chiếu phải đúng định dạng YYYY-MM-DD").custom((value, meta) => {
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
    (0, express_validator_1.body)("trangThai")
        .isIn(["dangChieu", "sapChieu"])
        .withMessage("Trạng thái chỉ nhận 'dangChieu' hoặc 'sapChieu'")
];
