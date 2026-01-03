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
import { Clock, UserCheck, UserX, Calendar, Download } from "lucide-react";

// Mock attendance data for today
const todayAttendance = [
	{
		id: "1",
		name: "Sarah Johnson",
		avatar:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
		checkIn: "09:02 AM",
		checkOut: null,
		status: "present",
		workHours: "5h 32m",
	},
	{
		id: "2",
		name: "Michael Chen",
		avatar:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
		checkIn: "08:45 AM",
		checkOut: null,
		status: "present",
		workHours: "5h 49m",
	},
	{
		id: "3",
		name: "Emily Watson",
		avatar:
			"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
		checkIn: null,
		checkOut: null,
		status: "on_leave",
		workHours: "--",
	},
	{
		id: "4",
		name: "David Kim",
		avatar:
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
		checkIn: "09:15 AM",
		checkOut: null,
		status: "late",
		workHours: "5h 19m",
	},
	{
		id: "5",
		name: "Lisa Chen",
		avatar:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
		checkIn: "08:58 AM",
		checkOut: null,
		status: "present",
		workHours: "5h 36m",
	},
];

const stats = [
	{
		label: "Present",
		value: 186,
		total: 248,
		icon: <UserCheck className="w-5 h-5" />,
		color: "success",
	},
	{
		label: "Absent",
		value: 12,
		total: 248,
		icon: <UserX className="w-5 h-5" />,
		color: "error",
	},
	{
		label: "On Leave",
		value: 23,
		total: 248,
		icon: <Calendar className="w-5 h-5" />,
		color: "warning",
	},
	{
		label: "Late",
		value: 27,
		total: 248,
		icon: <Clock className="w-5 h-5" />,
		color: "secondary",
	},
];

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
		case "absent":
			return (
				<Badge variant="error" size="sm">
					Absent
				</Badge>
			);
		case "on_leave":
			return (
				<Badge variant="secondary" size="sm">
					On Leave
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

export default function AttendancePage() {
	const today = new Date().toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">Attendance</h1>
					<p className="text-text-muted mt-1">{today}</p>
				</div>
				<Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
					Export Report
				</Button>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				{stats.map((stat, index) => (
					<Card key={index} padding="md">
						<div className="flex items-center justify-between mb-3">
							<div className={`p-2 rounded-lg bg-${stat.color}-muted`}>
								<span className={`text-${stat.color}`}>{stat.icon}</span>
							</div>
							<span className="text-sm text-text-muted">
								{Math.round((stat.value / stat.total) * 100)}%
							</span>
						</div>
						<p className="text-2xl font-bold text-text-primary">{stat.value}</p>
						<p className="text-sm text-text-muted">{stat.label}</p>
						<Progress
							value={(stat.value / stat.total) * 100}
							variant={
								stat.color as "success" | "error" | "warning" | "secondary"
							}
							size="sm"
							className="mt-3"
						/>
					</Card>
				))}
			</div>

			{/* Attendance Table */}
			<Card padding="none">
				<CardHeader className="px-6 pt-6">
					<CardTitle>Today&apos;s Attendance</CardTitle>
				</CardHeader>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b border-border">
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
									Status
								</th>
							</tr>
						</thead>
						<tbody>
							{todayAttendance.map((record) => (
								<tr
									key={record.id}
									className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
								>
									<td className="px-6 py-4">
										<div className="flex items-center gap-3">
											<Avatar
												src={record.avatar}
												name={record.name}
												size="sm"
											/>
											<span className="font-medium text-text-primary">
												{record.name}
											</span>
										</div>
									</td>
									<td className="px-6 py-4">
										<span className="text-text-primary">
											{record.checkIn || "--"}
										</span>
									</td>
									<td className="px-6 py-4">
										<span className="text-text-primary">
											{record.checkOut || "--"}
										</span>
									</td>
									<td className="px-6 py-4">
										<span className="text-text-primary font-medium">
											{record.workHours}
										</span>
									</td>
									<td className="px-6 py-4">{getStatusBadge(record.status)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
}
