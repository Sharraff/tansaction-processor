import { Wallet } from "../schema/wallet";
import { Request, Response } from "express";
import mongoose from "mongoose";

export class WalletController {

    // GET ALL USER WALLETS
    async getUserWallets(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const wallets = await Wallet.find({ user: userId, isDeleted: false });
            res.json(wallets);
        } catch (err) {
            res.status(500).json({ message: err });
        }
    }

    // GET WALLET BY ID
    async getWalletById(req: Request, res: Response) {
        try {
            const { walletId } = req.params;
            const wallet = await Wallet.findById(walletId);
            if (!wallet) return res.status(404).json({ message: "Wallet not found" });
            res.json(wallet);
        } catch (err) {
            res.status(500).json({ message: err });
        }
    }

    // INITIATE FUNDING
    async initiateFunding(req: Request, res: Response) {
        try {
            const { walletId, amount, provider } = req.body;

            const reference = `TXN-${Date.now()}`;
            res.json({
                provider,
                reference,
                amount,
                walletId,
                paymentUrl: `https://${provider}.pay/${reference}`,
            });

        } catch (err) {
            res.status(500).json({ message: err });
        }
    }

    // CREDIT WALLET
    async creditWallet(req: Request, res: Response) {
        try {
            const { walletId, amount } = req.body;
            const wallet = await Wallet.findByIdAndUpdate(
                walletId,
                { $inc: { balance: amount }},
                { new: true }
            );
            res.json(wallet);
        } catch (err) {
            res.status(500).json({ message: err });
        }
    }

    // INTERNAL TRANSFER
    async transfer(req: Request, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { senderId, receiverId, amount } = req.body;

            const sender = await Wallet.findById(senderId).session(session);
            const receiver = await Wallet.findById(receiverId).session(session);

            if (!sender || !receiver)
                return res.status(404).json({ message: "Wallet not found" });

            if (sender.balance < amount)
                return res.status(400).json({ message: "Insufficient funds" });

            sender.balance -= amount;
            await sender.save();

            receiver.balance += amount;
            await receiver.save();

            await session.commitTransaction();
            res.json({ sender, receiver });

        } catch (err) {
            await session.abortTransaction();
            res.status(500).json({ message: err });
        } finally {
            session.endSession();
        }
    }

    // LIST BANKS
    async listBanks(req: Request, res: Response) {
        res.json([
            { name: "Access Bank", code: "044" },
            { name: "GTBank", code: "058" },
            { name: "Zenith Bank", code: "057" },
        ]);
    }

    // VERIFY ACCOUNT
    async verifyAccount(req: Request, res: Response) {
        const { bankCode, accountNumber } = req.body;
        res.json({
            bankCode,
            accountNumber,
            accountName: "John Doe",
            isValid: true,
        });
    }

    // CHECK TRANSACTION STATUS
    async checkTransactionStatus(req: Request, res: Response) {
        const { reference } = req.params;
        res.json({
            reference,
            status: "success",
            amount: Math.floor(Math.random() * 20000),
        });
    }
}
