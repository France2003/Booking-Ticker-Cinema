import api from "../api";

export const getSeatsByShowtime = async (showtimeId: string) => {
    const res = await api.get(`/api/showtimes/${showtimeId}/seats`);
    return res.data.showtime;
};