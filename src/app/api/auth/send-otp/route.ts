import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import OTP from "@/models/OTP";
import User from "@/models/User";
import { generateOTP, sendOTPEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
	try {
		await connectDB();

		const { email, name } = await request.json();

		// Validate email
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return NextResponse.json(
				{ error: "Please provide a valid email address" },
				{ status: 400 }
			);
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email: email.toLowerCase() });
		if (existingUser) {
			return NextResponse.json(
				{ error: "An account with this email already exists" },
				{ status: 409 }
			);
		}

		// Check for recent OTP requests (rate limiting - 1 per minute)
		const recentOTP = await OTP.findOne({
			email: email.toLowerCase(),
			createdAt: { $gt: new Date(Date.now() - 60 * 1000) }, // Last 1 minute
		});

		if (recentOTP) {
			const waitTime = Math.ceil(
				(60 * 1000 - (Date.now() - recentOTP.createdAt.getTime())) / 1000
			);
			return NextResponse.json(
				{
					error: `Please wait ${waitTime} seconds before requesting a new OTP`,
				},
				{ status: 429 }
			);
		}

		// Delete any existing OTPs for this email
		await OTP.deleteMany({ email: email.toLowerCase() });

		// Generate new OTP
		const otp = generateOTP();
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

		// Save OTP to database
		await OTP.create({
			email: email.toLowerCase(),
			otp,
			expiresAt,
		});

		// Send OTP email
		const emailResult = await sendOTPEmail(email, otp, name);

		if (!emailResult.success) {
			// Delete the OTP if email failed
			await OTP.deleteOne({ email: email.toLowerCase(), otp });
			return NextResponse.json(
				{
					error: "Failed to send verification email. Please try again.",
					details: emailResult.error,
				},
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: "Verification code sent to your email",
				expiresIn: 600, // 10 minutes in seconds
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Send OTP error:", error);
		return NextResponse.json(
			{ error: "An error occurred while sending verification code" },
			{ status: 500 }
		);
	}
}
