import { Router, Request, Response } from "express";
import { upload } from "./middlewares/upload";
import { isAdmin, requireAuth } from "./middlewares/auth.middleware";
const router = Router();
router.post(
  "/",
  requireAuth,
  isAdmin,
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "trailer", maxCount: 1 },
  ]),
  (req: Request, res: Response): void => { // 👈 khai rõ trả về void
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const poster = files?.["poster"]?.[0];
      const trailer = files?.["trailer"]?.[0];

      if (!poster || !trailer) {
        res.status(400).json({ message: "Cần upload cả Poster và Trailer" });
        return; // 👈 kết thúc hàm
      }

      res.status(200).json({
        message: "Upload thành công",
        posterUrl: `/uploads/${poster.filename}`,
        trailerUrl: `/uploads/${trailer.filename}`,
      });
    } catch (error: any) {
      console.error("❌ Lỗi upload:", error);
      res.status(500).json({ message: "Lỗi khi upload file" });
    }
  }
);

export default router;
