import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getProfile } from "../services/userProfile/userProfile";
import { useNavigate } from "react-router-dom";
export interface User {
    _id: string;
    fullname: string;
    email: string;
    phone?: string;
    role: string;
    avatar?: string;
}

interface UserContextType {
    user: User | null;
    login: (token: string) => Promise<void>;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const navigatory = useNavigate();
    // 🔹 Lấy profile từ API khi có token
    const fetchProfile = async () => {
        try {
            const profile = await getProfile();
            console.log("[UserContext] Loaded profile:", profile);
            setUser(profile);
        } catch (err) {
            console.error("[UserContext] Failed to load profile:", err);
            setUser(null);
        }
    };

    // 🔹 Login: lưu token + gọi profile
    const login = async (token: string) => {
        localStorage.setItem("token", token);
        await fetchProfile();
    };
    // 🔹 Logout: xoá token + reset user
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigatory("/login");
    };
    // 🔹 Tự động fetch profile khi reload trang
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) fetchProfile();
    }, []);

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) {
        throw new Error("useUser must be used within UserProvider");
    }
    return ctx;
};
