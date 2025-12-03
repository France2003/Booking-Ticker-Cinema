import api from "../api"

export const getPromotions = async () => {
    const res = await api.get(`/api/promotions`)
    return res.data;
}
export const createPromotion = async (data: any) => {
    const res = await api.post(`/api/promotions`, data)
    return res.data
}
export const getActivePromotions = async () => {
    const res = await api.get("/api/promotions/active");
    return res.data.data;
};
export const getPromotionById = async (id: string) => {
    const res = await api.get(`/api/promotions/${id}`)
    return res.data;
}
export const updatePromotion = async (data: any, id: string) => {
    const res = await api.put(`/api/promotions/${id}`, data);
    return res.data;
}
export const deletePromotion = async (id: string) => {
    const res = await api.delete(`/api/promotions/${id}`);
    return res.data;
}
export const checkPromotionCode = async (maCode: string) => {
    const res = await api.post(`/api/promotions/check`, { maCode });
    return res.data.data;
};