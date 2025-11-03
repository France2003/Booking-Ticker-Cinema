import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import type { Transition } from "framer-motion"
import { PlayCircle, Ticket, ChevronLeft, ChevronRight } from "lucide-react"
import { getMovies } from "../../../services/movies/movie"
import TrailerModal from "../../../components/TrailerModal"
const spring: Transition = {
    type: "spring",
    damping: 15,
    stiffness: 200,
    mass: 0.6,
}

export default function NowShowingMovies() {
    const [movies, setMovies] = useState<any[]>([])
    const [isTrailerOpen, setIsTrailerOpen] = useState(false)
    const [currentTrailer, setCurrentTrailer] = useState("")
    const sliderRef = useRef<HTMLDivElement>(null)
    const animationRef = useRef<number | null>(null)
    const pausedRef = useRef(false)
    const isDraggingRef = useRef(false)
    const startX = useRef(0)
    const scrollLeftStart = useRef(0)

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await getMovies({ page: 1, limit: 20 })
                const allMovies = [
                    ...(res?.dangChieu?.data || []),
                ]
                const hotMovies = allMovies.sort((a, b) => {
                    if (a.isHot && !b.isHot) return -1
                    if (!a.isHot && b.isHot) return 1
                    return 0
                })
                setMovies(hotMovies)
            } catch (err) {
                console.error("❌ Lỗi tải phim đang chiếu:", err)
            }
        }
        fetchMovies()
    }, [])

    // ✅ Auto-scroll mượt và dừng khi hover hoặc drag
    useEffect(() => {
        const slider = sliderRef.current
        if (!slider) return
        let scrollX = slider.scrollLeft
        const speed = 0.4

        const animate = () => {
            if (!slider || pausedRef.current || isDraggingRef.current) return
            scrollX += speed
            if (scrollX >= slider.scrollWidth - slider.clientWidth) scrollX = 0
            slider.scrollLeft = scrollX
            animationRef.current = requestAnimationFrame(animate)
        }

        animationRef.current = requestAnimationFrame(animate)

        const stop = () => {
            pausedRef.current = true
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
        }

        const resume = () => {
            pausedRef.current = false
            animationRef.current = requestAnimationFrame(animate)
        }

        slider.addEventListener("mouseenter", stop)
        slider.addEventListener("mouseleave", resume)

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
            slider.removeEventListener("mouseenter", stop)
            slider.removeEventListener("mouseleave", resume)
        }
    }, [movies])

    // ✅ Kéo bằng chuột
    useEffect(() => {
        const slider = sliderRef.current
        if (!slider) return

        const handleDown = (e: MouseEvent) => {
            isDraggingRef.current = true
            startX.current = e.pageX - slider.offsetLeft
            scrollLeftStart.current = slider.scrollLeft
            slider.style.cursor = "grabbing"
        }

        const handleUp = () => {
            isDraggingRef.current = false
            slider.style.cursor = "grab"
        }

        const handleLeave = () => {
            isDraggingRef.current = false
            slider.style.cursor = "grab"
        }

        const handleMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return
            e.preventDefault()
            const x = e.pageX - slider.offsetLeft
            const walk = (x - startX.current) * 1.3
            slider.scrollLeft = scrollLeftStart.current - walk
        }

        slider.addEventListener("mousedown", handleDown)
        slider.addEventListener("mouseleave", handleLeave)
        slider.addEventListener("mouseup", handleUp)
        slider.addEventListener("mousemove", handleMove)

        return () => {
            slider.removeEventListener("mousedown", handleDown)
            slider.removeEventListener("mouseleave", handleLeave)
            slider.removeEventListener("mouseup", handleUp)
            slider.removeEventListener("mousemove", handleMove)
        }
    }, [])

    // ✅ Nút prev/next có sự kiện thật
    const scroll = (dir: "left" | "right") => {
        const slider = sliderRef.current
        if (!slider) return
        const amount = 340
        const max = slider.scrollWidth - slider.clientWidth
        const next =
            dir === "left" ? slider.scrollLeft - amount : slider.scrollLeft + amount
        if (next > max + 50) slider.scrollTo({ left: 0, behavior: "smooth" })
        else if (next < 0) slider.scrollTo({ left: max, behavior: "smooth" })
        else slider.scrollTo({ left: next, behavior: "smooth" })
    }

    const openTrailer = (url: string) => {
        const fullUrl = url.startsWith("http")
            ? url
            : `http://localhost:3001${url}`
        setCurrentTrailer(fullUrl)
        setIsTrailerOpen(true)
    }

    return (
        <section className="w-full -mt-[35px] py-10">
            <h2 className="text-center text-3xl font-extrabold uppercase mb-6 text-orange-600 tracking-wider drop-shadow-md">
                🎬 Phim Đang Chiếu
            </h2>
            <div className="relative">
                <div ref={sliderRef} className="flex gap-4 sm:gap-5 overflow-x-hidden no-scrollbar select-none px-2 py-2 cursor-grab">
                    {movies.map((movie, index) => {
                        const trailerUrl = movie.Trailer
                            ? `http://localhost:3001${movie.Trailer}`
                            : "https://www.youtube.com/embed/dQw4w9WgXcQ"

                        const color =
                            movie.danhGia < 10
                                ? "text-green-400"
                                : movie.danhGia < 16
                                    ? "text-yellow-400"
                                    : movie.danhGia < 18
                                        ? "text-orange-400"
                                        : "text-red-500"

                        return (
                            <motion.div
                                key={movie._id || index}
                                initial={{ opacity: 0, y: 25 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: index * 0.03,
                                    duration: 0.25,
                                    ...spring,
                                }}
                                whileHover={{
                                    scale: 1.04,
                                    boxShadow: "0 0 25px rgba(0,229,255,0.35)",
                                }}
                                className={`relative flex-shrink-0 w-[200px] sm:w-[250px] lg:w-[280px] rounded-xl overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.05)] 
                                ${movie.isHot ? "ring-2 ring-orange-400 shadow-[0_0_25px_rgba(255,120,0,0.4)]" : ""}`}                            >
                                {movie.isHot && (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                                        transition={{
                                            repeat: Infinity,
                                            repeatType: "mirror",
                                            duration: 1.5,
                                            ease: "easeInOut",
                                        }}
                                        className="absolute top-3 left-3 flex items-center gap-1.5 z-30"
                                    >
                                        <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 
                                                    text-white text-[11px] sm:text-sm font-extrabold px-3 py-1 rounded-full 
                                                      shadow-[0_0_15px_rgba(255,100,0,0.8)] border border-white/20 uppercase 
                                                      tracking-wider flex items-center gap-1 animate-pulse">🔥<span>HOT</span>
                                        </div>
                                    </motion.div>
                                )}
                                <img
                                    src={`http://localhost:3001${movie.anhPoster}`}
                                    alt={movie.tieuDe}
                                    className="w-full h-[320px] sm:h-[380px] lg:h-[420px] object-cover transition-transform duration-300 hover:scale-[1.07]"
                                    draggable={false}
                                />

                                <div className="absolute inset-0 bg-black/65 opacity-0 hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3 z-10">
                                    <button
                                        onClick={() => openTrailer(trailerUrl)}
                                        className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-500 hover:to-red-400 text-white font-bold px-4 sm:px-5 py-2 rounded-full shadow-md"                  >
                                        <PlayCircle className="w-4 h-4" />
                                        Trailer
                                    </button>
                                    <a
                                        href={`/movies/${movie._id}`}
                                        className="flex items-center gap-2 bg-white text-black font-semibold px-4 sm:px-5 py-2 rounded-full shadow-md hover:scale-[1.05] transition-all duration-150"
                                    >
                                        <Ticket className="w-4 h-4" />
                                        Đặt vé
                                    </a>
                                </div>

                                {/* Thông tin phim */}
                                <div className="relative bg-gradient-to-t from-black via-black/95 to-transparent pt-3 pb-3 text-center z-20">
                                    <h3 className="text-white font-extrabold uppercase truncate text-xs sm:text-sm lg:text-[15px] tracking-wide">
                                        {movie.tieuDe}
                                    </h3>
                                    <p className="text-[11px] sm:text-sm text-gray-200 mt-1 font-medium">
                                        {movie.thoiLuong || "120"} PHÚT{" "}
                                        {movie.danhGia && (
                                            <>
                                                {" | "}
                                                <span className={`${color} font-bold`}>
                                                    C{movie.danhGia}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1 tracking-wide font-medium">
                                        KHỞI CHIẾU{" "}
                                        <span className="text-gray-200">
                                            {movie.ngayKhoiChieu
                                                ? new Date(movie.ngayKhoiChieu).toLocaleDateString(
                                                    "vi-VN",
                                                    {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                    }
                                                )
                                                : "Đang cập nhật"}
                                        </span>
                                    </p>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Nút Prev/Next hoạt động thật */}
                <button
                    onClick={() => scroll("left")}
                    className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-black/70 to-transparent text-white p-3 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-150 z-30"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={() => scroll("right")}
                    className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-black/70 to-transparent text-white p-3 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-150 z-30"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            <TrailerModal
                trailerUrl={currentTrailer}
                isOpen={isTrailerOpen}
                onClose={() => setIsTrailerOpen(false)}
            />
        </section>
    )
}
