import { Schema, model, Document } from "mongoose";
import { IShowtime, IBookedSeat } from "./showtimes.type";

export interface IShowtimeDocument extends IShowtime, Document { }

const BookedSeatSchema = new Schema<IBookedSeat>(
    {
        seatNumber: String,
        isBooked: { type: Boolean, default: false },
        type: String,
        price: Number,
    },
    { _id: false }
);

const ShowtimeSchema = new Schema<IShowtimeDocument>(
    {
        movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
        roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
        date: { type: Date, required: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        price: { type: Number, required: true },
        bookedSeats: [BookedSeatSchema],
    },
    { timestamps: true }
);

export const Showtime = model<IShowtimeDocument>("Showtime", ShowtimeSchema);
