"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const review_controller_1 = require("../reviews/review.controller");
const router = express_1.default.Router();
// Public
router.get("/:movieId", review_controller_1.getReviews);
// User
router.post("/", auth_middleware_1.requireAuth, review_controller_1.createReview);
router.post("/:id/like", auth_middleware_1.requireAuth, review_controller_1.toggleLikeReview);
// Admin
router.get("/", auth_middleware_1.requireAuth, auth_middleware_1.isAdmin, review_controller_1.getAllReviewsAdmin); // ✅ Danh sách cho admin
router.put("/:id/approve", auth_middleware_1.requireAuth, auth_middleware_1.isAdmin, review_controller_1.approveReview);
exports.default = router;
