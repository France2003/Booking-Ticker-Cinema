import { motion } from "framer-motion"
import { PlayCircle, Ticket } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface MovieCardProps {
    movie: any
    theme?: "orange" | "orange"
    index?: number
    onOpenTrailer?: (url: string) => void
}
export default function MovieCard({ movie, theme = "orange", index = 0, onOpenTrailer }: MovieCardProps) {
    const navigate = useNavigate()
    const colors =
        theme === "orange"
            ? {
                accent: "#FF9D00",
                shadow: "rgba(255,157,0,0.5)",
                border: "rgba(255,157,0,0.2)",
                gradient: "from-orange-500 to-red-500",
            }
            : {
                accent: "#00E5FF",
                shadow: "rgba(0,229,255,0.5)",
                border: "rgba(0,229,255,0.2)",
                gradient: "from-cyan-500 to-blue-500",
            }
    const trailerUrl = movie.Trailer
        ? movie.Trailer.startsWith("http")
            ? movie.Trailer
            : `http://localhost:3001${movie.Trailer}`
        : "https://www.youtube.com/embed/dQw4w9WgXcQ"

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            whileHover={{
                scale: 1.05,
                boxShadow: `0 0 25px ${colors.shadow}`,
            }}
            className="relative bg-[#0c0c0c] rounded-xl overflow-hidden shadow-md cursor-pointer"
            style={{ border: `1px solid ${colors.border}` }}
            onClick={() => navigate(`/movies/${movie._id}`)}>
            <img
                src={`http://localhost:3001${movie.anhPoster}`}
                alt={movie.tieuDe}
                className="w-full h-[380px] object-cover transition-transform duration-300 hover:scale-105"
            />
            <div
                className="absolute inset-0 bg-black/70 opacity-0 hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-opacity"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => onOpenTrailer?.(trailerUrl)}
                    className={`flex items-center gap-2 bg-gradient-to-r ${colors.gradient} px-4 py-2 rounded-full font-bold hover:scale-105 transition`}
                >
                    <PlayCircle className="w-4 h-4" /> Trailer
                </button>
                <button
                    onClick={() => navigate(`/movies/${movie._id}`)}
                    className="flex items-center gap-2 bg-white text-black font-semibold px-4 py-2 rounded-full hover:scale-105 transition"
                >
                    <Ticket className="w-4 h-4" /> Đặt vé
                </button>
            </div>
            <div className="p-3 text-center bg-gradient-to-t from-black via-black/90 to-transparent">
                <h3
                    className="font-bold uppercase truncate text-[15px] sm:text-base"
                    style={{ color: colors.accent }}>{movie.tieuDe}
                </h3>
                <p className="text-xs uppercase sm:text-sm text-gray-300 mt-1">
                    Khởi chiếu:{" "}
                    {movie.ngayKhoiChieu
                        ? new Date(movie.ngayKhoiChieu).toLocaleDateString("vi-VN")
                        : "Đang cập nhật"}
                </p>
                <p className="text-xs uppercase sm:text-sm text-gray-300 mt-1 font-medium">{movie.thoiLuong || 120} phút{" "}
                    {movie.danhGia !== undefined && (
                        <>
                            {" | "}
                            <span
                                className={`font-bold ${movie.danhGia <= 5
                                    ? "text-green-400"
                                    : movie.danhGia <= 12
                                        ? "text-yellow-400"
                                        : movie.danhGia <= 17
                                            ? "text-orange-400"
                                            : "text-red-500"
                                    }`}
                            >
                                C{movie.danhGia}
                            </span>
                        </>
                    )}
                </p>
                <p className="text-xs sm:text-sm uppercase text-gray-300 mt-1">THỂ LOẠI: {movie.theLoai}</p>
            </div>

        </motion.div>
    )
}
