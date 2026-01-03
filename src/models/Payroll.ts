import mongoose, { Schema, Document, Model } from "mongoose";

export type PayrollStatus = "draft" | "pending" | "approved" | "paid" | "rejected";
export type PaymentMethod = "bank_transfer" | "check" | "cash";

export interface ISalaryComponent {
	name: string;
	type: "earning" | "deduction";
	amount: number;
	isPercentage?: boolean;
	percentageOf?: string;
}

export interface IPayroll extends Document {
	_id: mongoose.Types.ObjectId;
	employee: mongoose.Types.ObjectId;
	month: number; // 1-12
	year: number;
	basicSalary: number;
	components: ISalaryComponent[];
	grossSalary: number;
	totalDeductions: number;
	netSalary: number;
	paymentMethod: PaymentMethod;
	paymentDate?: Date;
	status: PayrollStatus;
	remarks?: string;
	approvedBy?: mongoose.Types.ObjectId;
	approvedAt?: Date;
	createdBy: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

interface IPayrollModel extends Model<IPayroll> {
	findByEmployeeAndPeriod(
		employeeId: string,
		month: number,
		year: number
	): Promise<IPayroll | null>;
}

const SalaryComponentSchema = new Schema<ISalaryComponent>(
	{
		name: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			enum: ["earning", "deduction"],
			required: true,
		},
		amount: {
			type: Number,
			required: true,
			min: 0,
		},
		isPercentage: {
			type: Boolean,
			default: false,
		},
		percentageOf: {
			type: String,
			default: "basicSalary",
		},
	},
	{ _id: false }
);

const PayrollSchema = new Schema<IPayroll>(
	{
		employee: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Employee is required"],
		},
		month: {
			type: Number,
			required: [true, "Month is required"],
			min: 1,
			max: 12,
		},
		year: {
			type: Number,
			required: [true, "Year is required"],
		},
		basicSalary: {
			type: Number,
			required: [true, "Basic salary is required"],
			min: 0,
		},
		components: {
			type: [SalaryComponentSchema],
			default: [],
		},
		grossSalary: {
			type: Number,
			required: true,
			min: 0,
		},
		totalDeductions: {
			type: Number,
			required: true,
			min: 0,
		},
		netSalary: {
			type: Number,
			required: true,
			min: 0,
		},
		paymentMethod: {
			type: String,
			enum: ["bank_transfer", "check", "cash"],
			default: "bank_transfer",
		},
		paymentDate: {
			type: Date,
		},
		status: {
			type: String,
			enum: ["draft", "pending", "approved", "paid", "rejected"],
			default: "draft",
		},
		remarks: {
			type: String,
			default: "",
		},
		approvedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		approvedAt: {
			type: Date,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

// Compound index to ensure unique payroll per employee per month/year
PayrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

// Index for faster queries
PayrollSchema.index({ status: 1 });
PayrollSchema.index({ year: 1, month: 1 });

// Static method to find payroll by employee and period
PayrollSchema.statics.findByEmployeeAndPeriod = async function (
	employeeId: string,
	month: number,
	year: number
): Promise<IPayroll | null> {
	return this.findOne({ employee: employeeId, month, year });
};

// Pre-save middleware to calculate totals
PayrollSchema.pre("save", function () {
	// Calculate gross salary (basic + earnings)
	const earnings = this.components
		.filter((c) => c.type === "earning")
		.reduce((sum, c) => {
			if (c.isPercentage) {
				return sum + (this.basicSalary * c.amount) / 100;
			}
			return sum + c.amount;
		}, 0);

	this.grossSalary = this.basicSalary + earnings;

	// Calculate total deductions
	this.totalDeductions = this.components
		.filter((c) => c.type === "deduction")
		.reduce((sum, c) => {
			if (c.isPercentage) {
				return sum + (this.grossSalary * c.amount) / 100;
			}
			return sum + c.amount;
		}, 0);

	// Calculate net salary
	this.netSalary = this.grossSalary - this.totalDeductions;
});

const Payroll: IPayrollModel =
	(mongoose.models.Payroll as IPayrollModel) ||
	mongoose.model<IPayroll, IPayrollModel>("Payroll", PayrollSchema);

export default Payroll;
