import express from "express";
import { isAdmin, requireAuth } from "../../middlewares/auth.middleware";
import { getReviews, createReview, approveReview, toggleLikeReview,getAllReviewsAdmin,} from "../reviews/review.controller";
const router = express.Router();
// Public
router.get("/:movieId", getReviews);
// User
router.post("/", requireAuth, createReview);
router.post("/:id/like", requireAuth, toggleLikeReview);
// Admin
router.get("/", requireAuth, isAdmin, getAllReviewsAdmin); // ✅ Danh sách cho admin
router.put("/:id/approve", requireAuth, isAdmin, approveReview);
export default router;
