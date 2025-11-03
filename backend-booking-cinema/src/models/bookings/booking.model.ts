// import { Schema, model, Document, Types } from "mongoose";

// export interface IBooking extends Document {
//     userId: Types.ObjectId;
//     showtimeId: Types.ObjectId;
//     roomId: Types.ObjectId;
//     movieId: Types.ObjectId;
//     seats: string[];
//     totalPrice: number;
//     paymentStatus: "pending" | "paid" | "cancelled";
//     bookingCode: string;
//     createdAt?: Date;
//     updatedAt?: Date;
// }

// const BookingSchema = new Schema<IBooking>(
//     {
//         userId: { type: Types.ObjectId, ref: "User", required: true },
//         showtimeId: { type: Types.ObjectId, ref: "Showtime", required: true },
//         roomId: { type: Types.ObjectId, ref: "Room", required: true },
//         movieId: { type: Types.ObjectId, ref: "Movie", required: true },
//         seats: { type: [String], required: true },
//         totalPrice: { type: Number, required: true },
//         paymentStatus: {
//             type: String,
//             enum: ["pending", "paid", "cancelled"],
//             default: "pending",
//         },
//         bookingCode: { type: String, unique: true },
//     },
//     { timestamps: true }
// );

// export const Booking = model<IBooking>("Booking", BookingSchema);
