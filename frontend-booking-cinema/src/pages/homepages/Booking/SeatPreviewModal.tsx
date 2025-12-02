import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import CinemaScene from "../Booking/CinemaModel";

interface SeatPreviewModalProps {
    seat: string;
    onClose: () => void;
}

export default function SeatPreviewModal({ seat, onClose }: SeatPreviewModalProps) {
    const [show3D, setShow3D] = useState(false);

    useEffect(() => {
        // Hiệu ứng xuất hiện 3D sau khi mở modal
        const t = setTimeout(() => setShow3D(true), 400);
        return () => clearTimeout(t);
    }, [seat]);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="relative bg-[#0f172a] rounded-2xl overflow-hidden border border-gray-700 shadow-2xl w-[95%] sm:w-[90%] md:w-[80%] max-w-5xl h-[70vh] sm:h-[80vh]"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 bg-gray-800 text-white px-3 py-1 rounded-md text-sm hover:bg-red-500 transition z-50"
                    >
                        ✕ Đóng
                    </button>

                    {/* === 3D Scene === */}
                    <div className="w-full h-full">
                        {show3D ? (
                            <CinemaScene selectedSeat={seat} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Đang tải rạp chiếu phim 3D...
                            </div>
                        )}
                    </div>

                    {/* Ghi chú */}
                    <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-400">
                        Góc nhìn từ ghế <span className="text-green-400 font-semibold">{seat}</span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
