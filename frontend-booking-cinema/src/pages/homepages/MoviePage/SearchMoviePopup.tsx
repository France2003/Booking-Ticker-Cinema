import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FiSearch, FiX } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import { getMovies } from "../../../services/movies/movie"

const SearchMoviePopup = ({ onClose }: { onClose: () => void }) => {
    const [keyword, setKeyword] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        const delay = setTimeout(() => {
            if (keyword.trim() !== "") {
                handleSearch()
            } else {
                setResults([])
            }
        }, 400)
        return () => clearTimeout(delay)
    }, [keyword])

    const handleSearch = async () => {
        try {
            setLoading(true)
            const res = await getMovies({ keyword, page: 1, limit: 10 })
            const results = res?.dangChieu?.data || []
            setResults(results)
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[999] flex items-start justify-center pt-28 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-xl rounded-2xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.4)]
                   bg-gradient-to-br from-[#0f1c2e] to-[#152235]
                   border border-white/10"
            >
                {/* HEADER */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold tracking-wide text-white">
                        Tìm kiếm phim
                    </h2>
                    <button onClick={onClose}>
                        <FiX className="text-white text-3xl hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* SEARCH INPUT */}
                <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl
                     bg-white/10 border border-white/20 backdrop-blur-lg
                     focus-within:ring-2 focus-within:ring-orange-400/50"
                >
                    <FiSearch className="text-gray-300 text-xl" />
                    <input
                        className="bg-transparent outline-none w-full text-white placeholder-gray-400"
                        placeholder="Nhập tên phim..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>

                {/* RESULTS */}
                <div className="mt-5 max-h-[350px] overflow-y-auto space-y-3 custom-scroll">
                    {loading && (
                        <p className="text-sm text-gray-300 animate-pulse">
                            Đang tìm kiếm...
                        </p>
                    )}

                    {!loading && results.length === 0 && keyword !== "" && (
                        <p className="text-sm text-gray-400 text-center py-4">
                            Không tìm thấy phim.
                        </p>
                    )}

                    {results.map((m, index) => (
                        <motion.div
                            key={m._id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => {
                                navigate(`/movies/${m._id}`)
                                onClose()
                            }}
                            className="flex items-center gap-4 p-3 rounded-xl cursor-pointer
                         bg-white/5 hover:bg-white/10 transition duration-200
                         border border-white/10 group"
                        >
                            <img
                                src={`http://localhost:3001${m.anhPoster}`}
                                className="w-14 h-20 object-cover rounded-lg shadow-lg group-hover:scale-105 transition duration-200"
                            />

                            <div className="flex flex-col">
                                <p className="font-semibold text-white text-base group-hover:text-orange-300 transition">
                                    {m.tieuDe}
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Ngày khởi chiếu:{" "}
                                    {new Date(m.ngayKhoiChieu).toLocaleDateString("vi-VN")}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    )
}

export default SearchMoviePopup
