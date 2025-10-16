import React from "react";
import { format } from 'date-fns';
import type { User } from "../../types/userManager/userManage";
interface UserTableProps {
    users: User[];
    onToggleStatus: (id: string) => void;
    onDelete: (user: User) => void;
    onViewDetail: (user: User) => void;
}
const getStatusBadgeClass = (isActive: boolean): string => {
    return isActive
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700";
};

const getToggleButtonClass = (isActive: boolean): string => {
    return isActive
        ? "bg-yellow-500 hover:bg-yellow-600"
        : "bg-green-600 hover:bg-green-700";
};
const UserTable: React.FC<UserTableProps> = ({
    users,
    onToggleStatus,
    onDelete,
    onViewDetail,
}) => {
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (error) {
            console.error("Invalid date format:", dateString);
            return 'N/A';
        }
    };
    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                    <tr>
                        <th scope="col" className="p-3 whitespace-nowrap">Họ tên</th>
                        <th scope="col" className="p-3 whitespace-nowrap">Email</th>
                        <th scope="col" className="p-3 whitespace-nowrap">SĐT</th>
                        <th scope="col" className="p-3 hidden sm:table-cell whitespace-nowrap">Giới tính</th>
                        <th scope="col" className="p-3 hidden md:table-cell whitespace-nowrap">Ngày tạo</th>
                        <th scope="col" className="p-3 hidden md:table-cell whitespace-nowrap">Trạng thái</th>
                        <th scope="col" className="p-3 text-center ">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td
                                colSpan={7}
                                className="p-4 text-center text-gray-500 italic"
                            >
                                Không có người dùng nào để hiển thị.
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user._id} className="border-t hover:bg-gray-50 transition">
                                <td className="p-3 font-medium">{user.fullname}</td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3">{user.phone}</td>
                                <td className="p-3 hidden sm:table-cell">{user.gioiTinh || "Không xác định"}</td>
                                <td className="p-3 hidden md:table-cell">
                                    {formatDate(user.createdAt)}
                                </td>
                                <td className="p-3 hidden md:table-cell">
                                    <span className={`px-2 py-1 text-xs rounded font-medium ${getStatusBadgeClass(user.trangThai)}`}>
                                        {user.trangThai ? "Hoạt động" : "Bị khóa"}
                                    </span>
                                </td>
                                <td className="p-3 text-right space-x-2 whitespace-nowrap">
                                    <button
                                        onClick={() => onViewDetail(user)}
                                        className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                                    >
                                        Xem
                                    </button>
                                    <button
                                        onClick={() => onToggleStatus(user._id)}
                                        className={`px-3 py-1 text-xs text-white rounded transition ${getToggleButtonClass(user.trangThai)}`}
                                    >
                                        {user.trangThai ? "Khóa" : "Mở"}
                                    </button>
                                    <button
                                        onClick={() => onDelete(user)}
                                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;