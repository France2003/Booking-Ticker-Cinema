import { useLocation, Link } from "react-router-dom";
import { CheckCircle2, Home, Mail } from "lucide-react";
import { Helmet } from "react-helmet";
export default function BookingSuccessPage() {
    const { state } = useLocation();
    const booking = state?.booking;
    const user = state?.user;
    // const showtime = state?.showtime;
    if (!booking || !user) {
        return (
            <div className="text-center py-20 text-gray-600">
                ❌ Không tìm thấy thông tin đặt vé. Vui lòng quay lại.
            </div>
        );
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Helmet>
                <meta charSet="utf-8" />
                <title>Đặt vé thành công</title>
            </Helmet>
            <div className="bg-white shadow-xl rounded-2xl p-8 text-center max-w-md w-full border border-gray-100">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Cảm ơn bạn đã đặt vé 🎬
                </h1>

                <p className="text-gray-600 mb-4">
                    Vé điện tử của bạn đã được gửi đến email:
                </p>

                <p className="font-semibold text-orange-600 flex items-center justify-center gap-2 mb-4">
                    <Mail className="w-5 h-5" /> {user.email}
                </p>

                <p className="text-sm text-gray-700 mb-6">
                    Mã vé của bạn:{" "}
                    <span className="font-semibold bg-orange-50 text-orange-700 px-2 py-1 rounded-lg">
                        {booking.bookingCode}
                    </span>
                </p>

                <p className="text-sm text-gray-500 mb-8">
                    Bạn có thể đến rạp để thanh toán & check-in trực tiếp.
                </p>
                <div className="flex justify-center gap-3">
                    <Link
                        to="/user/my-tickets"
                        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-xl transition-all shadow-md"
                    >
                        🎟️ Vé của tôi
                    </Link>

                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-xl transition-all shadow-md"
                    >
                        <Home className="w-5 h-5" /> Về trang chủ
                    </Link>
                </div>

            </div>
        </div>
    );
}
