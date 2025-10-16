//khai báo interface hoặc type.
import { Document, Types } from "mongoose";
export interface IUser extends Document {
    _id: Types.ObjectId;
    fullname: string;
    email: string;
    phone: string;
    password: string;
    trangThai: boolean;
    dateofbirth: Date;
    ngayTao: Date;
    role: "user" | "admin";
}
export interface RegisterDTO {
    fullname: string;
    email: string;
    phone: string;
    password: string;
    dateofbirth: string;
}
export interface LoginDTO {
    email: string;
    password: string;
}
export interface TokenPayload {
    id: string;
    role: string;
}
