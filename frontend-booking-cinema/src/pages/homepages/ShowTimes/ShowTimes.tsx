import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import type { Showtime } from "../../../types/showTimes/showTimes";
import { getAllShowTimes } from "../../../services/showTimes/showTimesService";
import { motion, AnimatePresence } from "framer-motion";

dayjs.locale("vi");

const ShowTimesPage = () => {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );
  const navigate = useNavigate(); // ✅ Dùng để điều hướng đến trang booking

  useEffect(() => {
    (async () => {
      const data = await getAllShowTimes();
      setShowtimes(data);
    })();
  }, []);

  // ✅ Danh sách 7 ngày kế tiếp
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = dayjs().add(i, "day");
    return {
      label: d.format("dddd"),
      date: d.format("YYYY-MM-DD"),
      dayNumber: d.format("DD"),
    };
  });

  // ✅ Lọc suất chiếu theo ngày
  const filtered = showtimes.filter((s) =>
    dayjs(s.date).isSame(selectedDate, "day")
  );

  // ✅ Nhóm suất chiếu theo phim
  const groupedMovies = filtered.reduce((acc: any, curr: Showtime) => {
    const id = curr.movieId._id;
    if (!acc[id]) acc[id] = { ...curr.movieId, showtimes: [] };
    acc[id].showtimes.push(curr);
    return acc;
  }, {});

  // ✅ Tháng hiện tại
  const currentMonth = dayjs(selectedDate)
    .format("MMMM")
    .replace(/^t/, "T")
    .replace(/^(\w)/, (m) => m.toUpperCase());

  // ✅ Xác định giờ cao điểm
  const isPeakHour = (startTime: string) => {
    const hour = dayjs(startTime).hour();
    return hour >= 18 && hour < 22;
  };

  // ✅ Khi click vào suất chiếu → chuyển đến trang booking
  const handleSelectShowtime = (showtimeId: string) => {
    navigate(`/booking/${showtimeId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-6">
      {/* --- Header --- */}
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
        <p className="text-gray-600 mt-2 text-md">
          Chọn ngày để xem các phim đang chiếu
        </p>
      </motion.div>

      {/* --- Ngày chiếu --- */}
      <div className="flex justify-center gap-3 bg-white p-4 rounded-2xl shadow-md mb-10 border border-gray-200 overflow-x-auto">
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

      {/* --- Danh sách phim theo ngày --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDate}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4 }}
          className="space-y-10 max-w-6xl mx-auto"
        >
          {Object.keys(groupedMovies).length > 0 ? (
            Object.values(groupedMovies).map((movie: any, idx: number) => (
              <motion.div
                key={movie._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-all bg-white overflow-hidden flex flex-col sm:flex-row"
              >
                {/* --- Poster --- */}
                <div className="relative sm:w-1/4 w-full">
                  <img
                    src={`http://localhost:3001${movie.anhPoster}`}
                    alt={movie.tieuDe}
                    className="w-full h-[250px] object-contain transition-transform duration-300 hover:scale-105"
                  />
                </div>

                {/* --- Thông tin & suất chiếu --- */}
                <div className="flex-1 p-6">
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 uppercase border-l-4 border-orange-500 pl-3 flex items-center gap-2">
                    {movie.tieuDe}
                    {movie.isHot && (
                      <span className="text-orange-600 text-lg animate-bounce">🔥</span>
                    )}
                  </h3>

                  {/* Suất chiếu */}
                  <motion.div
                    layout
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                  >
                    {movie.showtimes.map((st: Showtime, i: number) => (
                      <motion.button
                        key={st._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleSelectShowtime(st._id)} // ✅ điều hướng đến Booking
                        className={`rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-center shadow-sm border cursor-pointer transition-all duration-200 
                          ${isPeakHour(st.startTime)
                            ? "bg-orange-50 border-orange-300 hover:bg-orange-100"
                            : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                          }`}
                      >
                        <p className="font-semibold text-sm sm:text-base text-gray-800">
                          {dayjs(st.startTime).format("HH:mm")} -{" "}
                          {dayjs(st.endTime).format("HH:mm")}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                          Phòng: <span className="font-medium">{st.roomId.name}</span>
                        </p>
                        <p className="text-xs sm:text-sm text-orange-500 font-semibold mt-1">
                          {st.price.toLocaleString("vi-VN")}₫
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
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center text-gray-600 text-lg font-medium py-12 bg-gray-50 rounded-xl shadow-inner"
            >
              ❌ Không có xuất chiếu cho ngày hôm nay
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ShowTimesPage;
