import { Schema, model, Document } from "mongoose";

export interface IBooking extends Document {
    userId: any;
    showtimeId: any;
    roomId: any;
    movieId: any;
    seats: string[];
    totalPrice: number;
    paymentStatus: "pending" | "paid" | "cancelled";
    bookingCode: string;
    transactionId?: string;
    paymentMethod?: string;
}

const BookingSchema = new Schema<IBooking>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        showtimeId: { type: Schema.Types.ObjectId, ref: "Showtime", required: true },
        roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
        movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
        seats: { type: [String], required: true },
        totalPrice: { type: Number, required: true },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "cancelled"],
            default: "pending",
        },
        bookingCode: { type: String, unique: true },
        transactionId: String,
        paymentMethod: String,
    },
    { timestamps: true }
);

export const Booking = model<IBooking>("Booking", BookingSchema);
