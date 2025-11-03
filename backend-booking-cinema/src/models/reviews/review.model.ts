import { IUser } from "../auths/auth.types";
import { IMovie } from "../movies/movie.types";
import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
    movieId: mongoose.Types.ObjectId | IMovie;
    userId: mongoose.Types.ObjectId | IUser;
    rating: number;
    comment?: string;
    likes: mongoose.Types.ObjectId[];
    createdAt?: Date;
    status: "pending" | "approved" | "rejected";
    adminComment?: string;
    isDeleted: boolean;
}

const reviewSchema = new Schema<IReview>(
    {
        movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 0.5, max: 5 },
        comment: { type: String, default: "" },
        likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        adminComment: { type: String, default: "" },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const ReviewModel = mongoose.model<IReview>("Review", reviewSchema);
