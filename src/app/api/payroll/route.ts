import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
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

// GET - List all payroll records (Admin/HR only)
export async function GET(request: NextRequest) {
	try {
		const auth = await verifyAuth(request);
		if (!auth) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Only admin and HR can view all payroll
		if (auth.role !== "admin" && auth.role !== "hr") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		await connectToDatabase();

		const { searchParams } = new URL(request.url);
		const month = searchParams.get("month");
		const year = searchParams.get("year");
		const status = searchParams.get("status");
		const employeeId = searchParams.get("employeeId");

		// Build query
		const query: Record<string, unknown> = {};

		if (month) {
			query.month = parseInt(month);
		}

		if (year) {
			query.year = parseInt(year);
		}

		if (status) {
			query.status = status;
		}

		if (employeeId) {
			query.employee = employeeId;
		}

		const payrolls = await Payroll.find(query)
			.populate("employee", "name email department position avatar")
			.populate("approvedBy", "name")
			.populate("createdBy", "name")
			.sort({ year: -1, month: -1, createdAt: -1 });

		// Get unique employees for dropdown
		const employees = await User.find({})
			.select("_id name email department position")
			.sort({ name: 1 });

		// Calculate summary statistics
		const summary = {
			totalPayroll: payrolls.reduce((sum, p) => sum + p.netSalary, 0),
			totalGross: payrolls.reduce((sum, p) => sum + p.grossSalary, 0),
			totalDeductions: payrolls.reduce((sum, p) => sum + p.totalDeductions, 0),
			employeeCount: new Set(payrolls.map((p) => p.employee?._id?.toString())).size,
			pendingCount: payrolls.filter((p) => p.status === "pending").length,
			approvedCount: payrolls.filter((p) => p.status === "approved").length,
			paidCount: payrolls.filter((p) => p.status === "paid").length,
		};

		const formattedPayrolls = payrolls.map((p) => ({
			id: p._id.toString(),
			employee: p.employee
				? {
						id: (p.employee as any)._id?.toString(),
						name: (p.employee as any).name,
						email: (p.employee as any).email,
						department: (p.employee as any).department,
						position: (p.employee as any).position,
						avatar: (p.employee as any).avatar,
				  }
				: null,
			month: p.month,
			year: p.year,
			basicSalary: p.basicSalary,
			components: p.components,
			grossSalary: p.grossSalary,
			totalDeductions: p.totalDeductions,
			netSalary: p.netSalary,
			paymentMethod: p.paymentMethod,
			paymentDate: p.paymentDate,
			status: p.status,
			remarks: p.remarks,
			approvedBy: p.approvedBy ? (p.approvedBy as any).name : null,
			approvedAt: p.approvedAt,
			createdBy: p.createdBy ? (p.createdBy as any).name : null,
			createdAt: p.createdAt,
		}));

		return NextResponse.json(
			{
				payrolls: formattedPayrolls,
				employees: employees.map((e) => ({
					id: e._id.toString(),
					name: e.name,
					email: e.email,
					department: e.department,
					position: e.position,
				})),
				summary,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error fetching payroll:", error);
		return NextResponse.json(
			{ error: "Failed to fetch payroll records" },
			{ status: 500 }
		);
	}
}

// POST - Create payroll record (Admin/HR only)
export async function POST(request: NextRequest) {
	try {
		const auth = await verifyAuth(request);
		if (!auth) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Only admin and HR can create payroll
		if (auth.role !== "admin" && auth.role !== "hr") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		await connectToDatabase();

		const body = await request.json();
		const {
			employeeId,
			month,
			year,
			basicSalary,
			components = [],
			paymentMethod = "bank_transfer",
			remarks,
		} = body;

		// Validate required fields
		if (!employeeId || !month || !year || basicSalary === undefined) {
			return NextResponse.json(
				{ error: "Employee, month, year, and basic salary are required" },
				{ status: 400 }
			);
		}

		// Check if employee exists
		const employee = await User.findById(employeeId);
		if (!employee) {
			return NextResponse.json(
				{ error: "Employee not found" },
				{ status: 404 }
			);
		}

		// Check if payroll already exists for this employee/month/year
		const existingPayroll = await Payroll.findOne({
			employee: employeeId,
			month,
			year,
		});

		if (existingPayroll) {
			return NextResponse.json(
				{ error: "Payroll already exists for this employee and period" },
				{ status: 400 }
			);
		}

		// Create payroll
		const payroll = await Payroll.create({
			employee: employeeId,
			month,
			year,
			basicSalary,
			components,
			paymentMethod,
			remarks,
			status: "draft",
			createdBy: auth.userId,
			// grossSalary, totalDeductions, netSalary will be calculated by pre-save middleware
			grossSalary: 0,
			totalDeductions: 0,
			netSalary: 0,
		});

		await payroll.populate("employee", "name email department position");

		return NextResponse.json(
			{
				message: "Payroll created successfully",
				payroll: {
					id: payroll._id.toString(),
					employee: {
						id: (payroll.employee as any)._id.toString(),
						name: (payroll.employee as any).name,
						email: (payroll.employee as any).email,
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
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating payroll:", error);
		return NextResponse.json(
			{ error: "Failed to create payroll record" },
			{ status: 500 }
		);
	}
}
