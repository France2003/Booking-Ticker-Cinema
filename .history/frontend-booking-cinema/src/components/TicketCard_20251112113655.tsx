import { QRCodeCanvas } from "qrcode.react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import type { IBooking } from "../types/bookings/booking";
import { CalendarDays, Clock, Coins, Film } from "lucide-react";

dayjs.locale("vi");

interface TicketCardProps {
    booking: IBooking;
}

export default function TicketCard({ booking }: TicketCardProps) {
    const showtime = booking.showtimeId as any;
    const startTime = showtime?.startTime ? dayjs(showtime.startTime).format("HH:mm") : "—";
    const endTime = showtime?.endTime ? dayjs(showtime.endTime).format("HH:mm") : "—";
    const showDate = showtime?.date ? dayjs(showtime.date).format("DD/MM/YYYY") : "—";
    // 🧾 Tạo chuỗi văn bản hiển thị trong QR
    const qrText =
        `🎫 Mã vé: ${booking.bookingCode}\n` +
        `🎬 Phim: ${booking.movieId?.tieuDe || "Không rõ"}\n` +
        `📅 Ngày: ${showDate}\n` +
        `🕒 Giờ: ${startTime} - ${endTime}\n` +
        `💺 Ghế: ${booking.seats.join(", ")}\n` +
        `💰 Tổng: ${booking.totalPrice.toLocaleString("vi-VN")}đ\n` +
        `💳 Trạng thái: ${booking.paymentStatus === "paid"
            ? "Đã thanh toán"
            : booking.paymentStatus === "pending"
                ? "Chưa thanh toán"
                : "Đã hủy"
        }`;
    return (
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 flex flex-col sm:flex-row items-center gap-6 hover:shadow-xl transition-all duration-300">
            {/* QR Check-in */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className="p-2 bg-orange-50 rounded-xl border border-orange-200 shadow-sm">
                    <QRCodeCanvas value={qrText} size={120} />
                </div>
                <p className="text-xs text-gray-500 mt-1">📱 Quét để xem thông tin vé</p>
            </div>

            {/* Info Section */}
            <div className="flex-1 text-gray-700 space-y-2">
                <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <Film className="w-5 h-5 text-orange-500" /> {booking.movieId?.tieuDe || "Phim"}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-1 text-sm">
                    <p><b className="text-gray-800">🎫 Mã vé:</b> {booking.bookingCode}</p>
                    <p><b className="text-gray-800">💺 Ghế:</b> {booking.seats.join(", ")}</p>
                    <p><b className="text-gray-800">🎟️ Số vé:</b> {booking.seats.length}</p>

                    <p className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4 text-orange-500" />
                        {showDate}
                    </p>
                    <p className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-orange-500" />
                        {startTime} - {endTime}
                    </p>

                    <p className="flex items-center gap-1 font-medium text-orange-600">
                        <Coins className="w-4 h-4" />
                        {(booking.finalPrice ?? booking.totalPrice).toLocaleString("vi-VN")} VNĐ
                    </p>
                </div>

                <div className="pt-2 border-t border-gray-100 mt-2 flex flex-wrap justify-between items-center text-sm">
                    <p>
                        <b>Trạng thái:</b>{" "}
                        {booking.paymentStatus === "paid" ? (
                            <span className="text-green-600 font-semibold">Đã thanh toán</span>
                        ) : booking.paymentStatus === "pending" ? (
                            <span className="text-yellow-600 font-semibold">Chưa thanh toán</span>
                        ) : (
                            <span className="text-red-500 font-semibold">Đã hủy</span>
                        )}
                    </p>
                    {booking.paymentStatus === "cancelled" && booking.transactionNote && (
                        <p className="text-sm mt-2 text-red-500 font-medium">
                            ❌ Lý do hủy: {booking.transactionNote}
                        </p>
                    )}
                    <p className="text-gray-500">
                        Ngày đặt: {dayjs(booking.createdAt).format("DD/MM/YYYY HH:mm")}
                    </p>
                </div>
            </div>
        </div>
    );
}
