import type { Response, NextFunction } from "express";
import { AuthRequest } from "./requireAuth";
import { User } from "../schema/user";
import jwt from "jsonwebtoken";

export const userFromToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    if (!token) return next(); // not required—just optional

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET!
        ) as { userId: string };

        const user = await User.findById(decoded.userId).select("-password");

        if (user) {
            req.user = {
                id: user._id.toString()
            };
        }

    } catch (err) {
        // ignore errors — token might be expired
    }

    next();
};
