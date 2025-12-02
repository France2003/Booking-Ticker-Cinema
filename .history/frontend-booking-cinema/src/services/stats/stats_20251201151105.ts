import api from "../api";

export const fetchUserCount = () => api.get("/api/admin/stats/users");
export const fetchBookingStats = () => api.get("/api/admin/stats/bookings");
export const fetchShowsTimeCount = () => api.get("/api/admin/stats/showtimes");
export const fetchRoomStats = () => api.get("/api/admin/stats/room");

// doanh thu 7 ngày gần nhất
export const fetchRevenueThisWeek  = () => api.get("/api/admin/stats/revenue/week");

// doanh thu 12 tháng
export const fetchRevenueMonth = () => api.get("/api/admin/stats/revenue/month");
export const fetchRevenueRange = (from: string, to: string) =>
  api.get(`/api/admin/stats/revenue/range?from=${from}&to=${to}`);
export const fetchTopMovies = () => api.get("/api/admin/stats/movies/top");
export const fetchRevenueByRoom = () => api.get("/api/admin/stats/rooms/revenue");
export const fetchTopUsers = () => api.get("/api/admin/stats/users/top");