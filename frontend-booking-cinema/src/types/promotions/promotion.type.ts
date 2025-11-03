export interface Promotion {
    _id?: string
    tenKhuyenMai: string
    maCode: string
    loai: "percent" | "fixed"
    giaTri: number
    moTa?: string
    anhDaiDien?: string
    noiDungChiTiet?: string
    ngayBatDau: string | Date
    ngayKetThuc: string | Date
    dieuKhoan?: string
    luuY?: string
    gioiHanSuDung?: number
    daSuDung?: number
    trangThai?: "active" | "expired" | "upcoming"
    taoBoi?: string
    ngayTao?: string
    ngayCapNhat?: string
}
