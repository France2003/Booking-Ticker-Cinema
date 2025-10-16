import type { LoginDTO, LoginResponse } from "../../types/authLogin/authLogin";
import api from "../api";
export const loginUser = async (data: LoginDTO) => {
    const response = await api.post<LoginResponse>("/api/auth/login", data, {
        withCredentials: true,
    });
    return response.data;
};
export const loginAdmin = async (data: LoginDTO) => {
    const response = await api.post<LoginResponse>("/api/auth/admin/login", data, {
        withCredentials: true,
    });
    return response.data;
};
export const refreshToken = async (refreshToken: string) => {
    const response = await api.post("/api/auth/refresh-token", {
        refreshToken,
    });
    return response.data;
};
export const forgotPassword = async (email: string) => {
    const res = await api.post("/api/auth/forgot-password", { email });
    return res.data;
};
// Đặt lại mật khẩu với token
export const resetPassword = async (token: string, password: string) => {
    const res = await api.post(`/api/auth/reset-password/${token}`, { password });
    return res.data;
};