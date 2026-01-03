"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	Button,
	Badge,
	Avatar,
	SkeletonTable,
	NoAttendanceRecords,
	NoSearchResults,
	InlineError,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useReducedMotion, useAriaAnnounce } from "@/lib/hooks";
import { cn } from "@/lib/utils";
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
	RefreshCw,
} from "lucide-react";
import { attendanceApi, type AttendanceRecord } from "@/services/api";

// Types for display
interface DailyAttendanceDisplay {
	id: string;
	name: string;
	avatar?: string;
	department?: string;
	checkIn: string | null;
	checkOut: string | null;
	workHours: string;
	extraHours: string;
	status: string;
}

interface MonthlyAttendanceDisplay {
	date: string;
	dateDisplay: string;
	checkIn: string | null;
	checkOut: string | null;
	workHours: string;
	extraHours: string;
	status: string;
}

// Helper function to format work hours
const formatWorkHours = (hours: number): string => {
	if (!hours || hours === 0) return "--";
	const h = Math.floor(hours);
	const m = Math.round((hours % 1) * 60);
	return `${h}h ${m}m`;
};

// Helper function to format time
const formatTime = (dateString: string | undefined | null): string | null => {
	if (!dateString) return null;
	return new Date(dateString).toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
};

export default function AttendancePage() {
	const { role } = useAuth();
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [isCheckedIn, setIsCheckedIn] = useState(false);
	const [todayCheckIn, setTodayCheckIn] = useState<string | null>(null);
	const [todayCheckOut, setTodayCheckOut] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [dateDisplayMode, setDateDisplayMode] = useState<"date" | "day">(
		"date"
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// Real attendance data from API
	const [dailyAttendance, setDailyAttendance] = useState<
		DailyAttendanceDisplay[]
	>([]);
	const [monthlyAttendance, setMonthlyAttendance] = useState<
		MonthlyAttendanceDisplay[]
	>([]);

	const prefersReducedMotion = useReducedMotion();
	const announce = useAriaAnnounce();

	const isAdminOrHR = role === "admin" || role === "hr";

	// Animation classes
	const animationClass = prefersReducedMotion ? "" : "animate-fade-in";

	// For Employee view - month navigation
	const year = selectedDate.getFullYear();
	const month = selectedDate.getMonth();
	const monthName = selectedDate.toLocaleDateString("en-US", { month: "long" });

	const isCurrentMonth =
		year === new Date().getFullYear() && month === new Date().getMonth();

	const isToday = selectedDate.toDateString() === new Date().toDateString();

	// Fetch today's attendance status on mount
	useEffect(() => {
		const fetchTodayAttendance = async () => {
			try {
				const data = await attendanceApi.getToday();
				if (data.today) {
					if (data.today.checkIn) {
						setTodayCheckIn(formatTime(data.today.checkIn));
					}
					if (data.today.checkOut) {
						setTodayCheckOut(formatTime(data.today.checkOut));
					}
					setIsCheckedIn(data.isCheckedIn && !data.isCheckedOut);
				}
			} catch (err) {
				console.error("Failed to fetch today's attendance:", err);
			}
		};
		fetchTodayAttendance();
	}, []);

	// Load attendance data from API
	const loadAttendance = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			if (isAdminOrHR) {
				// Fetch attendance for selected date (all employees)
				const dateStr = selectedDate.toISOString().split("T")[0];
				const response = await attendanceApi.getAll({ date: dateStr });

				// Transform API response to display format
				const displayData: DailyAttendanceDisplay[] = (
					response.attendance || []
				).map((record: AttendanceRecord) => ({
					id: record.id,
					name: record.employee.name,
					avatar: record.employee.avatar,
					department: record.employee.department,
					checkIn: formatTime(record.checkIn),
					checkOut: formatTime(record.checkOut),
					workHours: formatWorkHours(record.workHours),
					extraHours: formatWorkHours(record.overtime),
					status: record.status,
				}));

				setDailyAttendance(displayData);
			} else {
				// Fetch attendance for current user for the month
				const startDate = new Date(year, month, 1).toISOString().split("T")[0];
				const endDate = new Date(year, month + 1, 0)
					.toISOString()
					.split("T")[0];
				const response = await attendanceApi.getAll({ startDate, endDate });

				// Transform API response to display format
				const displayData: MonthlyAttendanceDisplay[] = (
					response.attendance || []
				)
					.map((record: AttendanceRecord) => {
						const date = new Date(record.date);
						return {
							date: record.date,
							dateDisplay: date.toLocaleDateString("en-US", {
								day: "numeric",
								month: "short",
							}),
							checkIn: formatTime(record.checkIn),
							checkOut: formatTime(record.checkOut),
							workHours: formatWorkHours(record.workHours),
							extraHours: formatWorkHours(record.overtime),
							status: record.status,
						};
					})
					.reverse(); // Most recent first

				setMonthlyAttendance(displayData);
			}
			announce("Attendance records loaded");
		} catch (err) {
			console.error("Failed to load attendance:", err);
			setError(
				err instanceof Error ? err : new Error("Failed to load attendance")
			);
		} finally {
			setIsLoading(false);
		}
	}, [selectedDate, year, month, isAdminOrHR, announce]);

	useEffect(() => {
		loadAttendance();
	}, [loadAttendance]);

	const handleRefresh = () => {
		loadAttendance();
	};

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

	const handleCheckIn = async () => {
		try {
			const result = await attendanceApi.checkIn();
			if (result.attendance.checkIn) {
				setTodayCheckIn(formatTime(result.attendance.checkIn));
				setIsCheckedIn(true);
				announce("Checked in successfully");
				loadAttendance(); // Refresh the list
			}
		} catch (err) {
			console.error("Check-in failed:", err);
			announce("Failed to check in");
		}
	};

	const handleCheckOut = async () => {
		try {
			const result = await attendanceApi.checkOut();
			if (result.attendance.checkOut) {
				setTodayCheckOut(formatTime(result.attendance.checkOut));
				setIsCheckedIn(false);
				announce("Checked out successfully");
				loadAttendance(); // Refresh the list
			}
		} catch (err) {
			console.error("Check-out failed:", err);
			announce("Failed to check out");
		}
	};

	// Filter attendance for admin/HR search
	const filteredAttendance = dailyAttendance.filter(
		(record) =>
			record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(record.department || "")
				.toLowerCase()
				.includes(searchQuery.toLowerCase())
	);

	// Calculate stats for admin/HR
	const presentCount = dailyAttendance.filter(
		(r) => r.status === "present" || r.status === "late"
	).length;
	const leaveCount = dailyAttendance.filter(
		(r) => r.status === "on_leave"
	).length;
	const absentCount = dailyAttendance.filter(
		(r) => r.status === "absent"
	).length;

	// Calculate stats for employee
	const daysPresent = monthlyAttendance.filter(
		(d) => d.status === "present" || d.status === "late"
	).length;
	const leavesCount = monthlyAttendance.filter(
		(d) => d.status === "on_leave"
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

	// Status badge helper
	const getStatusBadge = (status: string) => {
		switch (status) {
			case "present":
				return (
					<Badge variant="success" size="sm">
						Present
					</Badge>
				);
			case "late":
				return (
					<Badge variant="warning" size="sm">
						Late
					</Badge>
				);
			case "on_leave":
				return (
					<Badge variant="warning" size="sm">
						On Leave
					</Badge>
				);
			case "absent":
				return (
					<Badge variant="error" size="sm">
						Absent
					</Badge>
				);
			case "half_day":
				return (
					<Badge variant="secondary" size="sm">
						Half Day
					</Badge>
				);
			default:
				return (
					<Badge variant="secondary" size="sm">
						{status}
					</Badge>
				);
		}
	};

	// Admin/HR View
	if (isAdminOrHR) {
		// Error state
		if (error) {
			return (
				<div className="flex items-center justify-center min-h-[60vh]">
					<InlineError message={error.message} onRetry={handleRefresh} />
				</div>
			);
		}

		return (
			<div
				className={cn("space-y-6 max-w-7xl mx-auto", animationClass)}
				role="main"
				aria-label="Attendance management"
			>
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
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleRefresh}
							aria-label="Refresh attendance"
							className="focus-ring"
							disabled={isLoading}
						>
							<RefreshCw
								className={cn("w-4 h-4", isLoading && "animate-spin")}
							/>
						</Button>
						<Button
							variant="outline"
							leftIcon={<Download className="w-4 h-4" />}
						>
							Export Report
						</Button>
					</div>
				</div>

				{/* Search and Date Navigation */}
				<div className="flex flex-col lg:flex-row gap-4">
					{/* Search Bar */}
					<div className="relative flex-1">
						<Search
							className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
							aria-hidden="true"
						/>
						<input
							type="search"
							placeholder="Search employees by name or department..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full h-11 pl-10 pr-4 bg-card border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus-ring"
							aria-label="Search employees"
							disabled={isLoading}
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
								{dailyAttendance.length}
							</p>
							<p className="text-sm text-text-muted mt-1">Total Records</p>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/30">
						<CardContent className="py-5">
							<div className="flex items-center justify-between mb-2">
								<div className="p-2 rounded-lg bg-success/20">
									<Check className="w-5 h-5 text-success" />
								</div>
								<Badge variant="success" size="sm">
									{dailyAttendance.length > 0
										? ((presentCount / dailyAttendance.length) * 100).toFixed(0)
										: 0}
									%
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
									{dailyAttendance.length > 0
										? ((leaveCount / dailyAttendance.length) * 100).toFixed(0)
										: 0}
									%
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
									{dailyAttendance.length > 0
										? ((absentCount / dailyAttendance.length) * 100).toFixed(0)
										: 0}
									%
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
								{filteredAttendance.length} records
							</Badge>
						</div>
					</CardHeader>

					{isLoading ? (
						<div
							className="p-6"
							aria-label="Loading attendance records"
							aria-busy="true"
						>
							<SkeletonTable rows={6} columns={6} />
						</div>
					) : (
						<div className="overflow-x-auto">
							<table
								className="w-full"
								role="table"
								aria-label="Employee attendance"
							>
								<thead>
									<tr className="border-y border-border bg-surface/50">
										<th
											scope="col"
											className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4"
										>
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
															{record.department || "N/A"}
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
												{getStatusBadge(record.status)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{!isLoading && filteredAttendance.length === 0 && searchQuery && (
						<div className="py-8">
							<NoSearchResults
								query={searchQuery}
								onClear={() => setSearchQuery("")}
							/>
						</div>
					)}

					{!isLoading && dailyAttendance.length === 0 && !searchQuery && (
						<div className="py-8">
							<NoAttendanceRecords />
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

	// Employee View
	// Error state
	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<InlineError message={error.message} onRetry={handleRefresh} />
			</div>
		);
	}

	return (
		<div
			className={cn("space-y-6 max-w-7xl mx-auto", animationClass)}
			role="main"
			aria-label="My attendance"
		>
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
						{/* Refresh Button */}
						<Button
							variant="ghost"
							size="sm"
							onClick={handleRefresh}
							aria-label="Refresh attendance"
							className="focus-ring"
							disabled={isLoading}
						>
							<RefreshCw
								className={cn("w-4 h-4", isLoading && "animate-spin")}
							/>
						</Button>

						{/* Status Indicator */}
						<div
							className="flex items-center gap-2 px-4 py-2 bg-surface rounded-lg border border-border"
							role="status"
							aria-live="polite"
						>
							<div
								className={`w-3 h-3 rounded-full transition-colors ${
									isCheckedIn ? "bg-green-500" : "bg-red-500"
								}`}
								aria-hidden="true"
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
								variant="danger"
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
								{totalWorkingDays > 0
									? ((daysPresent / totalWorkingDays) * 100).toFixed(0)
									: 0}
								%
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
								{totalWorkingDays > 0
									? ((leavesCount / totalWorkingDays) * 100).toFixed(0)
									: 0}
								%
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
						<p className="text-sm text-text-muted mt-1">Total Records</p>
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

				{isLoading ? (
					<div
						className="p-6"
						aria-label="Loading attendance records"
						aria-busy="true"
					>
						<SkeletonTable rows={8} columns={6} />
					</div>
				) : (
					<div className="overflow-x-auto">
						<table
							className="w-full"
							role="table"
							aria-label="Monthly attendance records"
						>
							<thead>
								<tr className="border-y border-border bg-surface/50">
									<th
										scope="col"
										className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4"
									>
										Date
									</th>
									<th
										scope="col"
										className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4"
									>
										Check In
									</th>
									<th
										scope="col"
										className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4"
									>
										Check Out
									</th>
									<th
										scope="col"
										className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4"
									>
										Work Hours
									</th>
									<th
										scope="col"
										className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4"
									>
										Extra Hours
									</th>
									<th
										scope="col"
										className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4"
									>
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
											{getStatusBadge(record.status)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{!isLoading && monthlyAttendance.length === 0 && (
					<div className="py-8">
						<NoAttendanceRecords />
					</div>
				)}
			</Card>
		</div>
	);
}
