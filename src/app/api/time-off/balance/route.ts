import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { LeaveBalance } from "@/models/TimeOff";
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

// GET - Get leave balance for current user
export async function GET(request: NextRequest) {
	try {
		const auth = await verifyAuth(request);
		if (!auth) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectToDatabase();

		const { searchParams } = new URL(request.url);
		const yearParam = searchParams.get("year");
		const employeeId = searchParams.get("employeeId");
		
		const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

		// Determine which employee to fetch balance for
		let targetEmployeeId = auth.userId;
		if (employeeId && (auth.role === "admin" || auth.role === "hr")) {
			targetEmployeeId = employeeId;
		}

		let balance = await LeaveBalance.findOne({
			employee: new mongoose.Types.ObjectId(targetEmployeeId),
			year,
		});

		// If no balance exists, create default
		if (!balance) {
			balance = await LeaveBalance.create({
				employee: new mongoose.Types.ObjectId(targetEmployeeId),
				year,
				paidTimeOff: { total: 20, used: 0, pending: 0 },
				sickLeave: { total: 10, used: 0, pending: 0 },
				unpaidLeave: { total: 30, used: 0, pending: 0 },
			});
		}

		return NextResponse.json({
			balance: {
				year: balance.year,
				paidTimeOff: {
					...balance.paidTimeOff,
					available: balance.paidTimeOff.total - balance.paidTimeOff.used - balance.paidTimeOff.pending,
				},
				sickLeave: {
					...balance.sickLeave,
					available: balance.sickLeave.total - balance.sickLeave.used - balance.sickLeave.pending,
				},
				unpaidLeave: {
					...balance.unpaidLeave,
					available: balance.unpaidLeave.total - balance.unpaidLeave.used - balance.unpaidLeave.pending,
				},
			},
		});
	} catch (error) {
		console.error("Error fetching leave balance:", error);
		return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 });
	}
}
