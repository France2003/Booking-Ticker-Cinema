import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useUser } from "../../../contexts/UserContext";
import {
    CheckCircle,
    Loader2,
    CreditCard,
    Smartphone,
    Wallet,
    Popcorn,
    CupSoda,
    Tag,
} from "lucide-react";
import { Helmet } from "react-helmet";
import { createBooking } from "../../../services/booking/booking";
import { socket } from "../../../utils/socket";
import { checkPromotionCode } from "../../../services/promotions/promotions";

dayjs.locale("vi");
export default function ConfirmBookingPage() {
    const { state } = useLocation();
    const { showtime, selectedSeats, total } = state || {};
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [method, setMethod] = useState<"momo" | "qr" | "cash" | null>(null);
    const [extras, setExtras] = useState<{ popcorn: boolean; drink: boolean; combo: boolean }>({
        popcorn: false,
        drink: false,
        combo: false,
    });
    const [promoCode, setPromoCode] = useState("");
    const [promotion, setPromotion] = useState<any>(null);
    const [discount, setDiscount] = useState(0);
    const navigate = useNavigate();

    if (!showtime || !selectedSeats) {
        return (
            <div className="text-center py-20 text-gray-600">
                ❌ Không có thông tin đặt vé. Hãy quay lại chọn ghế.
            </div>
        );
    }
    // 💸 Giá dịch vụ phụ
    const prices = {
        popcorn: 25000,
        drink: 15000,
        combo: 35000,
    };
    // 🎯 Tổng tiền tính theo lựa chọn
    const extraTotal = Object.entries(extras).reduce(
        (sum, [key, val]) => sum + (val ? prices[key as keyof typeof prices] : 0),
        0
    );
    const finalTotal = Math.max(0, total + extraTotal - discount);
    // 🏷️ Gọi API kiểm tra mã khuyến mãi thật
    const handleApplyPromo = async () => {
        if (!promoCode.trim()) {
            toast.warning("Vui lòng nhập mã khuyến mãi!");
            return;
        }
        try {
            toast.info("🔍 Đang kiểm tra mã khuyến mãi...");
            const promo = await checkPromotionCode(promoCode.trim());
            setPromotion(promo);

            let discountValue = 0;
            if (promo.loai === "percent") discountValue = Math.round(total * (promo.giaTri / 100));
            else if (promo.loai === "fixed") discountValue = promo.giaTri;

            setDiscount(discountValue);

            toast.success(
                `🎉 Mã ${promo.maCode} hợp lệ - Giảm ${promo.loai === "percent"
                    ? `${promo.giaTri}%`
                    : `${promo.giaTri.toLocaleString("vi-VN")}đ`
                }`
            );
        } catch (err: any) {
            console.error("❌ Lỗi kiểm tra mã:", err);
            setPromotion(null);
            setDiscount(0);
            toast.error(err.response?.data?.message || "❌ Mã khuyến mãi không hợp lệ!");
        }
    };

    // ✅ Xác nhận đặt vé
    const handleConfirmBooking = async () => {
        if (!method) {
            toast.warning("Vui lòng chọn hình thức thanh toán!");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                showtimeId: showtime._id,
                selectedSeats,
                moviePoster: showtime.movieId?.anhPoster,
                movieTitle: showtime.movieId?.tieuDe,
                paymentMethod:
                    method === "momo" ? "MoMo" : method === "qr" ? "QR Banking" : "Tiền mặt",
                extraServices: extras,
                totalPrice: finalTotal,
                discount,
                promotionCode: promotion?.maCode || null,
            };

            const res = await createBooking(payload);

            socket.emit("newBooking", {
                bookingCode: res.bookingCode,
                userId: user?._id,
                movieTitle: showtime.movieId?.tieuDe,
                showtimeId: showtime._id,
                seats: selectedSeats,
                totalPrice: res.totalPrice,
                paymentMethod: payload.paymentMethod,
                createdAt: new Date(),
            });

            toast.success("🎉 Đặt vé thành công! Vé điện tử sẽ được gửi đến email của bạn.");

            navigate("/booking-success", {
                state: {
                    booking: {
                        bookingCode: res.bookingCode,
                        totalPrice: res.totalPrice,
                        paymentMethod: payload.paymentMethod,
                    },
                    user,
                },
            });
        } catch (err: any) {
            console.error("❌ Lỗi khi tạo thanh toán:", err.response?.data || err);
            toast.error(err.response?.data?.message || "Đã xảy ra lỗi khi xác nhận đặt vé.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <Helmet>
                <title>Xác nhận đặt vé - FranceCinema</title>
            </Helmet>

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Tiêu đề */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Xác nhận thông tin đặt vé 🎬
                    </h1>
                    <p className="text-gray-600">Chọn phương thức thanh toán, dịch vụ và khuyến mãi.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* 👤 Thông tin người đặt */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            👤 Thông tin người đặt
                        </h2>
                        <div className="space-y-2 text-gray-700">
                            <p><b>Họ tên:</b> {user?.fullname || "—"}</p>
                            <p><b>Email:</b> {user?.email || "—"}</p>
                            <p><b>SĐT:</b> {user?.phone || "—"}</p>
                        </div>

                        {/* 💳 Thanh toán */}
                        <div className="mt-6">
                            <h3 className="font-semibold text-gray-800 mb-2">
                                💳 Hình thức thanh toán
                            </h3>
                            <div className="grid gap-3">
                                {[
                                    { key: "momo", label: "Ví MoMo", icon: <Smartphone className="w-5 h-5" /> },
                                    { key: "qr", label: "QR Banking", icon: <CreditCard className="w-5 h-5" /> },
                                    { key: "cash", label: "Tiền mặt tại rạp", icon: <Wallet className="w-5 h-5" /> },
                                ].map(({ key, label, icon }) => (
                                    <button
                                        key={key}
                                        onClick={() => setMethod(key as any)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${method === key
                                            ? "border-pink-500 bg-pink-50 text-pink-700 font-semibold shadow-sm"
                                            : "border-gray-200 hover:border-pink-400 hover:bg-gray-50"
                                            }`}
                                    >
                                        {icon} {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 🍿 Dịch vụ đi kèm */}
                        <div className="mt-6">
                            <h3 className="font-semibold text-gray-800 mb-3">🍿 Dịch vụ đi kèm</h3>
                            <div className="flex flex-col gap-2">
                                {[
                                    { key: "popcorn", label: "Bắp rang bơ", price: prices.popcorn, icon: <Popcorn /> },
                                    { key: "drink", label: "Nước ngọt", price: prices.drink, icon: <CupSoda /> },
                                    { key: "combo", label: "Combo bắp + nước", price: prices.combo, icon: <Popcorn /> },
                                ].map(({ key, label, price, icon }) => (
                                    <label
                                        key={key}
                                        className="flex items-center gap-3 cursor-pointer border p-3 rounded-lg hover:bg-gray-50 transition-all"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={extras[key as keyof typeof extras]}
                                            onChange={(e) =>
                                                setExtras({ ...extras, [key]: e.target.checked })
                                            }
                                            className="w-5 h-5 text-pink-500 focus:ring-pink-400 border-gray-300 rounded"
                                        />
                                        {icon}
                                        <span className="flex-1">{label}</span>
                                        <span className="text-sm text-gray-600">
                                            +{price.toLocaleString("vi-VN")}đ
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 🎁 Mã khuyến mãi */}
                        <div className="mt-6">
                            <h3 className="font-semibold text-gray-800 mb-2">🎁 Mã khuyến mãi</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Nhập mã (VD: GRANDOPEN20)"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400"
                                />
                                <button
                                    onClick={handleApplyPromo}
                                    className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <Tag className="w-4 h-4" /> Áp dụng
                                </button>
                            </div>

                            {promotion && (
                                <div className="mt-3 flex items-center gap-3 border p-3 rounded-lg bg-green-50 border-green-200">
                                    <img
                                        src={promotion.anhDaiDien}
                                        alt={promotion.tenKhuyenMai}
                                        className="w-12 h-12 object-cover rounded-lg"
                                    />
                                    <div>
                                        <p className="font-semibold text-green-700">
                                            {promotion.tenKhuyenMai}
                                        </p>
                                        <p className="text-sm text-gray-600">{promotion.moTa}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 🎟️ Vé xem phim */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                            🎟️ Thông tin vé xem phim
                        </h2>

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* Poster */}
                            <div className="w-full md:w-1/3 flex justify-center">
                                <img
                                    src={
                                        showtime.movieId?.anhPoster?.startsWith("http")
                                            ? showtime.movieId.anhPoster
                                            : `http://localhost:3001${showtime.movieId?.anhPoster || ""}`
                                    }
                                    alt={showtime.movieId?.tieuDe || "Poster"}
                                    className="w-40 h-60 rounded-xl object-cover shadow-md border border-gray-200"
                                />
                            </div>

                            {/* Thông tin vé */}
                            <div className="w-full md:w-2/3 space-y-3 text-gray-700">
                                <p className="text-xl font-semibold text-gray-900">
                                    {showtime.movieId.tieuDe}
                                </p>

                                <div className="grid grid-cols-2 gap-y-2 text-sm sm:text-base">
                                    <span className="font-medium text-gray-500">📅 Ngày chiếu:</span>
                                    <span>{dayjs(showtime.date).format("DD/MM/YYYY")}</span>

                                    <span className="font-medium text-gray-500">⏰ Giờ chiếu:</span>
                                    <span>
                                        {dayjs(showtime.startTime).format("HH:mm")} -{" "}
                                        {dayjs(showtime.endTime).format("HH:mm")}
                                    </span>

                                    <span className="font-medium text-gray-500">🏛️ Phòng:</span>
                                    <span>{showtime.roomId.name} ({showtime.roomId.type})</span>

                                    <span className="font-medium text-gray-500">💺 Ghế:</span>
                                    <span>{selectedSeats.join(", ")}</span>

                                    <span className="font-medium text-gray-500">🎟️ Số vé:</span>
                                    <span>{selectedSeats.length}</span>
                                </div>

                                {/* Tổng tiền */}
                                <div className="mt-4 bg-orange-50 p-3 rounded-xl text-center">
                                    <p className="text-lg font-bold text-orange-600">
                                        Tổng cộng: {finalTotal.toLocaleString("vi-VN")} VNĐ
                                    </p>
                                    {extraTotal > 0 && (
                                        <p className="text-xs text-gray-500">
                                            (Bao gồm dịch vụ: +{extraTotal.toLocaleString("vi-VN")}đ)
                                        </p>
                                    )}
                                    {discount > 0 && (
                                        <p className="text-xs text-green-600">
                                            Giảm giá: -{discount.toLocaleString("vi-VN")}đ
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Nút xác nhận --- */}
                <div className="text-center">
                    <button
                        onClick={handleConfirmBooking}
                        disabled={loading}
                        className={`flex items-center justify-center gap-2 mx-auto w-full md:w-1/2 py-3 rounded-xl text-white font-semibold transition-all shadow-md ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-pink-500 hover:bg-pink-600 active:scale-95"
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" /> Xác nhận & Thanh toán
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
