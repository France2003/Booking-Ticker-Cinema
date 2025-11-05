import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { toast } from "react-toastify";
import { getSeatsByShowtime, createVNPayPayment } from "../../../services/booking/booking";
import UserSeatMap from "./UserSeatMap";
import type { IShowtime, ISeat } from "../../../types/bookings/booking";
dayjs.locale("vi");
export default function BookingPage() {
    const { id } = useParams();
    const [showtime, setShowtime] = useState<IShowtime | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // ✅ Lấy dữ liệu suất chiếu và sơ đồ ghế
    useEffect(() => {
        (async () => {
            try {
                if (!id) return;
                const data = await getSeatsByShowtime(id);
                setShowtime(data);
            } catch (err) {
                toast.error("Không thể tải dữ liệu suất chiếu.");
            }
        })();
    }, [id]);

    if (!showtime)
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-600">
                <div className="animate-spin border-4 border-orange-400 border-t-transparent rounded-full w-10 h-10 mb-3"></div>
                <p>⏳ Đang tải sơ đồ ghế...</p>
            </div>
        );

    const seats: ISeat[] = showtime.seats || [];

    // ✅ Tính tổng tiền
    const total = seats
        .filter((s) => selectedSeats.includes(s.seatNumber))
        .reduce((sum, s) => sum + s.price, 0);

    // ✅ Xử lý đặt vé & thanh toán VNPay
    const handleBooking = async () => {
        if (!selectedSeats.length) {
            toast.warn("Vui lòng chọn ít nhất 1 ghế trước khi đặt vé!");
            return;
        }

        try {
            setLoading(true);
            // 🔥 Gọi API tạo thanh toán VNPay
            const paymentUrl = await createVNPayPayment(id!, selectedSeats);
            toast.info("🔗 Đang chuyển hướng đến VNPay...");
            // ✅ Chuyển hướng sang VNPay
            window.location.href = paymentUrl;
        } catch (err: any) {
            console.error(err);
            toast.error("❌ Lỗi khi tạo thanh toán!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* --- Sơ đồ ghế --- */}
            <div className="lg:col-span-2">
                <UserSeatMap seats={seats} onChange={setSelectedSeats} />
            </div>

            {/* --- Thông tin đặt vé --- */}
            <div className="bg-white rounded-3xl shadow-xl p-6 space-y-5 border border-gray-100">
                {/* --- Thông tin phim --- */}
                <div className="flex gap-4">
                    <img
                        src={
                            showtime.movieId?.anhPoster?.startsWith("http")
                                ? showtime.movieId.anhPoster
                                : `http://localhost:3001${showtime.movieId?.anhPoster || ""}`
                        }
                        alt={showtime.movieId?.tieuDe || "Poster"}
                        className="w-[120px] h-[180px] rounded-lg object-cover shadow-md"
                    />
                    <div className="flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                                {showtime.movieId?.isHot && (
                                    <span className="text-red-500 text-xl" title="Phim hot 🔥">
                                        🔥
                                    </span>
                                )}
                                {showtime.movieId?.tieuDe}
                            </h2>
                            <p className="text-sm md:text-base text-gray-800">
                                {dayjs(showtime.date).format("DD/MM/YYYY")}
                            </p>
                            <p className="text-sm md:text-base text-gray-800">
                                {dayjs(showtime.startTime).format("HH:mm")} →{" "}
                                {dayjs(showtime.endTime).format("HH:mm")}
                            </p>
                            <p className="text-sm md:text-base text-gray-800">
                                Thời lượng: {showtime.movieId?.thoiLuong} phút
                            </p>
                            <p className="text-sm md:text-base text-gray-800">
                                Phòng:{" "}
                                <span className="font-semibold text-gray-800">
                                    {showtime.roomId?.name}
                                </span>{" "}
                                ({showtime.roomId?.type})
                            </p>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-200" />

                {/* --- Chi tiết vé --- */}
                <div className="space-y-2 text-sm text-gray-700">
                    <p>
                        <b>Ghế:</b>{" "}
                        {selectedSeats.length > 0 ? selectedSeats.join(", ") : "Chưa chọn"}
                    </p>
                    <p>
                        <b>Số vé:</b> {selectedSeats.length}
                    </p>
                    <p>
                        <b>Tổng tiền:</b>{" "}
                        <span className="text-lg font-semibold text-orange-600">
                            {total.toLocaleString("vi-VN")} VNĐ
                        </span>
                    </p>
                </div>

                {/* --- Nút đặt vé --- */}
                <button
                    onClick={handleBooking}
                    disabled={!selectedSeats.length || loading}
                    className={`w-full py-3 rounded-xl text-white font-semibold transition-all shadow-md ${!selectedSeats.length || loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-orange-500 hover:bg-orange-600"
                        }`}
                >
                    {loading ? "⏳ Đang xử lý..." : "🎟️ Xác nhận đặt vé"}
                </button>
            </div>
        </div>
    );
}
