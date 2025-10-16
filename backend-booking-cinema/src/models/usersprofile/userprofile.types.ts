import { Document } from "mongoose";

export interface IUser extends Document {
    fullname: string;
    email: string;
    password: string;
    phone?: string;
    dateofbirth?: Date;
    avatar?: string;
    gender?: "Nam" | "Nữ" | "Khác";
    address?: string;
    role: "user" | "admin";
    trangThai?: boolean;
    ngayTao?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
