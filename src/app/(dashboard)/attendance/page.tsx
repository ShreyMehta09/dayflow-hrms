"use client";

import React, { useState } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	Button,
	Badge,
	Avatar,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
	Clock,
	Calendar,
	Download,
	ChevronLeft,
	ChevronRight,
	LogIn,
	LogOut,
	Check,
	Search,
	Users,
} from "lucide-react";

// Mock employee list
const employees = [
	{
		id: "1",
		name: "Sarah Johnson",
		avatar:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
		department: "Human Resources",
	},
	{
		id: "2",
		name: "Michael Chen",
		avatar:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
		department: "Engineering",
	},
	{
		id: "3",
		name: "Emily Watson",
		avatar:
			"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
		department: "Marketing",
	},
	{
		id: "4",
		name: "David Kim",
		avatar:
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
		department: "Engineering",
	},
	{
		id: "5",
		name: "Lisa Chen",
		avatar:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
		department: "Design",
	},
	{
		id: "6",
		name: "James Wilson",
		avatar:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
		department: "Sales",
	},
	{
		id: "7",
		name: "Amanda Foster",
		avatar:
			"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
		department: "Engineering",
	},
	{
		id: "8",
		name: "Robert Taylor",
		avatar:
			"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
		department: "Finance",
	},
];

// Generate attendance for all employees for a specific date
const generateDailyAttendance = (date: Date) => {
	return employees.map((employee) => {
		const random = Math.random();
		const isLeave = random < 0.05; // 5% chance of leave
		const isAbsent = !isLeave && random < 0.03; // 3% chance of absent

		if (isLeave) {
			return {
				...employee,
				checkIn: null,
				checkOut: null,
				workHours: "--",
				extraHours: "--",
				status: "leave",
			};
		} else if (isAbsent) {
			return {
				...employee,
				checkIn: null,
				checkOut: null,
				workHours: "--",
				extraHours: "--",
				status: "absent",
			};
		} else {
			const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
			const checkInMinute = Math.floor(Math.random() * 60);
			const workMinutes = 480 + Math.floor(Math.random() * 120); // 8-10 hours
			const checkOutMinutes = checkInHour * 60 + checkInMinute + workMinutes;

			const checkOutHour = Math.floor(checkOutMinutes / 60);
			const checkOutMinute = checkOutMinutes % 60;

			const standardHours = 8;
			const actualHours = workMinutes / 60;
			const extraHours = Math.max(0, actualHours - standardHours);

			return {
				...employee,
				checkIn: `${checkInHour.toString().padStart(2, "0")}:${checkInMinute
					.toString()
					.padStart(2, "0")}`,
				checkOut: `${checkOutHour.toString().padStart(2, "0")}:${checkOutMinute
					.toString()
					.padStart(2, "0")}`,
				workHours: `${Math.floor(actualHours)}h ${Math.round(
					(actualHours % 1) * 60
				)}m`,
				extraHours:
					extraHours > 0
						? `${Math.floor(extraHours)}h ${Math.round(
								(extraHours % 1) * 60
						  )}m`
						: "--",
				status: "present",
			};
		}
	});
};

// Mock attendance data for the selected month (for employee view)
const generateAttendanceData = (year: number, month: number) => {
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const data = [];

	for (let day = 1; day <= daysInMonth; day++) {
		const date = new Date(year, month, day);
		const dayOfWeek = date.getDay();

		// Skip weekends
		if (dayOfWeek === 0 || dayOfWeek === 6) continue;

		// Generate realistic data
		const isLeave = Math.random() < 0.05; // 5% chance of leave
		const isAbsent = !isLeave && Math.random() < 0.03; // 3% chance of absent

		if (isLeave) {
			data.push({
				date: date.toISOString().split("T")[0],
				dateDisplay: date.toLocaleDateString("en-US", {
					day: "numeric",
					month: "short",
				}),
				checkIn: null,
				checkOut: null,
				workHours: "--",
				extraHours: "--",
				status: "leave",
			});
		} else if (isAbsent) {
			data.push({
				date: date.toISOString().split("T")[0],
				dateDisplay: date.toLocaleDateString("en-US", {
					day: "numeric",
					month: "short",
				}),
				checkIn: null,
				checkOut: null,
				workHours: "--",
				extraHours: "--",
				status: "absent",
			});
		} else {
			const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
			const checkInMinute = Math.floor(Math.random() * 60);
			const workMinutes = 480 + Math.floor(Math.random() * 120); // 8-10 hours
			const checkOutMinutes = checkInHour * 60 + checkInMinute + workMinutes;

			const checkOutHour = Math.floor(checkOutMinutes / 60);
			const checkOutMinute = checkOutMinutes % 60;

			const standardHours = 8;
			const actualHours = workMinutes / 60;
			const extraHours = Math.max(0, actualHours - standardHours);

			data.push({
				date: date.toISOString().split("T")[0],
				dateDisplay: date.toLocaleDateString("en-US", {
					day: "numeric",
					month: "short",
				}),
				checkIn: `${checkInHour.toString().padStart(2, "0")}:${checkInMinute
					.toString()
					.padStart(2, "0")}`,
				checkOut: `${checkOutHour.toString().padStart(2, "0")}:${checkOutMinute
					.toString()
					.padStart(2, "0")}`,
				workHours: `${Math.floor(actualHours)}h ${Math.round(
					(actualHours % 1) * 60
				)}m`,
				extraHours:
					extraHours > 0
						? `${Math.floor(extraHours)}h ${Math.round(
								(extraHours % 1) * 60
						  )}m`
						: "--",
				status: "present",
			});
		}
	}

	return data.reverse(); // Most recent first
};

		if (isLeave) {
			data.push({
				date: date.toISOString().split("T")[0],
				dateDisplay: date.toLocaleDateString("en-US", {
					day: "numeric",
					month: "short",
				}),
				checkIn: null,
				checkOut: null,
				workHours: "--",
				extraHours: "--",
				status: "leave",
			});
		} else if (isAbsent) {
			data.push({
				date: date.toISOString().split("T")[0],
				dateDisplay: date.toLocaleDateString("en-US", {
					day: "numeric",
					month: "short",
				}),
				checkIn: null,
				checkOut: null,
				workHours: "--",
				extraHours: "--",
				status: "absent",
			});
		} else {
			const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
			const checkInMinute = Math.floor(Math.random() * 60);
			const workMinutes = 480 + Math.floor(Math.random() * 120); // 8-10 hours
			const checkOutMinutes = checkInHour * 60 + checkInMinute + workMinutes;

			const checkOutHour = Math.floor(checkOutMinutes / 60);
			const checkOutMinute = checkOutMinutes % 60;

			const standardHours = 8;
			const actualHours = workMinutes / 60;
			const extraHours = Math.max(0, actualHours - standardHours);

			data.push({
				date: date.toISOString().split("T")[0],
				dateDisplay: date.toLocaleDateString("en-US", {
					day: "numeric",
					month: "short",
				}),
				checkIn: `${checkInHour.toString().padStart(2, "0")}:${checkInMinute
					.toString()
					.padStart(2, "0")}`,
				checkOut: `${checkOutHour.toString().padStart(2, "0")}:${checkOutMinute
					.toString()
					.padStart(2, "0")}`,
				workHours: `${Math.floor(actualHours)}h ${Math.round(
					(actualHours % 1) * 60
				)}m`,
				extraHours:
					extraHours > 0
						? `${Math.floor(extraHours)}h ${Math.round(
								(extraHours % 1) * 60
						  )}m`
						: "--",
				status: "present",
			});
		}
	}

	return data.reverse(); // Most recent first
};

export default function AttendancePage() {
	const { user, role } = useAuth();
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [isCheckedIn, setIsCheckedIn] = useState(false);
	const [todayCheckIn, setTodayCheckIn] = useState<string | null>(null);
	const [todayCheckOut, setTodayCheckOut] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [dateDisplayMode, setDateDisplayMode] = useState<"date" | "day">(
		"date"
	);

	const isAdminOrHR = role === "admin" || role === "hr";

	// For Admin/HR view - single day navigation
	const handlePreviousDay = () => {
		const newDate = new Date(selectedDate);
		newDate.setDate(newDate.getDate() - 1);
		setSelectedDate(newDate);
	};

	const handleNextDay = () => {
		const today = new Date();
		const newDate = new Date(selectedDate);
		newDate.setDate(newDate.getDate() + 1);

		// Don't allow going beyond today
		if (newDate <= today) {
			setSelectedDate(newDate);
		}
	};

	// For Employee view - month navigation
	const year = selectedDate.getFullYear();
	const month = selectedDate.getMonth();
	const monthName = selectedDate.toLocaleDateString("en-US", { month: "long" });

	const handlePreviousMonth = () => {
		setSelectedDate(new Date(year, month - 1, 1));
	};

	const handleNextMonth = () => {
		const today = new Date();
		// Don't allow going beyond current month
		if (year < today.getFullYear() || month < today.getMonth()) {
			setSelectedDate(new Date(year, month + 1, 1));
		}
	};

	const handleCheckIn = () => {
		const now = new Date();
		const time = now.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
		setTodayCheckIn(time);
		setIsCheckedIn(true);
	};

	const handleCheckOut = () => {
		const now = new Date();
		const time = now.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
		setTodayCheckOut(time);
		setIsCheckedIn(false);
	};

	const isCurrentMonth =
		year === new Date().getFullYear() && month === new Date().getMonth();

	const isToday =
		selectedDate.toDateString() === new Date().toDateString();

	// Get appropriate data based on role
	const dailyAttendance = isAdminOrHR
		? generateDailyAttendance(selectedDate)
		: [];
	const monthlyAttendance = !isAdminOrHR
		? generateAttendanceData(year, month)
		: [];

	// Filter attendance for admin/HR search
	const filteredAttendance = dailyAttendance.filter(
		(record) =>
			record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			record.department.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Calculate stats for admin/HR
	const presentCount = dailyAttendance.filter(
		(r) => r.status === "present"
	).length;
	const leaveCount = dailyAttendance.filter(
		(r) => r.status === "leave"
	).length;
	const absentCount = dailyAttendance.filter(
		(r) => r.status === "absent"
	).length;

	// Calculate stats for employee
	const daysPresent = monthlyAttendance.filter(
		(d) => d.status === "present"
	).length;
	const leavesCount = monthlyAttendance.filter(
		(d) => d.status === "leave"
	).length;
	const totalWorkingDays = monthlyAttendance.length;

	// Format date display
	const getDateDisplay = () => {
		if (dateDisplayMode === "day") {
			return selectedDate.toLocaleDateString("en-US", { weekday: "long" });
		} else {
			return selectedDate.toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			});
		}
	};

	// Admin/HR View
	if (isAdminOrHR) {
		return (
			<div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
				{/* Header */}
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold text-text-primary">
							Attendance Overview
						</h1>
						<p className="text-text-muted mt-1">
							Monitor and manage employee attendance
						</p>
					</div>
					<Button
						variant="outline"
						leftIcon={<Download className="w-4 h-4" />}
					>
						Export Report
					</Button>
				</div>

				{/* Search and Date Navigation */}
				<div className="flex flex-col lg:flex-row gap-4">
					{/* Search Bar */}
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
						<input
							type="text"
							placeholder="Search employees by name or department..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full h-11 pl-10 pr-4 bg-card border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
						/>
					</div>

					{/* Date Navigation */}
					<Card padding="none" className="px-4 py-2">
						<div className="flex items-center gap-4">
							<Button
								variant="ghost"
								size="sm"
								onClick={handlePreviousDay}
								className="p-2"
							>
								<ChevronLeft className="w-4 h-4" />
							</Button>

							<div className="flex items-center gap-3">
								<Calendar className="w-4 h-4 text-primary" />
								<span className="font-semibold text-text-primary min-w-[200px] text-center">
									{getDateDisplay()}
								</span>
							</div>

							<Button
								variant="ghost"
								size="sm"
								onClick={handleNextDay}
								disabled={isToday}
								className="p-2"
							>
								<ChevronRight className="w-4 h-4" />
							</Button>

							{/* Day/Date Toggle */}
							<div className="flex items-center gap-1 ml-2 p-1 bg-surface rounded-lg">
								<button
									onClick={() => setDateDisplayMode("date")}
									className={`px-3 py-1 text-sm font-medium rounded transition-all ${
										dateDisplayMode === "date"
											? "bg-card text-text-primary shadow-sm"
											: "text-text-muted hover:text-text-primary"
									}`}
								>
									Date
								</button>
								<button
									onClick={() => setDateDisplayMode("day")}
									className={`px-3 py-1 text-sm font-medium rounded transition-all ${
										dateDisplayMode === "day"
											? "bg-card text-text-primary shadow-sm"
											: "text-text-muted hover:text-text-primary"
									}`}
								>
									Day
								</button>
							</div>
						</div>
					</Card>
				</div>

				{/* Summary Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
					<Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
						<CardContent className="py-5">
							<div className="flex items-center justify-between mb-2">
								<div className="p-2 rounded-lg bg-primary/20">
									<Users className="w-5 h-5 text-primary" />
								</div>
							</div>
							<p className="text-3xl font-bold text-text-primary">
								{employees.length}
							</p>
							<p className="text-sm text-text-muted mt-1">Total Employees</p>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/30">
						<CardContent className="py-5">
							<div className="flex items-center justify-between mb-2">
								<div className="p-2 rounded-lg bg-success/20">
									<Check className="w-5 h-5 text-success" />
								</div>
								<Badge variant="success" size="sm">
									{((presentCount / employees.length) * 100).toFixed(0)}%
								</Badge>
							</div>
							<p className="text-3xl font-bold text-text-primary">
								{presentCount}
							</p>
							<p className="text-sm text-text-muted mt-1">Present</p>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
						<CardContent className="py-5">
							<div className="flex items-center justify-between mb-2">
								<div className="p-2 rounded-lg bg-warning/20">
									<Calendar className="w-5 h-5 text-warning" />
								</div>
								<Badge variant="warning" size="sm">
									{((leaveCount / employees.length) * 100).toFixed(0)}%
								</Badge>
							</div>
							<p className="text-3xl font-bold text-text-primary">
								{leaveCount}
							</p>
							<p className="text-sm text-text-muted mt-1">On Leave</p>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-error/10 to-error/5 border-error/30">
						<CardContent className="py-5">
							<div className="flex items-center justify-between mb-2">
								<div className="p-2 rounded-lg bg-error/20">
									<Clock className="w-5 h-5 text-error" />
								</div>
								<Badge variant="error" size="sm">
									{((absentCount / employees.length) * 100).toFixed(0)}%
								</Badge>
							</div>
							<p className="text-3xl font-bold text-text-primary">
								{absentCount}
							</p>
							<p className="text-sm text-text-muted mt-1">Absent</p>
						</CardContent>
					</Card>
				</div>

				{/* Attendance Table */}
				<Card padding="none">
					<CardHeader className="px-6 pt-6 pb-4">
						<div className="flex items-center justify-between">
							<CardTitle>Daily Attendance Records</CardTitle>
							<Badge variant="secondary" size="sm">
								{filteredAttendance.length} / {employees.length} employees
							</Badge>
						</div>
					</CardHeader>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-y border-border bg-surface/50">
									<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
										Employee
									</th>
									<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
										Check In
									</th>
									<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
										Check Out
									</th>
									<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
										Work Hours
									</th>
									<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
										Extra Hours
									</th>
									<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
										Status
									</th>
								</tr>
							</thead>
							<tbody>
								{filteredAttendance.map((record) => (
									<tr
										key={record.id}
										className="border-b border-border last:border-0 hover:bg-surface/30 transition-colors"
									>
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<Avatar
													src={record.avatar}
													name={record.name}
													size="sm"
												/>
												<div>
													<p className="font-medium text-text-primary">
														{record.name}
													</p>
													<p className="text-xs text-text-muted">
														{record.department}
													</p>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<span className="text-text-primary font-medium">
												{record.checkIn || (
													<span className="text-text-muted">--</span>
												)}
											</span>
										</td>
										<td className="px-6 py-4">
											<span className="text-text-primary font-medium">
												{record.checkOut || (
													<span className="text-text-muted">--</span>
												)}
											</span>
										</td>
										<td className="px-6 py-4">
											<span className="font-semibold text-text-primary">
												{record.workHours}
											</span>
										</td>
										<td className="px-6 py-4">
											<span
												className={
													record.extraHours !== "--"
														? "font-semibold text-success"
														: "text-text-muted"
												}
											>
												{record.extraHours}
											</span>
										</td>
										<td className="px-6 py-4">
											{record.status === "present" && (
												<Badge variant="success" size="sm">
													Present
												</Badge>
											)}
											{record.status === "leave" && (
												<Badge variant="warning" size="sm">
													On Leave
												</Badge>
											)}
											{record.status === "absent" && (
												<Badge variant="error" size="sm">
													Absent
												</Badge>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{filteredAttendance.length === 0 && (
						<div className="text-center py-12">
							<p className="text-text-muted">
								No employees found matching your search.
							</p>
						</div>
					)}
				</Card>

				{/* Payroll Note */}
				<Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
					<CardContent className="py-4">
						<div className="flex items-start gap-3">
							<div className="p-2 rounded-lg bg-primary/20">
								<Clock className="w-5 h-5 text-primary" />
							</div>
							<div>
								<p className="font-medium text-text-primary">
									Payroll Integration
								</p>
								<p className="text-sm text-text-muted mt-1">
									Attendance data automatically feeds into payroll computation.
									Work hours and extra hours are calculated for salary
									processing.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Employee View (existing code)
	return (
		<div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
			{/* Header with Check-In/Out */}
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">
						My Attendance
					</h1>
					<p className="text-text-muted mt-1">
						Track your attendance and work hours
					</p>
				</div>

				{/* Check-In/Out Buttons - Only show for current month */}
				{isCurrentMonth && (
					<div className="flex items-center gap-3">
						{/* Status Indicator */}
						<div className="flex items-center gap-2 px-4 py-2 bg-surface rounded-lg border border-border">
							<div
								className={`w-3 h-3 rounded-full transition-colors ${
									isCheckedIn ? "bg-green-500" : "bg-red-500"
								}`}
							/>
							<span className="text-sm font-medium text-text-primary">
								{isCheckedIn ? "Checked In" : "Not Checked In"}
							</span>
						</div>

						{!todayCheckIn && (
							<Button
								variant="primary"
								leftIcon={<LogIn className="w-4 h-4" />}
								onClick={handleCheckIn}
							>
								Check In
							</Button>
						)}

						{todayCheckIn && !todayCheckOut && (
							<Button
								variant="error"
								leftIcon={<LogOut className="w-4 h-4" />}
								onClick={handleCheckOut}
							>
								Check Out
							</Button>
						)}

						{todayCheckOut && (
							<Button
								variant="success"
								leftIcon={<Check className="w-4 h-4" />}
								disabled
							>
								Day Complete
							</Button>
						)}
					</div>
				)}
			</div>

			{/* Month Selector */}
			<Card>
				<CardContent className="py-4">
					<div className="flex items-center justify-between">
						<Button
							variant="outline"
							size="sm"
							leftIcon={<ChevronLeft className="w-4 h-4" />}
							onClick={handlePreviousMonth}
						>
							Previous
						</Button>

						<div className="flex items-center gap-2">
							<Calendar className="w-5 h-5 text-primary" />
							<h2 className="text-xl font-semibold text-text-primary">
								{monthName} {year}
							</h2>
						</div>

						<Button
							variant="outline"
							size="sm"
							rightIcon={<ChevronRight className="w-4 h-4" />}
							onClick={handleNextMonth}
							disabled={isCurrentMonth}
						>
							Next
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				{/* Days Present */}
				<Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/30">
					<CardContent className="py-6">
						<div className="flex items-center justify-between mb-2">
							<div className="p-2 rounded-lg bg-success/20">
								<Check className="w-5 h-5 text-success" />
							</div>
							<Badge variant="success" size="sm">
								{((daysPresent / totalWorkingDays) * 100).toFixed(0)}%
							</Badge>
						</div>
						<p className="text-3xl font-bold text-text-primary">
							{daysPresent}
						</p>
						<p className="text-sm text-text-muted mt-1">Days Present</p>
					</CardContent>
				</Card>

				{/* Leaves Count */}
				<Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
					<CardContent className="py-6">
						<div className="flex items-center justify-between mb-2">
							<div className="p-2 rounded-lg bg-warning/20">
								<Calendar className="w-5 h-5 text-warning" />
							</div>
							<Badge variant="warning" size="sm">
								{((leavesCount / totalWorkingDays) * 100).toFixed(0)}%
							</Badge>
						</div>
						<p className="text-3xl font-bold text-text-primary">
							{leavesCount}
						</p>
						<p className="text-sm text-text-muted mt-1">Leaves Count</p>
					</CardContent>
				</Card>

				{/* Total Working Days */}
				<Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
					<CardContent className="py-6">
						<div className="flex items-center justify-between mb-2">
							<div className="p-2 rounded-lg bg-primary/20">
								<Clock className="w-5 h-5 text-primary" />
							</div>
							<Badge variant="primary" size="sm">
								100%
							</Badge>
						</div>
						<p className="text-3xl font-bold text-text-primary">
							{totalWorkingDays}
						</p>
						<p className="text-sm text-text-muted mt-1">Total Working Days</p>
					</CardContent>
				</Card>
			</div>

			{/* Attendance Table */}
			<Card padding="none">
				<CardHeader className="px-6 pt-6 pb-4 flex-row items-center justify-between">
					<CardTitle>Attendance Records</CardTitle>
					<Button
						variant="outline"
						size="sm"
						leftIcon={<Download className="w-4 h-4" />}
					>
						Export
					</Button>
				</CardHeader>

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-y border-border bg-surface/50">
								<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
									Date
								</th>
								<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
									Check In
								</th>
								<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
									Check Out
								</th>
								<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
									Work Hours
								</th>
								<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
									Extra Hours
								</th>
								<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
									Status
								</th>
							</tr>
						</thead>
						<tbody>
							{monthlyAttendance.map((record, index) => (
								<tr
									key={index}
									className="border-b border-border last:border-0 hover:bg-surface/30 transition-colors"
								>
									<td className="px-6 py-4">
										<span className="font-medium text-text-primary">
											{record.dateDisplay}
										</span>
									</td>
									<td className="px-6 py-4">
										<span className="text-text-primary">
											{record.checkIn || (
												<span className="text-text-muted">--</span>
											)}
										</span>
									</td>
									<td className="px-6 py-4">
										<span className="text-text-primary">
											{record.checkOut || (
												<span className="text-text-muted">--</span>
											)}
										</span>
									</td>
									<td className="px-6 py-4">
										<span className="font-medium text-text-primary">
											{record.workHours}
										</span>
									</td>
									<td className="px-6 py-4">
										<span
											className={
												record.extraHours !== "--"
													? "font-medium text-success"
													: "text-text-muted"
											}
										>
											{record.extraHours}
										</span>
									</td>
									<td className="px-6 py-4">
										{record.status === "present" && (
											<Badge variant="success" size="sm">
												Present
											</Badge>
										)}
										{record.status === "leave" && (
											<Badge variant="warning" size="sm">
												On Leave
											</Badge>
										)}
										{record.status === "absent" && (
											<Badge variant="error" size="sm">
												Absent
											</Badge>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{monthlyAttendance.length === 0 && (
					<div className="text-center py-12">
						<p className="text-text-muted">No attendance records found.</p>
					</div>
				)}
			</Card>
		</div>
	);
}
