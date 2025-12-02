import React from "react";
import type { Showtime } from "../../../types/showTimes/showTimes";

interface ShowtimeTableProps {
    showTimes: Showtime[];
    onDelete: (id: string) => void;
    loading: boolean;
    sortField: string;
    sortOrder: "asc" | "desc";
    onSort: (field: string) => void;
}

const ShowtimeTable: React.FC<ShowtimeTableProps> = ({
    showTimes,
    onDelete,
    loading,
    sortField,
    sortOrder,
    onSort,
}) => {
    if (loading)
        return <p className="text-center text-gray-500">Đang tải dữ liệu...</p>;

    if (!showTimes.length)
        return (
            <p className="text-center text-gray-500 mt-4">
                Không có suất chiếu nào cho ngày này.
            </p>
        );

    // 📅 Định dạng ngày
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "--/--/----";
        return date.toLocaleDateString("vi-VN", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // 🕒 Định dạng giờ (fix Invalid Date)
    const formatTime = (time: any) => {
        if (!time) return "--:--";
        const d =
            typeof time === "string"
                ? new Date(time)
                : new Date(time.$date || time);
        if (isNaN(d.getTime())) return "--:--";
        return d.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return null;
        return (
            <span className="ml-1 text-xs text-gray-500">
                {sortOrder === "asc" ? "▲" : "▼"}
            </span>
        );
    };

    return (
        <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700 border-b">
                    <tr>
                        <th
                            className="px-4 py-3 text-left cursor-pointer select-none"
                            onClick={() => onSort("movie")}
                        >
                            🎬 Phim <SortIcon field="movie" />
                        </th>
                        <th className="px-4 py-3 text-left">🏢 Phòng</th>
                        <th className="px-4 py-3 text-left">📅 Ngày chiếu</th>
                        <th
                            className="px-4 py-3 text-left cursor-pointer select-none"
                            onClick={() => onSort("time")}
                        >
                            🕒 Giờ chiếu <SortIcon field="time" />
                        </th>
                        <th
                            className="px-4 py-3 text-left cursor-pointer select-none"
                            onClick={() => onSort("price")}
                        >
                            💰 Giá vé <SortIcon field="price" />
                        </th>
                        <th className="px-4 py-3 text-center">⚙️ Hành động</th>
                    </tr>
                </thead>

                <tbody>
                    {showTimes.map((item, i) => {
                        // 🪑 Gom nhóm loại ghế và tính giá trung bình thực tế
                        const seatGroups: Record<string, { total: number; count: number }> = {};

                        if (item.bookedSeats?.length) {
                            item.bookedSeats.forEach((s: any) => {
                                const type = s.type || "Normal";
                                if (!seatGroups[type]) seatGroups[type] = { total: 0, count: 0 };
                                seatGroups[type].total += s.price || 0;
                                seatGroups[type].count += 1;
                            });
                        }

                        // 💰 Tính giá trung bình mỗi loại ghế
                        const seatPrices: Record<string, number> = {};
                        Object.keys(seatGroups).forEach((type) => {
                            seatPrices[type] = Math.round(
                                seatGroups[type].total / seatGroups[type].count
                            );
                        });

                        const order = ["Normal", "VIP", "Double", "Triple"];
                        const sorted = order.filter((t) => seatPrices[t] !== undefined);

                        return (
                            <tr
                                key={item._id}
                                className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                                    } hover:bg-blue-50 transition-colors duration-100`}
                            >
                                <td className="px-4 py-3 font-medium text-gray-800">
                                    {item.movieId?.tieuDe || "Không rõ"}
                                </td>
                                <td className="px-4 py-3 text-gray-600 text-center">
                                    {item.roomId?.name || "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {formatDate(item.date)}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                    {formatTime(item.startTime)} → {formatTime(item.endTime)}
                                </td>

                                {/* 💰 Hiển thị giá từng loại ghế từ bookedSeats */}
                                <td className="px-4 py-3 text-gray-700 text-right leading-5">
                                    {sorted.length ? (
                                        sorted.map((t) => (
                                            <span
                                                key={t}
                                                className={`font-semibold block ${seatPrices[t] > 120000
                                                        ? "text-red-600"
                                                        : "text-gray-700"
                                                    }`}
                                            >
                                                {t}: {seatPrices[t].toLocaleString("vi-VN")} VNĐ
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 italic">Chưa có ghế</span>
                                    )}
                                </td>

                                {/* ⚙️ Hành động */}
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => onDelete(item._id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md shadow-sm transition-all duration-150"
                                    >
                                        Xoá
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ShowtimeTable;
