import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Authentication required" });
    }
    next();
}


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