import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import type { Promotion } from "../../../types/promotions/promotion.type"
import { getPromotions } from "../../../services/promotions/promotions"
export default function Promotions() {
    const [promotions, setPromotions] = useState<Promotion[]>([])
    useEffect(() => {
        getPromotions()
            .then((res) => {
                if (res?.data) setPromotions(res.data.slice(0, 5))
            })
            .catch(() => console.warn("Không thể tải khuyến mãi"))
    }, [])
    return (
        <section className="bg-[#f6f6f2] py-10 px-4 md:px-8 lg:px-16">
            <div className="max-w-[1300px] mx-auto">
                <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-10 uppercase text-[#0f172a]">
                    Khuyến mãi & Ưu đãi
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="border border-gray-300 bg-white rounded-md p-6 flex flex-col justify-center text-center hover:shadow-md transition">
                        <h3 className="text-lg font-bold text-orange-600 mb-2 uppercase">
                            Khuyến mãi hấp dẫn
                        </h3>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            Khám phá ngay hàng trăm lợi ích dành cho bạn trong chuyên mục
                            khuyến mãi & ưu đãi hấp dẫn của France Cinema.
                        </p>
                    </div>
                    {promotions.map((promo, i) => (
                        <Link to={`/promotions/${promo._id}`}>
                            <motion.div
                                key={promo._id || i}
                                whileHover={{ scale: 1.02 }}
                                className="overflow-hidden rounded-md border border-gray-200 bg-white hover:shadow-md cursor-pointer transition"
                            >
                                <img
                                    src={promo.anhDaiDien || "/no-image.png"}
                                    alt={promo.tenKhuyenMai}
                                    className="w-full h-56 object-cover"
                                />
                            </motion.div>
                        </Link>
                    ))}
                    <Link
                        to="/promotions"
                        className="bg-black text-white rounded-md flex p-3 items-center justify-center gap-2 hover:bg-gray-800 transition"
                    >
                        <Plus className="w-8 h-8" />
                        <span className="uppercase text-sm font-semibold tracking-wide">
                            Xem nhiều hơn
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    )
}
