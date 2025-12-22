//Lấy dữ liệu từ req.body
import { Request, Response } from "express";
import * as AuthService from "../auths/auth.service";
import { successResponse, errorResponse } from "../../utils/response";
import bcrypt from "bcryptjs";
import { UserModel } from "./auth.model";
import sendMail from "../../utils/sendMail";
import jwt from "jsonwebtoken";
import { resetPasswordTemplate } from "../../utils/resetPasswordTemplate";
import { generateRefreshToken, generateToken } from "../../utils/jwt";
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await AuthService.register(req.body);
        successResponse(res, { user }, "Người dùng đã đăng ký thành công");
    } catch (err: any) {
        if (err.message.includes("Email") || err.message.includes("số điện thoại")) {
            errorResponse(res, err.message, 400);
        }
        errorResponse(res, "Lỗi server", 500);
    }
};
export const loginUser = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.login(req.body);
        successResponse(res, result, "Đăng nhập thành công");
    } catch (err: any) {
        errorResponse(res, err.message, 401);
    }
};
///Admin
export const Admin = async (req: Request, res: Response): Promise<void> => {
    try {
        // Kiểm tra xem admin đã tồn tại chưa
        const existingAdmin = await UserModel.findOne({ role: "admin" });
        if (existingAdmin) {
            res.status(400).json({ message: "Admin đã tồn tại!" });
            return;
        }
        const hashedPassword = await bcrypt.hash("admin123", 10);
        const admin = new UserModel({
            email: "admin@cinema.com",
            phone: "0000000000",
            password: hashedPassword,
            role: "admin",
        });
        await admin.save();
        res.json({ message: "Quản trị viên đã tạo thành công", admin });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Lỗi máy chủ nội bộ" });
    }
};
export const loginAdmin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const admin = await UserModel.findOne({ email, role: "admin" });
    if (!admin) throw new Error("Tài khoản admin không tồn tại");
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error("Sai mật khẩu");
    const token = generateToken({ id: admin._id.toString(), role: "admin" });
    const refreshToken = generateRefreshToken({ id: admin._id.toString(), role: "admin" });
    successResponse(res, { token, refreshToken, admin }, "Đăng nhập admin thành công");
};
// Gửi mail quên mật khẩu
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            res.status(404).json({ message: "Email không tồn tại" });
            return;
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
            expiresIn: "15m",
        });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        // Gửi mail
        await sendMail(
            email,
            "Đặt lại mật khẩu",
            resetPasswordTemplate(resetLink)
        );
        res.json({ message: "Đã gửi email đặt lại mật khẩu" });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Lỗi server" });
    }
};
// Đặt lại mật khẩu
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password) {
            res.status(400).json({ message: "Thiếu token hoặc mật khẩu" });
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        const hashed = await bcrypt.hash(password, 10);
        await UserModel.findByIdAndUpdate(decoded.id, { password: hashed });
        res.json({ message: "Đặt lại mật khẩu thành công" });
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            res.status(400).json({ message: "Token đã hết hạn" });
            return;
        }
        res.status(500).json({ message: error.message || "Lỗi server" });
    }
};

