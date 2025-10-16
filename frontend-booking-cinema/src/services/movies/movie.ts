import api from "../api";
export const createMovie = async (data: any) => {
  const res = await api.post("/api/movies", data);
  return res.data;
}
export const getMovies = async ({ keyword }: { keyword: string }) => {
  const res = await api.get("/api/movies",{
    params: { keyword }
  });
  return res.data;
};
export const updateMovies = async (data: any, id: string) => {
  const res = await api.put(`/api/movies/${id}`, data);
  return res.data;
};
export const deleteMovie = async (id: string) => {
  const res = await api.delete(`/api/movies/${id}`);
  return res.data;
}