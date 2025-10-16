import api from "../api";
/**
 * Upload poster và trailer lên server
 * @param posterFile File ảnh poster (hoặc null nếu không có)
 * @param trailerFile File video trailer (hoặc null nếu không có)
 * @param token JWT token để xác thực
 * @returns { posterUrl?: string; trailerUrl?: string }
 */
export const uploadFiles = async (
  posterFile: File | null,
  trailerFile: File | null,
  token: string | null
): Promise<{ posterUrl?: string; trailerUrl?: string }> => {
  const formData = new FormData();

  if (posterFile) formData.append("poster", posterFile);
  if (trailerFile) formData.append("trailer", trailerFile);
  if (!posterFile && !trailerFile) {
    // Nếu không có file nào => không cần gọi API
    return {};
  }
  const res = await api.post("/api/uploads", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
