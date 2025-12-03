import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function PromoPosterModal() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(true); // 🚀 Mở mỗi lần vào trang
    }, []);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div className="relative">
                
                {/* Nút X đóng */}
                <button
                    onClick={() => setOpen(false)}
                    className="absolute -top-4 -right-4 bg-white/90 hover:bg-white text-red-600 w-10 h-10 rounded-full shadow-lg flex items-center justify-center"
                >
                    <X size={24} />
                </button>

                {/* POSTER */}
                <img
                    src="https://i.imgur.com/gFZiSQZ.jpeg" 
                    alt="Khuyến mãi"
                    className="w-[360px] sm:w-[420px] rounded-2xl shadow-2xl border border-white"
                />

                {/* Nút CTA */}
                <button
                    onClick={() => setOpen(false)}
                    className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold shadow-md"
                >
                    Nhận khuyến mãi ngay 🎁
                </button>
            </div>
        </div>
    );
}
