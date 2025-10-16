import mongoose, { Schema } from "mongoose";
import { IUser } from "./userManager.type";

const userSchema = new Schema<IUser>(
    {
        fullname: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String },
        dateofbirth: { type: Date },
        gender: { type: String, enum: ["Nam", "Nữ", "Khác"], default: "Khác" },
        address: { type: String, default: "" },
        lichsuDatVe: [String],
        role: { type: String, enum: ["user", "admin"], default: "user" },
        trangThai: { type: Boolean, default: true },
        ngayTao: { type: Date, default: Date.now },
    },
    { timestamps: true }
);
delete mongoose.models.User;
export const UserModel =
    mongoose.models.User || mongoose.model<IUser>("User", userSchema);
