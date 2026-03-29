// src/middleware/deviceDetect.ts
import { Request, Response, NextFunction } from "express";

export const deviceDetect = (req: Request, res: Response, next: NextFunction) => {
    const userAgent = req.headers["user-agent"] || "";
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    res.locals.device = isMobile ? "mobile" : "desktop";
    next();
};