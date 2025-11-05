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
exports.deleteUser = exports.toggleUserStatus = exports.getUserById = exports.getAllUsers = void 0;
const userManager_model_1 = require("../../models/user/userManager.model");
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield userManager_model_1.UserModel.find({ role: "user" }).select("-password");
    res.json(users);
});
exports.getAllUsers = getAllUsers;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userManager_model_1.UserModel.findById(req.params.id).select("-password");
    if (!user) {
        res.status(404).json({ message: "Không tìm thấy người dùng" });
        return;
    }
    res.json(user);
});
exports.getUserById = getUserById;
const toggleUserStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userManager_model_1.UserModel.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }
        user.trangThai = !user.trangThai;
        yield user.save();
        res.status(200).json({
            message: `Tài khoản đã được ${user.trangThai ? "mở khóa" : "khóa"}`,
            user: user
        });
    }
    catch (error) {
        console.error("Error toggling user status:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
});
exports.toggleUserStatus = toggleUserStatus;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield userManager_model_1.UserModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa người dùng thành công" });
});
exports.deleteUser = deleteUser;
