import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dayflow-jwt-secret-key";

interface JWTPayload {
	userId: string;
	email: string;
	role: string;
}

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get("auth-token")?.value;

		if (!token) {
			return NextResponse.json(
				{ error: "Not authenticated", user: null },
				{ status: 401 }
			);
		}

		// Verify token
		let decoded: JWTPayload;
		try {
			decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
		} catch {
			return NextResponse.json(
				{ error: "Invalid token", user: null },
				{ status: 401 }
			);
		}

		await connectToDatabase();

		// Find user
		const user = await User.findById(decoded.userId);

		if (!user) {
			return NextResponse.json(
				{ error: "User not found", user: null },
				{ status: 404 }
			);
		}

		// Return user data
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

		return NextResponse.json({ user: userResponse }, { status: 200 });
	} catch (error) {
		console.error("Session check error:", error);
		return NextResponse.json(
			{ error: "Failed to check session", user: null },
			{ status: 500 }
		);
	}
}
