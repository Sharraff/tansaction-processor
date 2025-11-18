import * as mongoose from 'mongoose';


const UserIdentitySchema = new mongoose.Schema({
	status: {
		type: String,
		default: null
	},
	issuanceDate: {
		type: Date,
		default: null
	},
	expiryDate: {
		type: Date,
		default: null
	},
	type: {
		type: String,
		default: null
	},
	number: {
		type: String,
		default: null
	}
}, { _id: false });

const AddressSchema = new mongoose.Schema({
	street: String,
	city: String,
	state: String,
	country: String,
	postalCode: String
}, { _id: false });

export const UserSchema = new mongoose.Schema({
	type: {
        type: String,
        required: true,
        enum: ['Individual', 'Business']
    },
	firstName: String,
	lastName: String,
    tag: {
        type: String,
        unique: true,
        required: true,
        trim: true,
		index: true
    },
	emailAddress: {
        type: String,
        unique: true,
        required: true,
    },
	phoneNumber: {
		type: String,
		required: true,
		trim: true,
	},
	bvn: { type: String, default: null },
	nin: { type: String, default: null },
	password: { type: String, required: true, select: false },
	role: { type: String, default: 'User' },
	status: { type: String, default: 'Active' },
	gender: { type: String, default: 'Not Specified' },
	dateOfBirth: { type: Date, default: null },
	maritalStatus: {
		type: String,
		default: 'Not Specified'
	},
	countryOfBirth: {
		type: String,
		default: 'Not Specified'
	},
	stateOfOrigin: {
		type: String,
		default: 'Not Specified'
	},
	cityOfOrgin: {
		type: String,
		default: 'Not Specified'
	},
	contactAddress: AddressSchema,
	identificationDetails: UserIdentitySchema,
    defaultCurrency: {
		type: String,
		default: 'NGN'
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
	},
	deletedAt: {
		type: Date,
		default: null
	},
});

export const User = mongoose.model('User', UserSchema);
