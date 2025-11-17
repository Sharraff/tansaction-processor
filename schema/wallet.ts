import * as mongoose from 'mongoose';

export const WalletSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        default: 'NGN'
    },
    balance: {
        type: Number,
        default: 0
    },
    lockedBalance: { type: Number, default: 0 }, // for pending txns
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export const Wallet = mongoose.model("Wallet", WalletSchema);