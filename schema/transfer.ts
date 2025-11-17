import * as mongoose from 'mongoose';

const TransferSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    fee: { type: Number, default: 0 },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
    bankCode: { type: String, required: true },
    bankName: { type: String, required: true },
    providerId: { type: String, default: null },
    status: { type: String, required: true },
    provider: { type: String, default: 'SAFEHAVEN' },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { _id: false });

export const Transfer = mongoose.model("Transfer", TransferSchema);