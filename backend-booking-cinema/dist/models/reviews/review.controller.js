"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleLikeReview = exports.approveReview = exports.createReview = exports.getAllReviewsAdmin = exports.getReviews = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const review_model_1 = require("./review.model");
// 🟢 Lấy danh sách review + trung bình sao
const getReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { movieId } = req.params;
        const reviews = yield review_model_1.ReviewModel.find({
            movieId,
            status: "approved",
            isDeleted: false,
        })
            .populate("userId", "fullname email")
            .sort({ createdAt: -1 });
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
        const formatted = reviews.map((r) => {
            const user = r.userId;
            const displayName = typeof user === "object" && "fullname" in user
                ? user.fullname
                : "Ẩn danh";
            return Object.assign(Object.assign({}, r.toObject()), { userDisplayName: displayName });
        });
        res.json({ avgRating, reviews: formatted });
    }
    catch (err) {
        console.error("❌ Lỗi khi tải đánh giá:", err);
        res.status(500).json({
            message: "Lỗi khi tải đánh giá!",
            error: err.message,
        });
    }
});
exports.getReviews = getReviews;
// 🟠 API cho admin (quản lý bình luận)
const getAllReviewsAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const query = {};
        if (status)
            query.status = status;
        const skip = (Number(page) - 1) * Number(limit);
        const [data, total] = yield Promise.all([
            review_model_1.ReviewModel.find(query)
                .populate("userId", "fullname email")
                .populate("movieId", "tieuDe")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            review_model_1.ReviewModel.countDocuments(query),
        ]);
        const formatted = data.map((r) => {
            const user = r.userId;
            const displayName = typeof user === "object" && "fullname" in user
                ? user.fullname
                : "Ẩn danh";
            return Object.assign(Object.assign({}, r.toObject()), { userDisplayName: displayName });
        });
        res.json({
            data: formatted,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
        });
    }
    catch (err) {
        console.error("❌ Lỗi khi tải danh sách review:", err);
        res.status(500).json({
            message: "Lỗi server khi tải danh sách review!",
            error: err.message,
        });
    }
});
exports.getAllReviewsAdmin = getAllReviewsAdmin;
// 🟢 Tạo review mới (mặc định chờ duyệt)
const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const review = yield review_model_1.ReviewModel.create({
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
                movieTitle: ((_a = review.movieId) === null || _a === void 0 ? void 0 : _a.toString()) || "Không rõ",
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
    }
    catch (err) {
        console.error("❌ Lỗi createReview:", err);
        res.status(500).json({
            message: "Lỗi khi gửi đánh giá!",
            error: err.message,
        });
    }
});
exports.createReview = createReview;
// 🔵 Admin duyệt hoặc từ chối review
const approveReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
            res.status(403).json({ message: "Chỉ admin mới được duyệt!" });
            return;
        }
        const { id } = req.params;
        const { status, adminComment } = req.body;
        const review = yield review_model_1.ReviewModel.findByIdAndUpdate(id, { status, adminComment }, { new: true })
            .populate("userId", "fullname")
            .populate("movieId", "tieuDe");
        if (!review) {
            res.status(404).json({ message: "Không tìm thấy đánh giá!" });
            return;
        }
        const user = review.userId;
        const movie = review.movieId;
        // ✅ Gửi realtime đến đúng user
        const io = req.app.locals.io;
        if (io && typeof user === "object" && "_id" in user) {
            io.to(`user_${user._id}`).emit("reviewStatusUpdated", {
                reviewId: review._id,
                userId: user._id,
                fullname: user.fullname,
                movieTitle: (movie === null || movie === void 0 ? void 0 : movie.tieuDe) || "Không rõ",
                status: review.status,
                review: review.toObject(),
            });
        }
        res.json({
            message: "Cập nhật trạng thái thành công!",
            review,
        });
    }
    catch (err) {
        console.error("❌ Lỗi approveReview:", err);
        res.status(500).json({
            message: "Lỗi khi duyệt bình luận!",
            error: err.message,
        });
    }
});
exports.approveReview = approveReview;
// ❤️ Like / Unlike review
const toggleLikeReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Chưa đăng nhập!" });
            return;
        }
        const { id } = req.params;
        const review = yield review_model_1.ReviewModel.findById(id);
        if (!review) {
            res.status(404).json({ message: "Không tìm thấy đánh giá!" });
            return;
        }
        const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
        const alreadyLiked = review.likes.some((u) => u.toString() === userId.toString());
        if (alreadyLiked) {
            review.likes = review.likes.filter((u) => u.toString() !== userId.toString());
        }
        else {
            review.likes.push(userId);
        }
        yield review.save();
        res.status(200).json({
            liked: !alreadyLiked,
            likesCount: review.likes.length,
        });
    }
    catch (err) {
        console.error("❌ Lỗi toggleLikeReview:", err);
        res.status(500).json({
            message: "Lỗi khi like/unlike!",
            error: err.message,
        });
    }
});
exports.toggleLikeReview = toggleLikeReview;
