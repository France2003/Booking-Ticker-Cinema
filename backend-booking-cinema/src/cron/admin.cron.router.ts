import { Router, Request, Response } from "express";
import { updateMoviesNow } from "../cron/updateMovies.cron";
import { logToFile } from "../cron/log";
const router = Router();
router.post("/run-movie-cron", async (_req: Request, res: Response) => {
  try {
    await logToFile("⚡ Cron thủ công được kích hoạt qua API.");
    await updateMoviesNow();
    res.json({ message: "Cron movie chạy thành công thủ công!" });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi khi chạy cron thủ công", error: error.message });
  }
});
export default router;
