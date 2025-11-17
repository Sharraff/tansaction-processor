import * as mongoose from 'mongoose';

export const  TransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // current user
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' }, // user wallet
    currency: { type: String, required: true }, // currency
    amount: { type: Number, required: true },
    fees: { type: Number, default: 0 },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    status: { type: String, default: 'Created' },
    type: { type: String, required: true }, // Credit, Debit
    category: { type: String, required: true }, // Deposit, Withdrawal, Bill Payment
    channel: { type: String, required: true }, // Transfer, Airtime, Utility Bill Payment
    narration: { type: String, default: null }, // reason for transaction
    externalReference: { type: String, default: null },
    internalReference: { type: String, required: true },
    provider: { type: String, required: true },
    providerId: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
    isReversal: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

export const Transaction = mongoose.model("Transaction", TransactionSchema);