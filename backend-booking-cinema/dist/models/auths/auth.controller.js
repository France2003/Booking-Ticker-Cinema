"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.loginAdmin = exports.Admin = exports.loginUser = exports.registerUser = void 0;
const AuthService = __importStar(require("../auths/auth.service"));
const response_1 = require("../../utils/response");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_model_1 = require("./auth.model");
const sendMail_1 = __importDefault(require("../../utils/sendMail"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const resetPasswordTemplate_1 = require("../../utils/resetPasswordTemplate");
const jwt_1 = require("../../utils/jwt");
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield AuthService.register(req.body);
        (0, response_1.successResponse)(res, { user }, "Người dùng đã đăng ký thành công");
    }
    catch (err) {
        if (err.message.includes("Email") || err.message.includes("số điện thoại")) {
            (0, response_1.errorResponse)(res, err.message, 400);
        }
        (0, response_1.errorResponse)(res, "Lỗi server", 500);
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield AuthService.login(req.body);
        (0, response_1.successResponse)(res, result, "Đăng nhập thành công");
    }
    catch (err) {
        (0, response_1.errorResponse)(res, err.message, 401);
    }
});
exports.loginUser = loginUser;
///Admin
const Admin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Kiểm tra xem admin đã tồn tại chưa
        const existingAdmin = yield auth_model_1.UserModel.findOne({ role: "admin" });
        if (existingAdmin) {
            res.status(400).json({ message: "Admin đã tồn tại!" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash("admin123", 10);
        const admin = new auth_model_1.UserModel({
            email: "admin@cinema.com",
            phone: "0000000000",
            password: hashedPassword,
            role: "admin",
        });
        yield admin.save();
        res.json({ message: "Quản trị viên đã tạo thành công", admin });
    }
    catch (error) {
        res.status(500).json({ message: error.message || "Lỗi máy chủ nội bộ" });
    }
});
exports.Admin = Admin;
const loginAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const admin = yield auth_model_1.UserModel.findOne({ email, role: "admin" });
    if (!admin)
        throw new Error("Tài khoản admin không tồn tại");
    const isMatch = yield bcryptjs_1.default.compare(password, admin.password);
    if (!isMatch)
        throw new Error("Sai mật khẩu");
    const token = (0, jwt_1.generateToken)({ id: admin._id.toString(), role: "admin" });
    const refreshToken = (0, jwt_1.generateRefreshToken)({ id: admin._id.toString(), role: "admin" });
    (0, response_1.successResponse)(res, { token, refreshToken, admin }, "Đăng nhập admin thành công");
});
exports.loginAdmin = loginAdmin;
// Gửi mail quên mật khẩu
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield auth_model_1.UserModel.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "Email không tồn tại" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "15m",
        });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        // Gửi mail
        yield (0, sendMail_1.default)(email, "Đặt lại mật khẩu", (0, resetPasswordTemplate_1.resetPasswordTemplate)(resetLink));
        res.json({ message: "Đã gửi email đặt lại mật khẩu" });
    }
    catch (error) {
        res.status(500).json({ message: error.message || "Lỗi server" });
    }
});
exports.forgotPassword = forgotPassword;
// Đặt lại mật khẩu
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!token || !password) {
            res.status(400).json({ message: "Thiếu token hoặc mật khẩu" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const hashed = yield bcryptjs_1.default.hash(password, 10);
        yield auth_model_1.UserModel.findByIdAndUpdate(decoded.id, { password: hashed });
        res.json({ message: "Đặt lại mật khẩu thành công" });
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            res.status(400).json({ message: "Token đã hết hạn" });
            return;
        }
        res.status(500).json({ message: error.message || "Lỗi server" });
    }
});
exports.resetPassword = resetPassword;
