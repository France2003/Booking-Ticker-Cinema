import { useState } from "react";
import { toast } from "react-toastify";
import { createMovie } from "../../../services/movies/movie";
import { uploadFiles } from "../../../services/movies/uploads";
import type { Movie } from "../../../types/movies/movie.types";
import { validateMovieForm } from "../../../utils/movie.validation";

const AddMovieForm = ({ onSuccess }: { onSuccess?: () => void }) => {
    const [formData, setFormData] = useState<Partial<Omit<Movie, "_id">>>({ trangThai: "dangChieu" });
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [trailerFile, setTrailerFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "poster" | "trailer") => {
        if (!e.target.files) return;
        const file = e.target.files[0];
        type === "poster" ? setPosterFile(file) : setTrailerFile(file);
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const tempData = { ...formData, anhPoster: posterFile ? "temp" : "", Trailer: trailerFile ? "temp" : "" };
        const errorMsg = validateMovieForm(tempData);
        if (errorMsg) return toast.error(errorMsg);
        setLoading(true);
        try {
            const token = localStorage.getItem("token"); 
            const { posterUrl, trailerUrl } = await uploadFiles(posterFile, trailerFile, token);
            const payload: Omit<Movie, "_id"> = {
                ...formData,
                ///xem xét
                // _id:formData._id || "",
                maPhim: Number(formData.maPhim),
                thoiLuong: Number(formData.thoiLuong),
                Age: Number(formData.Age),
                anhPoster: posterUrl || "",
                Trailer: trailerUrl || "",
                tieuDe: formData.tieuDe!,
                moTa: formData.moTa!,
                daoDien: formData.daoDien!,
                dienVien: formData.dienVien!,
                theLoai: formData.theLoai!,
                ngonNgu: formData.ngonNgu!,
                ngayKhoiChieu: formData.ngayKhoiChieu!,
                danhGia: formData.danhGia!,
                trangThai: formData.trangThai!,
            };
            await createMovie(payload);
            toast.success("Thêm phim thành công!");
            setFormData({ trangThai: "dangChieu" });
            setPosterFile(null);
            setTrailerFile(null);
            if (onSuccess) onSuccess();
        } catch (err) {
            toast.error("Lỗi khi thêm phim!");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-4">Thêm Phim Mới</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { name: "maPhim", placeholder: "Mã phim", type: "number" },
                    { name: "tieuDe", placeholder: "Tiêu đề", type: "text" },
                    { name: "daoDien", placeholder: "Đạo diễn", type: "text" },
                    { name: "dienVien", placeholder: "Diễn viên", type: "text" },
                    { name: "theLoai", placeholder: "Thể loại", type: "text" },
                    { name: "thoiLuong", placeholder: "Thời lượng (phút)", type: "number" },
                    { name: "ngonNgu", placeholder: "Ngôn ngữ", type: "text" },
                    { name: "ngayKhoiChieu", placeholder: "Ngày khởi chiếu", type: "date" },
                    { name: "danhGia", placeholder: "Đánh giá", type: "text" },
                    { name: "Age", placeholder: "Độ tuổi", type: "number" },
                ].map(field => (
                    <input
                        key={field.name}
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        value={(formData as any)[field.name] || ""}
                        onChange={handleChange}
                        className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                ))}
            </div>

            <textarea
                name="moTa"
                placeholder="Mô tả"
                value={formData.moTa || ""}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center border border-gray-300 p-4 rounded-lg hover:border-indigo-500 transition">
                    <label className="mb-2 font-medium text-gray-700">Poster</label>
                    {posterFile && (
                        <img
                            src={URL.createObjectURL(posterFile)}
                            alt="Preview Poster"
                            className="w-32 h-48 object-cover mb-2 rounded-md shadow-sm text-center"
                        />
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "poster")} />
                </div>
                <div className="flex flex-col items-center border border-gray-300 p-4 rounded-lg hover:border-indigo-500 transition">
                    <label className="mb-2 font-medium text-gray-700">Trailer</label>
                    {trailerFile && (
                        <video
                            src={URL.createObjectURL(trailerFile)}
                            controls
                            className="w-full h-48 mb-2 rounded-md shadow-sm  text-center"
                        />
                    )}
                    <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, "trailer")} />
                </div>
            </div>

            <select
                name="trangThai"
                value={formData.trangThai}
                onChange={handleChange}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option value="dangChieu">Đang chiếu</option>
                <option value="sapChieu">Sắp chiếu</option>
            </select>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition"
            >
                {loading ? "Đang thêm..." : "Thêm phim"}
            </button>
        </form>
    );
};

export default AddMovieForm;
