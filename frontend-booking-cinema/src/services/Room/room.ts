import api from "../api";
export const createRoom = async (data: any) => {
    const res = await api.post("/api/rooms", data);
    return res.data;
}
export const getRooms = async () => {
    const res = await api.get("/api/rooms");
    return res.data;
};
export const updateRoom = async (data: any, id: string) => {
    const res = await api.put(`/api/rooms/${id}`, data);
    return res.data;
};
export const deleteRoom = async (id: string) => {
    const res = await api.delete(`/api/rooms/${id}`);
    return res.data;
}
export const addSeat = async (roomId: string, data: any) => {
    const res = await api.post(`/api/rooms/${roomId}/seats`, data);
    return res.data;
}
export const updateSeat = async (roomId: string, data: any) => {
    const res = await api.put(`/api/rooms/${roomId}/seats/${data.seatNumber}`, data);
    return res.data;
}
export const deleteSeat = async (roomId: string, seatNumber: string) => {
    const res = await api.delete(`/api/rooms/${roomId}/seats/${seatNumber}`);
    return res.data;
}