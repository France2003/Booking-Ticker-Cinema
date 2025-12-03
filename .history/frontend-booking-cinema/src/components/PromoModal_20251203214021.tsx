import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function PromoPosterModal() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(true);
    }, []);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] animate-fadeIn">
            <div className="relative animate-zoomIn">

                {/* Poster chính */}
                <img
                    src="https://i.imgur.com/gFZiSQZ.jpeg"
                    alt="Ưu đãi"
                    className="w-[780px] max-w-[90vw] rounded-3xl shadow-2xl border-4 border-white/30"
                />

                {/* Nút X */}
                <button
                    onClick={() => setOpen(false)}
                    className="absolute -top-6 -right-6 bg-white text-red-600 w-12 h-12 rounded-full shadow-xl
                               flex items-center justify-center hover:scale-110 transition"
                >
                    <X size={32} />
                </button>

                {/* Nút nhận khuyến mãi */}
                <button
                    onClick={() => setOpen(false)}
                    className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90 
                               text-white py-4 rounded-2xl text-xl font-bold shadow-lg tracking-wide 
                               flex items-center justify-center gap-2 transition"
                >
                    Nhận khuyến mãi ngay 🎁
                </button>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes zoomIn {
                    0% { transform: scale(0.75); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.35s ease-out;
                }
                .animate-zoomIn {
                    animation: zoomIn 0.4s ease-out;
                }
            `}</style>
        </div>
    );
}
