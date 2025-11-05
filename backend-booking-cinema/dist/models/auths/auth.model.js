"use strict";
//Chứa User schema (cấu trúc lưu trong MongoDB).
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    fullname: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    dateofbirth: { type: Date, required: true, unique: true },
    password: { type: String, required: true },
    trangThai: { type: Boolean, default: true },
    ngayTao: { type: Date, default: Date.now },
    role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });
exports.UserModel = (0, mongoose_1.model)("User", userSchema);
