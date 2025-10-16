import { Document } from "mongoose";

export interface IUser extends Document {
    fullname: string;
    email: string;
    password: string;
    phone?: string;
    dateofbirth?: Date;
    gender?: "Nam" | "Nữ" | "Khác";
    address?: string;
    lichsuDatVe?: string[];
    role: "user" | "admin";
    trangThai?: boolean;
    ngayTao?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
