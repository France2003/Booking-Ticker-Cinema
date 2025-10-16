import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminLayout from "../../../layouts/adminlayout/adminlayout";
import {
  getAllUsers,
  toggleUserStatus,
  deleteUser,
} from "../../../services/userManager/userManager";
import type { User } from "../../../types/userManager/userManage";
import UserTable from "../../../components/Admin/UserTable";
import DeleteUserModal from "../../../components/Admin/DeleteUser";
import UserDetailModal from "../../../components/Admin/UserDetail";
const QuanLyNguoiDung: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteUserData, setDeleteUserData] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers(token || "");
      setUsers(data);
    } catch {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const handleToggleStatus = async (id: string) => {
    try {
      const updatedUser = await toggleUserStatus(id, token || "");
      setUsers(currentUsers =>
        currentUsers.map(user =>
          user._id === id ? { ...user, trangThai: updatedUser.user.trangThai } : user
        )
      );
      toast.success("Cập nhật trạng thái thành công!");
      fetchUsers();
    } catch {
      toast.error("Không thể cập nhật trạng thái");
    }
  };
  const handleDeleteConfirm = async () => {
    if (!deleteUserData) return;
    try {
      await deleteUser(deleteUserData._id, token || "");
      toast.success("Xóa người dùng thành công!");
      setDeleteUserData(null);
      fetchUsers();
    } catch {
      toast.error("Không thể xóa người dùng");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Quản lý người dùng</h2>

        {loading ? (
          <p className="text-gray-500 text-center">Đang tải...</p>
        ) : (
          <UserTable
            users={users}
            onToggleStatus={handleToggleStatus}
            onDelete={setDeleteUserData}
            onViewDetail={setViewUser}
          />
        )}
        {/* Modal Xóa */}
        {deleteUserData && (
          <DeleteUserModal
            userName={deleteUserData.fullname}
            onConfirm={handleDeleteConfirm}
            onClose={() => setDeleteUserData(null)}
          />
        )}

        {/* Modal Chi tiết */}
        {viewUser && (
          <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} />
        )}
      </div>
    </AdminLayout>
  );
};

export default QuanLyNguoiDung;
