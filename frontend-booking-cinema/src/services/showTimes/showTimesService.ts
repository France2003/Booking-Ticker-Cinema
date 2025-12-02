import api from "../api";
import type { Showtime } from "../../types/showTimes/showTimes";
export const getAllShowTimes = async (): Promise<Showtime[]> => {
    const res = await api.get("/api/showtimes/");
    return res.data.data;
};
export const deleteShowTime = async (id: string) => {
    const res = await api.delete(`/api/showtimes/${id}`);
    return res.data;
};
export const getShowtimesByMovie = async (movieId: string): Promise<Showtime[]> => {
    const res = await api.get(`/api/showtimes/movie/${movieId}`);
    return res.data.data;
};
/** 🗓️ Lấy suất chiếu theo phim + ngày cụ thể */
export const getShowtimesByMovieAndDate = async (
    movieId: string,
    date: string
): Promise<Showtime[]> => {
    const res = await api.get(`/api/showtimes/movie/${movieId}?date=${date}`);
    return res.data.data;
};

