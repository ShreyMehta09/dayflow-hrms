import nodemailer from "nodemailer";

// Create reusable transporter
const createTransporter = () => {
	// For development, use Gmail or any SMTP service
	// For production, use a proper email service like SendGrid, AWS SES, etc.
	return nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD, // Use App Password for Gmail
		},
	});
};

// Generate 6-digit OTP
export const generateOTP = (): string => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (
	email: string,
	otp: string,
	name?: string
): Promise<{ success: boolean; error?: string }> => {
	try {
		const transporter = createTransporter();

		const mailOptions = {
			from: {
				name: "DayFlow HRMS",
				address: process.env.SMTP_USER || "noreply@dayflow.com",
			},
			to: email,
			subject: "Verify Your Email - DayFlow HRMS",
			html: `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title>Email Verification</title>
				</head>
				<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
					<table role="presentation" style="width: 100%; border-collapse: collapse;">
						<tr>
							<td align="center" style="padding: 40px 0;">
								<table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
									<!-- Header -->
									<tr>
										<td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0;">
											<div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background-color: rgba(255, 255, 255, 0.2); border-radius: 16px; margin-bottom: 16px;">
												<span style="color: #ffffff; font-size: 32px; font-weight: bold;">D</span>
											</div>
											<h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">DayFlow HRMS</h1>
										</td>
									</tr>
									
									<!-- Content -->
									<tr>
										<td style="padding: 40px;">
											<h2 style="margin: 0 0 16px; color: #1a1a2e; font-size: 24px; font-weight: 600;">
												Verify Your Email
											</h2>
											<p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
												Hi${name ? ` ${name}` : ""},
											</p>
											<p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
												Thank you for signing up for DayFlow HRMS! Please use the following verification code to complete your registration:
											</p>
											
											<!-- OTP Box -->
											<div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px dashed #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0;">
												<p style="margin: 0 0 8px; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
													Verification Code
												</p>
												<p style="margin: 0; color: #6366f1; font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
													${otp}
												</p>
											</div>
											
											<p style="margin: 0 0 16px; color: #4a5568; font-size: 14px; line-height: 1.6;">
												⏰ This code will expire in <strong>10 minutes</strong>.
											</p>
											<p style="margin: 0; color: #4a5568; font-size: 14px; line-height: 1.6;">
												If you didn't request this code, please ignore this email.
											</p>
										</td>
									</tr>
									
									<!-- Footer -->
									<tr>
										<td style="padding: 24px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; text-align: center;">
											<p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">
												Need help? Contact us at <a href="mailto:support@dayflow.com" style="color: #6366f1; text-decoration: none;">support@dayflow.com</a>
											</p>
											<p style="margin: 0; color: #94a3b8; font-size: 12px;">
												© ${new Date().getFullYear()} DayFlow HRMS. All rights reserved.
											</p>
										</td>
									</tr>
								</table>
							</td>
						</tr>
					</table>
				</body>
				</html>
			`,
			text: `
				DayFlow HRMS - Email Verification
				
				Hi${name ? ` ${name}` : ""},
				
				Thank you for signing up for DayFlow HRMS!
				
				Your verification code is: ${otp}
				
				This code will expire in 10 minutes.
				
				If you didn't request this code, please ignore this email.
				
				© ${new Date().getFullYear()} DayFlow HRMS. All rights reserved.
			`,
		};

		await transporter.sendMail(mailOptions);

		return { success: true };
	} catch (error) {
		console.error("Error sending OTP email:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to send email",
		};
	}
};
