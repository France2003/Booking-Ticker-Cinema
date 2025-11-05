"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promotion_controller_1 = require("./promotion.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post("/", promotion_controller_1.createPromotion, auth_middleware_1.requireAuth, auth_middleware_1.isAdmin);
router.get("/", promotion_controller_1.getPromotions);
router.get("/:id", promotion_controller_1.getPromotionById, auth_middleware_1.requireAuth, auth_middleware_1.isAdmin);
router.put("/:id", promotion_controller_1.updatePromotion, auth_middleware_1.requireAuth, auth_middleware_1.isAdmin);
router.delete("/:id", promotion_controller_1.deletePromotion, auth_middleware_1.requireAuth, auth_middleware_1.isAdmin);
router.post("/check", promotion_controller_1.checkPromotionCode, auth_middleware_1.requireAuth, auth_middleware_1.isAdmin);
exports.default = router;
