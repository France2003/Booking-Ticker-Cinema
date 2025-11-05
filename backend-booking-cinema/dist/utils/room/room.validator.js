"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seatSchema = exports.updateRoomSchema = exports.createRoomSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// ✅ Tạo phòng
exports.createRoomSchema = joi_1.default.object({
    name: joi_1.default.string().required().messages({
        "string.empty": "Tên phòng không được để trống",
        "any.required": "Thiếu tên phòng",
    }),
    type: joi_1.default.string()
        .valid("2D", "3D", "IMAX")
        .required()
        .messages({
        "any.only": "Loại phòng chỉ có thể là 2D, 3D hoặc IMAX",
        "any.required": "Thiếu loại phòng",
    }),
});
// ✅ Cập nhật phòng
exports.updateRoomSchema = joi_1.default.object({
    name: joi_1.default.string().optional(),
    totalSeats: joi_1.default.number().min(1).optional(),
    type: joi_1.default.string().valid("2D", "3D", "IMAX").optional(),
});
// ✅ Schema ghế
exports.seatSchema = joi_1.default.object({
    seatNumber: joi_1.default.string().required().messages({
        "string.empty": "Số ghế không được để trống",
    }),
    type: joi_1.default.string()
        .valid("Normal", "VIP", "Double", "Triple")
        .default("Normal"),
    price: joi_1.default.number().min(0).required().messages({
        "number.base": "Giá ghế phải là số",
        "number.min": "Giá ghế không thể âm",
    }),
});
