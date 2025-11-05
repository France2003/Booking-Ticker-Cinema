"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Showtime = void 0;
const mongoose_1 = require("mongoose");
const BookedSeatSchema = new mongoose_1.Schema({
    seatNumber: String,
    isBooked: { type: Boolean, default: false },
    type: String,
    price: Number,
}, { _id: false });
const ShowtimeSchema = new mongoose_1.Schema({
    movieId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Movie", required: true },
    roomId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Room", required: true },
    date: { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    price: { type: Number, required: true },
    bookedSeats: [BookedSeatSchema],
}, { timestamps: true });
exports.Showtime = (0, mongoose_1.model)("Showtime", ShowtimeSchema);
