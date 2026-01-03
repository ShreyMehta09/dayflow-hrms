import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Attendance from "@/models/Attendance";
import { TimeOff } from "@/models/TimeOff";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dayflow-jwt-secret-key";

// Helper to verify auth
async function verifyAuth(request: NextRequest) {
	const token = request.cookies.get("auth-token")?.value;
	if (!token) return null;

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
		return decoded;
	} catch {
		return null;
	}
}

// GET - Get dashboard statistics
export async function GET(request: NextRequest) {
	try {
		const auth = await verifyAuth(request);
		if (!auth) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectToDatabase();

		const today = new Date();
		const startOfDay = new Date(today);
		startOfDay.setHours(0, 0, 0, 0);
		const endOfDay = new Date(today);
		endOfDay.setHours(23, 59, 59, 999);

		// Get total employees count
		const totalEmployees = await User.countDocuments({ status: { $ne: "inactive" } });

		// Get today's attendance
		const todayAttendance = await Attendance.find({
			date: { $gte: startOfDay, $lte: endOfDay },
		});

		const presentToday = todayAttendance.filter((a) => a.checkIn).length;
		const lateToday = todayAttendance.filter((a) => a.status === "late").length;
		const onLeaveToday = todayAttendance.filter((a) => a.status === "on_leave").length;

		// Get pending leave requests
		const pendingLeaveRequests = await TimeOff.countDocuments({ status: "pending" });

		// Get recent activities (latest leave requests)
		const recentLeaveRequests = await TimeOff.find()
			.populate("employee", "name avatar department")
			.sort({ createdAt: -1 })
			.limit(5);

		// Get employees on leave today
		const employeesOnLeave = await TimeOff.find({
			status: "approved",
			startDate: { $lte: endOfDay },
			endDate: { $gte: startOfDay },
		}).populate("employee", "name avatar department position");

		// Get upcoming birthdays (mock - would need birthdate field in User model)
		const upcomingBirthdays: unknown[] = [];

		// For employee dashboard - get their own stats
		let myStats = null;
		if (auth.role === "employee") {
			const myAttendance = await Attendance.find({
				employee: auth.userId,
				date: {
					$gte: new Date(today.getFullYear(), today.getMonth(), 1),
					$lte: endOfDay,
				},
			});

			const presentDays = myAttendance.filter((a) => a.checkIn).length;
			const lateDays = myAttendance.filter((a) => a.status === "late").length;
			const totalWorkHours = myAttendance.reduce((acc, a) => acc + (a.workHours || 0), 0);

			const myLeaveRequests = await TimeOff.find({ employee: auth.userId });
			const pendingRequests = myLeaveRequests.filter((l) => l.status === "pending").length;
			const approvedRequests = myLeaveRequests.filter((l) => l.status === "approved").length;

			myStats = {
				presentDays,
				lateDays,
				totalWorkHours: Math.round(totalWorkHours * 10) / 10,
				avgWorkHours: presentDays > 0 ? Math.round((totalWorkHours / presentDays) * 10) / 10 : 0,
				pendingLeaveRequests: pendingRequests,
				approvedLeaveRequests: approvedRequests,
			};
		}

		// Build response based on role
		const stats = {
			totalEmployees,
			presentToday,
			absentToday: totalEmployees - presentToday - onLeaveToday,
			lateToday,
			onLeaveToday,
			pendingLeaveRequests,
			attendanceRate: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0,
		};

		const activities = recentLeaveRequests.map((req) => {
			const emp = req.employee as unknown as { name: string; avatar?: string; department?: string };
			return {
				id: req._id.toString(),
				type: "leave_request",
				employeeName: emp.name,
				employeeAvatar: emp.avatar,
				department: emp.department,
				leaveType: req.type,
				status: req.status,
				days: req.days,
				createdAt: req.createdAt,
			};
		});

		const onLeave = employeesOnLeave.map((leave) => {
			const emp = leave.employee as unknown as { _id: string; name: string; avatar?: string; department?: string; position?: string };
			return {
				id: emp._id.toString(),
				name: emp.name,
				avatar: emp.avatar,
				department: emp.department,
				position: emp.position,
				leaveType: leave.type,
				returnDate: leave.endDate,
			};
		});

		return NextResponse.json({
			stats,
			activities,
			onLeave,
			upcomingBirthdays,
			myStats,
		});
	} catch (error) {
		console.error("Error fetching dashboard stats:", error);
		return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
	}
}
