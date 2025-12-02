// userProfile.ts
import api from "../api";
export const getProfile = async () => {
  const res = await api.get(`/api/users/me/profile`);
  return res.data;
};
export const updateProfile = async (data: any) => {
  const res = await api.put("/api/users/me/profile", data);
  return res.data;
};
export const getMyBookings = async () => {
  const res = await api.get("/api/users/me/bookings");
  return res.data;
};