import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ISeat } from "../../../types/room/room.type";
import SeatPreviewModal from "../Booking/SeatPreviewModal";

interface UserSeatMapProps {
    seats: ISeat[];
    onChange: (selectedSeats: string[]) => void;
}

const seatColor = (seat: ISeat, selected: string[], hoveredGroup: string[]) => {
    if (seat.isBooked) return "bg-gray-400 cursor-not-allowed text-gray-100";
    if (selected.includes(seat.seatNumber))
        return "bg-green-500 text-white shadow-lg";
    if (hoveredGroup.includes(seat.seatNumber))
        return "bg-green-200/40 border-green-400 text-green-400";
    switch (seat.type) {
        case "VIP":
            return "border-2 border-yellow-400 hover:bg-yellow-100 text-yellow-600";
        case "Double":
            return "border-2 border-pink-400 hover:bg-pink-100 text-pink-600";
        case "Triple":
            return "border-2 border-purple-500 hover:bg-purple-100 text-purple-600";
        default:
            return "border-2 border-gray-300 hover:bg-gray-100 text-gray-700";
    }
};

export default function UserSeatMap({ seats, onChange }: UserSeatMapProps) {
    const [selected, setSelected] = useState<string[]>([]);
    const [previewSeat, setPreviewSeat] = useState<string | null>(null);
    const [hoveredGroup, setHoveredGroup] = useState<string[]>([]);

    // Gom ghế theo hàng
    const grouped = seats.reduce<Record<string, ISeat[]>>((acc, seat) => {
        const row = seat.seatNumber[0];
        if (!acc[row]) acc[row] = [];
        acc[row].push(seat);
        return acc;
    }, {});

    // Lấy nhóm ghế đôi/ba liền kề (phục vụ cho chọn & hover)
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

    // Toggle chọn ghế
    const toggleSeat = (seat: ISeat) => {
        if (seat.isBooked) return;

        const seatGroup = getSeatGroup(seat);
        const allSelected = seatGroup.every((s) => selected.includes(s.seatNumber));

        const newSelected = allSelected
            ? selected.filter((s) => !seatGroup.some((g) => g.seatNumber === s))
            : [...new Set([...selected, ...seatGroup.map((g) => g.seatNumber)])];

        setSelected(newSelected);
        onChange(newSelected);

        if (!selected.includes(seat.seatNumber)) setPreviewSeat(seat.seatNumber);
    };

    // Hover nhóm ghế
    const handleHover = (seat: ISeat, entering: boolean) => {
        if (!entering) {
            setHoveredGroup([]);
            return;
        }
        const group = getSeatGroup(seat);
        setHoveredGroup(group.map((s) => s.seatNumber));
    };

    return (
        <div className="p-4 sm:p-6 bg-[#0f172a] text-white rounded-3xl shadow-2xl border border-gray-700 w-full overflow-hidden relative">
            {/* --- Màn hình cong --- */}
            <div className="relative mb-10 flex flex-col items-center">
                <div
                    className="relative w-[90%] sm:w-[85%] h-[60px] overflow-hidden"
                    style={{ perspective: "800px" }}
                >
                    <div
                        className="absolute inset-0 rounded-b-[50%] bg-gradient-to-r from-gray-400 via-gray-100 to-gray-400 shadow-lg"
                        style={{ transform: "rotateX(55deg)", transformOrigin: "top" }}
                    />
                </div>
                <p className="text-sm sm:text-base text-gray-300 mt-3 italic font-medium">
                    Màn hình chiếu
                </p>
            </div>
            {/* --- Sơ đồ ghế --- */}
            <div className="relative bg-[#1e293b] py-6 rounded-2xl shadow-inner overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {/* --- Lối vào --- */}
                <div className="absolute left-3 bottom-2 flex items-center gap-2 rotate-[-90deg] origin-bottom-left">
                    <div className="w-12 h-2 bg-gradient-to-r from-gray-500 to-gray-300 rounded-md shadow-sm"></div>
                    <span className="text-[11px] sm:text-xs text-gray-300 italic">Lối vào</span>
                </div>
                {/* --- Lối đi phụ --- */}
                <div className="absolute left-[45px] bottom-0 top-0 w-[26px] bg-gray-700/20 rounded-md"></div>

                <div className="min-w-[600px] sm:min-w-[720px] flex flex-col items-center gap-2 px-2 relative z-10">
                    {Object.keys(grouped)
                        .sort()
                        .map((row) => {
                            const rowSeats = grouped[row].sort(
                                (a, b) =>
                                    parseInt(a.seatNumber.slice(1)) -
                                    parseInt(b.seatNumber.slice(1))
                            );

                            const leftSeats = rowSeats.slice(0, rowSeats.length / 2);
                            const rightSeats = rowSeats.slice(rowSeats.length / 2);

                            return (
                                <div key={row} className="flex justify-center items-center gap-6 sm:gap-10 w-full" >
                                    {/* Ký hiệu hàng */}
                                    <span className="text-gray-400 w-4 sm:w-6 text-right font-semibold mr-1 sm:mr-2 text-xs sm:text-sm">
                                        {row}
                                    </span>
                                    {/* Cụm ghế trái */}
                                    <div className="flex justify-end gap-[3px] sm:gap-1">
                                        {leftSeats.map((seat) => (
                                            <motion.div
                                                key={seat.seatNumber}
                                                whileHover={{ scale: seat.isBooked ? 1 : 1.08 }}
                                                whileTap={{ scale: seat.isBooked ? 1 : 0.92 }}
                                                onClick={() => toggleSeat(seat)}
                                                onMouseEnter={() => handleHover(seat, true)}
                                                onMouseLeave={() => handleHover(seat, false)}
                                                title={`${seat.seatNumber} (${seat.type}) - ${seat.price.toLocaleString()} VNĐ`}
                                                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-[10px] sm:text-[11px] font-semibold select-none transition-all duration-200 ${seatColor(
                                                    seat,
                                                    selected,
                                                    hoveredGroup
                                                )}`}
                                            >
                                                {seat.seatNumber.slice(1)}
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Lối đi giữa */}
                                    <div className="w-8 sm:w-10 lg:w-12 bg-gray-700/20 rounded-md"></div>

                                    {/* Cụm ghế phải */}
                                    <div className="flex justify-start gap-[3px] sm:gap-1">
                                        {rightSeats.map((seat) => (
                                            <motion.div
                                                key={seat.seatNumber}
                                                whileHover={{ scale: seat.isBooked ? 1 : 1.08 }}
                                                whileTap={{ scale: seat.isBooked ? 1 : 0.92 }}
                                                onClick={() => toggleSeat(seat)}
                                                onMouseEnter={() => handleHover(seat, true)}
                                                onMouseLeave={() => handleHover(seat, false)}
                                                title={`${seat.seatNumber} (${seat.type}) - ${seat.price.toLocaleString("vi-VN")} VNĐ`}
                                                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-[10px] sm:text-[11px] font-semibold select-none transition-all duration-200 ${seatColor(
                                                    seat,
                                                    selected,
                                                    hoveredGroup
                                                )}`}
                                            >
                                                {seat.seatNumber.slice(1)}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* --- Ghi chú --- */}
            <div className="mt-6 border-t border-gray-700 pt-4 text-xs sm:text-sm text-gray-300">
                <h3 className="font-semibold mb-2 text-white">Chú thích sơ đồ:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-400 rounded"></div>
                        <span>Đã đặt</span>
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
                    <div className="flex items-center gap-2">
                        <div className="flex gap-[2px]">
                            <div className="w-4 h-4 border-2 border-purple-500 rounded"></div>
                            <div className="w-4 h-4 border-2 border-purple-500 rounded"></div>
                            <div className="w-4 h-4 border-2 border-purple-500 rounded"></div>
                        </div>
                        <span>Ba</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-700/30 rounded"></div>
                        <span>Lối đi</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-1 bg-gradient-to-r from-gray-500 to-gray-300 rounded"></div>
                        <span>Lối vào</span>
                    </div>
                </div>
            </div>

            {/* --- Modal Preview --- */}
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
