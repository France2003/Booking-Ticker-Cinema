import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
        showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: "Showtime", required: true },
        roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
        seats: [{ type: String, required: true }], // ✅ Danh sách ghế đã chọn
        totalPrice: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        finalPrice: { type: Number, required: true },
        promotionCode: { type: String, default: null },
        bookingCode: { type: String, unique: true, required: true },
        paymentMethod: {
            type: String,
            enum: ["QR Banking", "Chuyển khoản", "Tiền mặt", "MoMo"],
            default: "QR Banking",
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "cancelled"],
            default: "pending",
        },
        transactionId: { type: String, default: "" },
        bankName: { type: String, default: "" },
        transactionNote: { type: String, default: "" },
        confirmedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
            default: null,
        },
        extraServices: {
            popcorn: { type: Boolean, default: false },
            drink: { type: Boolean, default: false },
            combo: { type: Boolean, default: false },
        },
        extraInfo: {
            moviePoster: { type: String },
            movieTitle: { type: String },
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 5 * 60 * 1000),
            required: false,
        },
    },
    { timestamps: true }
);
bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
bookingSchema.index({ paymentStatus: 1 });
export const Booking = mongoose.model("Booking", bookingSchema);
