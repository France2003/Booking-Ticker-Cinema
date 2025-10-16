export interface User {
    _id: string;
    tenDangNhap: string;
    email: string;
    fullname: string;
    phone: string;
    dateofbirth?: string;
    gender?: string;
    address?: string;
    lichsuDatVe?: string[];
    createdAt: string;
    trangThai: boolean;
    role: "user" | "admin";
}
