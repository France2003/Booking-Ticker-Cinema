import React from "react"
import type { Promotion } from "../../../types/promotions/promotion.type"
interface Props {
    isOpen: boolean
    onClose: () => void
    viewData: Promotion | null
}
const PromotionDetailModal: React.FC<Props> = ({ isOpen, onClose, viewData }) => {
    if (!isOpen || !viewData) return null
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative animate-fadeIn flex flex-col max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between border-b px-6 py-4 bg-gradient-to-r from-gray-50 to-white sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-gray-800">Chi tiết khuyến mãi</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>
                <div className="overflow-y-auto p-6 space-y-5">
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                        <img
                            src={viewData.anhDaiDien || "/no-image.png"}
                            alt={viewData.tenKhuyenMai}
                            className="w-56 h-56 object-cover rounded-xl shadow-md border hover:scale-105 transition-transform duration-200"
                        />
                        <div className="flex-1 text-gray-800">
                            <h2 className="text-2xl font-semibold mb-2">{viewData.tenKhuyenMai}</h2>

                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Mã khuyến mãi:</strong>{" "}
                                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                                    {viewData.maCode}
                                </span>
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span
                                    className={`px-3 py-1 text-xs font-semibold rounded-full ${viewData.loai === "percent"
                                        ? "bg-blue-100 text-blue-700"
                                        : viewData.loai === "fixed"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-purple-100 text-purple-700"}`} >
                                    {viewData.loai === "percent"
                                        ? "Giảm theo phần trăm (%)"
                                        : viewData.loai === "fixed"
                                            ? "Giảm theo số tiền (VNĐ)"
                                            : "Voucher / Ưu đãi đặc biệt"}
                                </span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                    {viewData.loai === "percent"
                                        ? `${viewData.giaTri}%`
                                        : `${viewData.giaTri.toLocaleString()} ${viewData.loai === "fixed" ? "VNĐ" : "Điểm / %"
                                        }`}
                                </span>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${viewData.trangThai === "active"
                                        ? "bg-green-100 text-green-700"
                                        : viewData.trangThai === "expired"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-yellow-100 text-yellow-700"}`} >
                                    {viewData.trangThai === "active"
                                        ? "Đang diễn ra"
                                        : viewData.trangThai === "upcoming"
                                            ? "Sắp diễn ra"
                                            : "Đã kết thúc"}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-1">
                                <strong>Thời gian áp dụng:</strong>{" "}
                                {new Date(viewData.ngayBatDau).toLocaleDateString()} -{" "}
                                {new Date(viewData.ngayKetThuc).toLocaleDateString()}
                            </p>
                            {viewData.gioiHanSuDung && (
                                <p className="text-sm text-gray-500">
                                    <strong>Giới hạn sử dụng:</strong> {viewData.gioiHanSuDung.toLocaleString()} lượt
                                    &nbsp;|&nbsp;
                                    <strong>Đã sử dụng:</strong>{" "}
                                    {viewData.daSuDung ? viewData.daSuDung.toLocaleString() : 0}
                                </p>
                            )}
                        </div>
                    </div>
                    {viewData.moTa && (
                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1">
                                ℹ️ Mô tả
                            </h4>
                            <p className="text-sm leading-relaxed text-gray-600">{viewData.moTa}</p>
                        </div>
                    )}
                    {viewData.noiDungChiTiet && (
                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1">
                                📝 Nội dung chi tiết
                            </h4>
                            <div
                                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: viewData.noiDungChiTiet }}
                            />
                        </div>
                    )}
                    {viewData.dieuKhoan && (
                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1">
                                📜 Điều khoản
                            </h4>
                            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                                {viewData.dieuKhoan}
                            </p>
                        </div>
                    )}
                    {viewData.luuY && (
                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1">
                                ⚠️ Lưu ý
                            </h4>
                            <p className="text-sm leading-relaxed text-gray-600">{viewData.luuY}</p>
                        </div>
                    )}
                    <div className="border-t pt-4">
                        <p className="text-xs text-center text-gray-500 italic">
                            Cập nhật lần cuối:{" "}
                            {viewData.ngayCapNhat
                                ? new Date(viewData.ngayCapNhat).toLocaleDateString()
                                : "N/A"}
                        </p>
                    </div>
                </div>
                <div className="border-t px-6 py-4 bg-gray-50 flex justify-end sticky bottom-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PromotionDetailModal
