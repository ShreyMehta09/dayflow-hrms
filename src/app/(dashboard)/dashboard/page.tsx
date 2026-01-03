"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	Badge,
	Avatar,
	Button,
	Progress,
	SkeletonStats,
	SkeletonCard,
	InlineError,
} from "@/components/ui";
import { useAuth, RoleGuard } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useReducedMotion, useAriaAnnounce } from "@/lib/hooks";
import {
	Users,
	UserCheck,
	Calendar,
	Clock,
	TrendingUp,
	TrendingDown,
	ArrowRight,
	Plus,
	Briefcase,
	DollarSign,
	AlertCircle,
	CheckCircle2,
	Timer,
	Coffee,
	Cake,
	RefreshCw,
	LogIn,
	LogOut,
} from "lucide-react";
import { dashboardApi, type DashboardStats } from "@/services/api";

// Today's attendance state
interface TodayAttendance {
	id?: string;
	checkIn?: string;
	checkOut?: string;
	status?: string;
	workHours?: number;
	breakTime?: number;
	overtime?: number;
}

// Quick Actions for employees
const getQuickActions = (
	isCheckedIn: boolean,
	isCheckedOut: boolean,
	onClockAction: () => void
) => [
	{
		label: isCheckedOut
			? "Done for today"
			: isCheckedIn
			? "Clock Out"
			: "Clock In",
		icon: isCheckedIn ? (
			<LogOut className="w-5 h-5" />
		) : (
			<LogIn className="w-5 h-5" />
		),
		variant: "primary" as const,
		onClick: onClockAction,
		disabled: isCheckedOut,
	},
	{
		label: "Request Leave",
		icon: <Calendar className="w-5 h-5" />,
		variant: "outline" as const,
		onClick: () => {},
		disabled: false,
	},
	{
		label: "Log Expense",
		icon: <DollarSign className="w-5 h-5" />,
		variant: "outline" as const,
		onClick: () => {},
		disabled: false,
	},
	{
		label: "View Payslip",
		icon: <Briefcase className="w-5 h-5" />,
		variant: "outline" as const,
		onClick: () => {},
		disabled: false,
	},
];

export default function DashboardPage() {
	const { user, role } = useAuth();
	const prefersReducedMotion = useReducedMotion();
	const announce = useAriaAnnounce();

	// Loading states
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
		null
	);

	// Attendance states
	const [todayAttendance, setTodayAttendance] =
		useState<TodayAttendance | null>(null);
	const [isCheckedIn, setIsCheckedIn] = useState(false);
	const [isCheckedOut, setIsCheckedOut] = useState(false);
	const [isClockLoading, setIsClockLoading] = useState(false);
	const [workingTime, setWorkingTime] = useState<string>("--:--");

	// Fetch today's attendance
	const fetchTodayAttendance = useCallback(async () => {
		try {
			const response = await fetch("/api/attendance/today", {
				credentials: "include",
			});
			if (response.ok) {
				const data = await response.json();
				setTodayAttendance(data.today);
				setIsCheckedIn(data.isCheckedIn);
				setIsCheckedOut(data.isCheckedOut);
			}
		} catch (err) {
			console.error("Failed to fetch today's attendance:", err);
		}
	}, []);

	// Calculate working time
	useEffect(() => {
		if (!isCheckedIn || !todayAttendance?.checkIn) {
			setWorkingTime("--:--");
			return;
		}

		const updateWorkingTime = () => {
			const checkInTime = new Date(todayAttendance.checkIn!).getTime();
			const endTime = todayAttendance.checkOut
				? new Date(todayAttendance.checkOut).getTime()
				: Date.now();
			const diffMs = endTime - checkInTime;
			const hours = Math.floor(diffMs / (1000 * 60 * 60));
			const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
			setWorkingTime(`${hours}h ${minutes}m`);
		};

		updateWorkingTime();

		// Update every minute if not checked out
		if (!isCheckedOut) {
			const interval = setInterval(updateWorkingTime, 60000);
			return () => clearInterval(interval);
		}
	}, [isCheckedIn, isCheckedOut, todayAttendance]);

	// Clock In/Out handler
	const handleClockAction = async () => {
		if (isCheckedOut) return;

		setIsClockLoading(true);
		try {
			const action = isCheckedIn ? "check-out" : "check-in";
			const response = await fetch("/api/attendance", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ action }),
			});

			if (response.ok) {
				const data = await response.json();
				announce(data.message);
				await fetchTodayAttendance();
				// Also refresh dashboard stats
				await fetchDashboard();
			} else {
				const data = await response.json();
				announce(data.error || "Failed to process attendance", "assertive");
			}
		} catch (err) {
			console.error("Clock action failed:", err);
			announce("Failed to process attendance", "assertive");
		} finally {
			setIsClockLoading(false);
		}
	};

	// Get quick actions with current state
	const quickActions = getQuickActions(
		isCheckedIn,
		isCheckedOut,
		handleClockAction
	);

	// Build dynamic stats from API data
	const getStats = () => {
		if (!dashboardData) return [];
		const { stats: apiStats, myStats } = dashboardData;

		if (role === "admin" || role === "hr") {
			return [
				{
					label: "Total Employees",
					value: apiStats.totalEmployees.toString(),
					change: `${apiStats.attendanceRate}% rate`,
					trend: "up" as const,
					icon: <Users className="w-5 h-5" />,
					color: "primary",
				},
				{
					label: "Present Today",
					value: apiStats.presentToday.toString(),
					change: `${apiStats.attendanceRate}%`,
					trend: "up" as const,
					icon: <UserCheck className="w-5 h-5" />,
					color: "success",
				},
				{
					label: "On Leave",
					value: apiStats.onLeaveToday.toString(),
					change: "Today",
					trend: "neutral" as const,
					icon: <Calendar className="w-5 h-5" />,
					color: "warning",
				},
				{
					label: "Pending Requests",
					value: apiStats.pendingLeaveRequests.toString(),
					change:
						apiStats.pendingLeaveRequests > 0 ? "Action needed" : "All clear",
					trend:
						apiStats.pendingLeaveRequests > 0
							? ("up" as const)
							: ("neutral" as const),
					icon: <AlertCircle className="w-5 h-5" />,
					color: "secondary",
				},
			];
		}

		// Employee stats
		return [
			{
				label: "Hours This Month",
				value: `${myStats?.totalWorkHours || 0}h`,
				change: `Avg ${myStats?.avgWorkHours || 0}h/day`,
				trend: "up" as const,
				icon: <Clock className="w-5 h-5" />,
				color: "primary",
			},
			{
				label: "Days Present",
				value: (myStats?.presentDays || 0).toString(),
				change: "This month",
				trend: "neutral" as const,
				icon: <CheckCircle2 className="w-5 h-5" />,
				color: "success",
			},
			{
				label: "Pending Leaves",
				value: (myStats?.pendingLeaveRequests || 0).toString(),
				change: "Requests",
				trend: "neutral" as const,
				icon: <AlertCircle className="w-5 h-5" />,
				color: "warning",
			},
			{
				label: "Late Days",
				value: (myStats?.lateDays || 0).toString(),
				change: "This month",
				trend:
					(myStats?.lateDays || 0) > 0
						? ("down" as const)
						: ("neutral" as const),
				icon: <Timer className="w-5 h-5" />,
				color: "secondary",
			},
		];
	};

	const stats = getStats();

	// Fetch dashboard data
	const fetchDashboard = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await dashboardApi.getStats();
			setDashboardData(data);
			announce("Dashboard loaded successfully");
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error("Failed to load dashboard")
			);
			announce("Failed to load dashboard", "assertive");
		} finally {
			setIsLoading(false);
		}
	}, [announce]);

	useEffect(() => {
		fetchDashboard();
		fetchTodayAttendance();
	}, [fetchDashboard, fetchTodayAttendance]);

	const handleRefresh = () => {
		fetchDashboard();
		fetchTodayAttendance();
	};

	const getColorClasses = (color: string) => {
		const colors: Record<string, { bg: string; text: string }> = {
			primary: { bg: "bg-primary-muted", text: "text-primary" },
			secondary: { bg: "bg-secondary-muted", text: "text-secondary" },
			success: { bg: "bg-success-muted", text: "text-success" },
			warning: { bg: "bg-warning-muted", text: "text-warning" },
			error: { bg: "bg-error-muted", text: "text-error" },
		};
		return colors[color] || colors.primary;
	};

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good Morning";
		if (hour < 17) return "Good Afternoon";
		return "Good Evening";
	};

	// Animation class based on reduced motion preference
	const animationClass = prefersReducedMotion ? "" : "animate-fade-in";
	const staggerClass = (index: number) =>
		prefersReducedMotion ? "" : `stagger-${Math.min(index + 1, 6)}`;

	// Error state
	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<InlineError
					message={error.message}
					onRetry={() => {
						setError(null);
						setIsLoading(true);
						setTimeout(() => setIsLoading(false), 600);
					}}
				/>
			</div>
		);
	}

	// Loading state
	if (isLoading) {
		return (
			<div
				className="space-y-6"
				aria-label="Loading dashboard"
				aria-busy="true"
			>
				{/* Header skeleton */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<div className="h-8 w-64 bg-surface rounded-lg animate-shimmer" />
						<div className="h-5 w-80 bg-surface rounded-lg mt-2 animate-shimmer" />
					</div>
					<div className="flex items-center gap-3">
						<div className="h-10 w-32 bg-surface rounded-lg animate-shimmer" />
						<div className="h-10 w-24 bg-surface rounded-lg animate-shimmer" />
					</div>
				</div>

				{/* Stats skeleton */}
				<SkeletonStats count={4} />

				{/* Content skeleton */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 space-y-6">
						<SkeletonCard className="h-64" />
						<SkeletonCard className="h-80" />
					</div>
					<div className="space-y-6">
						<SkeletonCard className="h-64" />
						<SkeletonCard className="h-56" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn("space-y-6", animationClass)}
			role="main"
			aria-label="Dashboard"
		>
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">
						{getGreeting()}, {user?.name?.split(" ")[0]} 👋
					</h1>
					<p className="text-text-muted mt-1">
						Here&apos;s what&apos;s happening with your team today.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleRefresh}
						aria-label="Refresh dashboard"
						className="focus-ring"
					>
						<RefreshCw className="w-4 h-4" />
					</Button>
					<RoleGuard allowedRoles={["admin", "hr"]}>
						<Button variant="outline" leftIcon={<Plus className="w-4 h-4" />}>
							Add Employee
						</Button>
					</RoleGuard>
					<Button
						variant={isCheckedIn && !isCheckedOut ? "secondary" : "primary"}
						leftIcon={
							isCheckedIn ? (
								<LogOut className="w-4 h-4" />
							) : (
								<LogIn className="w-4 h-4" />
							)
						}
						onClick={handleClockAction}
						isLoading={isClockLoading}
						disabled={isCheckedOut}
					>
						{isCheckedOut
							? "Done for today"
							: isCheckedIn
							? "Clock Out"
							: "Clock In"}
					</Button>
				</div>
			</div>

			{/* Stats Grid */}
			<div
				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
				role="region"
				aria-label="Key statistics"
			>
				{stats.map((stat, index) => {
					const colors = getColorClasses(stat.color);
					return (
						<Card
							key={index}
							className={cn(
								"hover-lift cursor-pointer focus-ring",
								staggerClass(index),
								animationClass
							)}
							padding="md"
							tabIndex={0}
							role="article"
							aria-label={`${stat.label}: ${stat.value}`}
						>
							<div className="flex items-start justify-between">
								<div className={cn("p-2.5 rounded-xl", colors.bg)}>
									<span className={colors.text} aria-hidden="true">
										{stat.icon}
									</span>
								</div>
								{stat.trend !== "neutral" && (
									<div
										className={cn(
											"flex items-center gap-1 text-xs font-medium",
											stat.trend === "up" ? "text-success" : "text-error"
										)}
										aria-label={`Trend ${stat.trend}, ${stat.change}`}
									>
										{stat.trend === "up" ? (
											<TrendingUp className="w-3 h-3" aria-hidden="true" />
										) : (
											<TrendingDown className="w-3 h-3" aria-hidden="true" />
										)}
										{stat.change}
									</div>
								)}
								{stat.trend === "neutral" && (
									<span className="text-xs text-text-muted">{stat.change}</span>
								)}
							</div>
							<div className="mt-4">
								<p className="text-2xl font-bold text-text-primary">
									{stat.value}
								</p>
								<p className="text-sm text-text-muted mt-0.5">{stat.label}</p>
							</div>
						</Card>
					);
				})}
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Activity & Quick Actions */}
				<div className="lg:col-span-2 space-y-6">
					{/* Quick Actions - Employee */}
					<RoleGuard allowedRoles={["employee"]}>
						<Card>
							<CardHeader>
								<CardTitle>Quick Actions</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
									{quickActions.map((action, index) => (
										<Button
											key={index}
											variant={action.variant}
											className="flex-col h-auto py-4 gap-2"
											onClick={action.onClick}
											disabled={
												action.disabled || (index === 0 && isClockLoading)
											}
											isLoading={index === 0 && isClockLoading}
										>
											{action.icon}
											<span className="text-xs">{action.label}</span>
										</Button>
									))}
								</div>
							</CardContent>
						</Card>
					</RoleGuard>

					{/* Pending Approvals - HR/Admin */}
					<RoleGuard allowedRoles={["admin", "hr"]}>
						<Card>
							<CardHeader>
								<CardTitle>Pending Approvals</CardTitle>
								<Button
									variant="ghost"
									size="sm"
									rightIcon={<ArrowRight className="w-4 h-4" />}
								>
									View All
								</Button>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{dashboardData?.activities &&
									dashboardData.activities.filter((a) => a.status === "pending")
										.length > 0 ? (
										dashboardData.activities
											.filter((a) => a.status === "pending")
											.map((item) => (
												<div
													key={item.id}
													className="flex items-center gap-4 p-3 rounded-lg bg-surface hover:bg-card transition-colors"
												>
													<Avatar
														src={item.employeeAvatar}
														name={item.employeeName}
														size="md"
													/>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2">
															<p className="font-medium text-text-primary truncate">
																{item.employeeName}
															</p>
															<Badge variant="warning" size="sm">
																pending
															</Badge>
														</div>
														<p className="text-sm text-text-muted">
															{item.leaveType} Leave Request
														</p>
														<p className="text-xs text-text-muted mt-0.5">
															{item.days} day(s) -{" "}
															{item.department || "No dept"}
														</p>
													</div>
													<div className="flex items-center gap-2">
														<Button variant="success" size="sm">
															Approve
														</Button>
														<Button variant="outline" size="sm">
															Reject
														</Button>
													</div>
												</div>
											))
									) : (
										<p className="text-sm text-text-muted text-center py-4">
											No pending approvals
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					</RoleGuard>

					{/* Attendance Overview - Employee */}
					<RoleGuard allowedRoles={["employee"]}>
						<Card>
							<CardHeader>
								<CardTitle>Today&apos;s Attendance</CardTitle>
								<Badge
									variant={
										isCheckedOut
											? "secondary"
											: isCheckedIn
											? "success"
											: "warning"
									}
									dot
								>
									{isCheckedOut
										? "Completed"
										: isCheckedIn
										? "Working"
										: "Not Clocked In"}
								</Badge>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-3 gap-4 mb-6">
									<div className="text-center p-4 rounded-xl bg-surface">
										<p
											className={cn(
												"text-2xl font-bold",
												isCheckedIn ? "text-success" : "text-text-muted"
											)}
										>
											{todayAttendance?.checkIn
												? new Date(todayAttendance.checkIn).toLocaleTimeString(
														[],
														{ hour: "2-digit", minute: "2-digit" }
												  )
												: "--:--"}
										</p>
										<p className="text-xs text-text-muted mt-1">Clock In</p>
									</div>
									<div className="text-center p-4 rounded-xl bg-surface">
										<p
											className={cn(
												"text-2xl font-bold",
												isCheckedOut ? "text-error" : "text-text-muted"
											)}
										>
											{todayAttendance?.checkOut
												? new Date(todayAttendance.checkOut).toLocaleTimeString(
														[],
														{ hour: "2-digit", minute: "2-digit" }
												  )
												: "--:--"}
										</p>
										<p className="text-xs text-text-muted mt-1">Clock Out</p>
									</div>
									<div className="text-center p-4 rounded-xl bg-surface">
										<p className="text-2xl font-bold text-primary">
											{workingTime}
										</p>
										<p className="text-xs text-text-muted mt-1">Working</p>
									</div>
								</div>
								<div className="space-y-4">
									{(() => {
										// Calculate work hours and progress
										const workHoursDecimal = todayAttendance?.workHours || 0;
										const targetHours = 8;
										const progressPercent = Math.min(
											(workHoursDecimal / targetHours) * 100,
											100
										);
										const hoursWorked =
											workingTime !== "--:--" ? workingTime : "0h 0m";

										return (
											<>
												<div className="flex items-center justify-between text-sm">
													<span className="text-text-muted">
														Daily Progress
													</span>
													<span className="font-medium text-text-primary">
														{hoursWorked} / {targetHours} hours
													</span>
												</div>
												<Progress
													value={progressPercent}
													variant="primary"
													size="md"
												/>
											</>
										);
									})()}
									<div className="flex items-center gap-4 text-sm text-text-muted">
										<div className="flex items-center gap-1.5">
											<Coffee className="w-4 h-4" />
											<span>Break: {todayAttendance?.breakTime || 0}m</span>
										</div>
										<div className="flex items-center gap-1.5">
											<Clock className="w-4 h-4" />
											<span>Overtime: {todayAttendance?.overtime || 0}h</span>
										</div>
									</div>
								</div>

								{/* Clock In/Out Button */}
								{!isCheckedIn && (
									<Button
										variant="primary"
										className="w-full mt-4"
										onClick={handleClockAction}
										isLoading={isClockLoading}
										leftIcon={<LogIn className="w-4 h-4" />}
									>
										Clock In Now
									</Button>
								)}
								{isCheckedIn && !isCheckedOut && (
									<Button
										variant="secondary"
										className="w-full mt-4"
										onClick={handleClockAction}
										isLoading={isClockLoading}
										leftIcon={<LogOut className="w-4 h-4" />}
									>
										Clock Out
									</Button>
								)}
							</CardContent>
						</Card>
					</RoleGuard>

					{/* Recent Activity */}
					<Card>
						<CardHeader>
							<CardTitle>Recent Activity</CardTitle>
							<Button
								variant="ghost"
								size="sm"
								rightIcon={<ArrowRight className="w-4 h-4" />}
							>
								View All
							</Button>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{dashboardData?.activities &&
								dashboardData.activities.length > 0 ? (
									dashboardData.activities.map((activity) => (
										<div
											key={activity.id}
											className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface transition-colors"
										>
											<div
												className={cn(
													"p-2 rounded-lg",
													"bg-primary-muted text-primary"
												)}
											>
												<Calendar className="w-4 h-4" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-medium text-text-primary">
													{activity.employeeName} - {activity.leaveType}
												</p>
												<p className="text-sm text-text-muted">
													{activity.days} day(s) - {activity.status}
												</p>
											</div>
											<Badge
												variant={
													activity.status === "approved"
														? "success"
														: activity.status === "rejected"
														? "error"
														: "warning"
												}
												size="sm"
											>
												{activity.status}
											</Badge>
										</div>
									))
								) : (
									<p className="text-sm text-text-muted text-center py-4">
										No recent activities
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Events & Team */}
				<div className="space-y-6">
					{/* Today's Schedule */}
					<Card>
						<CardHeader>
							<CardTitle>Today&apos;s Schedule</CardTitle>
							<Button variant="ghost" size="sm">
								<Plus className="w-4 h-4" />
							</Button>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<p className="text-sm text-text-muted text-center py-4">
									No scheduled events for today
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Leave Balance - Employee */}
					<RoleGuard allowedRoles={["employee"]}>
						<Card>
							<CardHeader>
								<CardTitle>Leave Balance</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div>
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm text-text-muted">
												Annual Leave
											</span>
											<span className="text-sm font-medium">12/18 days</span>
										</div>
										<Progress value={66.6} variant="primary" size="sm" />
									</div>
									<div>
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm text-text-muted">
												Sick Leave
											</span>
											<span className="text-sm font-medium">8/10 days</span>
										</div>
										<Progress value={80} variant="secondary" size="sm" />
									</div>
									<div>
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm text-text-muted">
												Personal Leave
											</span>
											<span className="text-sm font-medium">3/5 days</span>
										</div>
										<Progress value={60} variant="success" size="sm" />
									</div>
								</div>
								<Button variant="outline" className="w-full mt-4">
									Request Leave
								</Button>
							</CardContent>
						</Card>
					</RoleGuard>

					{/* Team Status - Admin/HR */}
					<RoleGuard allowedRoles={["admin", "hr"]}>
						<Card>
							<CardHeader>
								<CardTitle>Employees On Leave</CardTitle>
								<Badge variant="warning" size="sm">
									{dashboardData?.onLeave?.length || 0} Today
								</Badge>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{dashboardData?.onLeave &&
									dashboardData.onLeave.length > 0 ? (
										dashboardData.onLeave.map((emp) => (
											<div key={emp.id} className="flex items-center gap-3">
												<Avatar src={emp.avatar} name={emp.name} size="sm" />
												<div className="flex-1">
													<p className="text-sm font-medium text-text-primary">
														{emp.name}
													</p>
													<p className="text-xs text-text-muted">
														{emp.leaveType} - Returns{" "}
														{new Date(emp.returnDate).toLocaleDateString()}
													</p>
												</div>
											</div>
										))
									) : (
										<p className="text-sm text-text-muted text-center py-4">
											No employees on leave today
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					</RoleGuard>

					{/* Upcoming Birthdays */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Cake className="w-5 h-5 text-secondary" />
								Upcoming Birthdays
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<p className="text-sm text-text-muted text-center py-4">
									No upcoming birthdays this week
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
