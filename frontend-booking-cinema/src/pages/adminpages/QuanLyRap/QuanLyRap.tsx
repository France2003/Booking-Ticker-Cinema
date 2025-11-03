import { useEffect, useState } from "react";
import { getRooms, deleteRoom } from "../../../services/Room/room";
import type { IRoom } from "../../../types/room/room.type";
import RoomModal from "../../../components/Admin/SeatManager/RoomModal";
import DeleteConfirmModal from "../../../components/Admin/SeatManager/DeleteConfirmModal";
import AdminLayout from "../../../layouts/adminlayout/adminlayout";
import { toast } from "react-toastify";
import SeatPreview from "../../../components/Admin/SeatManager/SeatPreview";

export default function RoomManager() {
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<IRoom | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<IRoom | null>(null); // ✅ new state
  const [deleting, setDeleting] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await getRooms();
      setRooms(data);
    } catch (err) {
      console.error("Lỗi tải phòng:", err);
      toast.error("❌ Lỗi khi tải danh sách phòng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleEdit = (room: IRoom) => {
    setEditingRoom(room);
    setShowRoomModal(true);
  };
  const handleDelete = (room: IRoom) => {
    setRoomToDelete(room);
  };
  const confirmDelete = async () => {
    if (!roomToDelete) return;
    try {
      setDeleting(true);
      await deleteRoom(roomToDelete._id);
      setRooms((prev) => prev.filter((r) => r._id !== roomToDelete._id));
      if (selectedRoom && selectedRoom._id === roomToDelete._id) {
        setSelectedRoom(null);
      }

      toast.success(`🗑️ Đã xóa phòng ${roomToDelete.name} thành công!`);
      setRoomToDelete(null);
    } catch (err) {
      console.error("Lỗi xóa phòng:", err);
      toast.error("❌ Xóa phòng thất bại!");
    } finally {
      setDeleting(false);
    }
  };
  const handleManageSeats = (room: IRoom) => {
    setSelectedRoom(room);
  };
  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
          🎬 Quản lý Phòng Chiếu
        </h2>

        <button
          onClick={() => {
            setEditingRoom(null);
            setShowRoomModal(true);
          }}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          + Thêm Phòng Chiếu
        </button>

        {loading ? (
          <p>Đang tải danh sách phòng...</p>
        ) : rooms.length === 0 ? (
          <p>Không có phòng nào</p>
        ) : (
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Tên phòng</th>
                <th className="p-2 text-left">Loại</th>
                <th className="p-2 text-left">Tổng ghế</th>
                <th className="p-2 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{room.name}</td>
                  <td className="p-2">{room.type}</td>
                  <td className="p-2">{room.totalSeats}</td>
                  <td className="p-2 flex gap-2 justify-center ">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      onClick={() => handleEdit(room)}
                    >
                      Sửa
                    </button>
                    <button
                      className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600"
                      onClick={() => handleManageSeats(room)}
                    >
                      Sơ đồ ghế
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      onClick={() => handleDelete(room)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {showRoomModal && (
          <RoomModal
            onClose={() => setShowRoomModal(false)}
            onSuccess={fetchRooms}
            room={editingRoom}
          />
        )}
        {selectedRoom && (
          <div className="mt-6 relative border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-indigo-600">
                🎟️ Sơ đồ ghế - {selectedRoom.name}
              </h3>

              <button
                onClick={() => setSelectedRoom(null)}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                ✖ Đóng sơ đồ
              </button>
            </div>

            <SeatPreview seats={selectedRoom.seats} />
          </div>
        )}
        {roomToDelete && (
          <DeleteConfirmModal
            title="Xác nhận xóa phòng"
            message={`Bạn có chắc chắn muốn xóa "${roomToDelete.name}" không? Hành động này không thể hoàn tác.`}
            onConfirm={confirmDelete}
            onCancel={() => setRoomToDelete(null)}
            loading={deleting}
          />
        )}
      </div>
    </AdminLayout>
  );
}
