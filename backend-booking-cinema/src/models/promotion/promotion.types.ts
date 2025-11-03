export interface IPromotion {
    tenKhuyenMai: string
    maCode?: string
    loai: "percent" | "fixed" | "voucher" | "event" // thêm event cho các ưu đãi đặc biệt
    giaTri?: number // ví dụ: 10 (%) hoặc 50000 (vnđ)
    moTa?: string
    anhDaiDien?: string // 🆕 ảnh đại diện chương trình
    noiDungChiTiet?: string // 🆕 mô tả chi tiết dạng HTML
    ngayBatDau: Date
    ngayKetThuc: Date
    dieuKhoan?: string
    luuY?: string
    gioiHanSuDung?: number
    daSuDung?: number
    trangThai?: "active" | "expired" | "upcoming"
    taoBoi?: string
    ngayTao?: Date
    ngayCapNhat?: Date
}
