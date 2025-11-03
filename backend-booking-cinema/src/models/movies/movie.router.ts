import { Router } from "express";
import { createMovie, getMovies, updateMovie, deleteMovie, getMovieDeleteHistory, getMovieById, toggleLikeMovie} from "./movie.controller";
import { validateMovie } from "./movie.validation";
import { paginationMiddleware } from "../../middlewares/pagination";
import { isAdmin, requireAuth } from "../../middlewares/auth.middleware";
const router = Router();
// Admin routes
router.post("/", requireAuth, isAdmin, validateMovie, createMovie as any);
router.put("/:id", requireAuth, isAdmin, validateMovie, updateMovie);
router.get("/:id", requireAuth, getMovieById);
router.delete("/:id", requireAuth, isAdmin, deleteMovie);
router.get("/deleted/history", requireAuth, isAdmin, getMovieDeleteHistory);
// Public route
router.get("/", paginationMiddleware, getMovies);
router.post("/:id/like", requireAuth, toggleLikeMovie);
export default router;
