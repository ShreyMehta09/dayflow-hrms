import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dayflow-jwt-secret-key";

export async function POST(request: NextRequest) {
	try {
		await connectToDatabase();

		const body = await request.json();
		const { email, password } = body;

		// Validate required fields
		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email and password are required" },
				{ status: 400 }
			);
		}

		// Find user by email (include password for comparison)
		const user = await User.findOne({ email: email.toLowerCase() }).select(
			"+password"
		);

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 }
			);
		}

		// Check password
		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 }
			);
		}

		// Check if user is active
		if (user.status === "inactive") {
			return NextResponse.json(
				{ error: "Your account has been deactivated. Please contact HR." },
				{ status: 403 }
			);
		}

		// Create JWT token
		const token = jwt.sign(
			{
				userId: user._id.toString(),
				email: user.email,
				role: user.role,
			},
			JWT_SECRET,
			{ expiresIn: "7d" }
		);

		// Return user data without password
		const userResponse = {
			id: user._id.toString(),
			email: user.email,
			name: user.name,
			role: user.role,
			avatar: user.avatar,
			department: user.department,
			position: user.position,
			joinDate: user.joinDate,
			phone: user.phone,
			status: user.status,
		};

		// Create response with cookie
		const response = NextResponse.json(
			{ message: "Login successful", user: userResponse, token },
			{ status: 200 }
		);

		// Set HTTP-only cookie for token
		response.cookies.set("auth-token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json(
			{ error: "Failed to login" },
			{ status: 500 }
		);
	}
}
