import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface SeatPreviewModalProps {
    seat: string;
    onClose: () => void;
}

export default function SeatPreviewModal({ seat, onClose }: SeatPreviewModalProps) {
    const [cameraAngle, setCameraAngle] = useState(45);
    const [cameraTilt, setCameraTilt] = useState(25);

    // Giả lập hiệu ứng camera bay từ xa → đến ghế
    useEffect(() => {
        setCameraAngle(80);
        setCameraTilt(10);
        const t = setTimeout(() => {
            setCameraAngle(55);
            setCameraTilt(20);
        }, 1500);
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

                    {/* 🔶 Rạp giả 3D */}
                    <motion.div
                        className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
                        style={{
                            perspective: "1000px",
                            transformStyle: "preserve-3d",
                        }}
                    >
                        {/* --- Màn hình --- */}
                        <motion.div
                            className="relative w-[85%] h-[70px] bg-gradient-to-r from-gray-300 via-white to-gray-300 rounded-b-[60%] shadow-xl"
                            style={{
                                transform: `rotateX(${cameraAngle}deg) translateY(-100px)`,
                                transformOrigin: "top",
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-gray-300/40 to-transparent"></div>
                        </motion.div>
                        <p className="text-gray-300 text-sm italic mt-3">Màn hình chiếu</p>

                        {/* --- Hệ ghế nghiêng --- */}
                        <motion.div
                            className="relative bg-[#1e293b] rounded-2xl mt-6 px-6 py-8 shadow-inner border border-gray-700 w-[90%] sm:w-[80%]"
                            style={{
                                transform: `rotateX(${cameraTilt}deg) rotateY(0deg)`,
                                transformStyle: "preserve-3d",
                            }}
                        >
                            <div className="flex flex-col items-center gap-3">
                                {Array.from({ length: 6 }).map((_, rowIdx) => (
                                    <div
                                        key={rowIdx}
                                        className="flex justify-center gap-8 sm:gap-10"
                                        style={{
                                            transform: `translateZ(${rowIdx * 10}px)`,
                                        }}
                                    >
                                        {/* Ký hiệu hàng */}
                                        <span className="text-gray-400 text-xs sm:text-sm font-semibold w-5 text-right">
                                            {String.fromCharCode(65 + rowIdx)}
                                        </span>

                                        {/* Hàng ghế */}
                                        <div className="flex gap-[5px] sm:gap-[7px]">
                                            {Array.from({ length: 12 }).map((_, i) => {
                                                const seatId = `${String.fromCharCode(65 + rowIdx)}${i + 1}`;
                                                const isSelected = seatId === seat;
                                                return (
                                                    <motion.div
                                                        key={seatId}
                                                        whileHover={{ scale: 1.2, y: -3 }}
                                                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-[10px] sm:text-[11px] font-semibold transition-all duration-300 ${isSelected
                                                                ? "bg-green-500 text-white shadow-lg"
                                                                : "border border-gray-400 text-gray-300 bg-gray-700/20"
                                                            }`}
                                                        style={{
                                                            boxShadow: isSelected
                                                                ? "0 0 20px 5px rgba(34,197,94,0.6)"
                                                                : "0 0 0 0 rgba(0,0,0,0)",
                                                        }}
                                                    >
                                                        {i + 1}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* --- Lối đi giữa --- */}
                            <div className="absolute top-0 bottom-0 left-1/2 w-12 bg-gray-700/20 rounded-md -translate-x-1/2"></div>

                            {/* --- Lối vào --- */}
                            <div className="absolute left-3 bottom-2 flex items-center gap-2 rotate-[-90deg] origin-bottom-left">
                                <div className="w-12 h-2 bg-gradient-to-r from-gray-500 to-gray-300 rounded-md shadow-sm"></div>
                                <span className="text-[11px] sm:text-xs text-gray-300 italic">Lối vào</span>
                            </div>
                        </motion.div>

                        {/* --- Ghi chú --- */}
                        <div className="absolute bottom-3 left-6 right-6 border-t border-gray-700 pt-3 text-xs sm:text-sm text-gray-300">
                            <h3 className="font-semibold mb-2 text-white">Chú thích sơ đồ:</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                                    <span>Ghế đang xem</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border border-gray-400 rounded"></div>
                                    <span>Ghế khác</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-1 bg-gradient-to-r from-gray-500 to-gray-300 rounded"></div>
                                    <span>Lối vào</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-700/25 rounded"></div>
                                    <span>Lối đi</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
