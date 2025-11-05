"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userprofile_controller_1 = require("./userprofile.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/profile", auth_middleware_1.requireAuth, userprofile_controller_1.getProfile);
router.put("/profile", auth_middleware_1.requireAuth, userprofile_controller_1.updateProfile);
exports.default = router;
