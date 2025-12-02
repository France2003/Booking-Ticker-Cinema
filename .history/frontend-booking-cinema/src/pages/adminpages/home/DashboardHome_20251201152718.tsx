import { useEffect, useState } from "react";
import AdminLayout from "../../../layouts/adminlayout/adminlayout";
import StatCard from "../../../components/Admin/Dashboard.StatCard";

import {
  Users, ShoppingCart, DollarSign, Film, Projector, ChevronDown
} from "lucide-react";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from "recharts";

import { DateRange } from "react-date-range";

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

type RangeWithDate = {
  startDate: Date;
  endDate: Date;
  key: string;
};

interface RevenueItem {
  label: string;
  total: number;
}

const DashboardHome = () => {

  const [userCount, setUserCount] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [totalShowTime, setTotalShowTime] = useState(0);
  const [totalRoom, setTotalRoom] = useState(0);

  const [revenueType, setRevenueType] = useState<
    "week" | "month" | "range" | "thisWeek" | "lastWeek" | "compare"
  >("week");

  const [revenueData, setRevenueData] = useState<RevenueItem[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [trend, setTrend] = useState<number>(0);

  const [dateRange, setDateRange] = useState<RangeWithDate[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection"
    }
  ]);

  const [topMovies, setTopMovies] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [revenueRooms, setRevenueRooms] = useState([]);

  useEffect(() => {
    loadStaticStats();
    loadAdvancedStats();
    loadWeeklyTrend();
  }, []);

  useEffect(() => {
    loadRevenue();
  }, [revenueType, dateRange]);

  /* ===========================
      LOAD STATIC NUMBERS
  =========================== */
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

  /* ===========================
      LOAD ADVANCED STATS
  =========================== */
  const loadAdvancedStats = async () => {
    const movies = await fetchTopMovies();
    const users = await fetchTopUsers();
    const rooms = await fetchRevenueByRoom();

    setTopMovies(movies.data);
    setTopUsers(users.data);
    setRevenueRooms(rooms.data);
  };

  /* ===========================
      LOAD REVENUE CHART
  =========================== */
  const loadRevenue = async () => {
    let res;

    if (revenueType === "thisWeek") {
      res = await fetchRevenueThisWeek();
    } else if (revenueType === "lastWeek") {
      res = await fetchRevenueLastWeek();
    } else if (revenueType === "compare") {
      const compare = await fetchWeeklyCompare();
      setTrend(compare.data.trend);
      res = { data: compare.data.thisWeek }; // hiển thị tuần này trên chart
    } else if (revenueType === "month") {
      res = await fetchRevenueMonth();
    } else if (revenueType === "range") {
      const from = dateRange[0].startDate.toISOString();
      const to = dateRange[0].endDate.toISOString();
      res = await fetchRevenueRange(from, to);
    } else {
      // fallback week
      res = await fetchRevenueThisWeek();
    }

    setRevenueData(res.data);
  };

  /* ===========================
      TREND %
  =========================== */
  const loadWeeklyTrend = async () => {
    const res = await fetchWeeklyCompare();
    setTrend(res.data.trend);
  };

  const totalRevenue = revenueData.reduce((s, r) => s + r.total, 0);

  return (
    <AdminLayout>
      {/* ==================== REVENUE CHART ==================== */}
      <div className="bg-white p-6 rounded-3xl shadow mb-6">

        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          📊 Thống kê doanh thu
        </h2>

        {/* FILTER BUTTONS */}
        <div className="flex gap-3 mb-6 flex-wrap">

          <button
            onClick={() => setRevenueType("thisWeek")}
            className={`px-5 py-2 rounded-xl font-medium transition shadow-sm 
              ${revenueType === "thisWeek"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Tuần này
          </button>

          <button
            onClick={() => setRevenueType("lastWeek")}
            className={`px-5 py-2 rounded-xl font-medium transition shadow-sm 
              ${revenueType === "lastWeek"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Tuần trước
          </button>

          <button
            onClick={() => setRevenueType("compare")}
            className={`px-5 py-2 rounded-xl font-medium transition shadow-sm 
              ${revenueType === "compare"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            So sánh tuần
          </button>

          <button
            onClick={() => setRevenueType("month")}
            className={`px-5 py-2 rounded-xl font-medium transition shadow-sm 
              ${revenueType === "month"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            12 tháng
          </button>

          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`px-5 py-2 rounded-xl font-medium transition shadow-sm flex items-center gap-2
              ${revenueType === "range"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Chọn khoảng ngày <ChevronDown />
          </button>

        </div>

        {/* CALENDAR */}
        {showCalendar && (
          <div className="mb-4 shadow rounded-xl overflow-hidden border">
            <DateRange
              editableDateInputs
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
              onChange={(item) => {
                setRevenueType("range");
                setDateRange([
                  {
                    startDate: item.selection.startDate!,
                    endDate: item.selection.endDate!,
                    key: "selection"
                  }
                ]);
              }}
            />
          </div>
        )}

        {/* BAR CHART */}
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#6366F1" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* TREND % */}
        {revenueType === "compare" && (
          <p className="mt-4 text-lg font-semibold">
            Xu hướng tuần này:{" "}
            <span className={trend >= 0 ? "text-green-600" : "text-red-600"}>
              {trend}% {trend >= 0 ? "📈" : "📉"}
            </span>
          </p>
        )}

      </div>

      {/* ==================== STAT CARDS ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard title="Phòng chiếu" value={totalRoom} icon={<Projector />} positive />
        <StatCard title="Xuất chiếu" value={totalShowTime} icon={<Film />} positive />
        <StatCard title="Người dùng" value={userCount} icon={<Users />} positive />
        <StatCard title="Vé đã đặt" value={totalBookings} change={`Chờ duyệt: ${pendingBookings}`} icon={<ShoppingCart />} positive />
        <StatCard title="Tổng doanh thu" value={totalRevenue.toLocaleString() + " VNĐ"} icon={<DollarSign />} positive />
      </div>

      {/* ==================== TOP MOVIES / USERS / ROOMS ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

        {/* TOP MOVIES */}
        <div className="bg-white p-6 rounded-3xl shadow">
          <h3 className="text-xl font-semibold mb-4">🎬 Top phim bán chạy</h3>
          {topMovies.map((m: any, i) => (
            <div key={i} className="flex justify-between border-b py-3">
              <span>{i + 1}. {m.movie.tieuDe}</span>
              <span className="font-bold">{m.revenue.toLocaleString()} VNĐ</span>
            </div>
          ))}
        </div>

        {/* TOP ROOMS */}
        <div className="bg-white p-6 rounded-3xl shadow">
          <h3 className="text-xl font-semibold mb-4">🏟️ Doanh thu theo phòng</h3>
          {revenueRooms.map((r: any, i) => (
            <div key={i} className="flex justify-between border-b py-3">
              <span>Phòng: {r.room.name}</span>
              <span className="font-bold">{r.totalRevenue.toLocaleString()} đ</span>
            </div>
          ))}
        </div>

        {/* TOP USERS */}
        <div className="bg-white p-6 rounded-3xl shadow">
          <h3 className="text-xl font-semibold mb-4">👑 User chi nhiều nhất</h3>
          {topUsers.map((u: any, i) => (
            <div key={i} className="flex justify-between border-b py-3">
              <span>{i + 1}. {u.user.fullname}</span>
              <span className="font-bold">{u.totalSpent.toLocaleString()} đ</span>
            </div>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
};

export default DashboardHome;
