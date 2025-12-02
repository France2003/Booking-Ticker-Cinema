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
  fetchBookingStats,
  fetchRevenueLast7Days,
  fetchRevenueMonth,
  fetchRevenueRange,
  fetchTopMovies,
  fetchTopUsers,
  fetchRevenueByRoom,
  fetchRoomStats,
  fetchShowsTimeCount,
  fetchUserCount
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

  const [revenueType, setRevenueType] = useState<"week" | "month" | "range">("week");
  const [revenueData, setRevenueData] = useState<RevenueItem[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);

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
  }, []);
  useEffect(() => {
    loadRevenue();
  }, [revenueType, dateRange]);

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

  const loadAdvancedStats = async () => {
    const movies = await fetchTopMovies();
    const users = await fetchTopUsers();
    const rooms = await fetchRevenueByRoom();

    setTopMovies(movies.data);
    setTopUsers(users.data);
    setRevenueRooms(rooms.data);
  };

  const loadRevenue = async () => {
    let res;

    if (revenueType === "week") res = await fetchRevenueThisWeek();
    else if (revenueType === "month") res = await fetchRevenueMonth();
    else {
      const from = dateRange[0].startDate!.toISOString();
      const to = dateRange[0].endDate!.toISOString();
      res = await fetchRevenueRange(from, to);
    }

    setRevenueData(res.data);
  };

  const totalRevenue = revenueData.reduce((s, r) => s + r.total, 0);

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded-3xl shadow mb-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          📊 Thống kê doanh thu
        </h2>
        {/* FILTER TABS */}
        <div className="flex gap-4 mb-6 flex-wrap">

          <button
            onClick={() => setRevenueType("week")}
            className={`px-5 py-2 rounded-xl font-medium transition shadow-sm
              ${revenueType === "week"
                ? "bg-indigo-600 text-white shadow-lg scale-105"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Doanh thu 7 ngày
          </button>

          <button
            onClick={() => setRevenueType("month")}
            className={`px-5 py-2 rounded-xl font-medium transition shadow-sm
              ${revenueType === "month"
                ? "bg-indigo-600 text-white shadow-lg scale-105"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Doanh thu 12 tháng
          </button>

          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`px-5 py-2 rounded-xl font-medium transition shadow-sm flex items-center gap-2
              ${revenueType === "range"
                ? "bg-indigo-600 text-white shadow-lg scale-105"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Chọn khoảng ngày <ChevronDown />
          </button>

        </div>

        {/* DATE RANGE PICKER */}
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
                    startDate: item.selection.startDate || new Date(),
                    endDate: item.selection.endDate || new Date(),
                    key: "selection"
                  }
                ]);
              }}
            />
          </div>
        )}

        {/* CHART */}
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="url(#colorUv)" radius={[10, 10, 0, 0]} />

              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0.3} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard title="Phòng chiếu" value={totalRoom.toLocaleString()} change={`Tổng: ${totalRoom}`} icon={<Projector />} positive />
        <StatCard title="Xuất chiếu" value={totalShowTime.toLocaleString()} change={`Tổng: ${totalShowTime}`} icon={<Film />} positive />
        <StatCard title="Người dùng" value={userCount.toLocaleString()} change={`Tổng: ${userCount}`} icon={<Users />} positive />
        <StatCard title="Vé đã đặt" value={totalBookings.toLocaleString()} change={`Chờ duyệt: ${pendingBookings}`} icon={<ShoppingCart />} positive />
        <StatCard title="Doanh thu" value={totalRevenue.toLocaleString() + "VNĐ"} change="Tổng doanh thu" icon={<DollarSign />} positive />
      </div>

      {/* ADVANCED ANALYTICS */}
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
