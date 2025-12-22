import type { IRoom, ISeat } from "../../../types/room/room.type";

const getSeatColor = (type: ISeat["type"], isBooked?: boolean) => {
    if (isBooked) return "bg-gray-500 cursor-not-allowed";
    switch (type) {
        case "Normal": return "bg-green-400 hover:bg-green-500";
        case "VIP": return "bg-red-500 hover:bg-red-600";
        case "Double": return "bg-blue-400 hover:bg-blue-500";
        case "Triple": return "bg-purple-400 hover:bg-purple-500";
        default: return "bg-gray-300";
    }
};

interface SeatPreviewProps {
    seats: ISeat[];
    roomType?: IRoom["type"];
}
export default function SeatPreview({ seats, roomType }: SeatPreviewProps) {
    if (!seats || seats.length === 0)
        return <p className="text-gray-500 text-center">Phòng chưa có ghế.</p>;

    const groupedSeats = seats.reduce((acc, seat) => {
        const row = seat.seatNumber[0];
        if (!acc[row]) acc[row] = [];
        acc[row].push(seat);
        return acc;
    }, {} as Record<string, ISeat[]>);
    const seatStats = seats.reduce(
        (acc, s) => {
            if (!acc[s.type]) acc[s.type] = { total: 0, count: 0 };
            acc[s.type].total += s.price;
            acc[s.type].count += 1;
            return acc;
        },
        {} as Record<string, { total: number; count: number }>
    );

    const avg = (type: string) =>
        seatStats[type] ? Math.round(seatStats[type].total / seatStats[type].count) : 0;

    return (
        <div className="mt-4 border rounded-lg bg-gray-50 p-4">
            <h4 className="font-semibold text-center mb-3">
                🪑 Sơ đồ ghế phòng chiếu {roomType ? `(${roomType})` : ""}
            </h4>

            {/* Màn chiếu */}
            <div className="text-center mb-4">
                <div className="mx-auto w-2/3 h-2 bg-gray-800 rounded-full shadow-md"></div>
                <p className="text-xs text-gray-600 mt-1">Màn chiếu</p>
            </div>

            {/* Các hàng ghế */}
            <div className="flex flex-col items-center bg-white border rounded-md p-3 shadow-sm">
                {Object.keys(groupedSeats).map((row) => {
                    const sorted = groupedSeats[row].sort(
                        (a, b) => parseInt(a.seatNumber.slice(1)) - parseInt(b.seatNumber.slice(1))
                    );
                    const left = sorted.slice(0, sorted.length / 2);
                    const right = sorted.slice(sorted.length / 2);

                    return (
                        <div key={row} className="flex justify-center items-center mb-1">
                            <div className="flex justify-end">
                                {left.map((seat) => (
                                    <div
                                        key={seat.seatNumber}
                                        title={`${seat.seatNumber} - ${seat.type} (${seat.price.toLocaleString()}đ)`}
                                        className={`w-8 h-8 m-0.5 text-[10px] text-white flex items-center justify-center rounded ${getSeatColor(seat.type, seat.isBooked)}`}
                                    >
                                        {seat.seatNumber.slice(1)}
                                    </div>
                                ))}
                            </div>

                            <div className="w-10"></div>

                            <div className="flex justify-start">
                                {right.map((seat) => (
                                    <div
                                        key={seat.seatNumber}
                                        title={`${seat.seatNumber} - ${seat.type} (${seat.price.toLocaleString()}đ)`}
                                        className={`w-8 h-8 m-0.5 text-[10px] text-white flex items-center justify-center rounded ${getSeatColor(seat.type, seat.isBooked)}`}
                                    >
                                        {seat.seatNumber.slice(1)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-5 border-t pt-3 text-sm text-gray-700">
                <h5 className="font-semibold mb-2 text-center">💰 Bảng giá ghế {roomType}</h5>
                <div className="flex flex-wrap justify-center gap-4">
                    <p>Thường: <b>{avg("Normal").toLocaleString()}đ</b></p>
                    <p>VIP: <b>{avg("VIP").toLocaleString()}đ</b></p>
                    <p>Ghế đôi: <b>{avg("Double").toLocaleString()}đ</b></p>
                    <p>Ghế ba: <b>{avg("Triple").toLocaleString()}đ</b></p>
                </div>
            </div>
        </div>
    );
}
