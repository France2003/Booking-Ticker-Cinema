import api from "../api";
export const createMovie = async (data: any) => {
  const res = await api.post("/api/movies", data);
  return res.data;
}
export const getMovies = async ({
  keyword = "",
  page = 1,
  limit = 8,
}: {
  keyword?: string;
  page?: number;
  limit?: number;
}) => {
  const res = await api.get("/api/movies", {
    params: { keyword, page, limit },
  });
  return res.data;
};
export const getMovieById = async (id: string) => {
  const res = await api.get(`/api/movies/${id}`);
  return res.data;
}
export const updateMovies = async (data: any, id: string) => {
  const res = await api.put(`/api/movies/${id}`, data);
  return res.data;
};
export const deleteMovie = async (id: string) => {
  const res = await api.delete(`/api/movies/${id}`);
  return res.data;
}
export const toggleLikeMovie = async (id: string) => {
  const res = await api.post(`/api/movies/${id}/like`);
  return res.data; // { liked, likesCount }
};
export const historyDeleteShowTimes = async (): Promise<any[]> => {
  try {
    const response = await api.get("/api/movies/deleted/history");
    return response.data.data;
  } catch (error: any) {
    console.error("❌ Lỗi khi tải lịch sử xóa phim:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Không thể tải lịch sử xóa phim");
  }
};
