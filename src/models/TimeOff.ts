import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type LeaveType = "paid_time_off" | "sick_leave" | "unpaid_leave" | "maternity" | "paternity" | "bereavement" | "other";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface ITimeOff extends Document {
	_id: Types.ObjectId;
	employee: Types.ObjectId;
	type: LeaveType;
	startDate: Date;
	endDate: Date;
	days: number;
	reason: string;
	status: LeaveStatus;
	attachment?: string;
	approvedBy?: Types.ObjectId;
	approvedAt?: Date;
	rejectionReason?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ILeaveBalance extends Document {
	_id: Types.ObjectId;
	employee: Types.ObjectId;
	year: number;
	paidTimeOff: { total: number; used: number; pending: number };
	sickLeave: { total: number; used: number; pending: number };
	unpaidLeave: { total: number; used: number; pending: number };
	createdAt: Date;
	updatedAt: Date;
}

// TimeOff Schema
const TimeOffSchema = new Schema<ITimeOff>(
	{
		employee: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Employee is required"],
		},
		type: {
			type: String,
			enum: ["paid_time_off", "sick_leave", "unpaid_leave", "maternity", "paternity", "bereavement", "other"],
			required: [true, "Leave type is required"],
		},
		startDate: {
			type: Date,
			required: [true, "Start date is required"],
		},
		endDate: {
			type: Date,
			required: [true, "End date is required"],
		},
		days: {
			type: Number,
			required: true,
			min: [0.5, "Minimum leave is half a day"],
		},
		reason: {
			type: String,
			required: [true, "Reason is required"],
			trim: true,
		},
		status: {
			type: String,
			enum: ["pending", "approved", "rejected", "cancelled"],
			default: "pending",
		},
		attachment: {
			type: String,
		},
		approvedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		approvedAt: {
			type: Date,
		},
		rejectionReason: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
TimeOffSchema.index({ employee: 1, startDate: 1, endDate: 1 });
TimeOffSchema.index({ status: 1 });
TimeOffSchema.index({ createdAt: -1 });

// Calculate days before saving
TimeOffSchema.pre("save", function () {
	if (this.isModified("startDate") || this.isModified("endDate")) {
		const start = new Date(this.startDate);
		const end = new Date(this.endDate);
		const diffTime = Math.abs(end.getTime() - start.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
		this.days = diffDays;
	}
});

// Leave Balance Schema
const LeaveBalanceSchema = new Schema<ILeaveBalance>(
	{
		employee: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: false,
		},
		year: {
			type: Number,
			required: true,
		},
		paidTimeOff: {
			total: { type: Number, default: 20 },
			used: { type: Number, default: 0 },
			pending: { type: Number, default: 0 },
		},
		sickLeave: {
			total: { type: Number, default: 10 },
			used: { type: Number, default: 0 },
			pending: { type: Number, default: 0 },
		},
		unpaidLeave: {
			total: { type: Number, default: 30 },
			used: { type: Number, default: 0 },
			pending: { type: Number, default: 0 },
		},
	},
	{
		timestamps: true,
	}
);

// Compound index for employee + year
LeaveBalanceSchema.index({ employee: 1, year: 1 }, { unique: true });

const TimeOff: Model<ITimeOff> =
	mongoose.models.TimeOff || mongoose.model<ITimeOff>("TimeOff", TimeOffSchema);

const LeaveBalance: Model<ILeaveBalance> =
	mongoose.models.LeaveBalance || mongoose.model<ILeaveBalance>("LeaveBalance", LeaveBalanceSchema);

export { TimeOff, LeaveBalance };
export default TimeOff;
