import dotenv from "dotenv";
dotenv.config();


//import { Request, Response, NextFunction } from "express";
import "../types/express.d.ts";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";



export interface AuthRequest extends Request {
    userId?: string;
}

export const requireAuth = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ") 
        ? authHeader.substring(7)
        : null;

    if (!token) {
        return res.status(401).json({ message: "Access token missing" });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET!
        ) as { userId: string };

        req.userId = decoded.userId;
        next();

    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};


// transaction routes
// router.post("/credit", async (req, res) => {
//     try {
//         const result = await TransactionEngine.creditWalletAtomic(req.body);
//         res.json({ message: "Wallet credited", transaction: result });
//     } catch (error: any) {
//         res.status(400).json({ message: error.message || "Unable to credit wallet" });
//     }
// });

// router.post("/reverse", async (req, res) => {
//     try {
//         const { transactionId } = req.body;
//         const txn = await TransactionEngine.reverseTransaction(transactionId);
//         res.json({ message: "Transaction reversed", transaction: txn });
//     } catch (error: any) {
//         res.status(400).json({ message: error.message || "Unable to reverse transaction" });
//     }
// });

// router.post("/transfer", async (req, res) => {
//     try {
//         const { senderWalletId, receiverWalletId, amount } = req.body;
//         const result = await TransactionEngine.transferAtomic(senderWalletId, receiverWalletId, amount);
//         res.json({ message: "Transfer successful", transfer: result });
//     } catch (error: any) {
//         res.status(400).json({ message: error.message || "Unable to transfer" });
//     }
// });

// export function requireAuth(req: Request, res: Response, next: NextFunction) {
//     if (!req.session.userId) {
//         return res.status(401).json({ error: "Authentication required" });
//     }
//     // Set req.user from session
//     req.user = {
//         id: req.session.userId
//     };
//     next();
// }