import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function PaymentResultPage() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<"success" | "failed" | null>(null);
    const [code, setCode] = useState<string | null>(null);

    useEffect(() => {
        const st = searchParams.get("status") as "success" | "failed";
        const c = searchParams.get("code");
        setStatus(st);
        setCode(c);
    }, [searchParams]);

    if (!status)
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-600">
                <div className="animate-spin border-4 border-orange-400 border-t-transparent rounded-full w-10 h-10 mb-3"></div>
                <p>⏳ Đang xử lý kết quả thanh toán...</p>
            </div>
        );

    return (
        <div className="min-h-[70vh] flex flex-col justify-center items-center text-center p-6">
            {status === "success" ? (
                <>
                    <div className="text-6xl mb-4">✅</div>
                    <h1 className="text-2xl font-bold text-green-600 mb-3">Thanh toán thành công!</h1>
                    <p className="text-gray-700 mb-2">Mã vé của bạn: <b>{code}</b></p>
                    <p className="text-gray-600 mb-5">Chúng tôi đã gửi vé điện tử vào email của bạn 🎟️</p>
                    <Link
                        to="/user/my-tickets"
                        className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-semibold"
                    >
                        Xem vé của tôi
                    </Link>
                </>
            ) : (
                <>
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold text-red-600 mb-3">Thanh toán thất bại!</h1>
                    <p className="text-gray-700 mb-5">Có lỗi xảy ra trong quá trình thanh toán VNPay.</p>
                    <Link
                        to="/"
                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold"
                    >
                        Quay lại trang chủ
                    </Link>
                </>
            )}
        </div>
    );
}
