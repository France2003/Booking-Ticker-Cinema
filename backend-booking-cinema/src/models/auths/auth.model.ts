//Chứa User schema (cấu trúc lưu trong MongoDB).

import { Schema, model } from "mongoose";
import { IUser } from "../auths/auth.types";
const userSchema = new Schema<IUser>(
    {
        fullname: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true, unique: true },
        dateofbirth: { type: Date,required: true, unique: true },
        password: { type: String, required: true },
        trangThai: { type: Boolean, default: true },
        ngayTao: { type: Date, default: Date.now },
        role: { type: String, enum: ["user", "admin"], default: "user" },
    },
    { timestamps: true }
);
export const UserModel = model<IUser>("User", userSchema);
