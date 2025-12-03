import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function PromoModal() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // 🚀 Mỗi lần mở trang -> modal bật lên
        setOpen(true);
    }, []);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-md relative animate-[fadeIn_0.3s_ease]">

                {/* Nút đóng */}
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-red-600 text-center mb-3">
                    🎁 Ưu Đãi Siêu Hot!
                </h2>

                <p className="text-gray-700 text-center mb-4">
                    Giảm <span className="font-semibold text-red-500">30%</span> cho tất cả vé hôm nay!
                </p>

                <img
                    src="https://i.imgur.com/gFZiSQZ.jpeg"
                    alt="Ưu đãi"
                    className="w-full h-40 object-contain mb-4"
                />

                <button
                    onClick={() => setOpen(false)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-lg font-semibold"
                >
                    Nhận Ưu Đãi 🎬
                </button>
            </div>
        </div>
    );
}
