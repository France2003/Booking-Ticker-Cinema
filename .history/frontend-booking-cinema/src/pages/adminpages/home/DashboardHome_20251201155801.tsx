import { useEffect, useState } from "react";
import AdminLayout from "../../../layouts/adminlayout/adminlayout";
import {
  Users, ShoppingCart, DollarSign, Film, Projector, ChevronDown
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from "recharts";
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
  fetchRoomStats
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
  const [pendingBookings, setPendingBookings] = useState(0);
  const [totalShowTime, setTotalShowTime] = useState(0);
  const [totalRoom, setTotalRoom] = useState(0);

  const [revenueType, setRevenueType] =
    useState<"thisWeek" | "lastWeek" | "compare" | "month" | "range">("thisWeek");

  const [revenueData, setRevenueData] = useState<RevenueItem[]>([]);
  const [trend, setTrend] = useState(0);

  const [showCalendar, setShowCalendar] = useState(false);
  /** FIX TYPE — đảm bảo luôn có Date */
  const [dateRange, setDateRange] = useState<Range[]>([{
    startDate: new Date(),
    endDate: new Date(),
    key: "selection"
  }]);

  const [topMovies, setTopMovies] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [revenueRooms, setRevenueRooms] = useState<any[]>([]);

  /* ============================= INIT LOAD ============================= */
  useEffect(() => {
    loadStaticStats();
    loadAdvancedStats();
    loadWeeklyTrend();
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

  /* =========================== TOOLTIP =========================== */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="backdrop-blur-xl bg-white/40 border border-white/50 px-4 py-3 rounded-xl shadow-lg">
        <p className="font-semibold text-indigo-700">{label}</p>
        <p className="font-bold text-gray-900">
          {payload[0].value.toLocaleString()} VNĐ
        </p>
      </div>
    );
  };


  /* =========================== RENDER UI =========================== */
  return (
    <AdminLayout>

      {/* ===================== CHART BOX ===================== */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .7 }}
        className="p-8 rounded-3xl shadow-2xl mb-10 backdrop-blur-2xl bg-white/30 border border-white/40"
      >
        <h2 className="text-3xl font-extrabold text-indigo-700 mb-6">
          📊 Thống kê doanh thu
        </h2>

        {/* FILTER */}
        <div className="flex gap-3 mb-7 flex-wrap">
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
                px-5 py-2 rounded-2xl font-semibold transition backdrop-blur-xl
                ${revenueType === btn.key
                  ? "bg-indigo-600 text-white shadow-xl scale-105"
                  : "bg-white/40 text-gray-700 border hover:bg-indigo-50"
                }`}
            >
              {btn.label}
            </button>
          ))}

          <button
            onClick={() => setShowCalendar(prev => !prev)}
            className="px-4 py-2 rounded-2xl bg-indigo-100 hover:bg-indigo-200 transition flex items-center gap-2"
          >
            <ChevronDown /> Chọn ngày
          </button>
        </div>

        {showCalendar && (
          <div className="mb-6 rounded-2xl overflow-hidden border backdrop-blur-xl bg-white/50">
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

        {/* CHART */}
        <div className="h-[360px] w-full">
          <ResponsiveContainer>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="label" stroke="#555" />
              <YAxis stroke="#555" />
              <Tooltip content={<CustomTooltip />} />

              <Bar
                dataKey="total"
                radius={[12, 12, 0, 0]}
                animationDuration={2000}
                animationBegin={200}
                fill="url(#glassGradient)"
              />

              <defs>
                <linearGradient id="glassGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.4} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {revenueType === "compare" && (
          <p className="text-xl font-semibold mt-5">
            Xu hướng tuần này:{" "}
            <span className={trend >= 0 ? "text-green-600" : "text-red-600"}>
              {trend}% {trend >= 0 ? "📈" : "📉"}
            </span>
          </p>
        )}
      </motion.div>


      {/* ===================== STAT CARDS ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">

        {[
          { title: "Phòng chiếu", icon: <Projector />, value: totalRoom },
          { title: "Xuất chiếu", icon: <Film />, value: totalShowTime },
          { title: "Người dùng", icon: <Users />, value: userCount },
        ].map((card, i) => (
          <GlassCard key={i} {...card} />
        ))}

        <GlassCard
          title="Vé đã đặt"
          icon={<ShoppingCart />}
          value={totalBookings}
          sub={`Chờ duyệt: ${pendingBookings}`}
        />

        <GlassCard
          title="Tổng doanh thu"
          icon={<DollarSign />}
          money
          value={totalRevenue}
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
          title="👑 User chi nhiều nhất"
          data={topUsers.map((u, i) => ({
            label: `${i + 1}. ${u.user.fullname}`,
            value: u.totalSpent
          }))}
        />

      </div>

    </AdminLayout >
  );
}
/* ===================== INLINE COMPONENTS ===================== */
const GlassCard = ({ title, icon, value, sub, money }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: .5 }}
    className="
      p-6 rounded-3xl shadow-xl backdrop-blur-2xl bg-white/30
      border border-white/40 hover:shadow-2xl hover:scale-105 transition
    "
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="text-indigo-600 text-3xl">{icon}</div>
      <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
    </div>

    <p className="text-3xl font-extrabold text-indigo-700">
      <CountUp end={value} duration={1.4} separator="," />
      {money && " VNĐ"}
    </p>

    {sub && (
      <p className="text-sm text-gray-600 mt-1">{sub}</p>
    )}
  </motion.div>
);
const TopListCard = ({ title, data }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: .6 }}
    className="
      p-6 rounded-3xl shadow-xl backdrop-blur-2xl bg-white/30
      border border-white/40 hover:shadow-2xl transition
    "
  >
    <h3 className="text-xl font-bold mb-4 text-indigo-700">{title}</h3>

    {data.map((item: any, i: number) => (
      <div key={i} className="flex justify-between border-b py-3">
        <span>{item.label}</span>
        <span className="font-bold text-indigo-600">
          {item.value.toLocaleString()} đ
        </span>
      </div>
    ))}
  </motion.div>
);
