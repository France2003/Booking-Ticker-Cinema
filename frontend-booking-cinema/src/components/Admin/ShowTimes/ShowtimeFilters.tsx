import React from "react";

interface ShowtimeFiltersProps {
    search: string;
    selectedMovie: string;
    selectedRoom: string; // 👈 thêm
    selectedDate: Date;
    sortField: string;
    sortOrder: "asc" | "desc";
    movies: { id: string; title: string }[];
    onSearchChange: (v: string) => void;
    onMovieChange: (v: string) => void;
    onRoomChange: (v: string) => void; // 👈 thêm
    onDateSelect: (date: Date) => void;
    onSortFieldChange: (v: string) => void;
    onSortOrderChange: () => void;
}

const ShowtimeFilters: React.FC<ShowtimeFiltersProps> = ({
    selectedMovie,
    selectedRoom, // 👈 thêm
    selectedDate,
    sortField,
    sortOrder,
    movies,
    onMovieChange,
    onRoomChange, // 👈 thêm
    onDateSelect,
    onSortFieldChange,
    onSortOrderChange,
}) => {
    const getWeekDates = (offsetWeeks = 0) => {
        const today = new Date();
        const monday = new Date(today);
        const day = monday.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        monday.setDate(monday.getDate() + diff + offsetWeeks * 7); // offset tuần
        monday.setHours(0, 0, 0, 0);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const weekDays = getWeekDates();

    return (
        <div className="flex flex-wrap gap-3 mb-5 items-center justify-between">
            <select
                className="border rounded px-3 py-1"
                value={selectedRoom}
                onChange={(e) => onRoomChange(e.target.value)}
            >
                <option value="all">Tất cả phòng</option>
                {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                        Phòng {i + 1}
                    </option>
                ))}
            </select>
            <select
                className="border rounded px-3 py-1"
                value={selectedMovie}
                onChange={(e) => onMovieChange(e.target.value)}
            >
                <option value="all">Tất cả phim</option>
                {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                        {m.title}
                    </option>
                ))}
            </select>
            <div className="flex gap-1">
                {weekDays.map((d) => {
                    const isSelected = d.toDateString() === selectedDate.toDateString();
                    const weekday = d.toLocaleDateString("vi-VN", { weekday: "short" });
                    const day = d.getDate();
                    return (
                        <button
                            key={d.toISOString()}
                            onClick={() => onDateSelect(d)}
                            className={`flex flex-col items-center w-14 py-1 rounded ${isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 hover:bg-gray-200"
                                }`}
                        >
                            <span className="text-xs">{weekday}</span>
                            <span className="font-semibold">{day}</span>
                        </button>
                    );
                })}
            </div>

            {/* ⚙️ Sắp xếp */}
            <div className="flex gap-2 items-center">
                <select
                    className="border rounded px-3 py-1"
                    value={sortField}
                    onChange={(e) => onSortFieldChange(e.target.value)}
                >
                    <option value="time">Theo giờ</option>
                    <option value="price">Theo giá</option>
                    <option value="movie">Theo phim</option>
                </select>
                <button
                    className="border rounded px-3 py-1"
                    onClick={onSortOrderChange}
                >
                    {sortOrder === "asc" ? "⬆️ Tăng" : "⬇️ Giảm"}
                </button>
            </div>
        </div>
    );
};

export default ShowtimeFilters;
