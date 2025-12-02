import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getMovies } from "../../../services/movies/movie"
import MovieCard from "./MovieCard"
import TrailerModal from "../../../components/TrailerModal"
import { Helmet } from "react-helmet"
export default function ComingSoonPage() {
    const [movies, setMovies] = useState<any[]>([])
    const [visibleCount, setVisibleCount] = useState(6)
    const [isTrailerOpen, setIsTrailerOpen] = useState(false)
    const [currentTrailer, setCurrentTrailer] = useState("")
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await getMovies({ page: 1, limit: 50 })
                const filtered = (res?.sapChieu?.data || []).filter(
                    (m: any) => m?.trangThai === "sapChieu" || m?.sapChieu
                )
                setMovies(filtered)
            } catch (err) {
                console.error("❌ Lỗi tải phim đang chiếu:", err)
            }
        }
        fetchMovies()
    }, [])

    return (
        <section className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#020617] via-[#031c2c] to-[#000] text-white py-16 px-4 sm:px-10 lg:px-20">
            <Helmet>
                <meta charSet="utf-8" />
                <title>Phim sắp công chiếu</title>
            </Helmet>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#00E5FF]/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="max-w-[1200px] mx-auto relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center text-2xl md:text-4xl font-extrabold uppercase mb-14 text-[#FF9D00] tracking-[0.15em]"
                >
                    🎬 Phim Sắp Công Chiếu
                </motion.h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {movies.slice(0, visibleCount).map((movie, i) => (
                        <MovieCard
                            key={movie._id || i}
                            movie={movie}
                            theme="orange"
                            index={i}
                            onOpenTrailer={(url) => {
                                setCurrentTrailer(url)
                                setIsTrailerOpen(true)
                            }}
                        />
                    ))}
                </div>
                <div className="text-center mt-12">
                    {visibleCount < movies.length ? (
                        <button
                            onClick={() => setVisibleCount((prev) => prev + 6)}
                            className="px-8 py-3 rounded-full font-bold text-black bg-[#FF9D00] hover:bg-[#ffb13c] transition-all duration-200"
                        >
                            Xem thêm
                        </button>
                    ) : movies.length > 6 ? (
                        <button
                            onClick={() => setVisibleCount(6)}
                            className="px-8 py-3 rounded-full font-bold text-black bg-[#FF9D00] hover:bg-[#ffb13c] transition-all duration-200"
                        >
                            Thu gọn
                        </button>
                    ) : null}
                </div>
                <TrailerModal
                    trailerUrl={currentTrailer}
                    isOpen={isTrailerOpen}
                    onClose={() => setIsTrailerOpen(false)}
                />
            </div>
        </section>
    )
}
