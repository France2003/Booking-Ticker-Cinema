import { Types } from "mongoose";

export interface IBookedSeat {
    seatNumber: string;
    isBooked: boolean;
    type: string;
    price: number;
}

export interface IShowtime {
    movieId: Types.ObjectId;
    roomId: Types.ObjectId;
    date: Date;
    startTime: Date;
    endTime: Date;
    price: number;
    bookedSeats: IBookedSeat[];
}
