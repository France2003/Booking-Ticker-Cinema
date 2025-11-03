import mongoose, { Schema, model, Document, Types } from "mongoose";
import { IRoom, ISeat } from "./room.type";
export interface IRoomDocument extends IRoom, Document { _id: Types.ObjectId;}
const SeatSchema = new Schema<ISeat>(
    {
        seatNumber: { type: String, required: true },
        type: { type: String, enum: ["Normal", "Double", "Triple", "VIP"], required: true },
        price: { type: Number, required: true },
        isBooked: { type: Boolean, default: false },
    },
    { _id: false }
);
const RoomSchema = new Schema<IRoomDocument>(
    {
        name: { type: String, required: true, unique: true },
        totalSeats: { type: Number, required: true },
        type: { type: String, enum: ["2D", "3D", "IMAX"], default: "2D" },
        seats: { type: [SeatSchema], default: [] },
    },
    { timestamps: true }
);
delete mongoose.models["Room"];
export const Room = model<IRoomDocument>("Room", RoomSchema);
