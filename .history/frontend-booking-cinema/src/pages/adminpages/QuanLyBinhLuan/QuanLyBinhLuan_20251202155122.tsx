import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getAllReviewsAdmin, approveReview } from "../../../services/reviews/review";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import AdminLayout from "../../../layouts/adminlayout/adminlayout";

// ⚙️ Socket config
const socket = io("http://localhost:3001", { transports: ["websocket"] });

export default function QuanLyBinhLuan() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [status, setStatus] = useState<string>("pending");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [newReviewAlert, setNewReviewAlert] = useState<any | null>(null);

    // 🧩 Lấy danh sách bình luận
    const fetchReviews = async () => {
        try {
            setLoading(true);
            let filterStatus = status;
            if (status === "pending") {
                filterStatus = "pending,approved";
            }
            const res = await getAllReviewsAdmin({
                page,
                limit: 10,
                status: filterStatus, // luôn là string → không lỗi TypeScript
            });
            setReviews(res.data);
        } catch (err) {
            console.error("❌ Lỗi khi tải bình luận:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [page, status]);

    // 🟢 Admin duyệt hoặc từ chối bình luận
    const handleApprove = async (id: string, newStatus: string) => {
        try {
            await approveReview(id, { status: newStatus });
            fetchReviews();
        } catch (err) {
            console.error("❌ Lỗi khi duyệt:", err);
        }
    };

    // ⚡ Lắng nghe realtime khi có bình luận mới
    useEffect(() => {
        socket.on("newReviewPending", (data) => {
            console.log("🆕 Bình luận mới chờ duyệt:", data);
            if (status === "pending") fetchReviews();
            setNewReviewAlert({
                movieTitle: data.movieTitle,
                userName: data.userName,
                comment: data.comment,
                rating: data.rating,
                createdAt: data.createdAt,
            });
            setTimeout(() => setNewReviewAlert(null), 5000);
        });
        return () => {
            socket.off("newReviewPending");
        };
    }, [status]);

    return (
        <AdminLayout>
            <div className="p-6 bg-white rounded-xl shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                        📝 Quản lý bình luận
                    </h2>
                    <select
                        value={status}
                        onChange={(e) => {
                            setPage(1);
                            setStatus(e.target.value);
                        }}
                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="pending">⏳ Chờ duyệt</option>
                        <option value="approved">✅ Đã duyệt</option>
                        <option value="rejected">❌ Đã từ chối</option>
                    </select>
                </div>
                {newReviewAlert && (
                    <div className="mb-5 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow-sm animate-fadeIn">
                        <p className="text-yellow-800 font-semibold">📩 Bình luận mới chờ duyệt!</p>
                        <p className="text-sm text-gray-700 mt-1">
                            <b>{newReviewAlert.userName}</b> bình luận phim{" "}
                            <b>{newReviewAlert.movieTitle}</b>: “{newReviewAlert.comment}” ({newReviewAlert.rating}⭐)
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date(newReviewAlert.createdAt).toLocaleString("vi-VN")}
                        </p>
                    </div>
                )}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm text-gray-700">
                        <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
                            <tr>
                                <th className="p-3 text-left">🎬 Phim</th>
                                <th className="p-3 text-left">👤 Người dùng</th>
                                <th className="p-3 text-left">💬 Bình luận</th>
                                <th className="p-3 text-center">⭐</th>
                                <th className="p-3 text-center">📅 Thời gian</th>
                                <th className="p-3 text-center">📌 Trạng thái</th>
                                <th className="p-3 text-center">⚙️ Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-6 text-gray-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : reviews.length > 0 ? (
                                reviews.map((r) => (
                                    <tr key={r._id} className="border-t hover:bg-gray-50 transition">
                                        <td className="p-3 font-medium text-blue-600">{r.movieId?.tieuDe}</td>
                                        <td className="p-3 font-semibold text-gray-800">
                                            {r.userId?.fullname || "Ẩn danh"}
                                        </td>
                                        <td className="p-3">{r.comment}</td>
                                        <td className="p-3 text-center text-yellow-500">{r.rating}⭐</td>
                                        <td className="p-3 text-center text-xs text-gray-500">
                                            {new Date(r.createdAt).toLocaleString("vi-VN")}
                                        </td>
                                        <td className="p-3 text-center">
                                            {r.status === "pending" && (
                                                <span className="inline-flex items-center gap-1 text-yellow-600">
                                                    <Clock size={16} /> Chờ duyệt
                                                </span>
                                            )}
                                            {r.status === "approved" && (
                                                <span className="inline-flex items-center gap-1 text-green-600">
                                                    <CheckCircle size={16} /> Đã duyệt
                                                </span>
                                            )}
                                            {r.status === "rejected" && (
                                                <span className="inline-flex items-center gap-1 text-red-600">
                                                    <XCircle size={16} /> Từ chối
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            {r.status === "pending" ? (
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleApprove(r._id, "approved")}
                                                        className="px-3 py-1.5 rounded-md bg-green-500 text-white hover:bg-green-600"
                                                    >
                                                        Duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => handleApprove(r._id, "rejected")}
                                                        className="px-3 py-1.5 rounded-md bg-red-500 text-white hover:bg-red-600"
                                                    >
                                                        Từ chối
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">---</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-6 text-gray-500">
                                        Không có bình luận nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
