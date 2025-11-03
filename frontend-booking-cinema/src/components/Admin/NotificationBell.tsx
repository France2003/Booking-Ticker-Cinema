import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { io } from "socket.io-client";
interface Notification {
    id: string;
    movieTitle: string;
    status: string;
    time: string;
}
const socket = io("http://localhost:3001", {
    transports: ["websocket"],
});
export default function NotificationBell({ userId }: { userId: string }) {
    const [open, setOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (!userId) return;
        socket.emit("registerUser", userId);
        socket.on("reviewStatusUpdated", (data) => {
            if (data.userId === userId) {
                const newNoti = {
                    id: data.reviewId,
                    movieTitle: data.movieTitle,
                    status: data.status,
                    time: new Date().toLocaleString("vi-VN"),
                };
                setNotifications((prev) => [newNoti, ...prev]);
                setHasUnread(true);
            }
        });
        return () => {
            socket.off("reviewStatusUpdated");
        };
    }, [userId]);

    return (
        <div className="relative">
            {/* 🔔 Icon chuông */}
            <button
                onClick={() => {
                    setOpen(!open);
                    setHasUnread(false);
                }}
                className="relative p-2 rounded-full transition"
            >
                <Bell size={24} className="text-white" />
                {hasUnread && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] text-white font-bold w-4 h-4 flex items-center justify-center rounded-full">
                        {notifications.length}
                    </span>
                )}
            </button>
            {open && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                    <div className="p-3 border-b font-semibold text-gray-800">Thông báo</div>
                    <ul className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <li className="p-4 text-gray-500 text-center">Không có thông báo</li>
                        ) : (
                            notifications.map((n) => (
                                <li
                                    key={n.id}
                                    className={`p-3 border-b hover:bg-gray-50 text-sm ${n.status === "approved" ? "text-green-700" : "text-red-600"
                                        }`}
                                >
                                    {n.status === "approved"
                                        ? `✅ Bình luận phim "${n.movieTitle}" đã được duyệt`
                                        : `❌ Bình luận phim "${n.movieTitle}" bị từ chối`}
                                    <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
