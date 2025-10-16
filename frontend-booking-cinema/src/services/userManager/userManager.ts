import api from "../api";
import type { User } from "../../types/userManager/userManage";
export const getAllUsers = async (token: string): Promise<User[]> => {
    const res = await api.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
export const getUserById = async (id: string, token: string): Promise<User> => {
    const res = await api.get(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
}
export const toggleUserStatus = async (id: string, token: string) => {
    const res = await api.patch(`/api/users/${id}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
export const deleteUser = async (id: string, token: string) => {
    const res = await api.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
