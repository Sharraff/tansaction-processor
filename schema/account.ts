import * as mongoose from 'mongoose';


export const AccountSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
	bankCode: { type: String, required: true },
    bankName: { type: String, required: true },
    provider: { type: String, default: 'SAFEHAVEN' },
    providerId: String,
	accountNumber: { type: String, required: true },
	accountName: { type: String, required: true },
	amountControl: String,
	amount: { type: Number, required: true},
	validFor: Number,
	expiryDate: Date,
	reference: String,	
	status: String,
    providerResponse: Object,
	isBlocked: { type: Boolean, default: false},
	isExpired: { type: Boolean, default: false},
	isDeleted: { type: Boolean, default: false },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
	deletedAt: { type: Date, default: null },
	expiredAt: { type: Date, default: null }
});

export const AccountTransactionSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	Account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
	externalReference: String,
	internalReference: String,
	isReversed: { type: Boolean, default: false },
	reversalReference: { type: String, default: null },
    provider: { type: String, default: 'ACCESS' },
    providerId: String,
    sourceBankCode: String,
    sourceBankName: String,
	creditAccountName: String,
	creditAccountNumber: String,
	debitAccountName: String,
	debitAccountNumber: String,
	narration: String,
	amount: Number,
	fees: Number,
	vat: Number,
	responseMessage: String,
	status: String,
    providerResponse: Object,
	isDeleted: Boolean,
	createdAt: Date,
	declinedAt: Date,
	updatedAt: Date,
	deletedAt: Date
});

export const VerifyAccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    accountNumber: {
        type: String,
        required: true
    },
    accountName: {
        type: String,
        required: true
    },
    bankCode: {
        type: String,
        required: true
    },
    bankName: {
        type: String,
        required: true
    },
    reference: {
        type: String,
        required: true,
        unique: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    provider: {
        type: String,
        default: 'ACCESS'
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

export const Account = mongoose.model('Account', AccountSchema);
export const AccountTransaction = mongoose.model('AccountTransaction', AccountTransactionSchema);
export const VerifyAccount = mongoose.model('Account', VerifyAccountSchema);