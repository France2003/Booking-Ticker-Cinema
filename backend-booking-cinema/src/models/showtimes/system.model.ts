import { Schema, model, Document } from "mongoose";

export interface ISystemLog extends Document {
    key: string;
    value: string;
    createdAt: Date;
}

const SystemLogSchema = new Schema<ISystemLog>(
    {
        key: { type: String, required: true, unique: true },
        value: { type: String, required: true },
    },
    { timestamps: true }
);

export const SystemLog = model<ISystemLog>("SystemLog", SystemLogSchema);
