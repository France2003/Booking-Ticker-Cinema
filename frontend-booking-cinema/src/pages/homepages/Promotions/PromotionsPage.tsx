import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getPromotions } from "../../../services/promotions/promotions"
import type { Promotion } from "../../../types/promotions/promotion.type"
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet"
export default function PromotionsPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        getPromotions()
            .then((res) => setPromotions(res.data || []))
            .catch(() => console.warn("Không thể tải danh sách khuyến mãi"))
            .finally(() => setLoading(false))
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}  // Bắt đầu ẩn và dịch xuống 50px
            whileInView={{ opacity: 1, y: 0 }} // Khi vào màn hình, xuất hiện từ dưới lên
            transition={{ duration: 0.8, ease: "easeOut" }} // Hiệu ứng mượt
            viewport={{ once: true }} // Chỉ chạy 1 lần
            className="mb-10 "
        >
            <Helmet>
                <meta charSet="utf-8" />
                <title>Ưu đãi</title>
            </Helmet>
            <div className="min-h-screen bg-[#fafafa] py-12 px-4 md:px-10 lg:px-20">
                <div className="max-w-[1200px] mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 uppercase text-[#0f172a]">
                        🎁 Danh sách khuyến mãi
                    </h1>
                    {loading ? (
                        <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
                    ) : promotions.length === 0 ? (
                        <p className="text-center text-gray-500">Hiện chưa có khuyến mãi nào.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {promotions.map((promo, i) => (
                                <Link key={promo._id || i} to={`/promotions/${promo._id}`}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05, duration: 0.4 }}
                                        className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer group"
                                    >
                                        <img
                                            src={promo.anhDaiDien || "/no-image.png"}
                                            alt={promo.tenKhuyenMai}
                                            className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="p-4">
                                            <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                                                {promo.tenKhuyenMai}
                                            </h3>
                                            <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                                                {promo.moTa || "Chương trình ưu đãi đặc biệt tại Metiz Cinema."}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                📅 {new Date(promo.ngayBatDau).toLocaleDateString()} →{" "}
                                                {new Date(promo.ngayKetThuc).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}

                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
