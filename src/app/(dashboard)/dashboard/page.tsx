"use client";

import React, { useState, useEffect } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	Badge,
	Avatar,
	AvatarGroup,
	Button,
	Progress,
	SkeletonStats,
	SkeletonCard,
	SkeletonText,
	EmptyState,
	InlineError,
} from "@/components/ui";
import { useAuth, RoleGuard } from "@/context/AuthContext";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
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
	ChevronRight,
	RefreshCw,
} from "lucide-react";
import { dashboardApi, type DashboardStats } from "@/services/api";

// Mock data
const statsData = {
	admin: [
		{
			label: "Total Employees",
			value: "248",
			change: "+12%",
			trend: "up",
			icon: <Users className="w-5 h-5" />,
			color: "primary",
		},
		{
			label: "Active Today",
			value: "186",
			change: "75%",
			trend: "up",
			icon: <UserCheck className="w-5 h-5" />,
			color: "success",
		},
		{
			label: "On Leave",
			value: "23",
			change: "-5%",
			trend: "down",
			icon: <Calendar className="w-5 h-5" />,
			color: "warning",
		},
		{
			label: "Open Positions",
			value: "8",
			change: "+3",
			trend: "up",
			icon: <Briefcase className="w-5 h-5" />,
			color: "secondary",
		},
	],
	hr: [
		{
			label: "Total Employees",
			value: "248",
			change: "+12%",
			trend: "up",
			icon: <Users className="w-5 h-5" />,
			color: "primary",
		},
		{
			label: "Pending Requests",
			value: "15",
			change: "+5",
			trend: "up",
			icon: <AlertCircle className="w-5 h-5" />,
			color: "warning",
		},
		{
			label: "Leave Requests",
			value: "7",
			change: "Today",
			trend: "neutral",
			icon: <Calendar className="w-5 h-5" />,
			color: "secondary",
		},
		{
			label: "Interviews",
			value: "4",
			change: "This week",
			trend: "neutral",
			icon: <Briefcase className="w-5 h-5" />,
			color: "primary",
		},
	],
	employee: [
		{
			label: "Hours This Week",
			value: "32h",
			change: "80%",
			trend: "up",
			icon: <Clock className="w-5 h-5" />,
			color: "primary",
		},
		{
			label: "Leave Balance",
			value: "12",
			change: "days left",
			trend: "neutral",
			icon: <Calendar className="w-5 h-5" />,
			color: "success",
		},
		{
			label: "Pending Tasks",
			value: "5",
			change: "2 due today",
			trend: "up",
			icon: <AlertCircle className="w-5 h-5" />,
			color: "warning",
		},
		{
			label: "Team Members",
			value: "8",
			change: "Online",
			trend: "neutral",
			icon: <Users className="w-5 h-5" />,
			color: "secondary",
		},
	],
};

const recentActivities = [
	{
		id: "1",
		type: "leave",
		title: "Leave request approved",
		description: "Your annual leave for Dec 25-27 has been approved",
		time: new Date(Date.now() - 1000 * 60 * 30),
		icon: <CheckCircle2 className="w-4 h-4" />,
		iconBg: "bg-success-muted text-success",
	},
	{
		id: "2",
		type: "task",
		title: "New task assigned",
		description: "Complete Q4 performance review",
		time: new Date(Date.now() - 1000 * 60 * 60 * 2),
		icon: <AlertCircle className="w-4 h-4" />,
		iconBg: "bg-warning-muted text-warning",
	},
	{
		id: "3",
		type: "payroll",
		title: "Payslip generated",
		description: "December 2025 payslip is ready",
		time: new Date(Date.now() - 1000 * 60 * 60 * 5),
		icon: <DollarSign className="w-4 h-4" />,
		iconBg: "bg-primary-muted text-primary",
	},
	{
		id: "4",
		type: "attendance",
		title: "Clock-in recorded",
		description: "You clocked in at 9:02 AM",
		time: new Date(Date.now() - 1000 * 60 * 60 * 8),
		icon: <Timer className="w-4 h-4" />,
		iconBg: "bg-secondary-muted text-secondary",
	},
];

const upcomingEvents = [
	{
		id: "1",
		title: "Team Standup",
		time: "10:00 AM",
		type: "meeting",
		attendees: 8,
	},
	{
		id: "2",
		title: "Project Review",
		time: "2:00 PM",
		type: "meeting",
		attendees: 5,
	},
	{
		id: "3",
		title: "Sarah's Birthday",
		time: "All day",
		type: "birthday",
	},
	{
		id: "4",
		title: "Q4 Deadline",
		time: "5:00 PM",
		type: "deadline",
	},
];

const pendingApprovals = [
	{
		id: "1",
		employee: {
			name: "Emily Watson",
			avatar:
				"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
			department: "Marketing",
		},
		type: "Leave Request",
		details: "Annual Leave: Dec 28 - Jan 2",
		status: "pending",
		priority: "high",
	},
	{
		id: "2",
		employee: {
			name: "David Kim",
			avatar:
				"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
			department: "Engineering",
		},
		type: "Expense Claim",
		details: "$450 - Conference Travel",
		status: "pending",
		priority: "medium",
	},
	{
		id: "3",
		employee: {
			name: "Lisa Chen",
			avatar:
				"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
			department: "Design",
		},
		type: "Leave Request",
		details: "Sick Leave: Dec 26",
		status: "pending",
		priority: "high",
	},
];

const quickActions = [
	{
		label: "Clock In",
		icon: <Timer className="w-5 h-5" />,
		variant: "primary" as const,
	},
	{
		label: "Request Leave",
		icon: <Calendar className="w-5 h-5" />,
		variant: "outline" as const,
	},
	{
		label: "Log Expense",
		icon: <DollarSign className="w-5 h-5" />,
		variant: "outline" as const,
	},
	{
		label: "View Payslip",
		icon: <Briefcase className="w-5 h-5" />,
		variant: "outline" as const,
	},
];

export default function DashboardPage() {
	const { user, role } = useAuth();
	const stats = role ? statsData[role] : statsData.employee;
	const prefersReducedMotion = useReducedMotion();
	const announce = useAriaAnnounce();

	// Loading states
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
		null
	);

	// Fetch dashboard data
	const fetchDashboard = async () => {
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
	};

	useEffect(() => {
		fetchDashboard();
	}, [announce]);

	const handleRefresh = () => {
		fetchDashboard();
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
					<Button variant="primary" leftIcon={<Timer className="w-4 h-4" />}>
						Clock In
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
									{pendingApprovals.map((item) => (
										<div
											key={item.id}
											className="flex items-center gap-4 p-3 rounded-lg bg-surface hover:bg-card transition-colors"
										>
											<Avatar
												src={item.employee.avatar}
												name={item.employee.name}
												size="md"
											/>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<p className="font-medium text-text-primary truncate">
														{item.employee.name}
													</p>
													<Badge
														variant={
															item.priority === "high" ? "error" : "warning"
														}
														size="sm"
													>
														{item.priority}
													</Badge>
												</div>
												<p className="text-sm text-text-muted">{item.type}</p>
												<p className="text-xs text-text-muted mt-0.5">
													{item.details}
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
									))}
								</div>
							</CardContent>
						</Card>
					</RoleGuard>

					{/* Attendance Overview - Employee */}
					<RoleGuard allowedRoles={["employee"]}>
						<Card>
							<CardHeader>
								<CardTitle>Today&apos;s Attendance</CardTitle>
								<Badge variant="success" dot>
									Active
								</Badge>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-3 gap-4 mb-6">
									<div className="text-center p-4 rounded-xl bg-surface">
										<p className="text-2xl font-bold text-success">9:02</p>
										<p className="text-xs text-text-muted mt-1">Clock In</p>
									</div>
									<div className="text-center p-4 rounded-xl bg-surface">
										<p className="text-2xl font-bold text-text-muted">--:--</p>
										<p className="text-xs text-text-muted mt-1">Clock Out</p>
									</div>
									<div className="text-center p-4 rounded-xl bg-surface">
										<p className="text-2xl font-bold text-primary">5h 32m</p>
										<p className="text-xs text-text-muted mt-1">Working</p>
									</div>
								</div>
								<div className="space-y-4">
									<div className="flex items-center justify-between text-sm">
										<span className="text-text-muted">Daily Progress</span>
										<span className="font-medium text-text-primary">
											5.5 / 8 hours
										</span>
									</div>
									<Progress value={68.75} variant="primary" size="md" />
									<div className="flex items-center gap-4 text-sm text-text-muted">
										<div className="flex items-center gap-1.5">
											<Coffee className="w-4 h-4" />
											<span>Break: 30m</span>
										</div>
										<div className="flex items-center gap-1.5">
											<Clock className="w-4 h-4" />
											<span>Overtime: 0h</span>
										</div>
									</div>
								</div>
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
								{recentActivities.map((activity) => (
									<div
										key={activity.id}
										className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface transition-colors"
									>
										<div className={cn("p-2 rounded-lg", activity.iconBg)}>
											{activity.icon}
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-text-primary">
												{activity.title}
											</p>
											<p className="text-sm text-text-muted">
												{activity.description}
											</p>
										</div>
										<span className="text-xs text-text-muted whitespace-nowrap">
											{formatRelativeTime(activity.time)}
										</span>
									</div>
								))}
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
								{upcomingEvents.map((event) => (
									<div
										key={event.id}
										className="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-card transition-colors cursor-pointer"
									>
										<div
											className={cn(
												"w-1 h-10 rounded-full",
												event.type === "meeting"
													? "bg-primary"
													: event.type === "birthday"
													? "bg-secondary"
													: "bg-warning"
											)}
										/>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-text-primary text-sm">
												{event.title}
											</p>
											<p className="text-xs text-text-muted">{event.time}</p>
										</div>
										{event.attendees && (
											<div className="flex items-center gap-1 text-xs text-text-muted">
												<Users className="w-3 h-3" />
												{event.attendees}
											</div>
										)}
										{event.type === "birthday" && (
											<Cake className="w-4 h-4 text-secondary" />
										)}
										<ChevronRight className="w-4 h-4 text-text-muted" />
									</div>
								))}
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

					{/* Team Online - Admin/HR */}
					<RoleGuard allowedRoles={["admin", "hr"]}>
						<Card>
							<CardHeader>
								<CardTitle>Team Online</CardTitle>
								<Badge variant="success" size="sm">
									186 Active
								</Badge>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{[
										{ name: "Engineering", count: 45, total: 52 },
										{ name: "Marketing", count: 28, total: 35 },
										{ name: "Sales", count: 38, total: 42 },
										{ name: "Design", count: 15, total: 18 },
										{ name: "HR", count: 12, total: 12 },
									].map((dept) => (
										<div
											key={dept.name}
											className="flex items-center justify-between"
										>
											<span className="text-sm text-text-muted">
												{dept.name}
											</span>
											<div className="flex items-center gap-2">
												<Progress
													value={(dept.count / dept.total) * 100}
													variant="success"
													size="sm"
													className="w-20"
												/>
												<span className="text-xs text-text-primary font-medium w-12 text-right">
													{dept.count}/{dept.total}
												</span>
											</div>
										</div>
									))}
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
								{[
									{
										name: "Sarah Johnson",
										date: "Today",
										avatar:
											"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
									},
									{
										name: "Mike Brown",
										date: "Tomorrow",
										avatar:
											"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
									},
									{
										name: "Emily Davis",
										date: "Jan 5",
										avatar:
											"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
									},
								].map((person) => (
									<div key={person.name} className="flex items-center gap-3">
										<Avatar src={person.avatar} name={person.name} size="sm" />
										<div className="flex-1">
											<p className="text-sm font-medium text-text-primary">
												{person.name}
											</p>
											<p className="text-xs text-text-muted">{person.date}</p>
										</div>
										{person.date === "Today" && (
											<span className="text-lg">🎉</span>
										)}
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
