import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react"
import { getMovies } from "../services/movies/movie"
import { motion, AnimatePresence } from "framer-motion"
import TrailerModal from "../components/TrailerModal"
import { useNavigate } from "react-router-dom"
export default function MovieSlider() {
    const [movies, setMovies] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isTrailerOpen, setIsTrailerOpen] = useState(false)
    const thumbContainerRef = useRef<HTMLDivElement>(null)
    const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null)
    const navigate = useNavigate()
    // Lấy phim
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await getMovies({ page: 1, limit: 20 })
                const allMovies = [
                    ...(res?.dangChieu?.data || []),
                ]
                // 🎯 Lọc phim hot (do bạn đánh dấu sẵn trong admin)
                const hotMovies = allMovies.filter((m) => m.isHot === true)
                setMovies(hotMovies)
            } catch (error) {
                console.error("❌ Lỗi khi tải phim:", error)
            }
        }
        fetchMovies()
    }, [])

    // Auto chuyển slide
    useEffect(() => {
        if (!movies.length || isTrailerOpen) return
        slideTimer.current = setInterval(
            () => setCurrentIndex((prev) => (prev + 1) % movies.length),
            7000
        )
        return () => {
            if (slideTimer.current) clearInterval(slideTimer.current)
        }
    }, [movies, isTrailerOpen])

    // Auto scroll thumbnail
    useEffect(() => {
        const container = thumbContainerRef.current
        if (!container) return
        const activeThumb = container.children[currentIndex] as HTMLElement
        if (activeThumb) {
            const offset =
                activeThumb.offsetLeft - container.clientWidth / 2 + activeThumb.clientWidth / 2
            container.scrollTo({ left: offset, behavior: "smooth" })
        }
    }, [currentIndex])

    if (!movies.length)
        return <p className="text-center text-gray-500 mt-10">Đang tải phim...</p>

    const currentMovie = movies[currentIndex]
    const imageUrl = `http://localhost:3001${currentMovie.anhPoster}`
    const trailerUrl = currentMovie.Trailer
        ? `http://localhost:3001${currentMovie.Trailer}`
        : "https://www.youtube.com/embed/dQw4w9WgXcQ"

    return (
        <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 1, ease: "easeInOut" }}
        >
            <div className="max-w-[1400px] mx-auto px-3 sm:px-6 md:px-10 relative">
                {/* Vùng slide chính */}
                <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl bg-black border border-white/10">
                    {/* Background cinematic */}
                    <div
                        className="absolute inset-0 z-0"
                        style={{
                            backgroundImage: `url(${imageUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            filter: "blur(45px) brightness(0.5) saturate(1.4)",
                            transform: "scale(1.2)",
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-0" />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentMovie._id}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.9, ease: "easeInOut" }}
                            onClick={() => navigate(`/movies/${currentMovie._id}`)}
                            className="w-full h-full flex flex-col sm:flex-row items-center justify-center relative z-10 gap-6 sm:gap-10"
                        >
                            {currentMovie.isHot && (
                                <span className="absolute top-3 left-3 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400  text-white text-[11px] sm:text-sm font-extrabold px-3 py-1 rounded-full 
                                                shadow-[0_0_15px_rgba(255,100,0,0.8)] border border-white/20 uppercase 
                                                tracking-wider flex items-center gap-1 animate-pulse">🔥 HOT
                                </span>
                            )}

                            <img
                                src={imageUrl}
                                alt={currentMovie.tenPhim}
                                className="w-[70%] sm:w-[60%] md:w-[55%] lg:w-[50%] max-h-[80%] object-contain rounded-xl shadow-[0_0_50px_rgba(255,255,255,0.15)] border border-white/10"
                            />

                            {/* Overlay info */}
                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 sm:p-6 md:p-10 flex flex-col gap-3">
                                <motion.h3
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-white text-xl sm:text-3xl md:text-4xl font-bold drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)] tracking-wide"
                                >
                                    {currentMovie.tenPhim}
                                </motion.h3>

                                <motion.button
                                    whileHover={{
                                        scale: 1.1,
                                        boxShadow: "0 0 25px rgba(255,110,35,0.6)",
                                    }}
                                    onClick={() => setIsTrailerOpen(true)}
                                    className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-500 
                    hover:from-orange-500 hover:to-red-400 text-white font-semibold 
                    px-4 sm:px-6 py-2.5 rounded-full w-fit transition-all shadow-lg backdrop-blur-sm text-sm sm:text-base"
                                >
                                    <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Xem Trailer
                                </motion.button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                    <button
                        onClick={() =>
                            setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)
                        }
                        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 flex items-center justify-center 
              rounded-full bg-gradient-to-tr from-orange-600 to-red-500 hover:opacity-90 text-white 
              shadow-lg transition-all z-30 backdrop-blur-md"
                    >
                        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>

                    <button
                        onClick={() => setCurrentIndex((prev) => (prev + 1) % movies.length)}
                        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 flex items-center justify-center 
              rounded-full bg-gradient-to-tr from-orange-600 to-red-500 hover:opacity-90 text-white 
              shadow-lg transition-all z-30 backdrop-blur-md"
                    >
                        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                </div>
                <div
                    ref={thumbContainerRef}
                    className="mt-3 sm:mt-4 flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing"
                >
                    {movies.map((movie, index) => (
                        <motion.button
                            key={movie._id}
                            onClick={() => setCurrentIndex(index)}
                            whileHover={{ scale: 1.08 }}
                            className={`relative flex-shrink-0 w-[80px] h-[50px] sm:w-[120px] sm:h-[70px] md:w-[160px] md:h-[90px] lg:w-[180px] lg:h-[100px]
                rounded-md overflow-hidden transition-all duration-300 ${currentIndex === index
                                    ? "ring-4 ring-orange-500 scale-105 shadow-[0_0_25px_rgba(255,110,35,0.6)]"
                                    : "opacity-70 hover:opacity-100"
                                }`}
                        >
                            <img
                                src={`http://localhost:3001${movie.anhPoster}`}
                                alt={movie.tenPhim}
                                className="w-full h-full object-cover rounded-md"
                            />
                        </motion.button>
                    ))}
                </div>
            </div>

            <TrailerModal
                trailerUrl={trailerUrl}
                isOpen={isTrailerOpen}
                onClose={() => setIsTrailerOpen(false)}
            />
        </motion.div>
    )
}
