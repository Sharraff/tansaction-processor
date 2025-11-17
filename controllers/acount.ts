import { Request, Response } from "express";
import mongoose from "mongoose";
import { Account, AccountTransaction, VerifyAccount } from "../schema/account";
import { TransactionEngine } from "./transaction";
import { Wallet } from "../schema/wallet";

// Generate random references
const generateRef = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export class AccountController {

    
    static async createAccount(req: Request, res: Response) {
        try {
            const {
                user,
                wallet,
                bankCode,
                bankName,
                accountNumber,
                accountName,
                amount,
                provider
            } = req.body;

            const reference = generateRef("ACC");
            const expiryDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 24hrs

            const account = await Account.create({
                user,
                wallet,
                bankCode,
                bankName,
                accountNumber,
                accountName,
                amount,
                provider: provider || "SAFEHAVEN",
                reference,
                expiryDate,
                validFor: 24,
                status: "pending"
            });

            return res.status(201).json({
                message: "Virtual account created",
                account
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error" });
        }
    }


    
    static async getUserAccounts(req: Request, res: Response) {
        try {
            const { userId } = req.params;

            const accounts = await Account.find({
                user: userId,
                isDeleted: false
            });

            return res.json(accounts);

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }


    
    static async getAccountById(req: Request, res: Response) {
        try {
            const { accountId } = req.params;

            const account = await Account.findById(accountId);
            if (!account)
                return res.status(404).json({ message: "Account not found" });

            return res.json(account);

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }


   
    static async verifyAccount(req: Request, res: Response) {
        try {
            const { user, accountNumber, bankCode, bankName } = req.body;

            const reference = generateRef("VERIFY");
            const sessionId = generateRef("SESSION");

            const verify = await VerifyAccount.create({
                user,
                accountNumber,
                accountName: "John Doe", // Mock provider response
                bankCode,
                bankName,
                reference,
                sessionId,
                provider: "ACCESS"
            });

            return res.json({
                message: "Account verified",
                data: verify
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }



    static async createAccountTransaction(req: Request, res: Response) {
        try {
            const {
                user,
                account,
                wallet,
                amount,
                narration,
                sourceBankCode,
                sourceBankName,
                debitAccountName,
                debitAccountNumber
            } = req.body;

            const internalReference = generateRef("INT");
            const externalReference = generateRef("EXT");

            const txn = await AccountTransaction.create({
                user,
                Account: account,
                wallet,
                amount,
                narration,
                sourceBankCode,
                sourceBankName,
                debitAccountName,
                debitAccountNumber,
                creditAccountName: "Wallet",
                creditAccountNumber: "INTERNAL",
                provider: "ACCESS",
                providerResponse: {},
                status: "success",
                internalReference,
                externalReference,
                createdAt: new Date()
            });

            return res.status(201).json({
                message: "Transaction recorded",
                txn
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error" });
        }
    }



    static async reverseTransaction(req: Request, res: Response) {
        try {
            const { transactionId } = req.params;

            const txn = await AccountTransaction.findById(transactionId);
            if (!txn) return res.status(404).json({ message: "Transaction not found" });

            txn.isReversed = true;
            txn.reversalReference = generateRef("REV");
            txn.status = "reversed";
            await txn.save();

            return res.json({
                message: "Transaction reversed",
                txn
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }

    // Admin 
    static async blockAccount(req: Request, res: Response) {
        try {
            const { accountId } = req.params;

            const account = await Account.findByIdAndUpdate(
                accountId,
                { isBlocked: true },
                { new: true }
            );

            return res.json({ message: "Account blocked", account });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }

    static async unblockAccount(req: Request, res: Response) {
        try {
            const { accountId } = req.params;

            const account = await Account.findByIdAndUpdate(
                accountId,
                { isBlocked: false },
                { new: true }
            );

            return res.json({ message: "Account unblocked", account });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }

    // FUND WALLET THROUGH ACCOUNT
    static async fundWallet(req: Request, res: Response) {
        try {
            const {
                user,
                walletId,
                accountId,
                amount,
                narration = "Account funding",
                bankCode,
                bankName,
                debitAccountName,
                debitAccountNumber
            } = req.body;

            const txn = await TransactionEngine.creditWalletAtomic({
                user,
                walletId,
                account: accountId,
                amount,
                narration,
                meta: { bankCode, bankName, debitAccountName, debitAccountNumber }
            });

            return res.json({
                message: "Wallet funded successfully",
                transaction: txn
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: err });
        }
    }


    // WALLET TO WALLET TRANSFER
    static async walletTransfer(req: Request, res: Response) {
        try {
            const { senderWalletId, receiverWalletId, amount } = req.body;

            const result = await TransactionEngine.transferAtomic(
                senderWalletId,
                receiverWalletId,
                amount
            );

            return res.json({
                message: "Transfer successful",
                result
            });

        } catch (err) {
            return res.status(400).json({ message: err });
        }
    }


    static async deleteAccount(req: Request, res: Response) {
        try {
            const { accountId } = req.params;

            const account = await Account.findByIdAndUpdate(
                accountId,
                { isDeleted: true, deletedAt: new Date() },
                { new: true }
            );

            return res.json({ message: "Account deleted", account });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }
}

