"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const movie_controller_1 = require("./movie.controller");
const movie_validation_1 = require("./movie.validation");
const pagination_1 = require("../../middlewares/pagination");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Admin routes
router.post("/", auth_middleware_1.requireAuth, auth_middleware_1.isAdmin, movie_validation_1.validateMovie, movie_controller_1.createMovie);
router.put("/:id", auth_middleware_1.requireAuth, auth_middleware_1.isAdmin, movie_validation_1.validateMovie, movie_controller_1.updateMovie);
router.get("/:id", auth_middleware_1.requireAuth, movie_controller_1.getMovieById);
router.delete("/:id", auth_middleware_1.requireAuth, auth_middleware_1.isAdmin, movie_controller_1.deleteMovie);
router.get("/deleted/history", auth_middleware_1.requireAuth, auth_middleware_1.isAdmin, movie_controller_1.getMovieDeleteHistory);
// Public route
router.get("/", pagination_1.paginationMiddleware, movie_controller_1.getMovies);
router.post("/:id/like", auth_middleware_1.requireAuth, movie_controller_1.toggleLikeMovie);
exports.default = router;
