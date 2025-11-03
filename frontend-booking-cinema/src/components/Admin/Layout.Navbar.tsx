import { useUser } from "../../contexts/UserContext";
import { useState, useEffect } from "react";
import { Bell, LogOut } from "lucide-react";
import { io } from "socket.io-client";
// ⚙️ Socket config
const socket = io("http://localhost:3001", {
    transports: ["websocket"],
});
export default function Navbar() {
    const { user, logout } = useUser();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [hasNew, setHasNew] = useState(false);
    // 🧩 Lắng nghe sự kiện từ server
    useEffect(() => {
        socket.on("newReviewPending", (data) => {
            console.log("🔔 New review pending:", data);

            // Thêm thông báo mới
            setNotifications((prev) => [
                {
                    id: Date.now(),
                    message: `💬 ${data.fullname || "Người dùng ẩn danh"} bình luận phim "${data.movieTitle}" (${data.rating}⭐)`,
                    time: new Date(data.createdAt).toLocaleTimeString("vi-VN"),
                },
                ...prev,
            ]);

            setHasNew(true);

            // 🔊 Phát âm thanh
            const audio = new Audio("/sounds/notify.mp3");
            audio.play().catch(() => { });
        });

        return () => {
            socket.off("newReviewPending");
        };
    }, []);

    const handleToggle = () => {
        setOpen(!open);
        setHasNew(false); // reset badge khi mở dropdown
    };

    return (
        <header className="bg-white shadow p-4 flex justify-between items-center relative">
            <h1 className="text-lg font-bold">Bảng điều khiển</h1>

            <div className="flex items-center gap-5">
                {/* 🔔 Icon thông báo */}
                <div className="relative">
                    <button
                        onClick={handleToggle}
                        className="relative p-2 rounded-full hover:bg-gray-100"
                    >
                        <Bell size={22} className="text-gray-700" />
                        {hasNew && (
                            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                                {notifications.length}
                            </span>
                        )}
                    </button>

                    {/* 🔽 Dropdown thông báo */}
                    {open && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <div className="p-3 border-b font-semibold text-gray-700">
                                Thông báo
                            </div>
                            <ul className="max-h-64 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <li
                                            key={n.id}
                                            className="px-3 py-2 text-sm border-b hover:bg-gray-50 transition"
                                        >
                                            <p className="text-gray-800">{n.message}</p>
                                            <p className="text-xs text-gray-500">{n.time}</p>
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-3 py-4 text-center text-gray-500 text-sm">
                                        Không có thông báo mới
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Avatar + Đăng xuất */}
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{user?.fullname || "Admin"}</span>
                    <img
                        src="https://i.pravatar.cc/40"
                        alt="avatar"
                        className="w-8 h-8 rounded-full"
                    />
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600"
                    >
                        <LogOut size={16} /> Đăng xuất
                    </button>
                </div>
            </div>
        </header>
    );
}
