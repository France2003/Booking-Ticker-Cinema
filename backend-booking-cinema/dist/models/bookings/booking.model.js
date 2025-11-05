"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const mongoose_1 = require("mongoose");
const BookingSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    showtimeId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Showtime", required: true },
    roomId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Room", required: true },
    movieId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Movie", required: true },
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
}, { timestamps: true });
exports.Booking = (0, mongoose_1.model)("Booking", BookingSchema);
