import api from "../api"
export interface AddReviewPayload {
  movieId: string;
  rating: number;
  comment: string;
}
export const getReviews = async (movieId: string) => {
  const res = await api.get(`/api/reviews/${movieId}`);
  return res.data;
};
export const addReview = async (data: AddReviewPayload) => {
  const res = await api.post(`/api/reviews`, data);
  return res.data;
};
// 🟢 Like / Unlike review
export const toggleLikeReview = async (id: string) => {
  const res = await api.post(`/api/reviews/${id}/like`);
  return res.data; // { liked, likesCount }
};
// ✅ Lấy tất cả review cho admin (có filter)
export const getAllReviewsAdmin = async (params?: { page?: number; limit?: number; status?: string; keyword?: string }) => {
  const query = new URLSearchParams(params as any).toString();
  const res = await api.get(`/api/reviews?${query}`);
  return res.data;
};
// ✅ Duyệt hoặc từ chối review
export const approveReview = async (id: string, data: { status: string; adminComment?: string }) => {
  const res = await api.put(`/api/reviews/${id}/approve`, data);
  return res.data;
};