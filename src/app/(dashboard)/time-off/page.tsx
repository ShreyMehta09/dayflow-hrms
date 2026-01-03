"use client";

import React, { useState } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	Button,
	Badge,
	Modal,
	Input,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
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
} from "lucide-react";

// Mock leave requests for employee
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

// Leave balance data
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

export default function TimeOffPage() {
	const { user } = useAuth();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [formData, setFormData] = useState({
		type: "Paid Time Off",
		startDate: "",
		endDate: "",
		allocation: "2025 Annual Allocation",
		reason: "",
		attachment: null as File | null,
	});

	const handleOpenModal = () => {
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		// Reset form
		setFormData({
			type: "Paid Time Off",
			startDate: "",
			endDate: "",
			allocation: "2025 Annual Allocation",
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
			// Update allocation when type changes
			...(name === "type" && {
				allocation:
					value === "Sick Leave"
						? "2025 Sick Leave"
						: "2025 Annual Allocation",
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validate sick leave attachment
		if (formData.type === "Sick Leave" && !formData.attachment) {
			alert("Attachment is mandatory for sick leave requests!");
			return;
		}

		// Validate dates
		if (!formData.startDate || !formData.endDate) {
			alert("Please select both start and end dates!");
			return;
		}

		// Calculate days
		const start = new Date(formData.startDate);
		const end = new Date(formData.endDate);
		const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

		console.log("Leave Request Submitted:", {
			...formData,
			days,
			appliedOn: new Date().toISOString(),
		});

		// Close modal and show success message
		handleCloseModal();
		alert("Leave request submitted successfully!");
	};

	const isSickLeave = formData.type === "Sick Leave";

	return (
		<div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">My Time Off</h1>
					<p className="text-text-muted mt-1">
						Manage your leave requests and balances
					</p>
				</div>
				<Button
					variant="primary"
					leftIcon={<Plus className="w-4 h-4" />}
					onClick={handleOpenModal}
				>
					New Leave Request
				</Button>
			</div>

			{/* Leave Balance Cards */}
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
								<span className="text-sm text-text-muted">Total Allocation</span>
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
								<span className="font-medium text-text-primary">Available</span>
								<span className="text-2xl font-bold text-success">
									{leaveBalance.paidTimeOff.available}
								</span>
							</div>
						</div>

						{/* Progress Bar */}
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
								<span className="text-sm text-text-muted">Total Allocation</span>
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
								<span className="font-medium text-text-primary">Available</span>
								<span className="text-2xl font-bold text-success">
									{leaveBalance.sickLeave.available}
								</span>
							</div>
						</div>

						{/* Progress Bar */}
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
												request.type === "Paid Time Off" ? "primary" : "secondary"
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
						{/* Header */}
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

						{/* Form Fields */}
						<div className="space-y-4">
							{/* Time Off Type */}
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

							{/* Date Range */}
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

							{/* Allocation */}
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
											<option value="2025 Annual Allocation">
												2025 Annual Allocation ({leaveBalance.paidTimeOff.available}{" "}
												days available)
											</option>
											<option value="2024 Annual Allocation">
												2024 Annual Allocation (Carryover)
											</option>
										</>
									) : (
										<>
											<option value="2025 Sick Leave">
												2025 Sick Leave ({leaveBalance.sickLeave.available} days
												available)
											</option>
										</>
									)}
								</select>
							</div>

							{/* Reason */}
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

							{/* Attachment */}
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

						{/* Actions */}
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
