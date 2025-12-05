import { Request, Response } from "express";
import mongoose from "mongoose";
import { ReviewModel } from "./review.model";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { IUser } from "../auths/auth.types"; // đúng đường dẫn tới model user types

// 🟢 Lấy danh sách review + trung bình sao
export const getReviews = async (req: Request, res: Response) => {
    try {
        const { movieId } = req.params;

        const reviews = await ReviewModel.find({
            movieId,
            status: "approved",
            isDeleted: false,
        })
            .populate("userId", "fullname email")
            .sort({ createdAt: -1 });

        const avgRating =
            reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;

        const formatted = reviews.map((r) => {
            const user = r.userId as IUser | mongoose.Types.ObjectId;
            const displayName =
                typeof user === "object" && "fullname" in user
                    ? user.fullname
                    : "Ẩn danh";

            return {
                ...r.toObject(),
                userDisplayName: displayName,
            };
        });

        res.json({ avgRating, reviews: formatted });
    } catch (err) {
        console.error("❌ Lỗi khi tải đánh giá:", err);
        res.status(500).json({
            message: "Lỗi khi tải đánh giá!",
            error: (err as Error).message,
        });
    }
};
// 🟠 API cho admin (quản lý bình luận)
export const getAllReviewsAdmin = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const query: any = {};
        if (status) {
            if (typeof status === "string" && status.includes(",")) {
                // status = "pending,approved"
                query.status = { $in: status.split(",") };
            } else if (Array.isArray(status)) {
                // status = ["pending", "approved"]
                query.status = { $in: status };
            } else {
                // status = "pending"
                query.status = status;
            }
        }
        const skip = (Number(page) - 1) * Number(limit);

        const [data, total] = await Promise.all([
            ReviewModel.find(query)
                .populate("userId", "fullname email")
                .populate("movieId", "tieuDe")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            ReviewModel.countDocuments(query),
        ]);

        const formatted = data.map((r) => {
            const user = r.userId as IUser | mongoose.Types.ObjectId;
            const displayName =
                user && typeof user === "object" && "fullname" in user
                    ? (user as IUser).fullname
                    : "Ẩn danh";

            return {
                ...r.toObject(),
                userDisplayName: displayName,
            };
        });

        res.json({
            data: formatted,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
        });
    } catch (err) {
        console.error("❌ Lỗi khi tải danh sách review:", err);
        res.status(500).json({
            message: "Lỗi server khi tải danh sách review!",
            error: (err as Error).message,
        });
    }
};
// 🟢 Tạo review mới (mặc định chờ duyệt)
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Chưa đăng nhập!" });
            return;
        }

        const { movieId, rating, comment } = req.body;
        if (!movieId || !rating) {
            res.status(400).json({ message: "Thiếu dữ liệu cần thiết!" });
            return;
        }

        const review = await ReviewModel.create({
            movieId,
            userId: req.user.id,
            rating,
            comment,
            status: "pending",
        });

        // 🔔 Gửi realtime đến admin qua Socket.IO
        const io = req.app.locals.io;
        if (io) {
            io.emit("newReviewPending", {
                movieTitle: review.movieId?.toString() || "Không rõ",
                fullname: req.user.fullname || "Ẩn danh",
                comment: review.comment,
                rating: review.rating,
                createdAt: review.createdAt,
            });
        }

        res.status(201).json({
            message: "Bình luận của bạn đã được gửi và đang chờ duyệt!",
            review,
        });
    } catch (err) {
        console.error("❌ Lỗi createReview:", err);
        res.status(500).json({
            message: "Lỗi khi gửi đánh giá!",
            error: (err as Error).message,
        });
    }
};
// 🔵 Admin duyệt hoặc từ chối review
export const approveReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== "admin") {
            res.status(403).json({ message: "Chỉ admin mới được duyệt!" });
            return;
        }
        const { id } = req.params;
        const { status, adminComment } = req.body;
        const review = await ReviewModel.findByIdAndUpdate(
            id,
            { status, adminComment },
            { new: true }
        )
            .populate("userId", "fullname")
            .populate("movieId", "tieuDe");

        if (!review) {
            res.status(404).json({ message: "Không tìm thấy đánh giá!" });
            return;
        }

        const user = review.userId as IUser | mongoose.Types.ObjectId;
        const movie = review.movieId as any;
        // ✅ Gửi realtime đến đúng user
        const io = req.app.locals.io;
        if (io && typeof user === "object" && "_id" in user) {
            io.to(`user_${user._id}`).emit("reviewStatusUpdated", {
                reviewId: review._id,
                userId: user._id,
                fullname: (user as IUser).fullname,
                movieTitle: movie?.tieuDe || "Không rõ",
                status: review.status,
                review: review.toObject(),
            });
        }

        res.json({
            message: "Cập nhật trạng thái thành công!",
            review,
        });
    } catch (err) {
        console.error("❌ Lỗi approveReview:", err);
        res.status(500).json({
            message: "Lỗi khi duyệt bình luận!",
            error: (err as Error).message,
        });
    }
};
// ❤️ Like / Unlike review
export const toggleLikeReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Chưa đăng nhập!" });
            return;
        }

        const { id } = req.params;
        const review = await ReviewModel.findById(id);

        if (!review) {
            res.status(404).json({ message: "Không tìm thấy đánh giá!" });
            return;
        }

        const userId = new mongoose.Types.ObjectId(req.user.id);
        const alreadyLiked = review.likes.some(
            (u) => u.toString() === userId.toString()
        );

        if (alreadyLiked) {
            review.likes = review.likes.filter(
                (u) => u.toString() !== userId.toString()
            );
        } else {
            review.likes.push(userId);
        }

        await review.save();

        res.status(200).json({
            liked: !alreadyLiked,
            likesCount: review.likes.length,
        });
    } catch (err) {
        console.error("❌ Lỗi toggleLikeReview:", err);
        res.status(500).json({
            message: "Lỗi khi like/unlike!",
            error: (err as Error).message,
        });
    }
};
