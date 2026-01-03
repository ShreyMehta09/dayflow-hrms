"use client";

import React, { useState, useEffect } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	Button,
	Badge,
	Modal,
	Input,
	Avatar,
	Tabs,
	TabPanel,
	SkeletonCard,
	SkeletonTable,
	NoLeaveRequests,
	NoSearchResults,
	InlineError,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useReducedMotion, useAriaAnnounce } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import {
	Plus,
	Calendar,
	CheckCircle,
	XCircle,
	AlertCircle,
	Umbrella,
	Stethoscope,
	Upload,
	X,
	FileText,
	Search,
	Users,
	Clock,
	Edit,
	RefreshCw,
} from "lucide-react";
import {
	timeOffApi,
	type TimeOffRequest,
	type LeaveBalance,
} from "@/services/api";

// ==================== MOCK DATA ====================

// Mock leave requests for employee view
const myLeaveRequests = [
	{
		id: "1",
		type: "Paid Time Off",
		startDate: "2025-12-28",
		endDate: "2026-01-02",
		days: 4,
		reason: "Family vacation",
		status: "approved",
		appliedOn: "2025-12-20",
		allocation: "2025 Annual Allocation",
	},
	{
		id: "2",
		type: "Sick Leave",
		startDate: "2025-12-26",
		endDate: "2025-12-26",
		days: 1,
		reason: "Medical appointment",
		status: "approved",
		appliedOn: "2025-12-24",
		allocation: "2025 Sick Leave",
		attachment: "medical_certificate.pdf",
	},
	{
		id: "3",
		type: "Paid Time Off",
		startDate: "2026-01-15",
		endDate: "2026-01-17",
		days: 3,
		reason: "Personal matters",
		status: "pending",
		appliedOn: "2026-01-02",
		allocation: "2025 Annual Allocation",
	},
	{
		id: "4",
		type: "Sick Leave",
		startDate: "2025-11-10",
		endDate: "2025-11-10",
		days: 1,
		reason: "Flu",
		status: "rejected",
		appliedOn: "2025-11-09",
		allocation: "2025 Sick Leave",
		rejectionReason: "Insufficient documentation",
	},
];

// Mock all leave requests for admin view
const allLeaveRequests = [
	{
		id: "1",
		employee: {
			id: "emp1",
			name: "Emily Watson",
			avatar:
				"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
			department: "Marketing",
			position: "Marketing Manager",
		},
		type: "Paid Time Off",
		startDate: "2026-01-10",
		endDate: "2026-01-14",
		days: 5,
		reason: "Family vacation to Europe",
		status: "pending",
		appliedOn: "2026-01-02",
		allocation: "2026 Annual Allocation",
	},
	{
		id: "2",
		employee: {
			id: "emp2",
			name: "David Kim",
			avatar:
				"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
			department: "Engineering",
			position: "Senior Developer",
		},
		type: "Sick Leave",
		startDate: "2026-01-03",
		endDate: "2026-01-03",
		days: 1,
		reason: "Doctor's appointment",
		status: "pending",
		appliedOn: "2026-01-02",
		allocation: "2026 Sick Leave",
		attachment: "appointment_confirmation.pdf",
	},
	{
		id: "3",
		employee: {
			id: "emp3",
			name: "Lisa Chen",
			avatar:
				"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
			department: "Design",
			position: "UI/UX Designer",
		},
		type: "Paid Time Off",
		startDate: "2026-01-20",
		endDate: "2026-01-22",
		days: 3,
		reason: "Wedding ceremony",
		status: "pending",
		appliedOn: "2026-01-01",
		allocation: "2026 Annual Allocation",
	},
	{
		id: "4",
		employee: {
			id: "emp4",
			name: "Marcus Johnson",
			avatar:
				"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
			department: "Sales",
			position: "Sales Representative",
		},
		type: "Paid Time Off",
		startDate: "2025-12-28",
		endDate: "2026-01-02",
		days: 4,
		reason: "Year-end holidays",
		status: "approved",
		appliedOn: "2025-12-20",
		allocation: "2025 Annual Allocation",
		approvedBy: "HR Manager",
		approvedOn: "2025-12-21",
	},
	{
		id: "5",
		employee: {
			id: "emp5",
			name: "Sarah Williams",
			avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
			department: "Finance",
			position: "Financial Analyst",
		},
		type: "Sick Leave",
		startDate: "2025-12-26",
		endDate: "2025-12-27",
		days: 2,
		reason: "Flu recovery",
		status: "approved",
		appliedOn: "2025-12-25",
		allocation: "2025 Sick Leave",
		attachment: "medical_note.pdf",
		approvedBy: "HR Manager",
		approvedOn: "2025-12-25",
	},
	{
		id: "6",
		employee: {
			id: "emp6",
			name: "James Wilson",
			avatar:
				"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
			department: "Engineering",
			position: "Backend Developer",
		},
		type: "Paid Time Off",
		startDate: "2025-12-15",
		endDate: "2025-12-16",
		days: 2,
		reason: "Personal errands",
		status: "rejected",
		appliedOn: "2025-12-10",
		allocation: "2025 Annual Allocation",
		rejectedBy: "HR Manager",
		rejectedOn: "2025-12-11",
		rejectionReason: "Critical project deadline",
	},
];

// Mock allocations data for admin
const allAllocations = [
	{
		id: "1",
		employee: {
			id: "emp1",
			name: "Emily Watson",
			avatar:
				"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
			department: "Marketing",
		},
		type: "Paid Time Off",
		year: 2026,
		allocated: 20,
		used: 0,
		pending: 5,
		available: 15,
	},
	{
		id: "2",
		employee: {
			id: "emp1",
			name: "Emily Watson",
			avatar:
				"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
			department: "Marketing",
		},
		type: "Sick Leave",
		year: 2026,
		allocated: 10,
		used: 0,
		pending: 0,
		available: 10,
	},
	{
		id: "3",
		employee: {
			id: "emp2",
			name: "David Kim",
			avatar:
				"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
			department: "Engineering",
		},
		type: "Paid Time Off",
		year: 2026,
		allocated: 20,
		used: 0,
		pending: 0,
		available: 20,
	},
	{
		id: "4",
		employee: {
			id: "emp2",
			name: "David Kim",
			avatar:
				"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
			department: "Engineering",
		},
		type: "Sick Leave",
		year: 2026,
		allocated: 10,
		used: 0,
		pending: 1,
		available: 9,
	},
	{
		id: "5",
		employee: {
			id: "emp3",
			name: "Lisa Chen",
			avatar:
				"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
			department: "Design",
		},
		type: "Paid Time Off",
		year: 2026,
		allocated: 18,
		used: 0,
		pending: 3,
		available: 15,
	},
	{
		id: "6",
		employee: {
			id: "emp3",
			name: "Lisa Chen",
			avatar:
				"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
			department: "Design",
		},
		type: "Sick Leave",
		year: 2026,
		allocated: 10,
		used: 0,
		pending: 0,
		available: 10,
	},
];

// Employee leave balance
const leaveBalance = {
	paidTimeOff: {
		total: 20,
		used: 7,
		pending: 3,
		available: 10,
	},
	sickLeave: {
		total: 10,
		used: 1,
		pending: 0,
		available: 9,
	},
};

// ==================== HELPER FUNCTIONS ====================

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

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

// ==================== EMPLOYEE VIEW COMPONENT ====================

function EmployeeTimeOffView() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [leaveRequests, setLeaveRequests] = useState<TimeOffRequest[]>([]);
	const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
	const [formData, setFormData] = useState({
		type: "Paid Time Off",
		startDate: "",
		endDate: "",
		allocation: "2026 Annual Allocation",
		reason: "",
		attachment: null as File | null,
	});

	const prefersReducedMotion = useReducedMotion();
	const announce = useAriaAnnounce();

	const animationClass = prefersReducedMotion ? "" : "animate-fade-in";

	// Fetch data from API
	const fetchData = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const [requestsData, balanceData] = await Promise.all([
				timeOffApi.getAll({ view: "my" }),
				timeOffApi.getBalance(),
			]);
			setLeaveRequests(requestsData.requests || []);
			setLeaveBalance(balanceData.balance || null);
			announce("Time off data loaded");
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error("Failed to load time off data")
			);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [announce]);

	const handleRefresh = () => {
		fetchData();
	};

	const handleOpenModal = () => {
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setFormData({
			type: "Paid Time Off",
			startDate: "",
			endDate: "",
			allocation: "2026 Annual Allocation",
			reason: "",
			attachment: null,
		});
	};

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
			...(name === "type" && {
				allocation:
					value === "Sick Leave" ? "2026 Sick Leave" : "2026 Annual Allocation",
			}),
		}));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFormData((prev) => ({
				...prev,
				attachment: e.target.files![0],
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (formData.type === "Sick Leave" && !formData.attachment) {
			alert("Attachment is mandatory for sick leave requests!");
			return;
		}

		if (!formData.startDate || !formData.endDate) {
			alert("Please select both start and end dates!");
			return;
		}

		try {
			const leaveType =
				formData.type === "Sick Leave" ? "sick_leave" : "paid_time_off";
			await timeOffApi.create({
				type: leaveType,
				startDate: formData.startDate,
				endDate: formData.endDate,
				reason: formData.reason,
			});
			handleCloseModal();
			fetchData();
			announce("Leave request submitted successfully");
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to submit request");
		}
	};

	const isSickLeave = formData.type === "Sick Leave";

	// Error state
	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<InlineError message={error.message} onRetry={handleRefresh} />
			</div>
		);
	}

	// Loading state
	if (isLoading) {
		return (
			<div
				className="space-y-6"
				aria-label="Loading time off data"
				aria-busy="true"
			>
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<div className="h-8 w-48 bg-surface rounded-lg animate-shimmer" />
						<div className="h-5 w-64 bg-surface rounded-lg mt-2 animate-shimmer" />
					</div>
					<div className="h-10 w-40 bg-surface rounded-lg animate-shimmer" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<SkeletonCard className="h-64" />
					<SkeletonCard className="h-64" />
				</div>
				<SkeletonCard className="h-96" />
			</div>
		);
	}

	return (
		<div
			className={cn("space-y-6", animationClass)}
			role="main"
			aria-label="My time off management"
		>
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">My Time Off</h1>
					<p className="text-text-muted mt-1">
						Manage your leave requests and balances
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleRefresh}
						aria-label="Refresh time off data"
						className="focus-ring"
					>
						<RefreshCw className="w-4 h-4" />
					</Button>
					<Button
						variant="primary"
						leftIcon={<Plus className="w-4 h-4" />}
						onClick={handleOpenModal}
					>
						New Leave Request
					</Button>
				</div>
			</div>

			{/* Leave Balance Cards */}
			{leaveBalance && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Paid Time Off */}
					<Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
						<CardContent className="py-6">
							<div className="flex items-start justify-between mb-4">
								<div className="flex items-center gap-3">
									<div className="p-3 rounded-lg bg-primary/20">
										<Umbrella className="w-6 h-6 text-primary" />
									</div>
									<div>
										<h3 className="font-semibold text-text-primary">
											Paid Time Off
										</h3>
										<p className="text-sm text-text-muted">Annual Leave</p>
									</div>
								</div>
							</div>

							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm text-text-muted">
										Total Allocation
									</span>
									<span className="font-semibold text-text-primary">
										{leaveBalance.paidTimeOff.total} days
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-text-muted">Used</span>
									<span className="font-semibold text-error">
										{leaveBalance.paidTimeOff.used} days
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-text-muted">Pending</span>
									<span className="font-semibold text-warning">
										{leaveBalance.paidTimeOff.pending} days
									</span>
								</div>
								<div className="h-px bg-border" />
								<div className="flex items-center justify-between">
									<span className="font-medium text-text-primary">
										Available
									</span>
									<span className="text-2xl font-bold text-success">
										{leaveBalance.paidTimeOff.available}
									</span>
								</div>
							</div>

							<div className="mt-4">
								<div className="w-full bg-surface rounded-full h-2 overflow-hidden">
									<div
										className="bg-primary h-full rounded-full transition-all"
										style={{
											width: `${
												(leaveBalance.paidTimeOff.used /
													leaveBalance.paidTimeOff.total) *
												100
											}%`,
										}}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Sick Leave */}
					<Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30">
						<CardContent className="py-6">
							<div className="flex items-start justify-between mb-4">
								<div className="flex items-center gap-3">
									<div className="p-3 rounded-lg bg-secondary/20">
										<Stethoscope className="w-6 h-6 text-secondary" />
									</div>
									<div>
										<h3 className="font-semibold text-text-primary">
											Sick Leave
										</h3>
										<p className="text-sm text-text-muted">Medical Leave</p>
									</div>
								</div>
							</div>

							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm text-text-muted">
										Total Allocation
									</span>
									<span className="font-semibold text-text-primary">
										{leaveBalance.sickLeave.total} days
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-text-muted">Used</span>
									<span className="font-semibold text-error">
										{leaveBalance.sickLeave.used} days
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-text-muted">Pending</span>
									<span className="font-semibold text-warning">
										{leaveBalance.sickLeave.pending} days
									</span>
								</div>
								<div className="h-px bg-border" />
								<div className="flex items-center justify-between">
									<span className="font-medium text-text-primary">
										Available
									</span>
									<span className="text-2xl font-bold text-success">
										{leaveBalance.sickLeave.available}
									</span>
								</div>
							</div>

							<div className="mt-4">
								<div className="w-full bg-surface rounded-full h-2 overflow-hidden">
									<div
										className="bg-secondary h-full rounded-full transition-all"
										style={{
											width: `${
												(leaveBalance.sickLeave.used /
													leaveBalance.sickLeave.total) *
												100
											}%`,
										}}
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Leave Requests Table */}
			<Card padding="none">
				<CardHeader className="px-6 pt-6 pb-4">
					<CardTitle>My Leave Requests</CardTitle>
				</CardHeader>

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-y border-border bg-surface/50">
								<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
									Type
								</th>
								<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
									Date Range
								</th>
								<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
									Days
								</th>
								<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4 hidden lg:table-cell">
									Allocation
								</th>
								<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4 hidden xl:table-cell">
									Reason
								</th>
								<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
									Status
								</th>
								<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4 hidden lg:table-cell">
									Applied On
								</th>
							</tr>
						</thead>
						<tbody>
							{myLeaveRequests.map((request) => (
								<tr
									key={request.id}
									className="border-b border-border last:border-0 hover:bg-surface/30 transition-colors"
								>
									<td className="px-6 py-4">
										<Badge
											variant={
												request.type === "Paid Time Off"
													? "primary"
													: "secondary"
											}
											size="sm"
										>
											{request.type === "Paid Time Off" ? (
												<Umbrella className="w-3 h-3" />
											) : (
												<Stethoscope className="w-3 h-3" />
											)}
											{request.type}
										</Badge>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center gap-2">
											<Calendar className="w-4 h-4 text-text-muted" />
											<div>
												<p className="text-sm font-medium text-text-primary">
													{formatDate(request.startDate)}
												</p>
												<p className="text-xs text-text-muted">
													to {formatDate(request.endDate)}
												</p>
											</div>
										</div>
									</td>
									<td className="px-6 py-4">
										<span className="font-semibold text-text-primary">
											{request.days}
										</span>
									</td>
									<td className="px-6 py-4 hidden lg:table-cell">
										<span className="text-sm text-text-muted">
											{request.allocation}
										</span>
									</td>
									<td className="px-6 py-4 hidden xl:table-cell">
										<span className="text-sm text-text-muted line-clamp-2">
											{request.reason}
										</span>
									</td>
									<td className="px-6 py-4">
										<div className="space-y-1">
											{getStatusBadge(request.status)}
											{request.attachment && (
												<div className="flex items-center gap-1 text-xs text-text-muted">
													<FileText className="w-3 h-3" />
													<span>Attachment</span>
												</div>
											)}
										</div>
									</td>
									<td className="px-6 py-4 hidden lg:table-cell">
										<span className="text-sm text-text-muted">
											{formatDate(request.appliedOn)}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{myLeaveRequests.length === 0 && (
					<div className="text-center py-12">
						<p className="text-text-muted">No leave requests found.</p>
					</div>
				)}
			</Card>

			{/* New Leave Request Modal */}
			<Modal isOpen={isModalOpen} onClose={handleCloseModal} size="lg">
				<form onSubmit={handleSubmit}>
					<div className="p-6">
						<div className="flex items-start justify-between mb-6">
							<div>
								<h2 className="text-xl font-semibold text-text-primary">
									New Leave Request
								</h2>
								<p className="text-sm text-text-muted mt-1">
									Submit a new time off request
								</p>
							</div>
							<button
								type="button"
								onClick={handleCloseModal}
								className="p-1 text-text-muted hover:text-text-primary transition-colors"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-text-primary mb-2">
									Time Off Type <span className="text-error">*</span>
								</label>
								<select
									name="type"
									value={formData.type}
									onChange={handleInputChange}
									className="w-full h-11 px-4 bg-card border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
									required
								>
									<option value="Paid Time Off">Paid Time Off</option>
									<option value="Sick Leave">Sick Leave</option>
								</select>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-text-primary mb-2">
										Start Date <span className="text-error">*</span>
									</label>
									<Input
										type="date"
										name="startDate"
										value={formData.startDate}
										onChange={handleInputChange}
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-text-primary mb-2">
										End Date <span className="text-error">*</span>
									</label>
									<Input
										type="date"
										name="endDate"
										value={formData.endDate}
										onChange={handleInputChange}
										min={formData.startDate}
										required
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-text-primary mb-2">
									Allocation <span className="text-error">*</span>
								</label>
								<select
									name="allocation"
									value={formData.allocation}
									onChange={handleInputChange}
									className="w-full h-11 px-4 bg-card border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
									required
								>
									{formData.type === "Paid Time Off" ? (
										<>
											<option value="2026 Annual Allocation">
												2026 Annual Allocation (
												{leaveBalance?.paidTimeOff.available ?? 0} days
												available)
											</option>
											<option value="2025 Annual Allocation">
												2025 Annual Allocation (Carryover)
											</option>
										</>
									) : (
										<>
											<option value="2026 Sick Leave">
												2026 Sick Leave (
												{leaveBalance?.sickLeave.available ?? 0} days available)
											</option>
										</>
									)}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-text-primary mb-2">
									Reason
								</label>
								<textarea
									name="reason"
									value={formData.reason}
									onChange={handleInputChange}
									rows={3}
									placeholder="Enter reason for leave request..."
									className="w-full px-4 py-3 bg-card border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-text-primary mb-2">
									Attachment{" "}
									{isSickLeave && <span className="text-error">*</span>}
									{isSickLeave && (
										<span className="text-xs text-error font-normal">
											{" "}
											(Mandatory for sick leave)
										</span>
									)}
								</label>
								<div className="relative">
									<input
										type="file"
										onChange={handleFileChange}
										accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
										className="hidden"
										id="attachment-upload"
										required={isSickLeave}
									/>
									<label
										htmlFor="attachment-upload"
										className="flex items-center justify-center gap-2 w-full h-24 px-4 bg-surface border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
									>
										<Upload className="w-5 h-5 text-text-muted" />
										<div className="text-center">
											{formData.attachment ? (
												<>
													<p className="text-sm font-medium text-text-primary">
														{formData.attachment.name}
													</p>
													<p className="text-xs text-text-muted mt-1">
														Click to change file
													</p>
												</>
											) : (
												<>
													<p className="text-sm font-medium text-text-primary">
														Click to upload
													</p>
													<p className="text-xs text-text-muted mt-1">
														PDF, JPG, PNG, DOC (Max 5MB)
													</p>
												</>
											)}
										</div>
									</label>
								</div>
								{isSickLeave && !formData.attachment && (
									<p className="text-xs text-error mt-1">
										Medical certificate or doctor's note required
									</p>
								)}
							</div>
						</div>

						<div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
							<Button
								type="button"
								variant="outline"
								onClick={handleCloseModal}
							>
								Cancel
							</Button>
							<Button type="submit" variant="primary">
								Submit Request
							</Button>
						</div>
					</div>
				</form>
			</Modal>
		</div>
	);
}

// ==================== ADMIN/HR VIEW COMPONENT ====================

function AdminTimeOffView() {
	const [activeTab, setActiveTab] = useState("requests");
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [typeFilter, setTypeFilter] = useState("all");
	const [leaveRequests, setLeaveRequests] = useState<TimeOffRequest[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const prefersReducedMotion = useReducedMotion();
	const announce = useAriaAnnounce();

	const animationClass = prefersReducedMotion ? "" : "animate-fade-in";

	// Fetch data from API
	const fetchData = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await timeOffApi.getAll({ view: "all" });
			setLeaveRequests(data.requests || []);
			announce("Leave requests loaded");
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error("Failed to load leave requests")
			);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [announce]);

	const handleRefresh = () => {
		fetchData();
	};

	// Filter requests
	const filteredRequests = leaveRequests.filter((request) => {
		const matchesSearch =
			request.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(request.employee.department || "")
				.toLowerCase()
				.includes(searchQuery.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || request.status === statusFilter;
		const matchesType = typeFilter === "all" || request.type === typeFilter;
		return matchesSearch && matchesStatus && matchesType;
	});

	// Filter allocations
	const filteredAllocations = allAllocations.filter((allocation) => {
		const matchesSearch =
			allocation.employee.name
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			allocation.employee.department
				.toLowerCase()
				.includes(searchQuery.toLowerCase());
		const matchesType = typeFilter === "all" || allocation.type === typeFilter;
		return matchesSearch && matchesType;
	});

	// Handle approve/reject
	const handleApprove = async (requestId: string) => {
		try {
			await timeOffApi.approve(requestId);
			fetchData();
			announce("Request approved");
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to approve");
		}
	};

	const handleReject = async (requestId: string) => {
		const reason = prompt("Please enter rejection reason:");
		if (reason) {
			try {
				await timeOffApi.reject(requestId, reason);
				fetchData();
				announce("Request rejected");
			} catch (err) {
				alert(err instanceof Error ? err.message : "Failed to reject");
			}
		}
	};

	// Stats
	const pendingCount = leaveRequests.filter(
		(r) => r.status === "pending"
	).length;
	const approvedCount = leaveRequests.filter(
		(r) => r.status === "approved"
	).length;
	const rejectedCount = leaveRequests.filter(
		(r) => r.status === "rejected"
	).length;

	const tabs = [
		{
			id: "requests",
			label: "Leave Requests",
			icon: <Calendar className="w-4 h-4" />,
		},
		{
			id: "allocations",
			label: "Allocations",
			icon: <Users className="w-4 h-4" />,
		},
	];

	// Error state
	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<InlineError message={error.message} onRetry={handleRefresh} />
			</div>
		);
	}

	// Loading state
	if (isLoading) {
		return (
			<div
				className="space-y-6"
				aria-label="Loading time off data"
				aria-busy="true"
			>
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<div className="h-8 w-64 bg-surface rounded-lg animate-shimmer" />
						<div className="h-5 w-80 bg-surface rounded-lg mt-2 animate-shimmer" />
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<SkeletonCard className="h-24" />
					<SkeletonCard className="h-24" />
					<SkeletonCard className="h-24" />
				</div>
				<SkeletonCard className="h-96" />
			</div>
		);
	}

	return (
		<div
			className={cn("space-y-6", animationClass)}
			role="main"
			aria-label="Time off management"
		>
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">
						Time Off Management
					</h1>
					<p className="text-text-muted mt-1">
						Review and manage employee leave requests
					</p>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={handleRefresh}
					aria-label="Refresh leave requests"
					className="focus-ring"
				>
					<RefreshCw className="w-4 h-4" />
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
					<CardContent className="py-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-text-muted">Pending Requests</p>
								<p className="text-2xl font-bold text-warning">
									{pendingCount}
								</p>
							</div>
							<div className="p-3 rounded-lg bg-warning/20">
								<Clock className="w-6 h-6 text-warning" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/30">
					<CardContent className="py-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-text-muted">Approved</p>
								<p className="text-2xl font-bold text-success">
									{approvedCount}
								</p>
							</div>
							<div className="p-3 rounded-lg bg-success/20">
								<CheckCircle className="w-6 h-6 text-success" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-error/10 to-error/5 border-error/30">
					<CardContent className="py-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-text-muted">Rejected</p>
								<p className="text-2xl font-bold text-error">{rejectedCount}</p>
							</div>
							<div className="p-3 rounded-lg bg-error/20">
								<XCircle className="w-6 h-6 text-error" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Tabs */}
			<Tabs items={tabs} value={activeTab} onChange={setActiveTab} />

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
					<Input
						type="text"
						placeholder="Search by employee name or department..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>

				{activeTab === "requests" && (
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="h-11 px-4 bg-card border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
					>
						<option value="all">All Status</option>
						<option value="pending">Pending</option>
						<option value="approved">Approved</option>
						<option value="rejected">Rejected</option>
					</select>
				)}

				<select
					value={typeFilter}
					onChange={(e) => setTypeFilter(e.target.value)}
					className="h-11 px-4 bg-card border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
				>
					<option value="all">All Types</option>
					<option value="Paid Time Off">Paid Time Off</option>
					<option value="Sick Leave">Sick Leave</option>
				</select>
			</div>

			{/* Tab Panels */}
			<TabPanel value="requests" activeValue={activeTab}>
				{/* Leave Requests Table */}
				<Card padding="none">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-border bg-surface/50">
									<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
										Employee
									</th>
									<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
										Type
									</th>
									<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
										Date Range
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
								{filteredRequests.map((request) => (
									<tr
										key={request.id}
										className="border-b border-border last:border-0 hover:bg-surface/30 transition-colors"
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
														{request.employee.department} •{" "}
														{request.employee.position}
													</p>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<Badge
												variant={
													request.type === "Paid Time Off"
														? "primary"
														: "secondary"
												}
												size="sm"
											>
												{request.type === "Paid Time Off" ? (
													<Umbrella className="w-3 h-3" />
												) : (
													<Stethoscope className="w-3 h-3" />
												)}
												{request.type}
											</Badge>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-2">
												<Calendar className="w-4 h-4 text-text-muted" />
												<div>
													<p className="text-sm font-medium text-text-primary">
														{formatDate(request.startDate)} -{" "}
														{formatDate(request.endDate)}
													</p>
													<p className="text-xs text-text-muted">
														{request.days} day{request.days > 1 ? "s" : ""}
													</p>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 hidden lg:table-cell">
											<div className="max-w-xs">
												<p className="text-sm text-text-muted line-clamp-2">
													{request.reason}
												</p>
												{request.attachment && (
													<div className="flex items-center gap-1 text-xs text-primary mt-1">
														<FileText className="w-3 h-3" />
														<span>Attachment</span>
													</div>
												)}
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="space-y-1">
												{getStatusBadge(request.status)}
												{request.status === "approved" &&
													request.approvedAt && (
														<p className="text-xs text-text-muted">
															on {formatDate(request.approvedAt)}
														</p>
													)}
												{request.status === "rejected" &&
													request.rejectionReason && (
														<p className="text-xs text-error line-clamp-1">
															{request.rejectionReason}
														</p>
													)}
											</div>
										</td>
										<td className="px-6 py-4 text-right">
											{request.status === "pending" ? (
												<div className="flex items-center justify-end gap-2">
													<Button
														variant="success"
														size="xs"
														onClick={() => handleApprove(request.id)}
													>
														<CheckCircle className="w-3 h-3" />
														Approve
													</Button>
													<Button
														variant="danger"
														size="xs"
														onClick={() => handleReject(request.id)}
													>
														<XCircle className="w-3 h-3" />
														Reject
													</Button>
												</div>
											) : (
												<span className="text-xs text-text-muted">—</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{filteredRequests.length === 0 && (
						<div className="text-center py-12">
							<p className="text-text-muted">No leave requests found.</p>
						</div>
					)}
				</Card>
			</TabPanel>

			<TabPanel value="allocations" activeValue={activeTab}>
				{/* Allocations Table */}
				<Card padding="none">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-border bg-surface/50">
									<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
										Employee
									</th>
									<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
										Type
									</th>
									<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
										Year
									</th>
									<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
										Allocated
									</th>
									<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
										Used
									</th>
									<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
										Pending
									</th>
									<th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
										Available
									</th>
									<th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{filteredAllocations.map((allocation) => (
									<tr
										key={allocation.id}
										className="border-b border-border last:border-0 hover:bg-surface/30 transition-colors"
									>
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<Avatar
													src={allocation.employee.avatar}
													name={allocation.employee.name}
													size="sm"
												/>
												<div>
													<p className="font-medium text-text-primary">
														{allocation.employee.name}
													</p>
													<p className="text-xs text-text-muted">
														{allocation.employee.department}
													</p>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<Badge
												variant={
													allocation.type === "Paid Time Off"
														? "primary"
														: "secondary"
												}
												size="sm"
											>
												{allocation.type === "Paid Time Off" ? (
													<Umbrella className="w-3 h-3" />
												) : (
													<Stethoscope className="w-3 h-3" />
												)}
												{allocation.type}
											</Badge>
										</td>
										<td className="px-6 py-4">
											<span className="text-sm font-medium text-text-primary">
												{allocation.year}
											</span>
										</td>
										<td className="px-6 py-4">
											<span className="font-semibold text-text-primary">
												{allocation.allocated}
											</span>
										</td>
										<td className="px-6 py-4">
											<span className="font-semibold text-error">
												{allocation.used}
											</span>
										</td>
										<td className="px-6 py-4">
											<span className="font-semibold text-warning">
												{allocation.pending}
											</span>
										</td>
										<td className="px-6 py-4">
											<span className="font-semibold text-success">
												{allocation.available}
											</span>
										</td>
										<td className="px-6 py-4 text-right">
											<Button variant="ghost" size="xs">
												<Edit className="w-3 h-3" />
												Edit
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{filteredAllocations.length === 0 && (
						<div className="text-center py-12">
							<p className="text-text-muted">No allocations found.</p>
						</div>
					)}
				</Card>
			</TabPanel>
		</div>
	);
}

// ==================== MAIN PAGE COMPONENT ====================

export default function TimeOffPage() {
	const { user } = useAuth();
	const prefersReducedMotion = useReducedMotion();

	const animationClass = prefersReducedMotion ? "" : "animate-fade-in";

	// Check if user is admin or HR
	const isAdminOrHR = user?.role === "admin" || user?.role === "hr";

	return (
		<div className={cn("max-w-7xl mx-auto", animationClass)}>
			{isAdminOrHR ? <AdminTimeOffView /> : <EmployeeTimeOffView />}
		</div>
	);
}
