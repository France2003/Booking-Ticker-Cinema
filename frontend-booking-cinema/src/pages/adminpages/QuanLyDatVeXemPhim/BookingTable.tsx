import { CheckCircle, XCircle, User, Mail, Phone } from "lucide-react";
import dayjs from "dayjs";
import type { IBooking } from "../../../types/bookings/booking";

interface Props {
    bookings: IBooking[];
    handleApprove: (code: string) => void;
    handleReject: (code: string) => void;
}

const BookingTable = ({ bookings, handleApprove, handleReject }: Props) => (
    <div className="w-full overflow-x-auto">
        <table className="min-w-full table-fixed bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
            <thead className="bg-gray-100 text-gray-700 text-sm uppercase select-none">
                <tr>
                    <th className="w-[100px] py-3 px-4 text-left font-semibold">Mã vé</th>
                    <th className="w-[200px] py-3 px-4 text-left font-semibold">Người đặt</th>
                    <th className="w-[220px] py-3 px-4 text-left font-semibold">Phim</th>
                    <th className="w-[140px] py-3 px-4 text-left font-semibold">Phòng</th>
                    <th className="w-[140px] py-3 px-4 text-left font-semibold">Suất chiếu</th>
                    <th className="w-[90px] py-3 px-4 text-left font-semibold">Ghế</th>
                    <th className="w-[130px] py-3 px-4 text-left font-semibold">Thành tiền</th>
                    <th className="w-[120px] py-3 px-4 text-center font-semibold">Trạng thái</th>
                    <th className="w-[150px] py-3 px-4 text-center font-semibold">Thao tác</th>
                </tr>
            </thead>

            <tbody className="text-sm text-gray-700">
                {bookings.map((b, idx) => (
                    <tr
                        key={b._id || idx}
                        className="border-t border-gray-100 hover:bg-gray-50 transition-all text-[14px]"
                    >
                        {/* 📄 Mã vé */}
                        <td className="py-2.5 px-4 font-mono text-gray-800 truncate">{b.bookingCode}</td>

                        {/* 👤 Người đặt */}
                        <td className="py-2.5 px-4 align-top">
                            <div className="space-y-0.5 overflow-hidden">
                                <div className="flex items-center gap-2 truncate">
                                    <User className="w-4 h-4 text-pink-500 shrink-0" />
                                    <span className="font-medium truncate">{b.userId?.fullname || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-xs truncate">
                                    <Mail className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{b.userId?.email || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    <span>{b.userId?.phone || "—"}</span>
                                </div>
                            </div>
                        </td>

                        {/* 🎬 Phim */}
                        <td
                            className="py-2.5 px-4 font-semibold text-gray-800 truncate"
                            title={b.movieId?.tieuDe}
                        >
                            {b.movieId?.tieuDe || "—"}
                        </td>

                        {/* 🏢 Phòng */}
                        <td className="py-2.5 px-4 text-gray-700 truncate text-center">
                            {b.roomId?.name || "—"}
                        </td>

                        {/* 🕒 Suất chiếu */}
                        <td className="py-2.5 px-4 text-gray-700 text-center">
                            <div className="flex flex-col leading-tight">
                                <span>{dayjs(b.showtimeId?.date).format("DD/MM/YYYY")}</span>
                                <span className="text-xs text-gray-500">
                                    {dayjs(b.showtimeId?.startTime).format("HH:mm")} -{" "}
                                    {dayjs(b.showtimeId?.endTime).format("HH:mm")}
                                </span>
                            </div>
                        </td>

                        {/* 💺 Ghế */}
                        <td className="py-2.5 px-4 text-gray-700 text-center whitespace-nowrap">
                            {b.seats.join(", ")}
                        </td>

                        {/* 💰 Thành tiền (sau khi giảm giá) */}
                        <td className="py-2.5 px-4 font-bold text-red-600 whitespace-nowrap text-right">
                            {(b.finalPrice ?? b.totalPrice).toLocaleString("vi-VN")}₫
                            {b.discount > 0 && (
                                <div className="text-xs text-gray-500 line-through">
                                    {b.totalPrice.toLocaleString("vi-VN")}₫
                                </div>
                            )}
                            {b.promotionCode && (
                                <div className="text-xs text-green-600">🎁 {b.promotionCode}</div>
                            )}
                            {b.paymentMethod && (
                                <div
                                    className={`text-xs mt-0.5 font-medium ${b.paymentMethod.toLowerCase().includes("momo")
                                            ? "text-pink-500"
                                            : b.paymentMethod.toLowerCase().includes("qr")
                                                ? "text-blue-600"
                                                : "text-green-600"
                                        }`}
                                >
                                    💳 {b.paymentMethod}
                                </div>
                            )}
                        </td>

                        {/* 📦 Trạng thái */}
                        <td className="py-2.5 px-4 text-center whitespace-nowrap">
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${b.paymentStatus === "paid"
                                        ? "bg-green-100 text-green-700"
                                        : b.paymentStatus === "pending"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {b.paymentStatus === "paid"
                                    ? "Đã thanh toán"
                                    : b.paymentStatus === "pending"
                                        ? "Chờ thanh toán"
                                        : "Đã hủy"}
                            </span>
                        </td>

                        {/* ⚙️ Thao tác */}
                        <td className="py-2.5 px-4 text-center whitespace-nowrap">
                            {b.paymentStatus === "pending" && (
                                <div className="flex justify-center gap-2">
                                    <button
                                        onClick={() => handleApprove(b.bookingCode)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-xs font-medium"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Duyệt
                                    </button>
                                    <button
                                        onClick={() => handleReject(b.bookingCode)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-xs font-medium"
                                    >
                                        <XCircle className="w-4 h-4" /> Hủy
                                    </button>
                                </div>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default BookingTable;
