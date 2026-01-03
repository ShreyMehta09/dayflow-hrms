import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
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

// GET - Get today's attendance for current user
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

		const attendance = await Attendance.findOne({
			employee: auth.userId,
			date: { $gte: startOfDay, $lte: endOfDay },
		});

		if (!attendance) {
			return NextResponse.json({
				today: null,
				isCheckedIn: false,
				isCheckedOut: false,
			});
		}

		return NextResponse.json({
			today: {
				id: attendance._id.toString(),
				checkIn: attendance.checkIn,
				checkOut: attendance.checkOut,
				status: attendance.status,
				workHours: attendance.workHours,
				breakTime: attendance.breakTime,
				overtime: attendance.overtime,
			},
			isCheckedIn: !!attendance.checkIn,
			isCheckedOut: !!attendance.checkOut,
		});
	} catch (error) {
		console.error("Error fetching today's attendance:", error);
		return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
	}
}
