import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { toast } from "react-toastify";
import { getSeatsByShowtime } from "../../../services/booking/booking";
import UserSeatMap from "./UserSeatMap";
import type { IShowtime, ISeat } from "../../../types/bookings/booking";
import { Helmet } from "react-helmet";
import { io } from "socket.io-client";

dayjs.locale("vi");
const socket = io("http://localhost:3001", {
    transports: ["websocket"], reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

export default function BookingPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showtime, setShowtime] = useState<IShowtime | null>(null);
    const [seats, setSeats] = useState<ISeat[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // 🧾 Load dữ liệu
    const loadSeats = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await getSeatsByShowtime(id);
            setShowtime(data);
            setSeats(data.seats || []);
            console.log("📦 DỮ LIỆU SHOWTIME:", data);
        } catch {
            toast.error("Không thể tải dữ liệu suất chiếu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSeats();
    }, [id]);

    // ⚡️ Socket realtime
    useEffect(() => {
        if (!id) return;
        socket.emit("joinShowtime", id);
        socket.on("seatUpdate", ({ type, seats: updatedSeats }) => {
            setSeats((prev) =>
                prev.map((seat) => {
                    if (!updatedSeats.includes(seat.seatNumber)) return seat;
                    if (type === "hold") return { ...seat, isHold: true };
                    if (type === "release") return { ...seat, isHold: false };
                    if (type === "booked") return { ...seat, isBooked: true, isHold: false };
                    return seat;
                })
            );
            if (type === "booked" && selectedSeats.some((s) => updatedSeats.includes(s))) {
                toast.warning("⚠️ Một số ghế bạn chọn đã được người khác đặt!");
                setSelectedSeats((prev) => prev.filter((s) => !updatedSeats.includes(s)));
            }
        });

        return () => {
            socket.off("seatUpdate");
        };
    }, [id, selectedSeats]);

    // Xử lý chọn ghế
    const handleSelectSeats = (selected: string[]) => {
        const added = selected.filter((s) => !selectedSeats.includes(s));
        const removed = selectedSeats.filter((s) => !selected.includes(s));
        console.log("🪑 Chọn ghế mới:", added, " — Bỏ ghế:", removed);
        if (added.length)
            socket.emit("holdSeat", { showtimeId: id, seats: added, userId: "USER_TEMP" });
        if (removed.length)
            socket.emit("releaseSeat", { showtimeId: id, seats: removed, userId: "USER_TEMP" });
        setSelectedSeats(selected);
    };
    const total = seats
        .filter((seat) => selectedSeats.includes(seat.seatNumber))
        .reduce((sum, seat) => {
            console.log(`💰 Tính ghế ${seat.seatNumber} (${seat.type}) = ${seat.price}`);
            return sum + (seat.price || 0);
        }, 0);
    const handleConfirm = () => {
        if (!selectedSeats.length) return toast.warn("Vui lòng chọn ít nhất 1 ghế!");
        navigate("/booking/confirm", { state: { showtime, selectedSeats, total } });
    };

    if (!showtime)
        return (
            <div className="flex items-center justify-center h-[50vh] text-gray-600">
                <div className="animate-spin border-4 border-orange-400 border-t-transparent rounded-full w-10 h-10 mr-3"></div>
                Đang tải sơ đồ ghế...
            </div>
        );

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Helmet>
                <title>Đặt vé</title>
            </Helmet>

            <div className="lg:col-span-2">
                <UserSeatMap seats={seats} onChange={handleSelectSeats} />
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-6 space-y-5 border border-gray-100">
                <div className="flex gap-4">
                    <img
                        src={
                            showtime.movieId?.anhPoster?.startsWith("http")
                                ? showtime.movieId.anhPoster
                                : `http://localhost:3001${showtime.movieId?.anhPoster || ""}`
                        }
                        alt="Poster"
                        className="w-[120px] h-[180px] rounded-lg object-cover shadow-md"
                    />
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                            {showtime.movieId?.isHot && <span className="text-red-500">🔥</span>}
                            {showtime.movieId?.tieuDe}
                        </h2>
                        <p>{dayjs(showtime.date).format("DD/MM/YYYY")}</p>
                        <p>
                            {dayjs(showtime.startTime).format("HH:mm")} →{" "}
                            {dayjs(showtime.endTime).format("HH:mm")}
                        </p>
                        <p>
                            Phòng: <b>{showtime.roomId?.name}</b> ({showtime.roomId?.type})
                        </p>
                    </div>
                </div>

                <hr />
                <div className="text-sm text-gray-700 space-y-2">
                    <p><b>Ghế:</b> {selectedSeats.join(", ") || "Chưa chọn"}</p>
                    <p><b>Số vé:</b> {selectedSeats.length}</p>
                    <p>
                        <b>Tổng tiền:</b>{" "}
                        <span className="text-lg font-semibold text-orange-600">
                            {total.toLocaleString("vi-VN")} VNĐ
                        </span>
                    </p>
                </div>
                <button
                    onClick={handleConfirm}
                    disabled={!selectedSeats.length || loading}
                    className={`w-full py-3 rounded-xl text-white font-semibold transition-all shadow-md ${!selectedSeats.length ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"
                        }`}
                >
                    Tiếp tục
                </button>
            </div>
        </div>
    );
}
