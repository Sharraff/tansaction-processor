import mongoose from "mongoose";
//import { Request, Response } from "express";
import { Wallet } from "../schema/wallet.ts";
import { AccountTransaction } from "../schema/account.ts";
//import { Account } from "../schema/account.ts";


// Generate random references
const generateRef = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;


export class TransactionEngine {

    /**
     * Safe atomic wallet credit & transaction creation
     */
    static async creditWalletAtomic({
        user,
        walletId,
        account,
        amount,
        narration,
        meta = {}
    }: any) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // lock wallet
            const wallet = await Wallet.findOne({ _id: walletId })
                .session(session)
                .exec();

            if (!wallet) throw new Error("Wallet not found");

            wallet.balance += amount;
            await wallet.save({ session });

            const internalReference = `INT-${Date.now()}`;
            const externalReference = `EXT-${Date.now()}`;

            const txn = await AccountTransaction.create([{
                user,
                wallet: walletId,
                Account: account,
                amount,
                narration,
                creditAccountName: "Wallet",
                creditAccountNumber: "INTERNAL",
                debitAccountName: meta.debitAccountName || "",
                debitAccountNumber: meta.debitAccountNumber || "",
                sourceBankCode: meta.bankCode || "",
                sourceBankName: meta.bankName || "",
                status: "success",
                internalReference,
                externalReference,
                providerResponse: meta.providerResponse || {},
                createdAt: new Date()
            }], { session });

            await session.commitTransaction();
            session.endSession();

            return txn[0];

        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    }


    /**
     * Safe atomic wallet transfer
     */
    static async transferAtomic(senderWalletId: string, receiverWalletId: string, amount: number) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const sender = await Wallet.findById(senderWalletId).session(session);
            const receiver = await Wallet.findById(receiverWalletId).session(session);

            if (!sender || !receiver) throw new Error("Wallet not found");
            if (sender.balance < amount) throw new Error("Insufficient balance");

            sender.balance -= amount;
            receiver.balance += amount;

            await sender.save({ session });
            await receiver.save({ session });

            const internalReference = `TRF-${Date.now()}`;

            await AccountTransaction.create([{
                user: sender.user,
                wallet: senderWalletId,
                Account: null,
                amount,
                narration: "Wallet-to-wallet transfer",
                debitAccountName: senderWalletId,
                creditAccountName: receiverWalletId,
                internalReference,
                status: "success",
                createdAt: new Date()
            }], { session });

            await session.commitTransaction();
            session.endSession();

            return { sender, receiver };

        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    }


    /**
     * Reverse a transaction safely
     */
    static async reverseTransaction(txnId: string) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const txn = await AccountTransaction.findById(txnId)
                .session(session);

            if (!txn) throw new Error("Transaction not found");
            if (txn.isReversed) throw new Error("Already reversed");

            const wallet = await Wallet.findById(txn.wallet).session(session);
            if (!wallet) throw new Error("Wallet not found");

            // reverse (subtract amount)
            if (txn.amount == null) {
                throw new Error("Transaction amount is missing");
            }
            wallet.balance -= txn.amount;
            await wallet.save({ session });

            txn.isReversed = true;
            txn.reversalReference = `REV-${Date.now()}`;
            txn.status = "reversed";
            txn.updatedAt = new Date();
            await txn.save({ session });

            await session.commitTransaction();
            session.endSession();
            return txn;

        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
        }
    }


    // static async createAccountTransaction(req: Request, res: Response) {
    //     try {
    //         const {
    //             user,
    //             account,
    //             wallet,
    //             amount,
    //             narration,
    //             sourceBankCode,
    //             sourceBankName,
    //             debitAccountName,
    //             debitAccountNumber
    //         } = req.body;

    //         const internalReference = generateRef("INT");
    //         const externalReference = generateRef("EXT");

    //         const txn = await AccountTransaction.create({
    //             user,
    //             Account: account,
    //             wallet,
    //             amount,
    //             narration,
    //             sourceBankCode,
    //             sourceBankName,
    //             debitAccountName,
    //             debitAccountNumber,
    //             creditAccountName: "Wallet",
    //             creditAccountNumber: "INTERNAL",
    //             provider: "ACCESS",
    //             providerResponse: {},
    //             status: "success",
    //             internalReference,
    //             externalReference,
    //             createdAt: new Date()
    //         });

    //         return res.status(201).json({
    //             message: "Transaction recorded",
    //             txn
    //         });

    //     } catch (err) {
    //         console.error(err);
    //         return res.status(500).json({ message: "Server error" });
    //     }
    // }
}

