import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
	try {
		await connectToDatabase();

		const body = await request.json();
		const { name, email, password, department, position, phone } = body;

		// Validate required fields
		if (!name || !email || !password) {
			return NextResponse.json(
				{ error: "Name, email and password are required" },
				{ status: 400 }
			);
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email: email.toLowerCase() });
		if (existingUser) {
			return NextResponse.json(
				{ error: "User with this email already exists" },
				{ status: 409 }
			);
		}

		// Create new user
		const user = new User({
			name,
			email: email.toLowerCase(),
			password,
			department: department || "General",
			position: position || "Employee",
			phone: phone || "",
			role: "employee", // Default role for self-registration
			status: "active",
			joinDate: new Date(),
		});

		await user.save();

		// Return user without password
		const userResponse = {
			id: user._id.toString(),
			email: user.email,
			name: user.name,
			role: user.role,
			department: user.department,
			position: user.position,
			status: user.status,
		};

		return NextResponse.json(
			{ message: "User created successfully", user: userResponse },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Signup error:", error);
		return NextResponse.json(
			{ error: "Failed to create user" },
			{ status: 500 }
		);
	}
}
