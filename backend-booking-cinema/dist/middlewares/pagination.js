"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationMiddleware = void 0;
const paginationMiddleware = (req, res, next) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (page < 1)
        page = 1;
    if (limit < 1)
        limit = 10;
    const keyword = req.query.keyword || "";
    req.pagination = { page, limit, keyword };
    next();
};
exports.paginationMiddleware = paginationMiddleware;
