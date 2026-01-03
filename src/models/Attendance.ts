import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type AttendanceStatus = "present" | "absent" | "late" | "half_day" | "on_leave";

export interface IAttendance extends Document {
	_id: Types.ObjectId;
	employee: Types.ObjectId;
	date: Date;
	checkIn?: Date;
	checkOut?: Date;
	status: AttendanceStatus;
	workHours: number;
	breakTime: number;
	overtime: number;
	notes?: string;
	location?: string;
	createdAt: Date;
	updatedAt: Date;
}

interface IAttendanceModel extends Model<IAttendance> {
	findByEmployeeAndDate(employeeId: string, date: Date): Promise<IAttendance | null>;
	getTodayAttendance(employeeId: string): Promise<IAttendance | null>;
}

const AttendanceSchema = new Schema<IAttendance>(
	{
		employee: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Employee is required"],
		},
		date: {
			type: Date,
			required: [true, "Date is required"],
		},
		checkIn: {
			type: Date,
		},
		checkOut: {
			type: Date,
		},
		status: {
			type: String,
			enum: ["present", "absent", "late", "half_day", "on_leave"],
			default: "absent",
		},
		workHours: {
			type: Number,
			default: 0,
		},
		breakTime: {
			type: Number,
			default: 0,
		},
		overtime: {
			type: Number,
			default: 0,
		},
		notes: {
			type: String,
			default: "",
		},
		location: {
			type: String,
			default: "",
		},
	},
	{
		timestamps: true,
	}
);

// Index for efficient queries
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ date: 1 });

// Static method to find attendance by employee and date
AttendanceSchema.statics.findByEmployeeAndDate = async function (
	employeeId: string,
	date: Date
): Promise<IAttendance | null> {
	const startOfDay = new Date(date);
	startOfDay.setHours(0, 0, 0, 0);
	const endOfDay = new Date(date);
	endOfDay.setHours(23, 59, 59, 999);

	return this.findOne({
		employee: new mongoose.Types.ObjectId(employeeId),
		date: { $gte: startOfDay, $lte: endOfDay },
	}).populate("employee", "name email avatar department position");
};

// Static method to get today's attendance for an employee
AttendanceSchema.statics.getTodayAttendance = async function (
	employeeId: string
): Promise<IAttendance | null> {
	const today = new Date();
	const startOfDay = new Date(today);
	startOfDay.setHours(0, 0, 0, 0);
	const endOfDay = new Date(today);
	endOfDay.setHours(23, 59, 59, 999);

	return this.findOne({
		employee: new mongoose.Types.ObjectId(employeeId),
		date: { $gte: startOfDay, $lte: endOfDay },
	}).populate("employee", "name email avatar department position");
};

// Calculate work hours on save
AttendanceSchema.pre("save", function () {
	if (this.checkIn && this.checkOut) {
		const diffMs = this.checkOut.getTime() - this.checkIn.getTime();
		const diffHours = diffMs / (1000 * 60 * 60);
		this.workHours = Math.max(0, diffHours - this.breakTime);

		// Calculate overtime (standard work hours = 8)
		const standardHours = 8;
		this.overtime = Math.max(0, this.workHours - standardHours);

		// Update status based on check-in time
		const checkInHour = this.checkIn.getHours();
		const checkInMinutes = this.checkIn.getMinutes();

		if (checkInHour > 9 || (checkInHour === 9 && checkInMinutes > 15)) {
			this.status = "late";
		} else {
			this.status = "present";
		}

		// Check for half day
		if (this.workHours < 4) {
			this.status = "half_day";
		}
	}
});

const Attendance: IAttendanceModel =
	(mongoose.models.Attendance as IAttendanceModel) ||
	mongoose.model<IAttendance, IAttendanceModel>("Attendance", AttendanceSchema);

export default Attendance;
