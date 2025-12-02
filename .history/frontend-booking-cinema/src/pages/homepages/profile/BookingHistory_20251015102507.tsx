import React from "react";
interface Booking {
    _id: string;
    movieTitle: string;
    theater: string;
    seats: string[];
    showtime: string;
    totalPrice: number;
}
interface BookingHistoryProps {
    bookings: Booking[];
}
const BookingHistory: React.FC<BookingHistoryProps> = ({ bookings }) => {
    if (bookings.length === 0)
        return <p className="mt-10 text-center text-gray-600">Chưa có lịch sử đặt vé nào.</p>;

    return (
        <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">🎬 Lịch sử đặt vé</h2>
            <div className="space-y-4">
                {bookings.map((booking) => (
                    <div
                        key={booking._id}
                        className="border p-4 rounded-lg shadow-sm hover:shadow-md transition bg-gray-50"
                    >
                        <h3 className="text-lg font-semibold">{booking.movieTitle}</h3>
                        <p>🎭 Rạp: {booking.theater}</p>
                        <p>🪑 Ghế: {booking.seats.join(", ")}</p>
                        <p>⏰ Suất chiếu: {new Date(booking.showtime).toLocaleString()}</p>
                        <p>💰 Tổng tiền: {booking.totalPrice.toLocaleString()}₫</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookingHistory;
