import NowShowingMovies from "./NowShowingMovies"
import UpcomingMovies from "./UpcomingMovies"
import { motion } from "framer-motion";
export default function MovieTabs() {
    return (
        <section
            className="relative w-full py-10 md:py-16"
            style={{
                backgroundImage:
                    'url("https://metiz.vn/static/assets/websites/images/bg-session-movie.png")',
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}  // Bắt đầu ẩn và dịch xuống 50px
                whileInView={{ opacity: 1, y: 0 }} // Khi vào màn hình, xuất hiện từ dưới lên
                transition={{ duration: 0.8, ease: "easeOut" }} // Hiệu ứng mượt
                viewport={{ once: true }} // Chỉ chạy 1 lần
                className="mb-10 ">
                <div className="w-full mt-[15px] flex justify-center my-12">
                    <div className="relative w-4/5 h-[2px] bg-gradient-to-r from-transparent via-[#e35d0f] to-transparent">
                        <span className="absolute p-2 top-[-20px] left-1/2 -translate-x-1/2 text-orange-600 text-lg font-semibold tracking-wider bg-[#07122B] px-4 rounded-full shadow-lg">
                            ĐANG CHIẾU
                        </span>
                    </div>
                </div>
                <NowShowingMovies />
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 50 }}  // Bắt đầu ẩn và dịch xuống 50px
                whileInView={{ opacity: 1, y: 0 }} // Khi vào màn hình, xuất hiện từ dưới lên
                transition={{ duration: 0.8, ease: "easeOut" }} // Hiệu ứng mượt
                viewport={{ once: true }} // Chỉ chạy 1 lần
                className="mb-10 "
            >
                <div className="w-full mt-[25px] flex justify-center my-12">
                    <div className="relative w-4/5 h-[2px] bg-gradient-to-r from-transparent via-[#e35d0f] to-transparent">
                        <span className="absolute top-[-20px] p-2 left-1/2 -translate-x-1/2 text-orange-600 text-lg font-semibold tracking-wider bg-[#07122B] px-4 rounded-full shadow-lg">
                            SẮP CHIẾU
                        </span>
                    </div>
                </div>
                <UpcomingMovies />
            </motion.div>
        </section>
    )
}
