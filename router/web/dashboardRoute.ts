import type { Response, Request } from "express";
import express from 'express'
const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    res.render('admin/dashboard', { 
        title: 'Admin Dashboard'
    });
});
export default router;
