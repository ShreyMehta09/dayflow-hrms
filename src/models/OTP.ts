import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOTP extends Document {
	email: string;
	otp: string;
	expiresAt: Date;
	verified: boolean;
	attempts: number;
	createdAt: Date;
}

interface IOTPModel extends Model<IOTP> {
	findValidOTP(email: string, otp: string): Promise<IOTP | null>;
}

const OTPSchema = new Schema<IOTP>(
	{
		email: {
			type: String,
			required: [true, "Email is required"],
			lowercase: true,
			trim: true,
		},
		otp: {
			type: String,
			required: [true, "OTP is required"],
		},
		expiresAt: {
			type: Date,
			required: true,
			index: { expires: 0 }, // TTL index - document auto-deletes when expired
		},
		verified: {
			type: Boolean,
			default: false,
		},
		attempts: {
			type: Number,
			default: 0,
			max: 5, // Max 5 attempts
		},
	},
	{
		timestamps: true,
	}
);

// Index for faster lookups
OTPSchema.index({ email: 1, otp: 1 });

// Static method to find valid OTP
OTPSchema.statics.findValidOTP = async function (
	email: string,
	otp: string
): Promise<IOTP | null> {
	return this.findOne({
		email: email.toLowerCase(),
		otp,
		expiresAt: { $gt: new Date() },
		verified: false,
		attempts: { $lt: 5 },
	});
};

// Prevent model recompilation in development
const OTP: IOTPModel =
	(mongoose.models.OTP as IOTPModel) ||
	mongoose.model<IOTP, IOTPModel>("OTP", OTPSchema);

export default OTP;
