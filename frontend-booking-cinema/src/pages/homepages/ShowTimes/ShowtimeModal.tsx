import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useState, useMemo } from "react";
import type { Showtime } from "../../../types/showTimes/showTimes";

dayjs.locale("vi");

interface Props {
    isOpen: boolean;
    onClose: () => void;
    showtimes: Showtime[];
    movieTitle: string;
    moviePoster?: string;
    onSelect: (showtime: Showtime) => void;
}

export default function ShowtimeModal({
    isOpen,
    onClose,
    showtimes,
    movieTitle,
    moviePoster,
    onSelect,
}: Props) {
    const [selectedDate, setSelectedDate] = useState<string>(
        dayjs().format("YYYY-MM-DD")
    );

    const weekDays = useMemo(
        () =>
            Array.from({ length: 7 }).map((_, i) => {
                const d = dayjs().add(i, "day");
                return {
                    label: d.format("dddd"),
                    date: d.format("YYYY-MM-DD"),
                    dayNumber: d.format("DD"),
                };
            }),
        []
    );

    const filtered = showtimes.filter((s) =>
        dayjs(s.date).isSame(selectedDate, "day")
    );

    const isPeakHour = (start: string) => {
        const h = dayjs(start).hour();
        return h >= 18 && h < 22;
    };

    if (!isOpen) return null;

    // ✅ Chuẩn hóa URL ảnh poster
    const posterUrl =
        moviePoster && moviePoster.trim() !== ""
            ? moviePoster.startsWith("http")
                ? moviePoster
                : `http://localhost:3001${moviePoster.startsWith("/") ? moviePoster : `/${moviePoster}`
                }`
            : "https://via.placeholder.com/230x340?text=No+Poster";

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    onClick={(e) => e.stopPropagation()}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-orange-600">
                            🍿 Lịch chiếu phim
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-800 text-2xl font-bold transition"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 bg-gradient-to-b from-[#fffaf5] to-white space-y-6">
                        {/* Ngày chiếu */}
                        <div className="bg-[#fff8f2] rounded-2xl p-5 shadow-sm border border-orange-100">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-800 text-lg md:text-xl">
                                    Chọn ngày chiếu
                                </h3>
                                <span className="text-gray-600 font-medium text-sm md:text-base">
                                    Tháng {dayjs(selectedDate).format("MM")}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
                                {weekDays.map((d) => (
                                    <motion.button
                                        key={d.date}
                                        whileTap={{ scale: 0.95 }}
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => setSelectedDate(d.date)}
                                        className={`flex flex-col items-center justify-center rounded-xl h-[70px] sm:h-[80px] transition-all ${selectedDate === d.date
                                                ? "bg-orange-500 text-white shadow-lg"
                                                : "bg-white text-gray-800 hover:bg-orange-100 border border-gray-200"
                                            }`}
                                    >
                                        <span className="capitalize text-xs font-medium">
                                            {d.label}
                                        </span>
                                        <span className="text-lg font-bold">{d.dayNumber}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Danh sách suất chiếu */}
                        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-5 text-lg border-l-4 border-orange-500 pl-3">
                                🎬 Chọn lịch chiếu
                            </h3>

                            {filtered.length > 0 ? (
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    {/* Poster */}
                                    <div className="md:w-1/4 flex flex-col items-center">
                                        <img
                                            src={posterUrl}
                                            alt={movieTitle}
                                            className="w-[200px] sm:w-[230px] h-[300px] sm:h-[340px] object-cover rounded-2xl shadow-md border border-gray-200"
                                        />
                                        <p className="mt-3 font-bold text-center uppercase text-gray-800 text-base">
                                            {movieTitle}
                                        </p>
                                    </div>

                                    {/* Suất chiếu */}
                                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {filtered.map((st) => (
                                            <motion.button
                                                key={st._id}
                                                whileHover={{ scale: 1.05 }}
                                                onClick={() => onSelect(st)}
                                                className={`flex flex-col items-center justify-center h-[100px] border-2 rounded-xl transition-all duration-200 ${isPeakHour(st.startTime)
                                                        ? "border-orange-400 bg-orange-50 hover:bg-orange-100"
                                                        : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                                                    }`}
                                            >
                                                <p className="font-bold text-gray-800 text-base">
                                                    {dayjs(st.startTime).format("HH:mm")} -{" "}
                                                    {dayjs(st.endTime).format("HH:mm")}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Phòng: {st.roomId.name}
                                                </p>
                                                <p className="text-xs text-orange-500 font-semibold mt-1">
                                                    {st.price.toLocaleString("vi-VN")}₫
                                                </p>
                                                {isPeakHour(st.startTime) && (
                                                    <span className="text-[11px] text-white bg-orange-500 px-2 py-0.5 rounded-full mt-1">
                                                        🔥 Giờ cao điểm
                                                    </span>
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-600 py-8">
                                    ❌ Không có suất chiếu cho ngày này
                                </p>
                            )}
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full mt-4 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 transition font-medium text-gray-800"
                        >
                            Đóng
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
