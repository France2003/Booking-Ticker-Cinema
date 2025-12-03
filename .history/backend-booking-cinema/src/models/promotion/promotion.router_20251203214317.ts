import express from "express"
import {
  createPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  checkPromotionCode,
  getActivePromotions,
} from "./promotion.controller"
import { isAdmin, requireAuth } from "../../middlewares/auth.middleware"

const router = express.Router()

router.post("/", createPromotion,requireAuth, isAdmin)
router.get("/", getPromotions)
router.get("/active", getActivePromotions)
router.get("/:id", getPromotionById,requireAuth, isAdmin)
router.put("/:id", updatePromotion,requireAuth, isAdmin)
router.delete("/:id", deletePromotion,requireAuth, isAdmin)
router.post("/check", checkPromotionCode,requireAuth, isAdmin)

export default router
