"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const userManager_controller_1 = require("../../models/user/userManager.controller");
const router = express_1.default.Router();
router.get("/", auth_middleware_1.requireAuth, auth_middleware_1.isAdmin, userManager_controller_1.getAllUsers);
router.get("/:id", auth_middleware_1.requireAuth, auth_middleware_1.isAdmin, userManager_controller_1.getUserById);
router.patch("/:id/status", auth_middleware_1.requireAuth, auth_middleware_1.isAdmin, userManager_controller_1.toggleUserStatus);
router.delete("/:id", auth_middleware_1.requireAuth, auth_middleware_1.isAdmin, userManager_controller_1.deleteUser);
exports.default = router;
