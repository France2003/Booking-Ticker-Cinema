import { Router } from "express";
import { createMovie, getMovies, updateMovie, deleteMovie } from "./movie.controller";
import { validateMovie } from "./movie.validation";
import { validateRequest } from "../../middlewares/movie.validateRequest";
import { paginationMiddleware } from "../../middlewares/pagination";
import { isAdmin, requireAuth } from "../../middlewares/auth.middleware";
const router = Router();
// Admin routes
router.post("/", requireAuth, isAdmin, validateMovie, createMovie as any);
router.put("/:id", requireAuth, isAdmin, validateMovie, updateMovie);
router.get("/:id", requireAuth, isAdmin, getMovies);
router.delete("/:id", requireAuth, isAdmin, deleteMovie);
// Public route
router.get("/", paginationMiddleware, getMovies);
export default router;
