"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            message: "Dữ liệu không hợp lệ",
            errors: errors.array()
        });
        return;
    }
    next();
};
exports.validateRequest = validateRequest;
