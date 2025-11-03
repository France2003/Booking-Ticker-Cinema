import React, { useState } from "react";
import { toast } from "react-toastify";
import { updateMovies } from "../../../services/movies/movie";
import { uploadFiles } from "../../../services/movies/uploads";
import type { Movie } from "../../../types/movies/movie.types";

interface EditMovieModalProps {
    movie: Movie;
    onClose: () => void;
    onSuccess: () => void;
}

const EditMovieModal: React.FC<EditMovieModalProps> = ({
    movie,
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<Movie>(movie);
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [trailerFile, setTrailerFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "poster" | "trailer"
    ) => {
        if (!e.target.files) return;
        const file = e.target.files[0];
        if (type === "poster") setPosterFile(file);
        else setTrailerFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData._id) return;

        setLoading(true);
        try {
            let posterUrl = formData.anhPoster;
            let trailerUrl = formData.Trailer;
            // 🔹 Upload file mới nếu có chọn
            if (posterFile || trailerFile) {
                const token = localStorage.getItem("token");
                const uploaded = await uploadFiles(posterFile, trailerFile, token);
                if (uploaded.posterUrl) posterUrl = uploaded.posterUrl;
                if (uploaded.trailerUrl) trailerUrl = uploaded.trailerUrl;
            }

            const payload: Movie = {
                ...formData,
                maPhim: Number(formData.maPhim),
                thoiLuong: Number(formData.thoiLuong),
                Age: Number(formData.Age),
                anhPoster: posterUrl,
                Trailer: trailerUrl,
                isHot: !!formData.isHot,
            };
            await updateMovies(payload, formData._id);
            toast.success("🎉 Cập nhật phim thành công!");
            onSuccess();
        } catch (err) {
            toast.error("❌ Cập nhật thất bại!");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0  bg-opacity-40 backdrop-blur-sm animate-fadeIn flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl overflow-y-auto max-h-[90vh]">
                <h2 className="text-2xl font-semibold mb-6 text-center">Chỉnh sửa phim <span className="block text-indigo-600 mt-1">{formData.tieuDe || "Không rõ tiêu đề"}</span></h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nhập thông tin cơ bản */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { name: "maPhim", label: "Mã phim", type: "number" },
                            { name: "tieuDe", label: "Tiêu đề", type: "text" },
                            { name: "daoDien", label: "Đạo diễn", type: "text" },
                            { name: "dienVien", label: "Diễn viên", type: "text" },
                            { name: "theLoai", label: "Thể loại", type: "text" },
                            { name: "thoiLuong", label: "Thời lượng (phút)", type: "number" },
                            { name: "ngonNgu", label: "Ngôn ngữ", type: "text" },
                            { name: "ngayKhoiChieu", label: "Ngày khởi chiếu", type: "date" },
                            { name: "danhGia", label: "Đánh giá", type: "text" },
                            { name: "Age", label: "Độ tuổi", type: "number" },
                        ].map((field) => (
                            <div key={field.name}>
                                <label className="block text-sm font-medium mb-1">{field.label}</label>
                                <input
                                    type={field.type}
                                    name={field.name}
                                    value={
                                        field.name === "ngayKhoiChieu"
                                            ? new Date(formData.ngayKhoiChieu)
                                                .toISOString()
                                                .split("T")[0]
                                            : (formData as any)[field.name] || ""
                                    }
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Mô tả</label>
                        <textarea
                            name="moTa"
                            value={formData.moTa || ""}
                            onChange={handleChange}
                            rows={4}
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Hình ảnh và Trailer */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Poster */}
                        <div className="flex flex-col items-center border border-gray-300 p-4 rounded-lg hover:border-indigo-500 transition">
                            <label className="mb-2 font-medium text-gray-700">Poster</label>
                            <img
                                src={
                                    posterFile
                                        ? URL.createObjectURL(posterFile)
                                        : `http://localhost:3001${formData.anhPoster}`
                                }
                                alt="Poster"
                                className="w-32 h-48 object-cover mb-2 rounded shadow-sm"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, "poster")}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Chọn file mới nếu muốn thay poster
                            </p>
                        </div>

                        {/* Trailer */}
                        <div className="flex flex-col items-center border border-gray-300 p-4 rounded-lg hover:border-indigo-500 transition">
                            <label className="mb-2 font-medium text-gray-700">Trailer</label>
                            <video
                                src={
                                    trailerFile
                                        ? URL.createObjectURL(trailerFile)
                                        : `http://localhost:3001${formData.Trailer}`
                                }
                                controls
                                className="w-full h-48 mb-2 rounded-md shadow-sm" />
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => handleFileChange(e, "trailer")} />
                            <p className="text-xs text-gray-500 mt-1">
                                Chọn file mới nếu muốn thay trailer
                            </p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Trạng thái</label>
                        <select
                            name="trangThai"
                            value={formData.trangThai}
                            onChange={handleChange}
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500" >
                            <option value="dangChieu">Đang chiếu</option>
                            <option value="sapChieu">Sắp chiếu</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Phim hot</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="isHot"
                                checked={!!formData.isHot}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, isHot: e.target.checked }))
                                }
                                className="w-5 h-5 accent-red-600"
                            />
                            <span className="text-gray-700">HOT 🔥</span>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"> Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" >
                            {loading ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMovieModal;
