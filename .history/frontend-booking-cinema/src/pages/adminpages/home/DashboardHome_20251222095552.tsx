import { useEffect, useState } from "react";
import AdminLayout from "../../../layouts/adminlayout/adminlayout";
import { Users, ShoppingCart, DollarSign, Film, Projector, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { DateRange } from "react-date-range";
import type { Range } from "react-date-range";
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
  fetchRoomStats,
  fetchShowsTimeThisWeek,
  fetchBookingsThisWeek
} from "../../../services/stats/stats";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
interface RevenueItem {
  label: string;
  total: number;
}
export default function DashboardHome() {
  /* =============================== STATE =============================== */
  const [userCount, setUserCount] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [weeklyBookings, setWeeklyBookings] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [totalShowTime, setTotalShowTime] = useState(0);
  const [weeklyShowTime, setWeeklyShowTime] = useState(0);
  const [totalRoom, setTotalRoom] = useState(0);
  const [revenueType, setRevenueType] = useState<"thisWeek" | "lastWeek" | "compare" | "month" | "range">("thisWeek");
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
  /* ============================= INIT LOAD ============================= */
  useEffect(() => {
    loadStaticStats();
    loadAdvancedStats();
    loadWeeklyTrend();
    loadWeeklyShowTime();
    loadWeeklyBookings();
  }, []);
  useEffect(() => {
    loadRevenue();
  }, [revenueType, dateRange]);

  /* =========================== STATIC STATS =========================== */
  const loadStaticStats = async () => {
    const users = await fetchUserCount();
    const bookings = await fetchBookingStats();
    const shows = await fetchShowsTimeCount();
    const rooms = await fetchRoomStats();
    setUserCount(users.data.count);
    setTotalBookings(bookings.data.totalBookings);
    setPendingBookings(bookings.data.pendingBookings);
    setTotalShowTime(shows.data.count);
    setTotalRoom(rooms.data.count);
  };
  const loadWeeklyBookings = async () => {
    const res = await fetchBookingsThisWeek();
    setWeeklyBookings(res.data.count);
  };
  const loadWeeklyShowTime = async () => {
    const res = await fetchShowsTimeThisWeek();
    setWeeklyShowTime(res.data.count);
  };
  /* =========================== ADVANCED STATS =========================== */
  const loadAdvancedStats = async () => {
    const movies = await fetchTopMovies();
    const users = await fetchTopUsers();
    const rooms = await fetchRevenueByRoom();
    setTopMovies(movies.data);
    setTopUsers(users.data);
    setRevenueRooms(rooms.data);
  };
  /* =========================== TREND =========================== */
  const loadWeeklyTrend = async () => {
    const res = await fetchWeeklyCompare();
    setTrend(res.data.trend);
  };
  /* =========================== LOAD REVENUE =========================== */
  const loadRevenue = async () => {
    let res: { data: RevenueItem[] } | null = null;

    switch (revenueType) {
      case "thisWeek":
        res = await fetchRevenueThisWeek();
        break;
      case "lastWeek":
        res = await fetchRevenueLastWeek();
        break;
      case "compare":
        const c = await fetchWeeklyCompare();
        setTrend(c.data.trend);
        res = { data: c.data.thisWeek };
        break;
      case "month":
        res = await fetchRevenueMonth();
        break;
      case "range":
        res = await fetchRevenueRange(
          dateRange[0].startDate!.toISOString(),
          dateRange[0].endDate!.toISOString()
        );
        break;
    }

    if (res?.data) setRevenueData(res.data);
  };

  const totalRevenue = revenueData.reduce((s, r) => s + r.total, 0);
  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="p-6 rounded-3xl shadow-lg bg-white border mb-10"
      >
        <h2 className="text-2xl font-extrabold text-blue-700 mb-5 flex items-center gap-2">
          📊 Thống kê doanh thu
        </h2>
        {/* FILTER */}
        <div className="flex gap-3 mb-5 flex-wrap">
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
              className={`
                px-4 py-2 rounded-full font-medium text-sm transition-all
                ${revenueType === btn.key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white border text-gray-700 hover:bg-blue-50"
                }
              `}
            >
              {btn.label}
            </button>
          ))}

          <button
            onClick={() => setShowCalendar(prev => !prev)}
            className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-sm flex items-center gap-1"
          >
            <ChevronDown size={16} /> Chọn ngày
          </button>
        </div>
        {showCalendar && (
          <div className="mb-4 rounded-2xl overflow-hidden border bg-white shadow">
            <DateRange
              editableDateInputs
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
              onChange={(item: any) => {
                setRevenueType("range");
                setDateRange([item.selection]);
              }}
            />
          </div>
        )}
        {/* CHART — Blue Pro Sharp */}
        <div className="h-[260px] w-full p-4 rounded-2xl bg-white border border-gray-200 shadow-md">
          <ResponsiveContainer>
            <BarChart data={revenueData} barCategoryGap="30%">

              {/* GRID – rõ, sạch, không loãng */}
              <CartesianGrid
                stroke="#e5e7eb"
                strokeDasharray="3 3"
              />

              {/* TRỤC X */}
              <XAxis
                dataKey="label"
                tick={{ fill: "#1e293b", fontSize: 13, fontWeight: 600 }}
                tickMargin={12}
                axisLine={{ stroke: "#cbd5e1" }}
              />

              {/* TRỤC Y */}
              <YAxis
                tick={{ fill: "#334155", fontSize: 12 }}
                axisLine={{ stroke: "#cbd5e1" }}
              />

              {/* TOOLTIP – sắc nét */}
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  background: "#ffffff"
                }}
                formatter={(v) => v.toLocaleString() + " VNĐ"}
              />

              {/* BAR – xanh đậm, rõ, đẹp */}
              <Bar
                dataKey="total"
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
                animationDuration={1200}
                animationBegin={100}
                fill="#2563eb"
              />

            </BarChart>
          </ResponsiveContainer>
        </div>

        {revenueType === "compare" && (
          <p className="text-md font-semibold mt-3">
            Xu hướng tuần này:{" "}
            <span className={trend >= 0 ? "text-green-600" : "text-red-600"}>
              {trend}% {trend >= 0 ? "📈" : "📉"}
            </span>
          </p>
        )}
      </motion.div>
      {/* ===================== STAT CARDS ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard title="Phòng chiếu" value={totalRoom} icon={<Projector />} />
        {/* <StatCard title="Xuất chiếu" value={totalShowTime} icon={<Film />} /> */}
        <StatCard title="Xuất chiếu" value={weeklyShowTime} sub={`Tổng xuất chiếu: ${totalShowTime}`} icon={<Film />} />
        <StatCard title="Người dùng" value={userCount} icon={<Users />} />
        <StatCard
          title="Vé đã đặt"
          value={totalBookings}
          sub={`Chờ duyệt: ${pendingBookings}`}
          icon={<ShoppingCart />}
        />
        <StatCard
          title="Tổng doanh thu"
          value={totalRevenue}
          money
          icon={<DollarSign />}
        />
      </div>
      {/* ===================== TOP LISTS ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <TopListCard
          title="🎬 Top phim bán chạy"
          data={topMovies.map((m, i) => ({
            label: `${i + 1}. ${m.movie.tieuDe}`,
            value: m.revenue
          }))}
        />

        <TopListCard
          title="🏟️ Doanh thu theo phòng"
          data={revenueRooms.map(r => ({
            label: `Phòng ${r.room.name}`,
            value: r.totalRevenue
          }))}
        />

        <TopListCard
          title="👑 Người dùng chi nhiều nhất"
          data={topUsers.map((u, i) => ({
            label: `${i + 1}. ${u.user.fullname}`,
            value: u.totalSpent
          }))}
        />
      </div>

    </AdminLayout>
  );
}

/* ===================== COMPONENTS ===================== */
const StatCard = ({ title, icon, value, sub, money }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: .4 }}
    className="p-5 rounded-2xl bg-white border shadow hover:shadow-md transition"
  >
    <div className="flex items-center gap-3 mb-2">
      <div className="text-blue-600 text-2xl">{icon}</div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>

    <p className="text-2xl font-extrabold text-blue-700">
      <CountUp end={value} duration={1.3} separator="," />
      {money && " VNĐ"}
    </p>

    {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
  </motion.div>
);

const TopListCard = ({ title, data }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: .4 }}
    className="p-6 rounded-2xl bg-white border shadow hover:shadow-md transition"
  >
    <h3 className="text-lg font-bold text-blue-700 mb-3">{title}</h3>

    {data.map((item: any, i: number) => (
      <div key={i} className="flex justify-between py-2 border-b last:border-b-0">
        <span className="text-gray-700">{item.label}</span>
        <span className="font-bold text-blue-700">
          {item.value.toLocaleString()} VNĐ
        </span>
      </div>
    ))}
  </motion.div>
);
