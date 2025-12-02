import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
interface JwtPayload {
  role?: string;
  exp?: number;
}

/**
 * Bảo vệ các route admin.
 * - Kiểm tra token trong localStorage.
 * - Giải mã token để lấy role.
 * - Nếu role !== "admin" hoặc token hết hạn → redirect.
 */
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // ❌ Chưa đăng nhập
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    // Kiểm tra hạn token
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    // Kiểm tra role
    if (decoded.role !== "admin") {
      return <Navigate to="/" replace />;
    }

    // ✅ Là admin
    return <>{children}</>;
  } catch (err) {
    console.error("Lỗi giải mã token:", err);
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute;
