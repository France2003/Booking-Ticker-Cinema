import api from "../api";
import type { IShowtime, IBooking } from "../../types/bookings/booking";

/** 🎟️ Lấy danh sách ghế của suất chiếu */
export const getSeatsByShowtime = async (showtimeId: string): Promise<IShowtime> => {
  const res = await api.get(`/api/showtimes/${showtimeId}/seats`);
  return res.data.showtime;
};
export const createBooking = async (payload: {
  showtimeId: string;
  selectedSeats: string[];
  moviePoster?: string;
  movieTitle?: string;
  paymentMethod?: string; // ✅ thêm dòng này
}): Promise<{ bookingCode: string; totalPrice: number; message: string }> => {
  const res = await api.post(`/api/bookings/create`, payload);
  return res.data;
};

/** 💰 Tạo giao dịch MoMo và nhận link thanh toán */
export const momoPayment = async (bookingCode: string): Promise<{ payUrl: string }> => {
  const res = await api.post(`/api/bookings/momo-pay`, { bookingCode });
  return res.data;
};
/** 📜 Lấy danh sách vé của người dùng */
export const getMyBookings = async (): Promise<IBooking[]> => {
  const res = await api.get("/api/bookings/my-bookings");
  return res.data.bookings;
};

/** 🔍 Lấy trạng thái vé */
export const getBookingStatus = async (bookingCode: string) => {
  const res = await api.get(`/api/bookings/status/${bookingCode}`);
  return res.data;
};
/** 📋 Admin: Lấy tất cả vé */
export const getAllBookingsForAdmin = async (): Promise<IBooking[]> => {
  const res = await api.get("/api/bookings/admin/bookings");
  return res.data.bookings;
};
/** 🛠️ Admin: Cập nhật trạng thái vé */
export const updateBookingStatus = async (
  bookingCode: string,
  status: "paid" | "cancelled",
  note?: string,
  paymentMethod?: string,
  bankName?: string,
  transactionId?: string
) => {
  try {
    const res = await api.patch("/api/bookings/update-status", {
      bookingCode,
      status,
      note: note?.trim() || "",
      paymentMethod: paymentMethod?.trim() || "",
      bankName: bankName?.trim() || "",
      transactionId: transactionId?.trim() || "",
    });
    return res.data;
  } catch (err: any) {
    console.error("❌ Lỗi cập nhật vé:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};
/** 📜 Lấy danh sách vé của người dùng theo ID */
export const getBookingsByUser = async (userId: string): Promise<IBooking[]> => {
  const res = await api.get(`/api/bookings/user/${userId}`);
  return res.data.bookings;
}