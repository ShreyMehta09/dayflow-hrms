import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "admin" | "hr" | "employee";
export type UserStatus = "active" | "inactive" | "on_leave";

export interface IUser extends Document {
	_id: mongoose.Types.ObjectId;
	email: string;
	password: string;
	name: string;
	role: UserRole;
	avatar?: string;
	department?: string;
	position?: string;
	joinDate: Date;
	phone?: string;
	address?: string;
	status: UserStatus;
	loginId?: string;
	mustChangePassword: boolean;
	createdAt: Date;
	updatedAt: Date;
	comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
	findByEmail(email: string): Promise<IUser | null>;
}

const UserSchema = new Schema<IUser>(
	{
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [6, "Password must be at least 6 characters"],
			select: false, // Don't include password by default in queries
		},
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
		},
		role: {
			type: String,
			enum: ["admin", "hr", "employee"],
			default: "employee",
		},
		avatar: {
			type: String,
			default: "",
		},
		department: {
			type: String,
			default: "",
		},
		position: {
			type: String,
			default: "",
		},
		joinDate: {
			type: Date,
			default: Date.now,
		},
		phone: {
			type: String,
			default: "",
		},
		address: {
			type: String,
			default: "",
		},
		status: {
			type: String,
			enum: ["active", "inactive", "on_leave"],
			default: "active",
		},
		loginId: {
			type: String,
			unique: true,
			sparse: true,
		},
		mustChangePassword: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

// Hash password before saving
UserSchema.pre("save", async function () {
	if (!this.isModified("password")) {
		return;
	}

	const salt = await bcrypt.genSalt(12);
	this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (
	candidatePassword: string
): Promise<boolean> {
	return bcrypt.compare(candidatePassword, this.password);
};

// Static method to find user by email
UserSchema.statics.findByEmail = function (email: string) {
	return this.findOne({ email: email.toLowerCase() });
};

// Prevent model recompilation in development
const User: IUserModel =
	(mongoose.models.User as IUserModel) ||
	mongoose.model<IUser, IUserModel>("User", UserSchema);

export default User;
