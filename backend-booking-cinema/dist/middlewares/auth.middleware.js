"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.requireAuth = void 0;
const jwt_1 = require("../utils/jwt");
const requireAuth = (req, res, next) => {
    const header = req.headers["authorization"];
    if (!header || !header.startsWith("Bearer ")) {
        res.status(403).json({ message: "No token provided" });
        return;
    }
    const token = header.split(" ")[1];
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (err) {
        console.error("Invalid token:", err);
        res.status(401).json({ message: "Invalid or expired token" });
        return;
    }
};
exports.requireAuth = requireAuth;
const isAdmin = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
        res.status(403).json({ message: "Admins only" });
        return;
    }
    next();
};
exports.isAdmin = isAdmin;
