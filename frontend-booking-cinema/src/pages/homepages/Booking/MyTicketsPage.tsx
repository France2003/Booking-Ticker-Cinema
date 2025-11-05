import { useEffect, useState } from "react";
import { getMyBookings } from "../../../services/booking/booking";
import type { IBooking } from "../../../types/bookings/booking";
import dayjs from "dayjs";
import { QRCodeCanvas } from "qrcode.react";
import "dayjs/locale/vi";

dayjs.locale("vi");
export default function MyTicketsPage() {
    const [bookings, setBookings] = useState<IBooking[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        (async () => {
            try {
                const data = await getMyBookings();
                setBookings(data);
            } catch (err) {
                console.error("Không thể tải danh sách vé:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);
    if (loading)
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-600">
                <div className="animate-spin border-4 border-orange-400 border-t-transparent rounded-full w-10 h-10 mb-3"></div>
                <p>⏳ Đang tải danh sách vé...</p>
            </div>
        );

    if (!bookings.length)
        return (
            <div className="text-center py-20 text-gray-500">
                <p>😢 Bạn chưa đặt vé nào.</p>
            </div>
        );
    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">🎟️ Vé của tôi</h1>
            <div className="grid md:grid-cols-2 gap-6">
                {bookings.map((b) => (
                    <div
                        key={b._id}
                        className="bg-white shadow-lg rounded-2xl p-5 border border-gray-100 flex flex-col sm:flex-row items-center gap-5"
                    >
                        <div className="flex-shrink-0">
                            <QRCodeCanvas value={b.bookingCode} size={100} />
                        </div>
                        <div className="flex-1 text-sm text-gray-700 space-y-1">
                            <h2 className="font-semibold text-gray-800 text-lg">
                                {b.movieId?.tieuDe || "Phim"}
                            </h2>
                            <p><b>Mã vé:</b> {b.bookingCode}</p>
                            <p><b>Ghế:</b> {b.seats.join(", ")}</p>
                            <p><b>Tổng tiền:</b> {b.totalPrice.toLocaleString("vi-VN")}đ</p>
                            <p>
                                <b>Trạng thái:</b>{" "}
                                {b.paymentStatus === "paid" ? (
                                    <span className="text-green-600 font-medium">Đã thanh toán</span>
                                ) : b.paymentStatus === "pending" ? (
                                    <span className="text-yellow-600 font-medium">Đang xử lý</span>
                                ) : (
                                    <span className="text-red-500 font-medium">Đã hủy</span>
                                )}
                            </p>
                            <p><b>Ngày đặt:</b> {dayjs(b.createdAt).format("DD/MM/YYYY HH:mm")}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
