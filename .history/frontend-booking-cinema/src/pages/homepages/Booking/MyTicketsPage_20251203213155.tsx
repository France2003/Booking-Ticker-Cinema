import { useEffect, useState, useRef } from "react";
import { getMyBookings } from "../../../services/booking/booking";
import type { IBooking } from "../../../types/bookings/booking";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import TicketCard from "../../../components/TicketCard";
import { Film, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import { socket } from "../../../utils/socket";
import { useUser } from "../../../contexts/UserContext";
import { playSound } from "../../../utils/playSound";

dayjs.locale("vi");

export default function MyTicketsPage() {
    const [bookings, setBookings] = useState<IBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    // ⚙️ Ngăn đăng ký socket lặp lại
    const socketRegistered = useRef(false);
    // 📦 Lấy danh sách vé của người dùng
    const fetchBookings = async () => {
        try {
            const data = await getMyBookings();
            const filtered = data.filter((b: IBooking) => {
                const now = dayjs();
                if (b.showtimeId?.endTime && dayjs(b.showtimeId.endTime).isBefore(now)) {
                    return false;
                }
                if (b.paymentStatus !== "cancelled") return true;
                if (!b.updatedAt) return false;
                const minutesSinceCancel = dayjs().diff(dayjs(b.updatedAt), "minute");
                return minutesSinceCancel < 15;
            });
            setBookings(filtered);
        } catch (err) {
            console.error("❌ Không thể tải danh sách vé:", err);
            toast.error("Không thể tải danh sách vé!");
        } finally {
            setLoading(false);
        }
    };

    // 🔔 Lắng nghe sự kiện socket
    useEffect(() => {
        if (!user?._id) return;

        fetchBookings();

        // 🔒 Chỉ đăng ký socket 1 lần
        if (socketRegistered.current) return;
        socketRegistered.current = true;

        console.log("🎯 MyTicketsPage mounted for user:", user._id);

        const handleConnect = () => {
            console.log("🔗 Socket connected:", socket.id);
            socket.emit("registerUser", user._id);
            console.log("👤 Registered socket for user:", user._id);
        };
        const handleBookingUpdate = (data: any) => {
            console.log("📩 Received bookingUpdate:", data);
            // 🔊 Phát âm thanh phù hợp sau 300ms (mượt hơn)
            setTimeout(() => {
                playSound(data.status === "paid" ? "success" : "error");
            }, 300);
            // 💬 Hiển thị thông báo UI
            const msg =
                data.status === "paid"
                    ? `✅ Vé ${data.bookingCode} đã được duyệt thành công!`
                    : `❌ Vé ${data.bookingCode} đã bị hủy.`;

            toast(
                <div className="space-y-1">
                    <p className="font-semibold text-gray-800">{msg}</p>
                    <p className="text-sm text-gray-600">
                        🎬 {data.movieTitle || "Không rõ phim"} <br />
                        💺 {data.seats?.join(", ") || "—"} <br />
                        💰 {data.totalPrice?.toLocaleString("vi-VN")} VNĐ
                    </p>
                </div>,
                {
                    position: "top-right",
                    autoClose: 6000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: data.status === "paid" ? "light" : "colored",
                    className:
                        data.status === "paid"
                            ? "bg-green-50 border-l-4 border-green-500 text-green-700"
                            : "bg-red-50 border-l-4 border-red-500 text-red-700",
                }
            );

            // 🕐 Cập nhật danh sách vé sau 0.5 giây
            setTimeout(fetchBookings, 500);
        };

        // Kết nối socket
        if (socket.connected) handleConnect();
        else socket.on("connect", handleConnect);

        socket.on("bookingUpdate", handleBookingUpdate);

        // 🧹 Cleanup
        return () => {
            console.log("🧹 Cleanup socket listeners (MyTicketsPage)");
            socket.off("connect", handleConnect);
            socket.off("bookingUpdate", handleBookingUpdate);
        };
    }, [user?._id]);

    // ⏳ Loading
    if (loading)
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 text-gray-600">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-3" />
                <p className="font-medium">⏳ Đang tải danh sách vé của bạn...</p>
            </div>
        );

    // 😢 Không có vé
    if (!bookings.length)
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                <Film className="w-14 h-14 text-gray-400 mb-3" />
                <p className="text-lg font-medium">😢 Bạn chưa có vé nào được đặt.</p>
                <p className="text-sm text-gray-400">
                    Hãy đặt vé ngay để thưởng thức những bộ phim mới nhất!
                </p>
            </div>
        );

    // 🎫 Hiển thị danh sách vé
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <Helmet>
                <meta charSet="utf-8" />
                <title>Vé của tôi</title>
            </Helmet>

            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">🎟️ Vé Của Tôi</h1>
                    <p className="text-gray-600">
                        Dưới đây là danh sách các vé bạn đã đặt. Bạn có thể quét mã QR để
                        check-in nhanh tại rạp.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                    <div className="grid sm:grid-cols-2 gap-6">
                        {bookings.map((b) => (
                            <TicketCard key={b._id} booking={b} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
