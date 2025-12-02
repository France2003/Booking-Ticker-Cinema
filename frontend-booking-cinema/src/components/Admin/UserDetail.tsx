import React, { useEffect, useState } from "react";
import type { User } from "../../types/userManager/userManage";
import type { IBooking } from "../../types/bookings/booking";
import {
    X,
    Calendar,
    Phone,
    Mail,
    MapPin,
    User as UserIcon,
    Transgender,
    LockOpen,
} from "lucide-react";
import InfoRow from "../InfoRow";
import { getBookingsByUser } from "../../services/booking/booking";
interface UserDetailModalProps {
    user: User;
    onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
    const [veDangDat, setVeDangDat] = useState<IBooking[]>([]);
    const [lichSuDatVe, setLichSuDatVe] = useState<IBooking[]>([]);
    const [loading, setLoading] = useState(true);
    // 🔹 Gọi API lấy vé của người dùng
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const bookings = await getBookingsByUser(user._id);
                // Tách vé đang đặt và lịch sử
                setVeDangDat(bookings.filter((b) => b.paymentStatus === "pending"));
                setLichSuDatVe(bookings.filter((b) => b.paymentStatus !== "pending"));
            } catch (err) {
                console.error("❌ Lỗi khi tải vé người dùng:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user._id) fetchBookings();
    }, [user._id]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 relative overflow-y-auto max-h-[90vh]">
                {/* Nút đóng */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
                >
                    <X size={22} />
                </button>

                {/* Tiêu đề */}
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
                    👤 Thông tin người dùng
                </h2>

                {/* --- Thông tin người dùng --- */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <InfoRow icon={<UserIcon size={18} />} label="Họ tên" value={user.fullname} />
                    <InfoRow icon={<Mail size={18} />} label="Email" value={user.email} />
                    <InfoRow icon={<Phone size={18} />} label="Số điện thoại" value={user.phone} />
                    <InfoRow
                        icon={<Calendar size={18} />}
                        label="Ngày sinh"
                        value={
                            user.dateofbirth
                                ? new Date(user.dateofbirth).toLocaleDateString("vi-VN")
                                : "Chưa cập nhật"
                        }
                    />
                    <InfoRow icon={<Transgender size={18} />} label="Giới tính" value={user.gender || "Chưa cập nhật"} />
                    <InfoRow icon={<MapPin size={18} />} label="Địa chỉ" value={user.address || "Chưa cập nhật"} />
                    <InfoRow
                        icon={<LockOpen size={18} />}
                        label="Trạng thái"
                        value={user.trangThai ? "Hoạt động" : "Bị khóa"}
                    />
                </div>

                {/* --- Vé đang đặt --- */}
                <Section title="🎟 Vé đang đặt">
                    {loading ? (
                        <p>Đang tải dữ liệu...</p>
                    ) : veDangDat.length > 0 ? (
                        <BookingList bookings={veDangDat} />
                    ) : (
                        <EmptyMessage text="Hiện chưa có vé đang đặt" />
                    )}
                </Section>

                {/* --- Lịch sử đặt vé --- */}
                <Section title="🕓 Lịch sử đặt vé">
                    {loading ? (
                        <p>Đang tải dữ liệu...</p>
                    ) : lichSuDatVe.length > 0 ? (
                        <BookingList bookings={lichSuDatVe} />
                    ) : (
                        <EmptyMessage text="Hiện chưa có lịch sử đặt vé" />
                    )}
                </Section>
            </div>
        </div>
    );
};

// ====================== SUB COMPONENTS ======================

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 border-l-4 border-blue-600 pl-2">
            {title}
        </h3>
        {children}
    </div>
);

const EmptyMessage = ({ text }: { text: string }) => (
    <p className="text-gray-500 italic text-sm">{text}</p>
);

const BookingList = ({ bookings }: { bookings: IBooking[] }) => (
    <div className="space-y-4">
        {bookings.map((b) => (
            <div
                key={b._id}
                className="flex items-start gap-3 border rounded-lg p-3 shadow-sm hover:shadow-md transition"
            >
                {/* Ảnh poster phim */}
                {b.movieId?.anhPoster && (
                    <img
                         src={`http://localhost:3001${b.movieId.anhPoster}`}
                        alt={b.movieId.tieuDe}
                        className="w-16 h-20 rounded mt-[40px]  object-cover"
                    />
                )}

                {/* Thông tin vé */}
                <div className="flex-1">
                    <p className="font-semibold text-blue-700">
                        {b.movieId?.tieuDe || "Không rõ phim"}
                    </p>
                    <p className="text-sm text-gray-600">Mã vé: {b.bookingCode}</p>
                    <p className="text-sm text-gray-600">Ghế: {b.seats.join(", ")}</p>

                    {b.showtimeId && (
                        <p className="text-sm text-gray-600">
                            Suất chiếu: {b.showtimeId.date} ({b.showtimeId.startTime} -{" "}
                            {b.showtimeId.endTime})
                        </p>
                    )}
                    {b.roomId && (
                        <p className="text-sm text-gray-600">
                            Phòng: {b.roomId.name} ({b.roomId.type})
                        </p>
                    )}

                    <p className="text-sm text-gray-600">
                        Tổng tiền: {b.finalPrice?.toLocaleString() || b.totalPrice.toLocaleString()} VNĐ
                    </p>

                    <p className="text-sm text-gray-600">
                        Thanh toán: {b.paymentMethod || "Không xác định"}
                    </p>

                    <p
                        className={`text-sm font-medium mt-1 ${b.paymentStatus === "pending"
                                ? "text-orange-600"
                                : b.paymentStatus === "paid"
                                    ? "text-green-600"
                                    : "text-red-500"
                            }`}
                    >
                        {b.paymentStatus === "pending"
                            ? "Đang chờ thanh toán"
                            : b.paymentStatus === "paid"
                                ? "Đã thanh toán"
                                : "Đã hủy"}
                    </p>
                </div>
            </div>
        ))}
    </div>
);

export default UserDetailModal;
