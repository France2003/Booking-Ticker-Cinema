"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = void 0;
const userManager_model_1 = require("../../models/user/userManager.model");
// 📌 Lấy thông tin profile
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = yield userManager_model_1.UserModel.findById(userId).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    }
    catch (err) {
        console.error("❌ getProfile error:", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});
exports.getProfile = getProfile;
// 📌 Cập nhật profile
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            console.warn("⚠️ Không có userId trong token!");
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { fullname, phone, dateofbirth, gender, address } = req.body;
        const updatedUser = yield userManager_model_1.UserModel.findByIdAndUpdate(userId, {
            $set: { fullname, phone, dateofbirth, gender, address },
        }, { new: true, runValidators: true }).select("-password");
        if (!updatedUser) {
            console.warn("❌ Không tìm thấy user với id:", userId);
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json({
            message: "Cập nhật thông tin thành công",
            user: updatedUser,
        });
    }
    catch (err) {
        console.error("🔥 [updateProfile] Lỗi server:", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});
exports.updateProfile = updateProfile;
