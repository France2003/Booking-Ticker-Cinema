import { Request, Response, NextFunction } from "express";
export const paginationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    let page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.limit as string) || 10;
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    const keyword = (req.query.keyword as string) || "";
    (req as any).pagination = { page, limit, keyword };
    next();
};
