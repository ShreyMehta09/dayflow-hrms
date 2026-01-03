import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Payroll from "@/models/Payroll";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dayflow-jwt-secret-key";

// Helper to verify auth and get user role
async function verifyAuth(request: NextRequest) {
	const token = request.cookies.get("auth-token")?.value;
	if (!token) return null;

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as {
			userId: string;
			role: string;
		};
		return decoded;
	} catch {
		return null;
	}
}

// GET - Get single payroll record
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

		const payroll = await Payroll.findById(id)
			.populate("employee", "name email department position avatar")
			.populate("approvedBy", "name")
			.populate("createdBy", "name");

		if (!payroll) {
			return NextResponse.json(
				{ error: "Payroll record not found" },
				{ status: 404 }
			);
		}

		// Employees can only view their own payroll
		if (
			auth.role === "employee" &&
			(payroll.employee as any)._id.toString() !== auth.userId
		) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		return NextResponse.json(
			{
				payroll: {
					id: payroll._id.toString(),
					employee: payroll.employee
						? {
								id: (payroll.employee as any)._id?.toString(),
								name: (payroll.employee as any).name,
								email: (payroll.employee as any).email,
								department: (payroll.employee as any).department,
								position: (payroll.employee as any).position,
								avatar: (payroll.employee as any).avatar,
						  }
						: null,
					month: payroll.month,
					year: payroll.year,
					basicSalary: payroll.basicSalary,
					components: payroll.components,
					grossSalary: payroll.grossSalary,
					totalDeductions: payroll.totalDeductions,
					netSalary: payroll.netSalary,
					paymentMethod: payroll.paymentMethod,
					paymentDate: payroll.paymentDate,
					status: payroll.status,
					remarks: payroll.remarks,
					approvedBy: payroll.approvedBy
						? (payroll.approvedBy as any).name
						: null,
					approvedAt: payroll.approvedAt,
					createdBy: payroll.createdBy ? (payroll.createdBy as any).name : null,
					createdAt: payroll.createdAt,
				},
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error fetching payroll:", error);
		return NextResponse.json(
			{ error: "Failed to fetch payroll record" },
			{ status: 500 }
		);
	}
}

// PUT - Update payroll record (Admin/HR only)
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const auth = await verifyAuth(request);
		if (!auth) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Only admin and HR can update payroll
		if (auth.role !== "admin" && auth.role !== "hr") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const { id } = await params;

		await connectToDatabase();

		const payroll = await Payroll.findById(id);
		if (!payroll) {
			return NextResponse.json(
				{ error: "Payroll record not found" },
				{ status: 404 }
			);
		}

		// Cannot update paid payroll
		if (payroll.status === "paid") {
			return NextResponse.json(
				{ error: "Cannot modify paid payroll record" },
				{ status: 400 }
			);
		}

		const body = await request.json();
		const {
			basicSalary,
			components,
			paymentMethod,
			status,
			remarks,
			paymentDate,
		} = body;

		// Update fields
		if (basicSalary !== undefined) payroll.basicSalary = basicSalary;
		if (components !== undefined) payroll.components = components;
		if (paymentMethod !== undefined) payroll.paymentMethod = paymentMethod;
		if (remarks !== undefined) payroll.remarks = remarks;
		if (paymentDate !== undefined) payroll.paymentDate = new Date(paymentDate);

		// Handle status changes
		if (status !== undefined && status !== payroll.status) {
			// Only admin can approve/reject
			if (
				(status === "approved" || status === "rejected") &&
				auth.role !== "admin"
			) {
				return NextResponse.json(
					{ error: "Only admin can approve or reject payroll" },
					{ status: 403 }
				);
			}

			payroll.status = status;

			if (status === "approved") {
				payroll.approvedBy = auth.userId as any;
				payroll.approvedAt = new Date();
			}

			if (status === "paid" && !payroll.paymentDate) {
				payroll.paymentDate = new Date();
			}
		}

		await payroll.save();
		await payroll.populate("employee", "name email department position");

		return NextResponse.json(
			{
				message: "Payroll updated successfully",
				payroll: {
					id: payroll._id.toString(),
					employee: {
						id: (payroll.employee as any)._id.toString(),
						name: (payroll.employee as any).name,
					},
					month: payroll.month,
					year: payroll.year,
					basicSalary: payroll.basicSalary,
					grossSalary: payroll.grossSalary,
					totalDeductions: payroll.totalDeductions,
					netSalary: payroll.netSalary,
					status: payroll.status,
				},
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error updating payroll:", error);
		return NextResponse.json(
			{ error: "Failed to update payroll record" },
			{ status: 500 }
		);
	}
}

// DELETE - Delete payroll record (Admin only)
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const auth = await verifyAuth(request);
		if (!auth) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Only admin can delete payroll
		if (auth.role !== "admin") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const { id } = await params;

		await connectToDatabase();

		const payroll = await Payroll.findById(id);
		if (!payroll) {
			return NextResponse.json(
				{ error: "Payroll record not found" },
				{ status: 404 }
			);
		}

		// Cannot delete paid payroll
		if (payroll.status === "paid") {
			return NextResponse.json(
				{ error: "Cannot delete paid payroll record" },
				{ status: 400 }
			);
		}

		await Payroll.findByIdAndDelete(id);

		return NextResponse.json(
			{ message: "Payroll record deleted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error deleting payroll:", error);
		return NextResponse.json(
			{ error: "Failed to delete payroll record" },
			{ status: 500 }
		);
	}
}
