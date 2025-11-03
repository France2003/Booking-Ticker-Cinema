import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../layouts/adminlayout/adminlayout";
import { getAllShowTimes, deleteShowTime } from "../../../services/showTimes/showTimesService";
import type { Showtime } from "../../../types/showTimes/showTimes";
import ShowtimeFilters from "../../../components/Admin/ShowTimes/ShowtimeFilters";
import ShowtimeTable from "../../../components/Admin/ShowTimes/ShowtimeTable";
import ShowtimePagination from "../../../components/Admin/ShowTimes/ShowtimePagination";

const QuanLyXuatChieu: React.FC = () => {
  const [showTimes, setShowTimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMovie, setSelectedMovie] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sortField, setSortField] = useState("time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState("all");
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchShowTimes = async () => {
      try {
        const data = await getAllShowTimes();
        console.log("📦 API showtimes trả về:", data);
        setShowTimes(data);
      } catch (error) {
        console.error("Lỗi khi tải suất chiếu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShowTimes();
  }, []);

  // 🎯 Lọc + sắp xếp theo ngày, phim, search
  const filteredShowTimes = useMemo(() => {
    const dateStr = selectedDate.toLocaleDateString("vi-VN");

    return showTimes
      .filter((item) => {
        const itemDate = new Date(item.date).toLocaleDateString("vi-VN");
        const matchDate = itemDate === dateStr;

        const matchMovie =
          selectedMovie === "all" || item.movieId?._id === selectedMovie;

        const matchRoom =
          selectedRoom === "all" || item.roomId?.name === selectedRoom; // 👈 thêm đoạn này

        const matchSearch =
          item.movieId?.tieuDe.toLowerCase().includes(search.toLowerCase()) ||
          item.roomId?.name.toLowerCase().includes(search.toLowerCase());

        // 👇 thêm matchRoom vào điều kiện cuối cùng
        return matchDate && matchMovie && matchRoom && matchSearch;
      })
      .sort((a, b) => {
        if (sortField === "price")
          return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
        if (sortField === "movie")
          return sortOrder === "asc"
            ? a.movieId?.tieuDe.localeCompare(b.movieId?.tieuDe)
            : b.movieId?.tieuDe.localeCompare(a.movieId?.tieuDe);
        return sortOrder === "asc"
          ? a.startTime.localeCompare(b.startTime)
          : b.startTime.localeCompare(a.startTime);
      });
  }, [showTimes, selectedDate, selectedMovie, selectedRoom, search, sortField, sortOrder]); // 👈 đừng quên thêm selectedRoom vào dependencies


  // 📄 Phân trang
  const totalPages = Math.ceil(filteredShowTimes.length / itemsPerPage);
  const displayedShowTimes = filteredShowTimes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handleDelete = async (id: string) => {
    if (confirm("Xoá suất chiếu này?")) {
      await deleteShowTime(id);
      setShowTimes(showTimes.filter((s) => s._id !== id));
    }
  };
  const movieOptions = Array.from(
    new Map(showTimes.map((s) => [s.movieId?._id, s.movieId?.tieuDe])).entries()
  ).map(([id, title]) => ({ id, title }));

  const handleSort = (field: string) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else setSortField(field);
  };
  const totalShowtimes = filteredShowTimes.length;
  const totalMovies = new Set(filteredShowTimes.map((s) => s.movieId?._id)).size;
  const dateLabel = selectedDate.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const weekStart = new Date(selectedDate);
  const day = selectedDate.getDay(); // 0 = CN, 1 = Thứ 2, ...
  const diff = day === 0 ? -6 : 1 - day; // Nếu CN thì lùi 6 ngày, còn lại thì lùi tới Thứ 2
  weekStart.setDate(selectedDate.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const showtimesInWeek = showTimes.filter((item) => {
    const d = new Date(item.date);
    return d >= weekStart && d <= weekEnd;
  });
  const totalShowtimesInWeek = showtimesInWeek.length;

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-4">🎬 Quản lý Xuất Chiếu</h2>
      <ShowtimeFilters
        search={search}
        selectedMovie={selectedMovie}
        selectedRoom={selectedRoom}
        selectedDate={selectedDate}
        sortField={sortField}
        sortOrder={sortOrder}
        movies={movieOptions}
        onSearchChange={setSearch}
        onMovieChange={setSelectedMovie}
        onRoomChange={setSelectedRoom}
        onDateSelect={setSelectedDate}
        onSortFieldChange={setSortField}
        onSortOrderChange={() =>
          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        }
      />
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 text-sm sm:text-base space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span className="font-semibold text-blue-700">📅 {dateLabel}</span>
            <span className="ml-2 text-gray-700">
              — Tổng suất chiếu hôm nay:{" "}
              <span className="font-bold text-blue-800">{totalShowtimes}</span>
            </span>
          </div>

          <div className="text-gray-700">
            🎞️ Tổng số phim đang chiếu:{" "}
            <span className="font-semibold text-blue-800">{totalMovies}</span>
          </div>
        </div>

        <div className="text-gray-700">
          📆 Tuần{" "}
          <span className="font-semibold text-blue-800">
            {weekStart.toLocaleDateString("vi-VN")} →{" "}
            {weekEnd.toLocaleDateString("vi-VN")}
          </span>{" "}
          — Tổng suất chiếu trong tuần:{" "}
          <span className="font-bold text-blue-800">{totalShowtimesInWeek}</span>
        </div>
      </div>

      <ShowtimeTable
        showTimes={displayedShowTimes}
        onDelete={handleDelete}
        loading={loading}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      <ShowtimePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </AdminLayout>
  );
};

export default QuanLyXuatChieu;
