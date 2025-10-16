import React from "react";
interface DeleteUserModalProps {
    userName: string;
    onConfirm: () => void;
    onClose: () => void;
}
const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
    userName,
    onConfirm,
    onClose,
}) => {
    return (
        <div className="fixed inset-0 bg-opacity-40 flex items-center backdrop-blur-sm animate-fadeIn justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                <h3 className="text-lg font-semibold mb-4 text-center">
                    Xóa người dùng
                </h3>
                <p className="text-center mb-6">
                    Bạn có chắc chắn muốn xóa tài khoản{" "}
                    <span className="font-semibold">{userName}</span>?
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                    >
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteUserModal;
