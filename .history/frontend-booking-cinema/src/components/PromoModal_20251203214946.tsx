import { useEffect, useState } from "react";
import { getActivePromotions } from "../services/promotions/promotions";
import { X } from "lucide-react";
import confetti from "canvas-confetti";
import type { Promotion } from "../types/promotions/promotion.type";
export default function PromoPosterModal() {
    const [open, setOpen] = useState(false);
    const [poster, setPoster] = useState<Promotion | null>(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const promos = await getActivePromotions();
                if (!promos.length) return;
                // 📆 Lấy theo ngày trong tuần
                const todayIndex = new Date().getDay(); // 0–6
                const chosen = promos[todayIndex % promos.length];
                setPoster(chosen);
                setOpen(true);
                // 🎉 Pháo giấy
                setTimeout(() => {
                    confetti({
                        particleCount: 80,
                        spread: 70,
                        origin: { y: 0.3 },
                    });
                }, 300);

            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    if (!open || !poster) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div className="relative animate-zoomIn">
                <img
                    src={poster.anhDaiDien}
                    className="w-[720px] max-w-[92vw] rounded-3xl shadow-2xl border-[6px] neon-gold animate-shake"
                />
                <button
                    onClick={() => setOpen(false)}
                    className="absolute -top-7 -right-7 bg-yellow-400 text-black w-14 h-14 rounded-full shadow-xl
                            flex items-center justify-center hover:scale-110 transition font-bold text-2xl"
                >
                    <X size={36} />
                </button>
                <button
                    onClick={() => setOpen(false)}
                    className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-yellow-700 hover:opacity-90 
                            text-black py-4 rounded-2xl text-xl font-bold shadow-lg tracking-wide"
                >
                    Nhận ưu đãi ngay 🎁
                </button>

                {/* CSS */}
                <style>{`
                    @keyframes zoomIn {
                        0% { transform: scale(0.7); opacity: 0; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes shake {
                        0% { transform: translate(0,0) rotate(0deg); }
                        20% { transform: translate(-4px,2px) rotate(-1deg); }
                        40% { transform: translate(4px,-2px) rotate(1deg); }
                        60% { transform: translate(-3px,3px) rotate(0deg); }
                        80% { transform: translate(3px,-2px) rotate(1deg); }
                        100% { transform: translate(0,0) rotate(0deg); }
                    }
                    .animate-zoomIn { animation: zoomIn .35s ease-out; }
                    .animate-shake { animation: shake .5s ease alternate 2; }
                    
                    /* NEON GOLD */
                    .neon-gold {
                        box-shadow:
                            0 0 15px #ffdc73,
                            0 0 30px #ffcc33,
                            0 0 45px #ffb700,
                            inset 0 0 15px #ffdc73;
                        border-radius: 20px;
                    }
                `}</style>
            </div>
        </div>
    );
}
