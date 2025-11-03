interface DeleteConfirmModalProps {
    title?: string;
    message?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function DeleteConfirmModal({
    title = "Xác nhận xóa",
    message = "Bạn có chắc muốn xóa mục này không?",
    onConfirm,
    onCancel,
    loading = false,
}: DeleteConfirmModalProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm animate-fadeIn bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg animate-fadeIn">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
                <p className="text-gray-600 mb-5">{message}</p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 rounded text-white ${loading
                                ? "bg-red-300 cursor-not-allowed"
                                : "bg-red-500 hover:bg-red-600"
                            }`}
                    >
                        {loading ? "Đang xóa..." : "Xóa"}
                    </button>
                </div>
            </div>
        </div>
    );
}
