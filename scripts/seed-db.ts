import { connectToDatabase } from "../src/lib/mongodb";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define User schema directly to avoid module resolution issues
const UserSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	name: { type: String, required: true },
	role: { type: String, enum: ["admin", "hr", "employee"], default: "employee" },
	avatar: { type: String, default: "" },
	department: { type: String, default: "" },
	position: { type: String, default: "" },
	joinDate: { type: Date, default: Date.now },
	phone: { type: String, default: "" },
	status: { type: String, enum: ["active", "inactive", "on_leave"], default: "active" },
	loginId: { type: String, unique: true, sparse: true },
	mustChangePassword: { type: Boolean, default: false },
}, { timestamps: true });

// Define Attendance schema
const AttendanceSchema = new mongoose.Schema({
	employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	date: { type: Date, required: true },
	checkIn: { type: Date },
	checkOut: { type: Date },
	status: { type: String, enum: ["present", "absent", "late", "half_day", "on_leave"], default: "absent" },
	workHours: { type: Number, default: 0 },
	breakTime: { type: Number, default: 0 },
	overtime: { type: Number, default: 0 },
	notes: { type: String, default: "" },
	location: { type: String, default: "" },
}, { timestamps: true });

// Define TimeOff schema
const TimeOffSchema = new mongoose.Schema({
	employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	type: { type: String, enum: ["paid_time_off", "sick_leave", "unpaid_leave", "maternity", "paternity", "bereavement", "other"], required: true },
	startDate: { type: Date, required: true },
	endDate: { type: Date, required: true },
	days: { type: Number, required: true },
	reason: { type: String, required: true },
	status: { type: String, enum: ["pending", "approved", "rejected", "cancelled"], default: "pending" },
	attachment: { type: String },
	approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	approvedAt: { type: Date },
	rejectionReason: { type: String },
}, { timestamps: true });

// Define LeaveBalance schema
const LeaveBalanceSchema = new mongoose.Schema({
	employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	year: { type: Number, required: true },
	paidTimeOff: { total: { type: Number, default: 20 }, used: { type: Number, default: 0 }, pending: { type: Number, default: 0 } },
	sickLeave: { total: { type: Number, default: 10 }, used: { type: Number, default: 0 }, pending: { type: Number, default: 0 } },
	unpaidLeave: { total: { type: Number, default: 30 }, used: { type: Number, default: 0 }, pending: { type: Number, default: 0 } },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
const TimeOff = mongoose.models.TimeOff || mongoose.model("TimeOff", TimeOffSchema);
const LeaveBalance = mongoose.models.LeaveBalance || mongoose.model("LeaveBalance", LeaveBalanceSchema);

// Only 3 core users: admin, hr, employee
const coreUsers = [
	{
		email: "admin@dayflow.com",
		password: "demo123",
		name: "Alex Thompson",
		role: "admin",
		avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
		department: "Management",
		position: "System Administrator",
		phone: "+1 (555) 123-4567",
		status: "active",
	},
	{
		email: "hr@dayflow.com",
		password: "demo123",
		name: "Sarah Johnson",
		role: "hr",
		avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
		department: "Human Resources",
		position: "HR Manager",
		phone: "+1 (555) 234-5678",
		status: "active",
	},
	{
		email: "employee@dayflow.com",
		password: "demo123",
		name: "Michael Chen",
		role: "employee",
		avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
		department: "Engineering",
		position: "Senior Developer",
		phone: "+1 (555) 345-6789",
		status: "active",
	},
];

async function seedDatabase() {
	try {
		console.log("🔌 Connecting to MongoDB...");
		await connectToDatabase();
		console.log("✅ Connected to MongoDB");

		console.log("🗑️  Clearing existing data...");
		await User.deleteMany({});
		await Attendance.deleteMany({});
		await TimeOff.deleteMany({});
		await LeaveBalance.deleteMany({});

		console.log("👤 Creating core users...");
		const createdUsers: { _id: mongoose.Types.ObjectId; email: string; role: string; name: string }[] = [];
		
		for (const userData of coreUsers) {
			const salt = await bcrypt.genSalt(12);
			const hashedPassword = await bcrypt.hash(userData.password, salt);

			const user = await User.create({
				...userData,
				password: hashedPassword,
				joinDate: new Date("2024-01-15"),
			});
			
			createdUsers.push({ _id: user._id, email: userData.email, role: userData.role, name: userData.name });
			console.log(`   ✅ Created: ${userData.email} (${userData.role})`);
		}

		// Create attendance records for the past 7 days
		console.log("\n📅 Creating attendance records...");
		const today = new Date();
		
		for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
			const date = new Date(today);
			date.setDate(today.getDate() - dayOffset);
			date.setHours(0, 0, 0, 0);
			
			// Skip weekends
			if (date.getDay() === 0 || date.getDay() === 6) continue;
			
			for (const user of createdUsers) {
				const random = Math.random();
				
				// 85% present, 5% late, 5% on leave, 5% absent
				let status: string;
				let checkIn: Date | undefined;
				let checkOut: Date | undefined;
				let workHours = 0;
				
				if (random < 0.85) {
					status = "present";
					checkIn = new Date(date);
					checkIn.setHours(8 + Math.floor(Math.random() * 1), Math.floor(Math.random() * 45), 0, 0);
					checkOut = new Date(date);
					checkOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0);
					workHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
				} else if (random < 0.90) {
					status = "late";
					checkIn = new Date(date);
					checkIn.setHours(9 + Math.floor(Math.random() * 2), 15 + Math.floor(Math.random() * 45), 0, 0);
					checkOut = new Date(date);
					checkOut.setHours(18 + Math.floor(Math.random() * 1), Math.floor(Math.random() * 60), 0, 0);
					workHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
				} else if (random < 0.95) {
					status = "on_leave";
				} else {
					status = "absent";
				}
				
				await Attendance.create({
					employee: user._id,
					date,
					checkIn,
					checkOut,
					status,
					workHours: Math.round(workHours * 10) / 10,
					breakTime: 1,
					overtime: Math.max(0, workHours - 8),
				});
			}
		}
		console.log("   ✅ Attendance records created");

		// Create leave requests
		console.log("\n🏖️  Creating leave requests...");
		const hrUser = createdUsers.find(u => u.role === "hr");
		const employeeUser = createdUsers.find(u => u.email === "employee@dayflow.com");
		
		if (employeeUser && hrUser) {
			// Approved leave
			await TimeOff.create({
				employee: employeeUser._id,
				type: "paid_time_off",
				startDate: new Date(today.getFullYear(), today.getMonth() - 1, 15),
				endDate: new Date(today.getFullYear(), today.getMonth() - 1, 17),
				days: 3,
				reason: "Family vacation",
				status: "approved",
				approvedBy: hrUser._id,
				approvedAt: new Date(today.getFullYear(), today.getMonth() - 1, 10),
			});
			
			// Pending leave
			await TimeOff.create({
				employee: employeeUser._id,
				type: "sick_leave",
				startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
				endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8),
				days: 2,
				reason: "Medical appointment",
				status: "pending",
			});
			
			console.log("   ✅ Leave requests created");
		}

		// Create leave balances
		console.log("\n💰 Creating leave balances...");
		for (const user of createdUsers) {
			await LeaveBalance.create({
				employee: user._id,
				year: today.getFullYear(),
				paidTimeOff: { total: 20, used: Math.floor(Math.random() * 5), pending: Math.floor(Math.random() * 2) },
				sickLeave: { total: 10, used: Math.floor(Math.random() * 3), pending: 0 },
				unpaidLeave: { total: 30, used: 0, pending: 0 },
			});
		}
		console.log("   ✅ Leave balances created");

		console.log("\n🎉 Database seeded successfully!");
		console.log("\n📋 Accounts:");
		console.log("   Email: admin@dayflow.com    Password: demo123 (Admin)");
		console.log("   Email: hr@dayflow.com       Password: demo123 (HR Manager)");
		console.log("   Email: employee@dayflow.com Password: demo123 (Employee)");

		process.exit(0);
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		process.exit(1);
	}
}

seedDatabase();
