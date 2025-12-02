import { useEffect, useState } from "react";
import AdminLayout from "../../../layouts/adminlayout/adminlayout";
import StatCard from "../../../components/Admin/Dashboard.StatCard";

import {
  Users, ShoppingCart, DollarSign, Film, Projector, ChevronDown
} from "lucide-react";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer
} from "recharts";

import { motion } from "framer-motion";
import { DateRange, Range } from "react-date-range";

import {
  fetchRevenueMonth,
  fetchRevenueRange,
  fetchRevenueThisWeek,
  fetchRevenueLastWeek,
  fetchWeeklyCompare,
  fetchBookingStats,
  fetchTopMovies,
  fetchTopUsers,
  fetchRevenueByRoom,
  fetchShowsTimeCount,
  fetchUserCount,
  fetchRoomStats
} from "../../../services/stats/stats";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface RevenueItem {
  label: string;
  total: number;
}

const DashboardHome = () => {

  /* ===================== LOCAL STATE ===================== */
  const [userCount, setUserCount] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [totalShowTime, setTotalShowTime] = useState(0);
  const [totalRoom, setTotalRoom] = useState(0);

  const [revenueType, setRevenueType] = useState<
    "thisWeek" | "lastWeek" | "compare" | "month" | "range"
  >("thisWeek");

  const [revenueData, setRevenueData] = useState<RevenueItem[]>([]);
  const [trend, setTrend] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);

  const [dateRange, setDateRange] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection"
    }
  ]);

  const [topMovies, setTopMovies] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [revenueRooms, setRevenueRooms] = useState<any[]>([]);

  /* ===================== LOAD INITIAL ===================== */
  useEffect(() => {
    loadStaticStats();
    loadAdvancedStats();
    loadWeeklyTrend();
  }, []);

  useEffect(() => {
    loadRevenue();
  }, [revenueType, dateRange]);


  /* ===================== LOAD STATIC ===================== */
  const loadStaticStats = async () => {
    const users = await fetchUserCount();
    const bookings = await fetchBookingStats();
    const showtimes = await fetchShowsTimeCount();
    const rooms = await fetchRoomStats();

    setUserCount(users.data.count);
    setTotalBookings(bookings.data.totalBookings);
    setPendingBookings(bookings.data.pendingBookings);
    setTotalShowTime(showtimes.data.count);
    setTotalRoom(rooms.data.count);
  };

  /* ===================== LOAD ADVANCED ===================== */
  const loadAdvancedStats = async () => {
    const movies = await fetchTopMovies();
    const users = await fetchTopUsers();
    const rooms = await fetchRevenueByRoom();

    setTopMovies(movies.data);
    setTopUsers(users.data);
    setRevenueRooms(rooms.data);
  };

  /* ===================== TREND (WEEK COMPARE) ===================== */
  const loadWeeklyTrend = async () => {
    const res = await fetchWeeklyCompare();
    setTrend(res.data.trend);
  };

  /* ===================== MAIN REVENUE LOADER ===================== */
  const loadRevenue = async () => {
    let res: { data: RevenueItem[] } | null = null;

    if (revenueType === "thisWeek") {
      res = await fetchRevenueThisWeek();

    } else if (revenueType === "lastWeek") {
      res = await fetchRevenueLastWeek();

    } else if (revenueType === "compare") {
      const compare = await fetchWeeklyCompare();
      setTrend(compare.data.trend);
      res = { data: compare.data.thisWeek };

    } else if (revenueType === "month") {
      res = await fetchRevenueMonth();

    } else if (revenueType === "range") {
      const start = dateRange[0].startDate ?? new Date();
      const end = dateRange[0].endDate ?? new Date();
      res = await fetchRevenueRange(start.toISOString(), end.toISOString());
    }

    if (res && res.data) setRevenueData(res.data);
  };


  /* ===================== TOTAL REVENUE ===================== */
  const totalRevenue = revenueData.reduce((s, r) => s + r.total, 0);


  /* ===================== CUSTOM TOOLTIP ===================== */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border text-sm">
          <p className="font-semibold text-indigo-600">{label}</p>
          <p className="font-bold text-gray-800">
            {payload[0].value.toLocaleString()} VNĐ
          </p>
        </div>
      );
    }
    return null;
  };


  /* ===================== RENDER UI ===================== */
  return (
    <AdminLayout>

      {/* ====================== REVENUE CHART ====================== */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 rounded-3xl shadow-xl mb-8 border border-indigo-100"
      >
        <h2 className="text-3xl font-bold mb-6 text-indigo-700">📊 Thống kê doanh thu</h2>

        {/* FILTER BUTTONS */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {[
            { key: "thisWeek", label: "Tuần này" },
            { key: "lastWeek", label: "Tuần trước" },
            { key: "compare", label: "So sánh tuần" },
            { key: "month", label: "12 tháng" },
            { key: "range", label: "Khoảng ngày" }
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => setRevenueType(btn.key as any)}
              className={`px-5 py-2 rounded-xl font-semibold transition 
              ${revenueType === btn.key
                  ? "bg-indigo-600 text-white shadow-xl scale-105"
                  : "bg-white text-gray-600 border hover:bg-indigo-50"
                }`}
            >
              {btn.label}
            </button>
          ))}

          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="px-4 py-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 transition flex items-center gap-2"
          >
            <ChevronDown /> Chọn ngày
          </button>
        </div>

        {/* CALENDAR */}
        {showCalendar && (
          <div className="mb-4 shadow-xl rounded-2xl overflow-hidden border">
            <DateRange
              editableDateInputs
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
              onChange={(item) => {
                setRevenueType("range");
                setDateRange([item.selection as Range]);
              }}
            />
          </div>
        )}

        {/* CHART */}
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="4 4" opacity={0.15} />
              <XAxis dataKey="label" stroke="#555" />
              <YAxis stroke="#555" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="total"
                radius={[10, 10, 0, 0]}
                animationDuration={1400}
                animationBegin={300}
                fill="url(#revenueGradient)"
              />

              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.25} />
                </linearGradient>
              </defs>

            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* TREND */}
        {revenueType === "compare" && (
          <p className="text-lg mt-4 font-semibold">
            Xu hướng tuần này:{" "}
            <span className={trend >= 0 ? "text-green-600" : "text-red-600"}>
              {trend}% {trend >= 0 ? "📈" : "📉"}
            </span>
          </p>
        )}

      </motion.div>


      {/* ===================== STAT CARDS ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard title="Phòng chiếu" value={totalRoom} icon={<Projector />} positive />
        <StatCard title="Xuất chiếu" value={totalShowTime} icon={<Film />} positive />
        <StatCard title="Người dùng" value={userCount} icon={<Users />} positive />
        <StatCard title="Vé đã đặt" value={totalBookings} change={`Chờ duyệt: ${pendingBookings}`} icon={<ShoppingCart />} positive />
        <StatCard title="Tổng doanh thu" value={totalRevenue.toLocaleString() + " VNĐ"} icon={<DollarSign />} positive />
      </div>


      {/* ===================== TOP ITEMS ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

        {/* MOVIES */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl p-6 shadow-xl border hover:shadow-2xl transition"
        >
          <h3 className="text-xl font-bold mb-4 text-indigo-700">🎬 Top phim bán chạy</h3>
          {topMovies.map((m, i) => (
            <div key={i} className="flex justify-between border-b py-3">
              <span>{i + 1}. {m.movie?.tieuDe}</span>
              <span className="font-bold text-indigo-600">{m.revenue.toLocaleString()} VNĐ</span>
            </div>
          ))}
        </motion.div>

        {/* ROOMS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-6 shadow-xl border hover:shadow-2xl transition"
        >
          <h3 className="text-xl font-bold mb-4 text-indigo-700">🏟️ Doanh thu theo phòng</h3>
          {revenueRooms.map((r, i) => (
            <div key={i} className="flex justify-between border-b py-3">
              <span>Phòng {r.room?.name}</span>
              <span className="font-bold text-indigo-600">{r.totalRevenue.toLocaleString()} đ</span>
            </div>
          ))}
        </motion.div>

        {/* USERS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-6 shadow-xl border hover:shadow-2xl transition"
        >
          <h3 className="text-xl font-bold mb-4 text-indigo-700">👑 User chi nhiều nhất</h3>
          {topUsers.map((u, i) => (
            <div key={i} className="flex justify-between border-b py-3">
              <span>{i + 1}. {u.user?.fullname}</span>
              <span className="font-bold text-indigo-600">{u.totalSpent.toLocaleString()} đ</span>
            </div>
          ))}
        </motion.div>

      </div>

    </AdminLayout>
  );
};

export default DashboardHome;
