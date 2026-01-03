import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import OTP from "@/models/OTP";

export async function POST(request: NextRequest) {
	try {
		await connectDB();

		const { email, otp } = await request.json();

		// Validate inputs
		if (!email || !otp) {
			return NextResponse.json(
				{ error: "Email and OTP are required" },
				{ status: 400 }
			);
		}

		// Find the OTP record
		const otpRecord = await OTP.findOne({
			email: email.toLowerCase(),
			verified: false,
		}).sort({ createdAt: -1 }); // Get the most recent one

		if (!otpRecord) {
			return NextResponse.json(
				{ error: "No verification code found. Please request a new one." },
				{ status: 404 }
			);
		}

		// Check if OTP has expired
		if (otpRecord.expiresAt < new Date()) {
			await OTP.deleteOne({ _id: otpRecord._id });
			return NextResponse.json(
				{ error: "Verification code has expired. Please request a new one." },
				{ status: 410 }
			);
		}

		// Check attempt limit
		if (otpRecord.attempts >= 5) {
			await OTP.deleteOne({ _id: otpRecord._id });
			return NextResponse.json(
				{
					error:
						"Too many failed attempts. Please request a new verification code.",
				},
				{ status: 429 }
			);
		}

		// Verify OTP
		if (otpRecord.otp !== otp) {
			// Increment attempts
			otpRecord.attempts += 1;
			await otpRecord.save();

			const remainingAttempts = 5 - otpRecord.attempts;
			return NextResponse.json(
				{
					error: `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? "s" : ""} remaining.`,
					remainingAttempts,
				},
				{ status: 400 }
			);
		}

		// Mark OTP as verified
		otpRecord.verified = true;
		await otpRecord.save();

		return NextResponse.json(
			{
				success: true,
				message: "Email verified successfully",
				verified: true,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Verify OTP error:", error);
		return NextResponse.json(
			{ error: "An error occurred while verifying the code" },
			{ status: 500 }
		);
	}
}
