// src/components/Admin/SeatManager/RoomModal.tsx
import { useState } from "react";
import { createRoom, updateRoom } from "../../../services/Room/room";
import type { IRoom } from "../../../types/room/room.type";
import { toast } from "react-toastify";

interface RoomModalProps {
    onClose: () => void;
    onSuccess: () => void;
    room?: IRoom | null;
}

export default function RoomModal({ onClose, onSuccess, room }: RoomModalProps) {
    const [form, setForm] = useState({
        name: room?.name || "",
        type: room?.type || "2D",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (room) {
                await updateRoom(form, room._id);
                toast.success("✅ Cập nhật phòng chiếu thành công!");
            } else {
                await createRoom(form);
                toast.success("🎬 Tạo phòng chiếu mới thành công!");
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error("❌ Lỗi lưu phòng:", err);
            toast.error("Lưu phòng thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-lg p-6 w-[400px] shadow-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">
                    {room ? "Chỉnh sửa phòng chiếu" : "Thêm phòng chiếu mới"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1 text-gray-700">Tên phòng</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-700">Loại phòng</label>
                        <select
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={form.type}
                            onChange={(e) =>
                                setForm({ ...form, type: e.target.value as IRoom["type"] })
                            }
                        >
                            <option value="2D">2D</option>
                            <option value="3D">3D</option>
                            <option value="IMAX">IMAX</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                            {loading ? "Đang lưu..." : room ? "Cập nhật" : "Thêm mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
