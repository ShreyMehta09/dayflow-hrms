import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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

// GET - List attendance records
export async function GET(request: NextRequest) {
	try {
		const auth = await verifyAuth(request);
		if (!auth) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectToDatabase();

		const { searchParams } = new URL(request.url);
		const dateStr = searchParams.get("date");
		const employeeId = searchParams.get("employeeId");
		const startDateStr = searchParams.get("startDate");
		const endDateStr = searchParams.get("endDate");

		// Build query
		const query: Record<string, unknown> = {};

		// If specific date requested
		if (dateStr) {
			const date = new Date(dateStr);
			const startOfDay = new Date(date);
			startOfDay.setHours(0, 0, 0, 0);
			const endOfDay = new Date(date);
			endOfDay.setHours(23, 59, 59, 999);
			query.date = { $gte: startOfDay, $lte: endOfDay };
		}

		// Date range query
		if (startDateStr && endDateStr) {
			const startDate = new Date(startDateStr);
			startDate.setHours(0, 0, 0, 0);
			const endDate = new Date(endDateStr);
			endDate.setHours(23, 59, 59, 999);
			query.date = { $gte: startDate, $lte: endDate };
		}

		// Employee filter - regular employees can only see their own
		if (auth.role === "employee") {
			query.employee = new mongoose.Types.ObjectId(auth.userId);
		} else if (employeeId) {
			query.employee = new mongoose.Types.ObjectId(employeeId);
		}

		const attendance = await Attendance.find(query)
			.populate("employee", "name email avatar department position")
			.sort({ date: -1, checkIn: -1 });

		const records = attendance.map((a) => {
			const emp = a.employee as unknown as { _id: mongoose.Types.ObjectId; name: string; email: string; avatar?: string; department?: string };
			return {
				id: a._id.toString(),
				employee: {
					id: emp._id.toString(),
					name: emp.name,
					email: emp.email,
					avatar: emp.avatar,
					department: emp.department,
				},
				date: a.date,
				checkIn: a.checkIn,
				checkOut: a.checkOut,
				status: a.status,
				workHours: a.workHours,
				breakTime: a.breakTime,
				overtime: a.overtime,
				notes: a.notes,
			};
		});

		return NextResponse.json({ attendance: records }, { status: 200 });
	} catch (error) {
		console.error("Error fetching attendance:", error);
		return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
	}
}

// POST - Check in/out or create attendance record
export async function POST(request: NextRequest) {
	try {
		const auth = await verifyAuth(request);
		if (!auth) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectToDatabase();

		const body = await request.json();
		const { action, employeeId, notes, location } = body;

		// Determine which employee ID to use
		const targetEmployeeId = auth.role === "employee" ? auth.userId : (employeeId || auth.userId);

		const today = new Date();
		const startOfDay = new Date(today);
		startOfDay.setHours(0, 0, 0, 0);
		const endOfDay = new Date(today);
		endOfDay.setHours(23, 59, 59, 999);

		// Find today's attendance record
		let attendance = await Attendance.findOne({
			employee: new mongoose.Types.ObjectId(targetEmployeeId),
			date: { $gte: startOfDay, $lte: endOfDay },
		});

		if (action === "check-in") {
			if (attendance?.checkIn) {
				return NextResponse.json(
					{ error: "Already checked in today" },
					{ status: 400 }
				);
			}

			if (!attendance) {
				attendance = new Attendance({
					employee: new mongoose.Types.ObjectId(targetEmployeeId),
					date: new Date(),
					checkIn: new Date(),
					status: "present",
					notes: notes || "",
					location: location || "",
				});
			} else {
				attendance.checkIn = new Date();
				attendance.status = "present";
				if (notes) attendance.notes = notes;
				if (location) attendance.location = location;
			}

			await attendance.save();

			return NextResponse.json({
				message: "Checked in successfully",
				attendance: {
					id: attendance._id.toString(),
					checkIn: attendance.checkIn,
					status: attendance.status,
				},
			});
		} else if (action === "check-out") {
			if (!attendance?.checkIn) {
				return NextResponse.json(
					{ error: "Must check in before checking out" },
					{ status: 400 }
				);
			}

			if (attendance.checkOut) {
				return NextResponse.json(
					{ error: "Already checked out today" },
					{ status: 400 }
				);
			}

			attendance.checkOut = new Date();
			if (notes) attendance.notes = notes;
			await attendance.save();

			return NextResponse.json({
				message: "Checked out successfully",
				attendance: {
					id: attendance._id.toString(),
					checkIn: attendance.checkIn,
					checkOut: attendance.checkOut,
					workHours: attendance.workHours,
					status: attendance.status,
				},
			});
		}

		return NextResponse.json({ error: "Invalid action" }, { status: 400 });
	} catch (error) {
		console.error("Error processing attendance:", error);
		return NextResponse.json({ error: "Failed to process attendance" }, { status: 500 });
	}
}
