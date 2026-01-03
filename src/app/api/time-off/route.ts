import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TimeOff, LeaveBalance } from "@/models/TimeOff";
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

// GET - List leave requests
export async function GET(request: NextRequest) {
	try {
		const auth = await verifyAuth(request);
		if (!auth) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectToDatabase();

		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const type = searchParams.get("type");
		const view = searchParams.get("view"); // "my" or "all"

		// Build query
		const query: Record<string, unknown> = {};

		// Regular employees can only see their own
		if (auth.role === "employee" || view === "my") {
			query.employee = new mongoose.Types.ObjectId(auth.userId);
		}

		if (status && status !== "all") {
			query.status = status;
		}

		if (type) {
			query.type = type;
		}

		const timeOffs = await TimeOff.find(query)
			.populate("employee", "name email avatar department position")
			.populate("approvedBy", "name email")
			.sort({ createdAt: -1 });

		const requests = timeOffs
			.filter((t) => t.employee !== null)
			.map((t) => {
				const emp = t.employee as unknown as { _id: mongoose.Types.ObjectId; name: string; email: string; avatar?: string; department?: string; position?: string };
				const approver = t.approvedBy as unknown as { _id: mongoose.Types.ObjectId; name: string; email: string } | undefined;
			
				return {
					id: t._id.toString(),
					employee: {
						id: emp?._id?.toString() || "",
						name: emp?.name || "Unknown",
						email: emp?.email || "",
						avatar: emp?.avatar,
						department: emp?.department,
						position: emp?.position,
					},
					type: t.type,
					startDate: t.startDate,
					endDate: t.endDate,
					days: t.days,
					reason: t.reason,
					status: t.status,
					attachment: t.attachment,
					approvedBy: approver ? {
						id: approver._id.toString(),
						name: approver.name,
					} : null,
					approvedAt: t.approvedAt,
					rejectionReason: t.rejectionReason,
					createdAt: t.createdAt,
				};
			});

		return NextResponse.json({ requests }, { status: 200 });
	} catch (error) {
		console.error("Error fetching time-off requests:", error);
		return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
	}
}

// POST - Create leave request
export async function POST(request: NextRequest) {
	try {
		const auth = await verifyAuth(request);
		if (!auth) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectToDatabase();

		const body = await request.json();
		const { type, startDate, endDate, reason, attachment } = body;

		// Validate required fields
		if (!type || !startDate || !endDate || !reason) {
			return NextResponse.json(
				{ error: "Type, start date, end date, and reason are required" },
				{ status: 400 }
			);
		}

		// Calculate days
		const start = new Date(startDate);
		const end = new Date(endDate);
		
		if (end < start) {
			return NextResponse.json(
				{ error: "End date must be after start date" },
				{ status: 400 }
			);
		}

		const diffTime = Math.abs(end.getTime() - start.getTime());
		const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

		// Create leave request
		const timeOff = await TimeOff.create({
			employee: new mongoose.Types.ObjectId(auth.userId),
			type,
			startDate: start,
			endDate: end,
			days,
			reason,
			attachment: attachment || "",
			status: "pending",
		});

		// Update leave balance (pending)
		const year = new Date().getFullYear();
		const balanceField = type === "paid_time_off" ? "paidTimeOff" : type === "sick_leave" ? "sickLeave" : "unpaidLeave";
		
		await LeaveBalance.findOneAndUpdate(
			{ employee: new mongoose.Types.ObjectId(auth.userId), year },
			{ $inc: { [`${balanceField}.pending`]: days } },
			{ upsert: true }
		);

		return NextResponse.json(
			{
				message: "Leave request submitted successfully",
				request: {
					id: timeOff._id.toString(),
					type: timeOff.type,
					startDate: timeOff.startDate,
					endDate: timeOff.endDate,
					days: timeOff.days,
					status: timeOff.status,
				},
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating leave request:", error);
		return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
	}
}
