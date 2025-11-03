import { useState } from "react";
import { motion } from "framer-motion";
import type { ISeat } from "../../../types/room/room.type";

interface UserSeatMapProps {
    seats: ISeat[];
    onChange: (selectedSeats: string[]) => void;
}

const seatColor = (seat: ISeat, selected: string[]) => {
    if (seat.isBooked) return "bg-gray-400 cursor-not-allowed text-gray-100";
    if (selected.includes(seat.seatNumber))
        return "bg-green-500 text-white shadow-lg";
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

    const toggleSeat = (seat: ISeat) => {
        if (seat.isBooked) return;
        const newSelected = selected.includes(seat.seatNumber)
            ? selected.filter((s) => s !== seat.seatNumber)
            : [...selected, seat.seatNumber];

        setSelected(newSelected);
        onChange(newSelected);
    };

    // Gom ghế theo hàng
    const grouped = seats.reduce<Record<string, ISeat[]>>((acc, seat) => {
        const row = seat.seatNumber[0];
        if (!acc[row]) acc[row] = [];
        acc[row].push(seat);
        return acc;
    }, {});

    return (
        <div className="p-6 bg-[#0f172a] text-white rounded-3xl shadow-2xl border border-gray-700">
            {/* --- Màn chiếu --- */}
            <div className="text-center mb-8 relative">
                <div className="w-[90%] mx-auto h-2 bg-gradient-to-r from-gray-400 via-gray-100 to-gray-400 rounded-full shadow-lg" />
                <p className="text-sm text-gray-300 mt-1 font-medium italic">
                    Màn hình chiếu
                </p>
            </div>

            {/* --- Sơ đồ ghế --- */}
            <div className="flex flex-col items-center gap-2 bg-[#1e293b] py-6 rounded-2xl shadow-inner">
                {Object.keys(grouped)
                    .sort()
                    .map((row) => {
                        const rowSeats = grouped[row].sort(
                            (a, b) =>
                                parseInt(a.seatNumber.slice(1)) -
                                parseInt(b.seatNumber.slice(1))
                        );

                        // ✅ Giả lập lối đi giữa
                        const midIndex = Math.floor(rowSeats.length / 2);

                        return (
                            <div
                                key={row}
                                className="flex justify-center items-center gap-1 w-full"
                            >
                                <span className="text-gray-400 w-6 text-right font-semibold mr-1">
                                    {row}
                                </span>

                                {rowSeats.map((seat, i) => (
                                    <>
                                        <motion.div
                                            key={seat.seatNumber}
                                            whileHover={{
                                                scale: seat.isBooked ? 1 : 1.1,
                                            }}
                                            whileTap={{
                                                scale: seat.isBooked ? 1 : 0.95,
                                            }}
                                            onClick={() => toggleSeat(seat)}
                                            title={`${seat.seatNumber} (${seat.type}) - ${seat.price.toLocaleString()}đ`}
                                            className={`w-8 h-8 flex items-center justify-center rounded-md text-[11px] font-semibold select-none transition-all duration-200 ${seatColor(
                                                seat,
                                                selected
                                            )}`}
                                        >
                                            {seat.seatNumber.slice(1)}
                                        </motion.div>

                                        {/* ⛔ Thêm lối đi giữa */}
                                        {i === midIndex && (
                                            <div key={`${row}-gap`} className="w-6 sm:w-8" />
                                        )}
                                    </>
                                ))}
                            </div>
                        );
                    })}
            </div>

            {/* --- Ghi chú --- */}
            <div className="mt-6 border-t border-gray-700 pt-4 text-xs sm:text-sm text-gray-300">
                <h3 className="font-semibold mb-2 text-white">Chú thích ghế:</h3>
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
                        <div className="w-4 h-4 border-2 border-pink-400 rounded"></div>
                        <span>Đôi</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-purple-500 rounded"></div>
                        <span>Cao cấp</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
