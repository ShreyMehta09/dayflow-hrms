import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
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

// GET - Get single employee
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

		const user = await User.findById(id).select("-password");

		if (!user) {
			return NextResponse.json({ error: "Employee not found" }, { status: 404 });
		}

		return NextResponse.json({
			employee: {
				id: user._id.toString(),
				email: user.email,
				name: user.name,
				role: user.role,
				avatar: user.avatar,
				department: user.department,
				position: user.position,
				joinDate: user.joinDate,
				phone: user.phone,
				address: user.address,
				status: user.status,
			},
		});
	} catch (error) {
		console.error("Error fetching employee:", error);
		return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 });
	}
}

// PUT - Update employee
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const auth = await verifyAuth(request);
		if (!auth) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		// Only admin/hr can update other users, employees can only update themselves
		if (auth.role === "employee" && auth.userId !== id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		await connectToDatabase();

		const body = await request.json();
		const { name, department, position, phone, address, avatar, status, role, email } = body;

		const updateData: Record<string, unknown> = {};

		// Fields that employees can edit themselves
		if (phone !== undefined) updateData.phone = phone;
		if (address !== undefined) updateData.address = address;
		if (avatar !== undefined) updateData.avatar = avatar;

		// Only admin/hr can update these fields
		if (auth.role === "admin" || auth.role === "hr") {
			if (name) updateData.name = name;
			if (email) updateData.email = email;
			if (department !== undefined) updateData.department = department;
			if (position !== undefined) updateData.position = position;
			if (status) updateData.status = status;
			if (role) updateData.role = role;
		}

		const user = await User.findByIdAndUpdate(
			id,
			{ $set: updateData },
			{ new: true, runValidators: true }
		).select("-password");

		if (!user) {
			return NextResponse.json({ error: "Employee not found" }, { status: 404 });
		}

		return NextResponse.json({
			message: "Employee updated successfully",
			employee: {
				id: user._id.toString(),
				email: user.email,
				name: user.name,
				role: user.role,
				avatar: user.avatar,
				department: user.department,
				position: user.position,
				phone: user.phone,
				address: user.address,
				status: user.status,
			},
		});
	} catch (error) {
		console.error("Error updating employee:", error);
		return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
	}
}

// DELETE - Delete employee
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const auth = await verifyAuth(request);
		if (!auth || auth.role !== "admin") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		await connectToDatabase();

		const user = await User.findByIdAndDelete(id);

		if (!user) {
			return NextResponse.json({ error: "Employee not found" }, { status: 404 });
		}

		return NextResponse.json({ message: "Employee deleted successfully" });
	} catch (error) {
		console.error("Error deleting employee:", error);
		return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
	}
}
