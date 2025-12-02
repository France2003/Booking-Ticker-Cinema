import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ISeat } from "../../../types/room/room.type";
import SeatPreviewModal from "../Booking/SeatPreviewModal";
import { ArrowUpRight } from "lucide-react";

interface UserSeatMapProps {
    seats: ISeat[];
    onChange: (selectedSeats: string[]) => void;
    // basePrice: number;
}
const seatColor = (seat: ISeat, selected: string[], hoveredGroup: string[]) => {
    if (seat.isBooked)
        return "bg-gray-400 cursor-not-allowed text-gray-100"; // Đã đặt (xám)
    if (seat.isHold)
        return "bg-yellow-400/90 cursor-not-allowed text-white shadow-inner"; // ⚠️ Đang giữ tạm (vàng)
    if (selected.includes(seat.seatNumber))
        return "bg-green-500 text-white shadow-lg"; // Đang chọn
    if (hoveredGroup.includes(seat.seatNumber))
        return "bg-green-200/40 border-green-400 text-green-400"; // Hover
    switch (seat.type) {
        case "VIP":
            return "border-2 border-yellow-400 hover:bg-yellow-100 text-yellow-600";
        case "Double":
            return "border-2 border-pink-400 hover:bg-pink-100 text-pink-600";
        case "Triple":
            return "border-2 border-purple-500 hover:bg-purple-100 text-purple-600";
        default:
            return "border-2 border-gray-300 hover:bg-gray-100 text-gray-200";
    }
};


export default function UserSeatMap({ seats, onChange }: UserSeatMapProps) {
    const [selected, setSelected] = useState<string[]>([]);
    const [previewSeat, setPreviewSeat] = useState<string | null>(null);
    const [hoveredGroup, setHoveredGroup] = useState<string[]>([]);

    // Gom ghế theo hàng (A, B, C...)
    const grouped = seats.reduce<Record<string, ISeat[]>>((acc, seat) => {
        const row = seat.seatNumber[0];
        if (!acc[row]) acc[row] = [];
        acc[row].push(seat);
        return acc;
    }, {});

    // Nhóm ghế đôi / ba
    const getSeatGroup = (seat: ISeat) => {
        const row = grouped[seat.seatNumber[0]];
        if (seat.type === "Double") {
            const neighbors = row.filter(
                (s) =>
                    Math.abs(parseInt(s.seatNumber.slice(1)) - parseInt(seat.seatNumber.slice(1))) <= 1 &&
                    s.type === "Double"
            );
            return neighbors.length === 2 ? neighbors : [seat];
        }
        if (seat.type === "Triple") {
            const neighbors = row.filter(
                (s) =>
                    Math.abs(parseInt(s.seatNumber.slice(1)) - parseInt(seat.seatNumber.slice(1))) <= 2 &&
                    s.type === "Triple"
            );
            return neighbors.length === 3 ? neighbors : [seat];
        }
        return [seat];
    };

    const toggleSeat = (seat: ISeat) => {
        if (seat.isBooked) return;
        console.log("🎟️ Click ghế:", seat.seatNumber, "Giá:", seat.price, "Loại:", seat.type);
        const seatGroup = getSeatGroup(seat);
        const allSelected = seatGroup.every((s) => selected.includes(s.seatNumber));
        const newSelected = allSelected
            ? selected.filter((s) => !seatGroup.some((g) => g.seatNumber === s))
            : [...new Set([...selected, ...seatGroup.map((g) => g.seatNumber)])];
        setSelected(newSelected);
        onChange(newSelected);
        if (!selected.includes(seat.seatNumber)) setPreviewSeat(seat.seatNumber);
    };

    const handleHover = (seat: ISeat, entering: boolean) => {
        if (!entering) return setHoveredGroup([]);
        const group = getSeatGroup(seat);
        setHoveredGroup(group.map((s) => s.seatNumber));
    };

    return (
        <div className="p-4 sm:p-6 bg-[#0f172a] text-white rounded-3xl shadow-2xl border border-gray-700 w-full overflow-hidden relative">
            {/* --- Màn hình cong --- */}
            <div className="relative mb-10 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative w-[90%] sm:w-[85%] h-[60px] overflow-hidden"
                    style={{ perspective: "800px" }}
                >
                    <div
                        className="absolute inset-0 rounded-b-[50%] bg-gradient-to-r from-gray-400 via-gray-100 to-gray-400 shadow-xl"
                        style={{ transform: "rotateX(55deg)", transformOrigin: "top" }}
                    />
                </motion.div>
                <p className="text-sm sm:text-base text-gray-300 mt-3 italic font-medium">
                    Màn hình chiếu
                </p>
            </div>

            {/* --- Sơ đồ ghế --- */}
            <div className="relative bg-[#1e293b] py-8 rounded-2xl shadow-inner overflow-hidden">
                {/* --- Hai lối vào --- */}
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-3 left-10 flex items-center gap-2"
                >
                    <div className="w-14 h-2 bg-gradient-to-r from-gray-500 to-gray-200 rounded-md"></div>
                    <span className="text-[11px] sm:text-xs text-gray-300 italic flex items-center gap-1">
                        <ArrowUpRight size={12} /> Lối vào
                    </span>
                </motion.div>

                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-3 right-10 flex items-center gap-2 flex-row-reverse"
                >
                    <div className="w-14 h-2 bg-gradient-to-l from-gray-500 to-gray-200 rounded-md"></div>
                    <span className="text-[11px] sm:text-xs text-gray-300 italic flex items-center gap-1">
                        Lối vào <ArrowUpRight size={12} />
                    </span>
                </motion.div>

                {/* --- Hàng ghế --- */}
                <div className="w-full flex flex-col items-center gap-3 px-2 relative z-10">
                    {Object.keys(grouped)
                        .sort()
                        .map((row) => {
                            const rowSeats = grouped[row].sort(
                                (a, b) => parseInt(a.seatNumber.slice(1)) - parseInt(b.seatNumber.slice(1))
                            );

                            const leftSeats = rowSeats.filter((s) => parseInt(s.seatNumber.slice(1)) <= 8);
                            const rightSeats = rowSeats.filter((s) => parseInt(s.seatNumber.slice(1)) >= 9);

                            return (
                                <div
                                    key={row}
                                    className="flex justify-center items-center gap-4 w-full relative"
                                >
                                    {/* --- Ký hiệu hàng --- */}
                                    <span className="w-5 sm:w-6 text-center text-gray-400 font-semibold text-xs sm:text-sm">
                                        {row}
                                    </span>

                                    {/* --- Cụm trái (1–8) --- */}
                                    <div className="flex items-center gap-[3px] sm:gap-1">
                                        {leftSeats.map((seat) => {
                                            const seatNum = parseInt(seat.seatNumber.slice(1));
                                            return (
                                                <>
                                                    <motion.div
                                                        key={seat.seatNumber}
                                                        whileHover={{ scale: seat.isBooked ? 1 : 1.08 }}
                                                        whileTap={{ scale: seat.isBooked ? 1 : 0.92 }}
                                                        onClick={() => toggleSeat(seat)}
                                                        onMouseEnter={() => handleHover(seat, true)}
                                                        onMouseLeave={() => handleHover(seat, false)}
                                                        title={`${seat.seatNumber} (${seat.type}) - ${seat.price.toLocaleString("vi-VN")} VNĐ`}
                                                        className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md 
                                                        text-[10px] sm:text-[11px] font-semibold select-none transition-all duration-200 
                                                        ${seatColor(seat, selected, hoveredGroup)}`}
                                                    >
                                                        {seat.seatNumber.slice(1)}
                                                    </motion.div>

                                                    {/* Lối giữa ghế 2 và 3 */}
                                                    {seatNum === 2 && (
                                                        <motion.div
                                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                                            transition={{
                                                                repeat: Infinity,
                                                                duration: 1.5,
                                                                ease: "easeInOut",
                                                            }}
                                                            className="w-5 sm:w-6 h-[70%] bg-gray-400/30 rounded-md shadow-inner"
                                                        />
                                                    )}
                                                </>
                                            );
                                        })}
                                    </div>
                                    {/* --- Cụm phải (9–16) --- */}
                                    <div className="flex items-center gap-[3px] sm:gap-1">
                                        {rightSeats.map((seat) => {
                                            const seatNum = parseInt(seat.seatNumber.slice(1));
                                            return (
                                                <>
                                                    <motion.div
                                                        key={seat.seatNumber}
                                                        whileHover={{ scale: seat.isBooked ? 1 : 1.08 }}
                                                        whileTap={{ scale: seat.isBooked ? 1 : 0.92 }}
                                                        onClick={() => toggleSeat(seat)}
                                                        onMouseEnter={() => handleHover(seat, true)}
                                                        onMouseLeave={() => handleHover(seat, false)}
                                                        title={`${seat.seatNumber} (${seat.type}) - ${seat.price.toLocaleString("vi-VN")} VNĐ`}
                                                        className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md 
                                                        text-[10px] sm:text-[11px] font-semibold select-none transition-all duration-200 
                                                        ${seatColor(seat, selected, hoveredGroup)}`}
                                                    >
                                                        {seat.seatNumber.slice(1)}
                                                    </motion.div>
                                                    {/* Lối giữa 14 và 15 */}
                                                    {seatNum === 14 && (
                                                        <motion.div
                                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                                            transition={{
                                                                repeat: Infinity,
                                                                duration: 1.5,
                                                                ease: "easeInOut",
                                                            }}
                                                            className="w-5 sm:w-6 h-[70%] bg-gray-400/30 rounded-md shadow-inner"
                                                        />
                                                    )}
                                                </>
                                            );
                                        })}
                                    </div>
                                    {/* --- Ký hiệu hàng phải --- */}
                                    <span className="w-5 sm:w-6 text-center text-gray-400 font-semibold text-xs sm:text-sm">
                                        {row}
                                    </span>
                                </div>
                            );
                        })}
                </div>
            </div>
            {/* --- Ghi chú --- */}
            <div className="mt-6 border-t border-gray-700 pt-4 text-xs sm:text-sm text-gray-300 space-y-3">
                <h3 className="font-semibold text-white">Chú thích sơ đồ:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-400 rounded"></div>
                        <span>Đã đặt</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                        <span>Đang giữ tạm</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>Đang chọn</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                        <span>Thường</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-yellow-400 rounded"></div>
                        <span>VIP</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-[2px]">
                            <div className="w-4 h-4 border-2 border-pink-400 rounded"></div>
                            <div className="w-4 h-4 border-2 border-pink-400 rounded"></div>
                        </div>
                        <span>Đôi</span>
                    </div>
                </div>
                {/* --- Ghi chú lối đi và lối vào --- */}
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-2 bg-gray-600/30 rounded"></div>
                        <span>Lối đi</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-2 bg-gradient-to-r from-gray-500 to-gray-300 rounded"></div>
                        <span>Lối vào</span>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {previewSeat && (
                    <SeatPreviewModal
                        seat={previewSeat}
                        onClose={() => setPreviewSeat(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
