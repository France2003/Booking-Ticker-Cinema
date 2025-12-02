import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { getMovieById, toggleLikeMovie } from "../../../services/movies/movie";
import { getReviews, addReview, toggleLikeReview } from "../../../services/reviews/review";
import RatingStars from "../../../components/Reviews/RatingStars";
import { Heart, PlayCircle, CheckCircle2, XCircle, Flame } from "lucide-react";
import TrailerModal from "../../../components/TrailerModal";
import { playSound } from "../../../utils/playSound";
import { useUser } from "../../../contexts/UserContext";
import ShowtimeModal from "../ShowTimes/ShowtimeModal";
import { getAllShowTimes } from "../../../services/showTimes/showTimesService";
import type { Showtime } from "../../../types/showTimes/showTimes";
import { Helmet } from "react-helmet";
// ⚙️ Socket config
const socket = io("http://localhost:3001", {
    transports: ["websocket"],
});

export default function MovieDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState<any>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);
    const { user } = useUser();
    const [isShowtimeOpen, setIsShowtimeOpen] = useState(false);
    const [showtimes, setShowtimes] = useState<Showtime[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isShowtimeLoading, setIsShowtimeLoading] = useState<boolean>(true);
    const [reviews, setReviews] = useState<any[]>([]);
    const [avgRating, setAvgRating] = useState(0);
    const [newRating, setNewRating] = useState(0);
    const [comment, setComment] = useState("");
    const [toast, setToast] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    useEffect(() => {
        const fetchMovie = async () => {
            try {
                setIsLoading(true);
                const res = await getMovieById(id as string);
                setMovie(res);
                setLikeCount(res.likesCount || 0);
                setIsLiked(res.isLiked || false);
            } catch (err) {
                console.error("❌ Lỗi tải chi tiết phim:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMovie();
    }, [id]);

    useEffect(() => {
        if (id) {
            getReviews(id).then((data) => {
                setReviews(data.reviews);
                setAvgRating(data.avgRating);
            });
        }
    }, [id]);
    useEffect(() => {
        if (id) {
            setIsShowtimeLoading(true); // ✅ Bắt đầu loading trước khi gọi API
            getAllShowTimes()
                .then((data) => {
                    const filtered = data.filter((s: Showtime) => s.movieId._id === id);
                    setShowtimes(filtered);
                })
                .catch((err) => console.error("❌ Lỗi tải suất chiếu:", err))
                .finally(() => setIsShowtimeLoading(false)); // ✅ Kết thúc loading
        }
    }, [id]);
    // 🧩 Đăng ký socket room theo user ID
    useEffect(() => {
        if (user?._id) socket.emit("registerUser", user._id);
        socket.on("reviewStatusUpdated", (data) => {
            if (data.userId === user?._id) {
                if (data.status === "approved") {
                    playSound("success"); // 🔊 Phát âm khi được duyệt
                    showToast("success", `🎉 Bình luận phim "${data.movieTitle}" của bạn đã được duyệt!`);
                } else if (data.status === "rejected") {
                    playSound("error"); // 🔊 Phát âm khi bị từ chối
                    showToast("error", `❌ Bình luận phim "${data.movieTitle}" của bạn đã bị từ chối.`);
                }
            }
        });
        return () => {
            socket.off("reviewStatusUpdated");
        };
    }, [user]);

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 5000);
    };

    const handleSubmitReview = async () => {
        if (!newRating) return showToast("error", "Hãy chọn số sao trước khi gửi!");
        try {
            const payload = { movieId: id!, rating: newRating, comment };
            const res = await addReview(payload);
            showToast("success", res.message || "Bình luận của bạn đang chờ duyệt!");
            setComment("");
            setNewRating(0);
        } catch {
            showToast("error", "Lỗi khi gửi đánh giá!");
        }
    };

    const handleLikeReview = async (id: string) => {
        const res = await toggleLikeReview(id);
        setReviews((prev) =>
            prev.map((r) =>
                r._id === id ? { ...r, liked: res.liked, likesCount: res.likesCount } : r
            )
        );
    };

    const handleLikeMovie = async () => {
        try {
            const res = await toggleLikeMovie(id!);
            setIsLiked(res.liked);
            setLikeCount(res.likesCount);
        } catch {
            showToast("error", "Bạn cần đăng nhập để thích phim này!");
        }
    };
    if (!movie)
        return <div className="text-center text-gray-400 py-20">Đang tải...</div>;

    const trailerUrl = movie.Trailer?.startsWith("http")
        ? movie.Trailer
        : `http://localhost:3001${movie.Trailer}`;

    return (
        <section className="min-h-screen bg-[#fafafa] text-[#0f172a] relative">
            <Helmet>
                <meta charSet="utf-8" />
                <title>{movie.tieuDe}</title>
            </Helmet>
            {/* ✅ Custom Toast Popup */}
            {toast && (
                <div
                    className={`fixed top-6 right-6 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white transition-all animate-fadeIn z-50
            ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}
          `}
                >
                    {toast.type === "success" ? (
                        <CheckCircle2 size={20} />
                    ) : (
                        <XCircle size={20} />
                    )}
                    <p className="text-sm font-medium">{toast.message}</p>
                </div>
            )}

            <div className="max-w-[1100px] mx-auto py-12 px-4 sm:px-8">
                {/* THÔNG TIN PHIM */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
                    {/* Poster + Rating + Like */}
                    <div className="flex flex-col items-center md:items-start space-y-3">
                        <img
                            src={`http://localhost:3001${movie.anhPoster}`}
                            alt={movie.tieuDe}
                            className="w-[260px] sm:w-[300px] rounded-lg shadow-lg"
                        />
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mt-2">
                            <div className="text-center md:text-left">
                                <RatingStars value={avgRating} />
                                <p className="text-sm text-gray-600">
                                    {avgRating.toFixed(1)} / 5.0 ({reviews.length} lượt)
                                </p>
                            </div>

                            <button
                                onClick={handleLikeMovie}
                                className={`flex items-center gap-1 px-4 py-1.5 rounded-full border text-sm font-medium transition ${isLiked
                                    ? "bg-red-100 border-red-400 text-red-600"
                                    : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                                    }`}
                            >
                                <Heart
                                    size={18}
                                    fill={isLiked ? "red" : "none"}
                                    className="transition"
                                />
                                <span>Thích ({likeCount})</span>
                            </button>
                        </div>
                    </div>

                    {/* Thông tin phim */}
                    <div className="md:col-span-2 space-y-3">
                        <h2 className="text-3xl font-bold uppercase">{movie.tieuDe}</h2>
                        {movie.isHot && (
                            <span className="flex items-center gap-1 text-red-600 font-semibold text-sm">
                                <Flame size={16} /> HOT
                            </span>
                        )}
                        <ul className="space-y-1 text-gray-700 text-sm md:text-base">
                            <li><b>Đạo diễn:</b> {movie.daoDien || "Đang cập nhật"}</li>
                            <li><b>Diễn viên:</b> {movie.dienVien || "Đang cập nhật"}</li>
                            <li><b>Thể loại:</b> {movie.theLoai || "Đang cập nhật"}</li>
                            <li><b>Khởi chiếu:</b> {new Date(movie.ngayKhoiChieu).toLocaleDateString("vi-VN")}</li>
                            <li><b>Thời lượng:</b> {movie.thoiLuong} phút</li>
                            <li><b>Ngôn ngữ:</b> {movie.ngonNgu || "Phụ đề Tiếng Việt"}</li>
                            <li><b>Nội dung phim:</b> {movie.moTa || "Thông tin chi tiết đang được cập nhật."}</li>
                        </ul>

                        <div className="flex flex-wrap gap-3 mt-5">
                            <button
                                onClick={() => setIsTrailerOpen(true)}
                                className="flex items-center gap-2 px-6 py-2 bg-[#FF6600] text-white rounded-full font-semibold hover:bg-[#ff7e26] transition"
                            >
                                <PlayCircle size={18} />
                                Xem Trailer
                            </button>
                            <button
                                onClick={() => {
                                    if (!user) {
                                        showToast("error", "Bạn cần đăng nhập để đặt vé!");
                                        // return navigate("/login");
                                    }
                                    setIsShowtimeOpen(true);
                                }}
                                className="px-6 py-2 bg-[#0f172a] text-white rounded-full font-semibold hover:bg-[#1e293b] transition"
                            >
                                🎟️ Đặt vé ngay
                            </button>

                        </div>
                    </div>
                </div>

                {/* PHẦN ĐÁNH GIÁ */}
                <div className="mt-12 border-t pt-6">
                    <h3 className="text-xl font-semibold mb-4">Đánh giá & bình luận</h3>
                    <div className="mb-6">
                        <RatingStars value={newRating} editable onChange={setNewRating} />
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full border rounded-lg p-2 mt-2"
                            placeholder="Viết bình luận..."
                        />
                        <button
                            onClick={handleSubmitReview}
                            className="mt-2 px-6 py-2 bg-[#FF6600] text-white rounded-full hover:bg-[#ff7e26]"
                        >
                            Gửi đánh giá
                        </button>
                    </div>
                    {/* Danh sách bình luận */}
                    <ul className="space-y-3">
                        {reviews.map((r) => (
                            <li key={r._id} className="p-3 bg-gray-100 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-xl text-gray-800">
                                            {r.userId?.fullname || "Ẩn danh"}
                                        </p>
                                        <RatingStars value={r.rating} />
                                    </div>
                                    <button
                                        onClick={() => handleLikeReview(r._id)}
                                        className="flex items-center gap-1 text-gray-600 hover:text-red-500"
                                    >
                                        <Heart
                                            size={18}
                                            fill={r.liked ? "red" : "none"}
                                            className="transition"
                                        />
                                        {r.likesCount || 0}
                                    </button>
                                </div>
                                <p className="text-gray-700 mt-1">{r.comment}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(r.createdAt).toLocaleString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    })}
                                </p>
                            </li>
                        ))}
                    </ul>

                </div>
            </div>

            <TrailerModal
                trailerUrl={trailerUrl}
                isOpen={isTrailerOpen}
                onClose={() => setIsTrailerOpen(false)}
            />
            <ShowtimeModal
                isOpen={isShowtimeOpen}
                onClose={() => setIsShowtimeOpen(false)}
                showtimes={showtimes}
                movieTitle={movie.tieuDe}
                moviePoster={movie.anhPoster}
                onSelect={(st) => navigate(`/booking/${st._id}`)}
                isLoading={isShowtimeLoading}
            />

        </section>
    );
}
