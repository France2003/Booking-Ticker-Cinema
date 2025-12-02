import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import AdminLayout from "../../../layouts/adminlayout/adminlayout";
import type { IBooking } from "../../../types/bookings/booking";
import { getAllBookingsForAdmin, updateBookingStatus } from "../../../services/booking/booking";
import { socket } from "../../../utils/socket";
import BookingTabs from "./BookingTabs";

dayjs.locale("vi");

const QuanLyDatVeXemPhim = () => {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "cancelled">("all");
  const [newBookingInfo, setNewBookingInfo] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 🧭 Lấy danh sách vé
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getAllBookingsForAdmin();
      setBookings(data);
    } catch {
      toast.error("Không thể tải danh sách vé!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Duyệt vé
  const handleApprove = async (bookingCode: string) => {
    try {
      setLoading(true);
      await updateBookingStatus(
        bookingCode,
        "paid",
        "Duyệt thủ công bởi quản trị viên",
        "MoMo",
        "MoMo Payment",
        `ADMIN-${Date.now()}`
      );
      toast.success(`✅ Vé ${bookingCode} đã được duyệt thành công`);
      fetchBookings();
    } catch {
      toast.error("Không thể duyệt vé này!");
    } finally {
      setLoading(false);
    }
  };

  // ❌ Hủy vé
  const handleReject = async (bookingCode: string) => {
    try {
      setLoading(true);
      await updateBookingStatus(bookingCode, "cancelled", "Hủy thủ công bởi quản trị viên");
      toast.info(`❌ Vé ${bookingCode} đã bị hủy`);
      fetchBookings();
    } catch {
      toast.error("Không thể hủy vé này!");
    } finally {
      setLoading(false);
    }
  };

  // 🔔 Lắng nghe realtime từ socket
  useEffect(() => {
    fetchBookings();

    let hasInteracted = false;
    const enableAudio = () => {
      hasInteracted = true;
      window.removeEventListener("click", enableAudio);
    };
    window.addEventListener("click", enableAudio);

    socket.on("newBooking", async (data) => {
      console.log("🆕 Vé mới:", data);
      // ⏱ Delay nhẹ 1s trước khi cập nhật
      await new Promise((resolve) => setTimeout(resolve, 1000));
      fetchBookings();

      // 🔊 Phát âm thanh nếu admin đã tương tác
      if (hasInteracted) {
        const audio = new Audio(`${window.location.origin}/models/pling.mp3`);
        audio.volume = 0.5;
        audio.play().catch(() => { });
      }
      console.log("Bị chặn");
      
      // 🖥️ Cập nhật banner UI
      setNewBookingInfo({
        title: data.movieTitle,
        name: data.fullname,
        seats: data.seats,
        total: data.totalPrice,
      });

      // Ẩn banner sau 10s
      setTimeout(() => setNewBookingInfo(null), 10000);
    });

    return () => {
      socket.off("newBooking");
      window.removeEventListener("click", enableAudio);
    };
  }, []);

  // 📋 Bộ lọc vé
  const filteredBookings = bookings.filter((b) => {
    const matchStatus = filter === "all" || b.paymentStatus === filter;
    const matchSearch = b.bookingCode?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const today = dayjs().startOf("day");
  const categorized = {
    today: filteredBookings.filter((b) => dayjs(b.showtimeId?.date).isSame(today, "day")),
    upcoming: filteredBookings.filter((b) => dayjs(b.showtimeId?.date).isAfter(today, "day")),
    past: filteredBookings.filter((b) => dayjs(b.showtimeId?.date).isBefore(today, "day")),
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 flex items-center gap-2">
        🎫 Quản lý vé xem phim
      </h1>

      {/* 🔔 Banner thông báo vé mới */}
      {newBookingInfo && (
        <div className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white p-4 rounded-xl mb-6 shadow-md flex justify-between items-center animate-fadeIn">
          <div>
            <h3 className="font-semibold text-lg">🆕 Vé mới được đặt!</h3>
            <p className="text-sm opacity-90">
              🎬 <b>{newBookingInfo.title}</b> • 👤 {newBookingInfo.name}
            </p>
            <p className="text-xs mt-1 opacity-80">
              💺 Ghế: {newBookingInfo.seats?.join(", ")} • 💰{" "}
              {newBookingInfo.total?.toLocaleString("vi-VN")} VNĐ
            </p>
          </div>
          <button
            onClick={() => setNewBookingInfo(null)}
            className="text-white bg-black/20 hover:bg-black/30 rounded-lg px-3 py-1.5 text-sm font-medium"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Bộ lọc trạng thái */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-3 flex-wrap">
          {[
            { key: "all", label: "Tất cả" },
            { key: "pending", label: "Đang chờ thanh toán" },
            { key: "paid", label: "Đã thanh toán" },
            { key: "cancelled", label: "Đã hủy" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${filter === key
                  ? "bg-pink-600 text-white shadow-md"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="🔍 Tìm theo mã vé..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-pink-500" />
          <p>Đang tải danh sách vé...</p>
        </div>
      ) : (
        <BookingTabs
          categorized={categorized}
          handleApprove={handleApprove}
          handleReject={handleReject}
        />
      )}
    </AdminLayout>
  );
};

export default QuanLyDatVeXemPhim;
