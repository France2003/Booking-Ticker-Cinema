import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import type { Showtime } from "../../../types/showTimes/showTimes";
import { getAllShowTimes } from "../../../services/showTimes/showTimesService";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";

dayjs.locale("vi");

const ShowTimesPage = () => {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1); // ✅ phân trang
  const itemsPerPage = 4; // ✅ mỗi trang 4 phim
  const navigate = useNavigate();

  // --- Lấy dữ liệu suất chiếu ---
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await getAllShowTimes();
        setShowtimes(data);
      } catch (err) {
        console.error("Error fetching showtimes:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // --- 7 ngày kế tiếp ---
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = dayjs().add(i, "day");
    return {
      label: d.format("dddd"),
      date: d.format("YYYY-MM-DD"),
      dayNumber: d.format("DD"),
    };
  });

  // --- Các khung giờ ---
  const timeRanges = [
    { label: "Tất cả", value: "all", start: 0, end: 24 },
    { label: "Sáng (06:00 - 12:00)", value: "morning", start: 6, end: 12 },
    { label: "Chiều (12:00 - 18:00)", value: "afternoon", start: 12, end: 18 },
    { label: "Tối (18:00 - 24:00)", value: "evening", start: 18, end: 24 },
  ];

  // --- Lọc theo ngày và khung giờ ---
  const filtered = showtimes.filter((s) => {
    const sameDay = dayjs(s.date).isSame(selectedDate, "day");
    if (!sameDay) return false;

    if (selectedTimeRange === "all") return true;
    const range = timeRanges.find((r) => r.value === selectedTimeRange);
    const hour = dayjs(s.startTime).hour();
    return hour >= (range?.start || 0) && hour < (range?.end || 24);
  });

  // --- Nhóm phim ---
  const groupedMovies = filtered.reduce((acc: any, curr: Showtime) => {
    const id = curr.movieId._id;
    if (!acc[id]) acc[id] = { ...curr.movieId, showtimes: [] };
    acc[id].showtimes.push(curr);
    return acc;
  }, {});

  // --- Danh sách phim hiện tại ---
  const moviesArray = Object.values(groupedMovies);
  const totalPages = Math.ceil(moviesArray.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMovies = moviesArray.slice(startIndex, startIndex + itemsPerPage);

  const currentMonth = dayjs(selectedDate)
    .format("MMMM")
    .replace(/^(\w)/, (m) => m.toUpperCase());

  const isPeakHour = (startTime: string) => {
    const hour = dayjs(startTime).hour();
    return hour >= 18 && hour < 22;
  };

  const handleSelectShowtime = (showtimeId: string) => {
    navigate(`/booking/${showtimeId}`);
  };

  // --- Reset về trang đầu khi lọc ---
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, selectedTimeRange]);
  const isPastShowtime = (start: string) => {
    return dayjs(start).isBefore(dayjs());
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-6">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Lịch chiếu {currentMonth}</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center mb-10"
      >
        <div className="flex items-center gap-3">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3163/3163478.png"
            alt="icon"
            className="w-10 h-10"
          />
          <h2 className="text-4xl font-extrabold text-orange-600 tracking-wide">
            Lịch chiếu
          </h2>
          <span className="text-4xl font-extrabold text-gray-800 ml-1">
            {currentMonth}
          </span>
        </div>
        <p className="text-gray-600 mt-2 text-md">Chọn ngày & khung giờ để xem phim</p>
      </motion.div>

      {/* --- Chọn ngày --- */}
      <div className="flex justify-center gap-3 bg-white p-4 rounded-2xl shadow-md border border-gray-200 overflow-x-auto">
        {weekDays.map((d) => (
          <motion.button
            key={d.date}
            onClick={() => setSelectedDate(d.date)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className={`flex flex-col items-center justify-center w-16 h-20 rounded-xl transition-all duration-200 ${selectedDate === d.date
              ? "bg-orange-500 text-white shadow-lg scale-105"
              : "hover:bg-orange-100 text-gray-700"
              }`}
          >
            <span className="capitalize text-sm">{d.label}</span>
            <span className="text-lg font-bold">{d.dayNumber}</span>
          </motion.button>
        ))}
      </div>

      {/* --- Chọn khung giờ --- */}
      <div className="flex justify-end mt-4 mb-10 max-w-6xl mx-auto">
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 shadow-sm hover:border-orange-400 focus:ring-2 focus:ring-orange-300 transition w-full sm:w-64"
        >
          {timeRanges.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* --- Danh sách phim --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedDate}-${selectedTimeRange}-${currentPage}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4 }}
          className="space-y-10 max-w-6xl mx-auto"
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600"> 🎬 Đang tải lịch phim...</span>
            </div>
          ) : paginatedMovies.length > 0 ? (
            <>
              {paginatedMovies.map((movie: any, idx: number) => (
                <motion.div
                  key={movie._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-all bg-white overflow-hidden flex flex-col sm:flex-row"
                >
                  <div className="relative sm:w-1/4 w-full">
                    <img
                      src={`http://localhost:3001${movie.anhPoster}`}
                      alt={movie.tieuDe}
                      className="w-full h-[250px] object-contain transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  <div className="flex-1 p-6">
                    <h3 className="text-2xl font-bold mb-4 text-gray-800 uppercase border-l-4 border-orange-500 pl-3 flex items-center gap-2">
                      {movie.tieuDe}
                      {movie.isHot && <span className="text-orange-600 text-lg animate-bounce">🔥</span>}
                    </h3>

                    <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {movie.showtimes.map((st: Showtime, i: number) => (
                        <motion.button
                          key={st._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          disabled={isPastShowtime(st.startTime)}
                          onClick={() => {
                            if (!isPastShowtime(st.startTime)) handleSelectShowtime(st._id);
                          }}
                          className={`rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-center shadow-sm border transition-all duration-200${isPastShowtime(st.startTime)
                            ? "opacity-40 cursor-not-allowed bg-gray-200 border-gray-300"
                            : isPeakHour(st.startTime)
                              ? "bg-orange-50 border-orange-300 hover:bg-orange-100 cursor-pointer"
                              : "bg-gray-50 hover:bg-gray-100 border-gray-200 cursor-pointer"
                            }`}>
                          <p className="font-semibold text-sm sm:text-base text-gray-800">
                            {dayjs(st.startTime).format("HH:mm")} - {dayjs(st.endTime).format("HH:mm")}
                          </p>
                          {isPeakHour(st.startTime) && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="text-[10px] sm:text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full mt-1 inline-block"
                            >
                              🔥 Giờ cao điểm
                            </motion.span>
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              ))}

              {/* ✅ Thanh phân trang */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 rounded-lg font-medium border transition-all duration-200 
                          ${currentPage === i + 1
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-orange-100"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center text-gray-600 text-lg font-medium py-12 bg-gray-50 rounded-xl shadow-inner"
            >
              ❌ Không có suất chiếu cho ngày & khung giờ này
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ShowTimesPage;
