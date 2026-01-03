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

// GET - Get single leave request
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const auth = await verifyAuth(request);
		if (!auth) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		await connectToDatabase();

		const timeOff = await TimeOff.findById(id)
			.populate("employee", "name email avatar department")
			.populate("approvedBy", "name email");

		if (!timeOff) {
			return NextResponse.json({ error: "Request not found" }, { status: 404 });
		}

		// Check if user can view this request
		const empId = (timeOff.employee as unknown as { _id: mongoose.Types.ObjectId })._id.toString();
		if (auth.role === "employee" && empId !== auth.userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		return NextResponse.json({ request: timeOff });
	} catch (error) {
		console.error("Error fetching leave request:", error);
		return NextResponse.json({ error: "Failed to fetch request" }, { status: 500 });
	}
}

// PUT - Approve/Reject leave request
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const auth = await verifyAuth(request);
		if (!auth) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Only admin/hr can approve/reject
		if (auth.role !== "admin" && auth.role !== "hr") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const { id } = await params;
		await connectToDatabase();

		const body = await request.json();
		const { action, rejectionReason } = body;

		if (!["approve", "reject"].includes(action)) {
			return NextResponse.json({ error: "Invalid action" }, { status: 400 });
		}

		const timeOff = await TimeOff.findById(id);

		if (!timeOff) {
			return NextResponse.json({ error: "Request not found" }, { status: 404 });
		}

		if (timeOff.status !== "pending") {
			return NextResponse.json(
				{ error: "Can only approve/reject pending requests" },
				{ status: 400 }
			);
		}

		const year = new Date(timeOff.startDate).getFullYear();
		const balanceField = timeOff.type === "paid_time_off" ? "paidTimeOff" : timeOff.type === "sick_leave" ? "sickLeave" : "unpaidLeave";

		if (action === "approve") {
			timeOff.status = "approved";
			timeOff.approvedBy = new mongoose.Types.ObjectId(auth.userId);
			timeOff.approvedAt = new Date();

			// Update leave balance: reduce pending, increase used
			await LeaveBalance.findOneAndUpdate(
				{ employee: timeOff.employee, year },
				{
					$inc: {
						[`${balanceField}.pending`]: -timeOff.days,
						[`${balanceField}.used`]: timeOff.days,
					},
				}
			);
		} else {
			timeOff.status = "rejected";
			timeOff.rejectionReason = rejectionReason || "Request rejected";

			// Update leave balance: reduce pending
			await LeaveBalance.findOneAndUpdate(
				{ employee: timeOff.employee, year },
				{ $inc: { [`${balanceField}.pending`]: -timeOff.days } }
			);
		}

		await timeOff.save();

		return NextResponse.json({
			message: `Request ${action}d successfully`,
			request: {
				id: timeOff._id.toString(),
				status: timeOff.status,
			},
		});
	} catch (error) {
		console.error("Error updating leave request:", error);
		return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
	}
}

// DELETE - Cancel leave request
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const auth = await verifyAuth(request);
		if (!auth) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		await connectToDatabase();

		const timeOff = await TimeOff.findById(id);

		if (!timeOff) {
			return NextResponse.json({ error: "Request not found" }, { status: 404 });
		}

		// Only owner or admin can cancel
		if (timeOff.employee.toString() !== auth.userId && auth.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		// Can only cancel pending requests
		if (timeOff.status !== "pending") {
			return NextResponse.json(
				{ error: "Can only cancel pending requests" },
				{ status: 400 }
			);
		}

		// Update balance
		const year = new Date(timeOff.startDate).getFullYear();
		const balanceField = timeOff.type === "paid_time_off" ? "paidTimeOff" : timeOff.type === "sick_leave" ? "sickLeave" : "unpaidLeave";

		await LeaveBalance.findOneAndUpdate(
			{ employee: timeOff.employee, year },
			{ $inc: { [`${balanceField}.pending`]: -timeOff.days } }
		);

		timeOff.status = "cancelled";
		await timeOff.save();

		return NextResponse.json({ message: "Request cancelled successfully" });
	} catch (error) {
		console.error("Error cancelling leave request:", error);
		return NextResponse.json({ error: "Failed to cancel request" }, { status: 500 });
	}
}
