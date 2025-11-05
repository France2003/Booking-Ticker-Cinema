export interface IBooking {
    _id: string;
    bookingCode: string;
    totalPrice: number;
    paymentStatus: "pending" | "paid" | "cancelled";
    seats: string[];
    movieId?: {
        _id: string;
        tieuDe: string;
        anhPoster: string;
    };
    createdAt: string;
}
