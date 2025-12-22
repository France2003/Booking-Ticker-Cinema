import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import type { Promotion } from "../../../types/promotions/promotion.type"
import { getPromotions } from "../../../services/promotions/promotions"
import { Helmet } from "react-helmet"

export default function PromotionDetailPage() {
  const { id } = useParams()
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getPromotions()
      .then((res) => {
        const found = res.data.find((p: Promotion) => p._id === id)
        setPromotion(found || null)
      })
      .catch(() => console.warn("Không thể tải chi tiết khuyến mãi"))
      .finally(() => setLoading(false))
  }, [id])
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Đang tải khuyến mãi...
      </div>
    )
  if (!promotion)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <p>Không tìm thấy khuyến mãi.</p>
        <Link
          to="/promotions"
          className="mt-4 text-blue-600 hover:underline text-sm"
        >
          ← Quay lại danh sách
        </Link>
      </div>
    )
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{promotion.tenKhuyenMai}</title>
      </Helmet>
      {/* Ảnh banner */}
      <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          src={promotion.anhDaiDien || "/no-image.png"}
          alt={promotion.tenKhuyenMai}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-white text-2xl md:text-4xl font-bold text-center px-6">
            {promotion.tenKhuyenMai}
          </h1>
        </div>
      </div>

      {/* Nội dung */}
      <div className="max-w-[900px] mx-auto px-5 md:px-10 py-10">
        <Link
          to="/promotions"
          className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Link>

        {/* Thông tin chính */}
        <div className="bg-white rounded-xl shadow p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span
              className={`px-3 py-1 rounded-full font-semibold ${promotion.loai === "percent"
                ? "bg-blue-100 text-blue-700"
                : promotion.loai === "fixed"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-purple-100 text-purple-700"
                }`}
            >
              {promotion.loai === "percent"
                ? `Giảm ${promotion.giaTri}%`
                : promotion.loai === "fixed"
                  ? `Giảm ${promotion.giaTri.toLocaleString()}đ`
                  : "Voucher / Quà tặng"}
            </span>
            <span
              className={`px-3 py-1 rounded-full font-semibold ${promotion.trangThai === "active"
                ? "bg-green-100 text-green-700"
                : promotion.trangThai === "upcoming"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
                }`}
            >
              {promotion.trangThai === "active"
                ? "Đang diễn ra"
                : promotion.trangThai === "upcoming"
                  ? "Sắp diễn ra"
                  : "Đã kết thúc"}
            </span>
          </div>

          <p className="text-gray-600 text-sm">
            📅{" "}
            {new Date(promotion.ngayBatDau).toLocaleDateString()} →{" "}
            {new Date(promotion.ngayKetThuc).toLocaleDateString()}
          </p>
          <p className="text-gray-800 leading-relaxed">Mã giảm giá: {promotion.maCode}</p>
          <p className="text-gray-800 leading-relaxed">{promotion.moTa}</p>

          {/* Nội dung chi tiết */}
          {promotion.noiDungChiTiet && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-2">📖 Nội dung chi tiết</h3>
              <div
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: promotion.noiDungChiTiet,
                }}
              />
            </div>
          )}

          {/* Điều khoản */}
          {promotion.dieuKhoan && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-2">📜 Điều khoản</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {promotion.dieuKhoan}
              </p>
            </div>
          )}

          {/* Lưu ý */}
          {promotion.luuY && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-2">⚠️ Lưu ý</h3>
              <p className="text-sm text-gray-600">{promotion.luuY}</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 italic">
          Cập nhật lần cuối:{" "}
          {promotion.ngayCapNhat
            ? new Date(promotion.ngayCapNhat).toLocaleDateString()
            : "N/A"}
        </p>
      </div>
    </div>
  )
}
