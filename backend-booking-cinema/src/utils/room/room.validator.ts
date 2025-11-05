import Joi from "joi";

// ✅ Tạo phòng
export const createRoomSchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": "Tên phòng không được để trống",
        "any.required": "Thiếu tên phòng",
    }),
    type: Joi.string()
        .valid("2D", "3D", "IMAX")
        .required()
        .messages({
            "any.only": "Loại phòng chỉ có thể là 2D, 3D hoặc IMAX",
            "any.required": "Thiếu loại phòng",
        }),
});

// ✅ Cập nhật phòng
export const updateRoomSchema = Joi.object({
    name: Joi.string().optional(),
    totalSeats: Joi.number().min(1).optional(),
    type: Joi.string().valid("2D", "3D", "IMAX").optional(),
});

// ✅ Schema ghế
export const seatSchema = Joi.object({
    seatNumber: Joi.string().required().messages({
        "string.empty": "Số ghế không được để trống",
    }),
    type: Joi.string()
        .valid("Normal", "VIP", "Double", "Triple")
        .default("Normal"),
    price: Joi.number().min(0).required().messages({
        "number.base": "Giá ghế phải là số",
        "number.min": "Giá ghế không thể âm",
    }),
});
