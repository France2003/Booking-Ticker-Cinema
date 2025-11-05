export interface IMovie {
    _id: string;
    tieuDe: string;
    thoiLuong: number;
    anhPoster: string;
    isHot?: boolean;
}

export interface IRoom {
    _id: string;
    name: string;
    type: "2D" | "3D" | "IMAX";
}

export interface ISeat {
    seatNumber: string;
    type: "Normal" | "VIP" | "Double" | "Triple";
    price: number;
    isBooked?: boolean;
}

export interface IShowtime {
    _id: string;
    movieId: IMovie;
    roomId: IRoom;
    date: string;
    startTime: string;
    endTime: string;
    seats: ISeat[];
    price: number;
}

export interface IBooking {
    _id: string;
    bookingCode: string;
    totalPrice: number;
    paymentStatus: "pending" | "paid" | "cancelled";
    seats: string[];
    createdAt: string;

    showtimeId: {
        _id: string;
        date: string;
        startTime: string;
        endTime: string;
    };

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
}
