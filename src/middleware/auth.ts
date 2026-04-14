import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ── Types ─────────────────────────────────────────────────
interface JwtPayload {
    id: string;
    email: string;
    role: string;
}

// ── Public routes (no login required) ────────────────────
const PUBLIC_PATHS = [
    '/users/login',
    '/users/register',
    '/users/verify',
    '/users/forgot-password',
    '/users/reset-password',
    '/api/v1/user/login',
    '/api/v1/user/register',
    '/api/v1/user/verify',
    '/api/v1/user/resend-otp',
    '/api/v1/user/forgot-password',
    '/api/v1/user/reset-password',
];

const isPublicPath = (path: string): boolean => {
    return PUBLIC_PATHS.some(p => path.startsWith(p));
};

// ── Auth Middleware ───────────────────────────────────────
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const path = req.path;

    // Allow public paths through
    if (isPublicPath(path)) {
        next();
        return;
    }

    // Get token from cookie or Authorization header
    const token =
        req.cookies?.token ||
        req.headers.authorization?.replace('Bearer ', '');

    // No token → redirect to login
    if (!token) {
        // API request → return 401
        if (path.startsWith('/api/')) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized. Please login.',
            });
            return;
        }

        // Page request → redirect to login
        res.redirect('/users/login');
        return;
    }

    // Verify token
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        // Attach user to request
        req.user = decoded;
        next();

    } catch (error) {
        // Invalid/expired token → clear cookie
        res.clearCookie('token');

        if (path.startsWith('/api/')) {
            res.status(401).json({
                success: false,
                message: 'Session expired. Please login again.',
            });
            return;
        }

        res.redirect('/users/login');
    }
};

// ── Already logged in Middleware ──────────────────────────
// Prevent logged in users from accessing login/register pages
export const guestMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token =
        req.cookies?.token ||
        req.headers.authorization?.replace('Bearer ', '');

    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET as string);
            // Already logged in → redirect to home
            res.redirect('/');
            return;
        } catch {
            // Invalid token → allow through
            res.clearCookie('token');
        }
    }

    next();
};