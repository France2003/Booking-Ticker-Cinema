import React from "react";
interface BookingHistoryProps {
    bookings: any[];
}
const BookingHistory: React.FC<BookingHistoryProps> = ({ bookings }) => {
    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };
    if (bookings.length === 0)
        return (
            <p className="mt-10 text-center text-gray-600">
                Chưa có lịch sử đặt vé nào.
            </p>
        );
    return (
        <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">🎬 Lịch sử đặt vé</h2>

            <div className="space-y-4">
                {bookings.map((b) => (
                    <div
                        key={b._id}
                        className="border p-4 rounded-lg shadow-sm hover:shadow-md transition bg-gray-50"
                    >
                        {/* Ảnh poster */}
                        {b.movieId?.anhPoster && (
                            <img
                                src={`http://localhost:3001${b.movieId.anhPoster}`}
                                alt={b.movieId?.tieuDe}
                                className="w-20 h-28 rounded object-cover mb-3"
                            />
                        )}

                        <h3 className="text-lg font-semibold">
                            {b.movieId?.tieuDe || "Không rõ phim"}
                        </h3>

                        <p>🎭 Rạp: {b.roomId?.name} ({b.roomId?.type})</p>

                        <p>🪑 Ghế: {b.seats.join(", ")}</p>

                        {b.showtimeId && (
                            <p>
                                ⏰ Suất chiếu: {formatDate(b.showtimeId.date)}{" "}
                                ({formatTime(b.showtimeId.startTime)} - {formatTime(b.showtimeId.endTime)})
                            </p>
                        )}

                        <p>💰 Tổng tiền: {(b.finalPrice || 0).toLocaleString()} VNĐ</p>

                        <p
                            className={
                                b.paymentStatus === "paid"
                                    ? "text-green-600"
                                    : b.paymentStatus === "pending"
                                        ? "text-orange-600"
                                        : "text-red-600"
                            }
                        >
                            {b.paymentStatus === "paid"
                                ? "Đã thanh toán"
                                : b.paymentStatus === "pending"
                                    ? "Đang chờ xử lý"
                                    : "Đã hủy"}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookingHistory;
