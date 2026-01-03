"use client";

import React from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	Button,
	Badge,
	Avatar,
	Progress,
} from "@/components/ui";
import {
	Plus,
	Calendar,
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
} from "lucide-react";

// Mock leave requests
const leaveRequests = [
	{
		id: "1",
		employee: {
			name: "Emily Watson",
			avatar:
				"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
			department: "Marketing",
		},
		type: "Annual Leave",
		startDate: "Dec 28, 2025",
		endDate: "Jan 2, 2026",
		days: 4,
		reason: "Family vacation",
		status: "pending",
		appliedOn: "Dec 20, 2025",
	},
	{
		id: "2",
		employee: {
			name: "David Kim",
			avatar:
				"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
			department: "Engineering",
		},
		type: "Sick Leave",
		startDate: "Dec 26, 2025",
		endDate: "Dec 26, 2025",
		days: 1,
		reason: "Medical appointment",
		status: "approved",
		appliedOn: "Dec 24, 2025",
	},
	{
		id: "3",
		employee: {
			name: "Lisa Chen",
			avatar:
				"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
			department: "Design",
		},
		type: "Personal Leave",
		startDate: "Jan 5, 2026",
		endDate: "Jan 5, 2026",
		days: 1,
		reason: "Personal matters",
		status: "pending",
		appliedOn: "Dec 30, 2025",
	},
];

// Mock leave balance
const leaveBalances = [
	{ type: "Annual Leave", used: 6, total: 18, color: "primary" },
	{ type: "Sick Leave", used: 2, total: 10, color: "secondary" },
	{ type: "Personal Leave", used: 2, total: 5, color: "success" },
];

const getStatusBadge = (status: string) => {
	switch (status) {
		case "approved":
			return (
				<Badge variant="success" size="sm">
					<CheckCircle className="w-3 h-3" />
					Approved
				</Badge>
			);
		case "pending":
			return (
				<Badge variant="warning" size="sm">
					<AlertCircle className="w-3 h-3" />
					Pending
				</Badge>
			);
		case "rejected":
			return (
				<Badge variant="error" size="sm">
					<XCircle className="w-3 h-3" />
					Rejected
				</Badge>
			);
		default:
			return (
				<Badge variant="default" size="sm">
					{status}
				</Badge>
			);
	}
};

const getLeaveTypeBadge = (type: string) => {
	switch (type) {
		case "Annual Leave":
			return (
				<Badge variant="primary" size="sm">
					{type}
				</Badge>
			);
		case "Sick Leave":
			return (
				<Badge variant="error" size="sm">
					{type}
				</Badge>
			);
		case "Personal Leave":
			return (
				<Badge variant="secondary" size="sm">
					{type}
				</Badge>
			);
		default:
			return (
				<Badge variant="default" size="sm">
					{type}
				</Badge>
			);
	}
};

export default function TimeOffPage() {
	return (
		<div className="space-y-6 animate-fade-in">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">Time Off</h1>
					<p className="text-text-muted mt-1">
						Manage leave requests and balances
					</p>
				</div>
				<Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
					Request Time Off
				</Button>
			</div>

			{/* Leave Balance Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{leaveBalances.map((balance, index) => (
					<Card key={index} padding="md">
						<div className="flex items-center justify-between mb-4">
							<h3 className="font-medium text-text-primary">{balance.type}</h3>
							<Badge
								variant={balance.color as "primary" | "secondary" | "success"}
								size="sm"
							>
								{balance.total - balance.used} days left
							</Badge>
						</div>
						<Progress
							value={(balance.used / balance.total) * 100}
							variant={balance.color as "primary" | "secondary" | "success"}
							size="md"
							className="mb-2"
						/>
						<div className="flex justify-between text-sm">
							<span className="text-text-muted">Used: {balance.used} days</span>
							<span className="text-text-muted">
								Total: {balance.total} days
							</span>
						</div>
					</Card>
				))}
			</div>

			{/* Leave Requests */}
			<Card padding="none">
				<CardHeader className="px-6 pt-6">
					<CardTitle>Leave Requests</CardTitle>
					<div className="flex gap-2">
						<Button variant="ghost" size="sm">
							All
						</Button>
						<Button variant="ghost" size="sm">
							Pending
						</Button>
						<Button variant="ghost" size="sm">
							Approved
						</Button>
					</div>
				</CardHeader>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b border-border">
								<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
									Employee
								</th>
								<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
									Type
								</th>
								<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4 hidden md:table-cell">
									Duration
								</th>
								<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4 hidden lg:table-cell">
									Reason
								</th>
								<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
									Status
								</th>
								<th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{leaveRequests.map((request) => (
								<tr
									key={request.id}
									className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
								>
									<td className="px-6 py-4">
										<div className="flex items-center gap-3">
											<Avatar
												src={request.employee.avatar}
												name={request.employee.name}
												size="sm"
											/>
											<div>
												<p className="font-medium text-text-primary">
													{request.employee.name}
												</p>
												<p className="text-xs text-text-muted">
													{request.employee.department}
												</p>
											</div>
										</div>
									</td>
									<td className="px-6 py-4">
										{getLeaveTypeBadge(request.type)}
									</td>
									<td className="px-6 py-4 hidden md:table-cell">
										<div className="flex items-center gap-2">
											<Calendar className="w-4 h-4 text-text-muted" />
											<div>
												<p className="text-sm text-text-primary">
													{request.startDate} - {request.endDate}
												</p>
												<p className="text-xs text-text-muted">
													{request.days} day{request.days > 1 ? "s" : ""}
												</p>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 hidden lg:table-cell">
										<span className="text-text-muted text-sm">
											{request.reason}
										</span>
									</td>
									<td className="px-6 py-4">
										{getStatusBadge(request.status)}
									</td>
									<td className="px-6 py-4 text-right">
										{request.status === "pending" && (
											<div className="flex items-center justify-end gap-2">
												<Button variant="success" size="xs">
													Approve
												</Button>
												<Button variant="outline" size="xs">
													Reject
												</Button>
											</div>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
}
