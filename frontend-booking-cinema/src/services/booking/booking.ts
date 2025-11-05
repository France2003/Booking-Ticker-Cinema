import api from "../api";
import type { IShowtime, IBooking } from "../../types/bookings/booking";
export const getSeatsByShowtime = async (showtimeId: string): Promise<IShowtime> => {
    const res = await api.get(`/api/showtimes/${showtimeId}/seats`);
    return res.data.showtime;
};
// ✅ Tạo yêu cầu thanh toán VNPay
export const createVNPayPayment = async (showtimeId: string, selectedSeats: string[]): Promise<string> => {
    const res = await api.post(`/api/bookings/create-payment`, {
        showtimeId,
        selectedSeats,
    });
    return res.data.paymentUrl; // backend trả về paymentUrl
};

// ✅ Lấy danh sách vé của user (nếu cần)
export const getMyBookings = async (): Promise<IBooking[]> => {
  const res = await api.get("/api/bookings/me");
  return res.data.bookings;
};