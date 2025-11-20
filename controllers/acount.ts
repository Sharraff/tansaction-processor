import type { Request, Response } from "express";
import "../types/express.d.ts";
import mongoose from "mongoose";
import { Account, AccountTransaction, VerifyAccount } from "../schema/account.ts";
import { TransactionEngine } from "./transaction.ts";
import { Wallet } from "../schema/wallet.ts";

// Generate random references
const generateRef = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export class AccountController {

    
    static async createAccount(req: Request, res: Response) { // create account
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
                provider: provider || "ACCESS",
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


    
    static async getUserAccounts(req: Request, res: Response) { // get a users account by userID
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


    
    static async getAccountById(req: Request, res: Response) { // get a users account by accountID
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


   
    static async verifyAccount(req: Request, res: Response) { // verify user account
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

    static async externalTransfer(req: Request, res: Response) {
        try {
            const {
              accountId,
              bankCode,
              bankName,
              creditAccountNumber,
              creditAccountName,
              amount,
              narration
            } = req.body;
          
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }
            
            const userId = req.user.id; // from auth middleware
          
            // 1. Fetch sender account
            const senderAccount = await Account.findOne({
              _id: accountId,
              user: userId,
              isDeleted: false,
              isBlocked: false
            });

            if (!senderAccount) {
                return res.status(404).json({ message: "Account not found or blocked" });
            }
          
            // 2. Check balance
            if (senderAccount.amount < amount) {
                return res.status(400).json({ message: "Insufficient account balance" });
            }
          
            // 3. Debit internal account balance
            senderAccount.amount -= amount;
            await senderAccount.save();
          
            // 4. Make external transfer (placeholder API)
            const externalReference = "EXT-" + Date.now();
            let providerResponse;


            try {
              // simulate external call
              providerResponse = {
                status: "SUCCESS",
                reference: externalReference,
                message: "Transfer delivered to bank network"
              };


            } catch (err: any) {
                // rollback balance
                senderAccount.amount += amount;
                await senderAccount.save();

                return res.status(500).json({
                  message: "External bank transfer failed",
                  error: err.message
                });
            }

            // 5. Create AccountTransaction record
            const internalReference = "INT-" + Date.now();

            const trx = await AccountTransaction.create({
                user: userId,
                Account: senderAccount._id,
                wallet: senderAccount.wallet,
                externalReference,
                internalReference,
                provider: senderAccount.provider,
                providerId: senderAccount.providerId,
                sourceBankCode: senderAccount.bankCode,
                sourceBankName: senderAccount.bankName,
                creditAccountName,
                creditAccountNumber,
                debitAccountName: senderAccount.accountName,
                debitAccountNumber: senderAccount.accountNumber,
                narration,
                amount,
                fees: 10,
                vat: 5,
                responseMessage: providerResponse,
                status: providerResponse,
                providerResponse,
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false
            });

            return res.status(200).json({
               message: "External transfer successful",
               transaction: trx
            });
        } catch (error: any) {
            return res.status(500).json({
                message: "Internal server error",
                error: error.message
            });
        }
    }


    static async reverseTransaction(req: Request, res: Response) {  // reverse a transaction
        try {
            const { transactionId } = req.params;

            //const txn = await AccountTransaction.findById(transactionId);
            //if (!txn) return res.status(404).json({ message: "Transaction not found" });

            // txn.isReversed = true;
            // txn.reversalReference = generateRef("REV");
            // txn.status = "reversed";
            // await txn.save();

            const reversed = TransactionEngine.reverseTransaction(transactionId);

            return res.json({
                message: "Transaction reversed",
                //txn
                reversed
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }


    static async blockAccount(req: Request, res: Response) { // block user  account
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

    static async unblockAccount(req: Request, res: Response) { // unblock user account
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

    static async fundWallet(req: Request, res: Response) { // fund wallet through account
        try {
            const {
                user,
                walletId,
                accountId,
                amount,
                narration = "Wallet funding from account",
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


    // // WALLET TO WALLET TRANSFER
    // static async walletTransfer(req: Request, res: Response) { 
    //     try {
    //         const { senderWalletId, receiverWalletId, amount } = req.body;

    //         const result = await TransactionEngine.transferAtomic(
    //             senderWalletId,
    //             receiverWalletId,
    //             amount
    //         );

    //         return res.json({
    //             message: "Transfer successful",
    //             result
    //         });

    //     } catch (err) {
    //         return res.status(400).json({ message: err });
    //     }
    // }


    static async deleteAccount(req: Request, res: Response) { // delete account
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

