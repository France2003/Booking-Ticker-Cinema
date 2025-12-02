export interface IBooking {
    _id: string;
    bookingCode: string;
    totalPrice: number;
    paymentStatus: "pending" | "paid" | "cancelled";
    paymentMethod?: "QR Banking" | "Chuyển khoản" | "Tiền mặt" | "MoMo"; // ✅ thêm MoMo
    transactionNote?: string;
    transactionId?: string;
    bankName?: string;
    confirmedBy?: string;
    seats: string[];
    createdAt: string;
    movieId?: {
        _id: string;
        tieuDe: string;
        anhPoster: string;
    };
    roomId?: {
        _id: string;
        name: string;
        type: "2D" | "3D" | "IMAX";
    };
    showtimeId?: {
        _id: string;
        date: string;
        startTime: string;
        endTime: string;
    };
    expiresAt?: Date | null;
}
