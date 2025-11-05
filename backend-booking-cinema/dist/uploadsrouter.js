"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("./middlewares/upload");
const auth_middleware_1 = require("./middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.requireAuth, auth_middleware_1.isAdmin, upload_1.upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "trailer", maxCount: 1 },
]), (req, res) => {
    var _a, _b;
    try {
        const files = req.files;
        const poster = (_a = files === null || files === void 0 ? void 0 : files["poster"]) === null || _a === void 0 ? void 0 : _a[0];
        const trailer = (_b = files === null || files === void 0 ? void 0 : files["trailer"]) === null || _b === void 0 ? void 0 : _b[0];
        if (!poster || !trailer) {
            res.status(400).json({ message: "Cần upload cả Poster và Trailer" });
            return; // 👈 kết thúc hàm
        }
        res.status(200).json({
            message: "Upload thành công",
            posterUrl: `/uploads/${poster.filename}`,
            trailerUrl: `/uploads/${trailer.filename}`,
        });
    }
    catch (error) {
        console.error("❌ Lỗi upload:", error);
        res.status(500).json({ message: "Lỗi khi upload file" });
    }
});
exports.default = router;
