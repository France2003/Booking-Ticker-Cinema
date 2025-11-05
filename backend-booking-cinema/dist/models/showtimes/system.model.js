"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemLog = void 0;
const mongoose_1 = require("mongoose");
const SystemLogSchema = new mongoose_1.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
}, { timestamps: true });
exports.SystemLog = (0, mongoose_1.model)("SystemLog", SystemLogSchema);
