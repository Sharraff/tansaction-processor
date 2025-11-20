import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Account, AccountTransaction } from "../schema/account.ts";

export const IncomingTransferWebhook = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            accountId,        // Preferably the internal account ID
            userId,           // OR fallback if accountId is missing
            amount,
            senderBankName,
            senderBankCode,
            senderAccountName,
            senderAccountNumber,
            narration,
            externalReference
        } = req.body;

        //find the recieving account
        let account;

        if (accountId) {
            account = await Account.findOne({
                _id: accountId,
                isDeleted: false,
                isBlocked: false
            }).session(session);
        } else if (userId) {
            account = await Account.findOne({
                user: userId,
                isDeleted: false,
                isBlocked: false
            }).session(session);
        }

        if (!account) { // account not found
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                message: "Receiving account not found",
                status: "FAILED"
            });
        }

        // credit account atomically
        account.amount += Number(amount);
        await account.save({ session });

        const trx = await AccountTransaction.create( // create transaction record
            [{
                user: account.user,
                Account: account._id,
                wallet: account.wallet,
                externalReference: externalReference || "EXT-" + Date.now(),
                internalReference: "INT-" + Date.now(),

                provider: account.provider,
                providerId: account.providerId,

                sourceBankCode: senderBankCode,
                sourceBankName: senderBankName,

                creditAccountName: account.accountName,
                creditAccountNumber: account.accountNumber,

                debitAccountName: senderAccountName,
                debitAccountNumber: senderAccountNumber,

                narration,
                amount,
                fees: 0,
                vat: 0,

                status: "SUCCESS",
                responseMessage: "Incoming transfer credited successfully",
                providerResponse: req.body,

                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false
            }],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.json({ //send success to the bank
            message: "Incoming transfer processed",
            status: "SUCCESS",
            creditedAccount: {
                id: account._id,
                accountName: account.accountName,
                accountNumber: account.accountNumber
            },
            amount,
            transaction: trx[0]
        });

    } catch (err: any) {
        await session.abortTransaction();
        session.endSession();

        return res.status(500).json({
            message: "Webhook processing error",
            error: err.message,
            status: "FAILED"
        });
    }
};
