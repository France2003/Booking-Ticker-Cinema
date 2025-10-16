import React from "react";
import { toast } from "react-toastify";
import { deleteMovie } from "../../services/movies/movie";

interface DeleteMovieModalProps {
    movieId: string;
    movieTitle: string;
    onClose: () => void;
    onSuccess: () => void;
}

const DeleteMovieModal: React.FC<DeleteMovieModalProps> = ({
    movieId,
    movieTitle,
    onClose,
    onSuccess,
}) => {
    const [loading, setLoading] = React.useState(false);

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            await deleteMovie(movieId);
            toast.success(`Đã xoá phim "${movieTitle}" thành công!`, {
                position: "top-right",
            });
            onSuccess();
        } catch (error) {
            toast.error("Xóa phim thất bại! Vui lòng thử lại.", {
                position: "top-right",
            });
            console.error(error);
        } finally {
            setLoading(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center  bg-opacity-40 z-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-scaleIn">
                <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">
                    Xác nhận xoá phim
                </h2>
                <p className="text-gray-600 text-center mb-6">
                    Bạn có chắc chắn muốn xoá phim{" "}
                    <span className="font-semibold text-red-600">"{movieTitle}"</span>?
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleConfirmDelete}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-70"
                    >
                        {loading ? "Đang xoá..." : "Xoá phim"}
                    </button>
                </div>
            </div>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out;
        }
      `}</style>
        </div>
    );
}

export default DeleteMovieModal;
