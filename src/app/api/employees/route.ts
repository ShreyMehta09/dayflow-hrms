import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Attendance from "@/models/Attendance";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dayflow-jwt-secret-key";

// Helper to verify auth and get user role
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

// GET - List all employees
export async function GET(request: NextRequest) {
	try {
		const auth = await verifyAuth(request);
		if (!auth) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectToDatabase();

		const { searchParams } = new URL(request.url);
		const search = searchParams.get("search") || "";
		const department = searchParams.get("department") || "";
		const status = searchParams.get("status") || "";

		// Build query
		const query: Record<string, unknown> = {};
		
		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
				{ position: { $regex: search, $options: "i" } },
			];
		}

		if (department) {
			query.department = department;
		}

		if (status) {
			query.status = status;
		}

		const employees = await User.find(query)
			.select("-password")
			.sort({ name: 1 });

		// Get today's attendance for each employee
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const endOfDay = new Date(today);
		endOfDay.setHours(23, 59, 59, 999);

		const attendanceRecords = await Attendance.find({
			date: { $gte: today, $lte: endOfDay },
		});

		const attendanceMap = new Map(
			attendanceRecords.map((a) => [a.employee.toString(), a])
		);

		const employeesWithAttendance = employees.map((emp) => {
			const attendance = attendanceMap.get(emp._id.toString());
			return {
				id: emp._id.toString(),
				email: emp.email,
				name: emp.name,
				role: emp.role,
				avatar: emp.avatar,
				department: emp.department,
				position: emp.position,
				joinDate: emp.joinDate,
				phone: emp.phone,
				status: attendance?.status === "on_leave" 
					? "on_leave" 
					: attendance?.checkIn 
						? "present" 
						: "absent",
			};
		});

		return NextResponse.json({ employees: employeesWithAttendance }, { status: 200 });
	} catch (error) {
		console.error("Error fetching employees:", error);
		return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
	}
}

// POST - Create new employee
export async function POST(request: NextRequest) {
	try {
		const auth = await verifyAuth(request);
		if (!auth || (auth.role !== "admin" && auth.role !== "hr")) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectToDatabase();

		const body = await request.json();
		const { email, password, name, department, position, phone, role } = body;

		// Validate required fields
		if (!email || !password || !name) {
			return NextResponse.json(
				{ error: "Email, password, and name are required" },
				{ status: 400 }
			);
		}

		// Check if email exists
		const existingUser = await User.findOne({ email: email.toLowerCase() });
		if (existingUser) {
			return NextResponse.json(
				{ error: "Email already exists" },
				{ status: 400 }
			);
		}

		// Create user
		const user = await User.create({
			email: email.toLowerCase(),
			password,
			name,
			department: department || "",
			position: position || "",
			phone: phone || "",
			role: role || "employee",
			status: "active",
		});

		return NextResponse.json(
			{
				message: "Employee created successfully",
				employee: {
					id: user._id.toString(),
					email: user.email,
					name: user.name,
					role: user.role,
					department: user.department,
					position: user.position,
				},
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating employee:", error);
		return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
	}
}
