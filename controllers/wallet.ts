import { Wallet } from "../schema/wallet.ts";
import type { Request, Response } from "express";
import mongoose from "mongoose";

export class WalletController {

    // CREATE WALLET
    async createWallet(req: Request, res: Response) {
        try {
        const { userId, name, type, currency } = req.body;

        if (!userId || !name || !type || !currency) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const wallet = await Wallet.create({
            user: userId,
            name,
            type,       // e.g., 'fiat' or crypto
            currency,   // e.g., 'NGN', 'USD'
            balance: 5000  // default starting balance
        });

        res.status(201).json({ message: "Wallet created successfully", wallet });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}


    async getUserWallets(req: Request, res: Response) { // get user wallet by userID
        try {
            const { userId } = req.params;
            const wallets = await Wallet.find({ user: userId, isDeleted: false });
            res.json(wallets);
        } catch (err) {
            res.status(500).json({ message: err });
        }
    }


    async getWalletById(req: Request, res: Response) { // get wallet by wallet id
        try {
            const { walletId } = req.params;
            const wallet = await Wallet.findById(walletId);
            if (!wallet) return res.status(404).json({ message: "Wallet not found" });
            res.json(wallet);
        } catch (err) {
            res.status(500).json({ message: err });
        }
    }

    async initiateFunding(req: Request, res: Response) { // initiate wallet funding from external provider
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


    async creditWallet(req: Request, res: Response) { //credit wallet
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

    async transfer(req: Request, res: Response) { // internal transfer
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

    async listBanks(req: Request, res: Response) { // list of available banks
        res.json([
            { name: "Access Bank", code: "044" },
            { name: "GTBank", code: "058" },
            { name: "Zenith Bank", code: "057" },
        ]);
    }


    async verifyAccount(req: Request, res: Response) { //verify account before transaction
        const { bankCode, accountNumber } = req.body;
        res.json({
            bankCode,
            accountNumber,
            accountName: "John Doe",
            isValid: true,
        });
    }

    async checkTransactionStatus(req: Request, res: Response) {  // check transaction status
        const { reference } = req.params;
        res.json({
            reference,
            status: "success",
            amount: Math.floor(Math.random() * 20000),
        });
    }
}
