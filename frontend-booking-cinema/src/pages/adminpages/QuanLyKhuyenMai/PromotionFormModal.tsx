import React from "react"
import type { Promotion } from "../../../types/promotions/promotion.type"

interface Props {
    isOpen: boolean
    onClose: () => void
    onSubmit: (e: React.FormEvent) => void
    formData: Promotion
    setFormData: React.Dispatch<React.SetStateAction<Promotion>>
    editData?: Promotion | null
    handleChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => void
}

const PromotionFormModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onSubmit,
    formData,
    editData,
    handleChange,
}) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl relative animate-fadeIn overflow-y-auto max-h-[90vh]">
                <h3 className="text-2xl font-semibold mb-5 text-gray-800">
                    {editData ? "✏️ Cập nhật khuyến mãi" : "🆕 Thêm khuyến mãi mới"}
                </h3>

                <form onSubmit={onSubmit} className="space-y-4">
                    {/* Tên và mã code */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                                Tên khuyến mãi
                            </label>
                            <input
                                name="tenKhuyenMai"
                                value={formData.tenKhuyenMai}
                                onChange={handleChange}
                                placeholder="Ví dụ: Mua 1 vé tặng voucher 5%"
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Mã code</label>
                            <input
                                name="maCode"
                                value={formData.maCode}
                                onChange={handleChange}
                                placeholder="Ví dụ: DEADWOLVER5"
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Loại, giá trị, trạng thái */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Loại</label>
                            <select
                                name="loai"
                                value={formData.loai}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="percent">Giảm theo phần trăm (%)</option>
                                <option value="fixed">Giảm theo số tiền (VNĐ)</option>
                                <option value="voucher">Voucher</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Giá trị</label>
                            <input
                                type="number"
                                name="giaTri"
                                value={formData.giaTri}
                                onChange={handleChange}
                                placeholder="5 hoặc 50000"
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Trạng thái</label>
                            <select
                                name="trangThai"
                                value={formData.trangThai || "upcoming"}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="active">Đang diễn ra</option>
                                <option value="upcoming">Sắp diễn ra</option>
                                <option value="expired">Đã hết hạn</option>
                            </select>
                        </div>
                    </div>

                    {/* Ngày bắt đầu - kết thúc */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Ngày bắt đầu</label>
                            <input
                                type="date"
                                name="ngayBatDau"
                                value={formData.ngayBatDau?.toString().slice(0, 10)}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Ngày kết thúc</label>
                            <input
                                type="date"
                                name="ngayKetThuc"
                                value={formData.ngayKetThuc?.toString().slice(0, 10)}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>

                    {/* Giới hạn sử dụng & Đã sử dụng */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                                Giới hạn sử dụng
                            </label>
                            <input
                                type="number"
                                name="gioiHanSuDung"
                                value={formData.gioiHanSuDung || 0}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Đã sử dụng</label>
                            <input
                                type="number"
                                name="daSuDung"
                                value={formData.daSuDung || 0}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>

                    {/* Link ảnh đại diện */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Ảnh đại diện</label>
                        <input
                            name="anhDaiDien"
                            value={formData.anhDaiDien || ""}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* Mô tả ngắn */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Mô tả ngắn</label>
                        <textarea
                            name="moTa"
                            value={formData.moTa || ""}
                            onChange={handleChange}
                            placeholder="Tặng ngay voucher giảm 5% đồ uống tại Open Bar khi mua vé..."
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* Nội dung chi tiết HTML */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                            Nội dung chi tiết (HTML)
                        </label>
                        <textarea
                            name="noiDungChiTiet"
                            value={formData.noiDungChiTiet || ""}
                            onChange={handleChange}
                            placeholder="Nhập nội dung HTML..."
                            className="w-full h-40 border rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-400"
                        />
                        <p className="text-xs text-gray-500 mt-1 italic">
                            Có thể dùng thẻ HTML như &lt;p&gt;, &lt;ul&gt;, &lt;b&gt;, &lt;span style=''&gt;...
                        </p>
                    </div>

                    {/* Điều khoản & Lưu ý */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Điều khoản</label>
                            <textarea
                                name="dieuKhoan"
                                value={formData.dieuKhoan || ""}
                                onChange={handleChange}
                                placeholder="Điều kiện áp dụng..."
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Lưu ý</label>
                            <textarea
                                name="luuY"
                                value={formData.luuY || ""}
                                onChange={handleChange}
                                placeholder="Các lưu ý quan trọng..."
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                        >
                            Huỷ
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {editData ? "Lưu thay đổi" : "Tạo mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default PromotionFormModal
