import Joi from "joi";
export const createRoomSchema = Joi.object({
    name: Joi.string().required(),
    totalSeats: Joi.number().min(1).required(),
    type: Joi.string().valid("2D", "3D", "IMAX").required(),
});
export const updateRoomSchema = Joi.object({
    name: Joi.string(),
    totalSeats: Joi.number().min(1),
    type: Joi.string().valid("2D", "3D", "IMAX"),
});
export const seatSchema = Joi.object({
    seatNumber: Joi.string().required(),
    type: Joi.string().valid("Normal", "VIP", "Double","Triple").default("Normal"),
    price: Joi.number().min(0).required(),
});
