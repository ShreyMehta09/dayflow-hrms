import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "DayFlow HRMS - Modern HR Management System",
	description:
		"Enterprise-grade Human Resource Management System built with Next.js",
	keywords: [
		"HRMS",
		"HR Management",
		"Employee Management",
		"Payroll",
		"Attendance",
	],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
			</head>
			<body className="min-h-screen bg-background text-text-primary antialiased">
				{children}
			</body>
		</html>
	);
}
