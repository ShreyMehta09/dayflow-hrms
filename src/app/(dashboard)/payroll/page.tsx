"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Avatar, Modal, Input, Select } from "@/components/ui";
import { useAuth, RoleGuard } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
	Plus,
	Search,
	X,
	DollarSign,
	Users,
	TrendingUp,
	Clock,
	CheckCircle,
	AlertCircle,
	RefreshCw,
	Edit,
	Trash2,
	Eye,
	Calendar,
	Building2,
	Briefcase,
	Save,
	FileText,
	CreditCard,
	Banknote,
} from "lucide-react";

// Types
type PayrollStatus = "draft" | "pending" | "approved" | "paid" | "rejected";
type PaymentMethod = "bank_transfer" | "check" | "cash";

interface SalaryComponent {
	name: string;
	type: "earning" | "deduction";
	amount: number;
	isPercentage?: boolean;
}

interface Employee {
	id: string;
	name: string;
	email: string;
	department?: string;
	position?: string;
	avatar?: string;
}

interface Payroll {
	id: string;
	employee: Employee | null;
	month: number;
	year: number;
	basicSalary: number;
	components: SalaryComponent[];
	grossSalary: number;
	totalDeductions: number;
	netSalary: number;
	paymentMethod: PaymentMethod;
	paymentDate?: string;
	status: PayrollStatus;
	remarks?: string;
	approvedBy?: string;
	approvedAt?: string;
	createdBy?: string;
	createdAt: string;
}

interface PayrollSummary {
	totalPayroll: number;
	totalGross: number;
	totalDeductions: number;
	employeeCount: number;
	pendingCount: number;
	approvedCount: number;
	paidCount: number;
}

// Helper functions
const getMonthName = (month: number): string => {
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	return months[month - 1] || "";
};

const formatCurrency = (amount: number): string => {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(amount);
};

const getStatusColor = (status: PayrollStatus): string => {
	switch (status) {
		case "draft":
			return "bg-gray-500/20 text-gray-700 border-gray-500/30";
		case "pending":
			return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
		case "approved":
			return "bg-blue-500/20 text-blue-700 border-blue-500/30";
		case "paid":
			return "bg-green-500/20 text-green-700 border-green-500/30";
		case "rejected":
			return "bg-red-500/20 text-red-700 border-red-500/30";
		default:
			return "bg-gray-500/20 text-gray-700 border-gray-500/30";
	}
};

// Default salary components
const defaultComponents: SalaryComponent[] = [
	{
		name: "House Rent Allowance",
		type: "earning",
		amount: 40,
		isPercentage: true,
	},
	{
		name: "Dearness Allowance",
		type: "earning",
		amount: 10,
		isPercentage: true,
	},
	{
		name: "Transport Allowance",
		type: "earning",
		amount: 1600,
		isPercentage: false,
	},
	{
		name: "Medical Allowance",
		type: "earning",
		amount: 1250,
		isPercentage: false,
	},
	{ name: "Provident Fund", type: "deduction", amount: 12, isPercentage: true },
	{
		name: "Professional Tax",
		type: "deduction",
		amount: 200,
		isPercentage: false,
	},
	{ name: "Income Tax", type: "deduction", amount: 10, isPercentage: true },
];

// Add/Edit Payroll Modal
interface PayrollModalProps {
	payroll?: Payroll | null;
	employees: Employee[];
	isOpen: boolean;
	onClose: () => void;
	onSave: (data: any) => Promise<void>;
	mode: "add" | "edit";
}

const PayrollModal = ({
	payroll,
	employees,
	isOpen,
	onClose,
	onSave,
	mode,
}: PayrollModalProps) => {
	const currentDate = new Date();
	const [formData, setFormData] = useState({
		employeeId: "",
		month: currentDate.getMonth() + 1,
		year: currentDate.getFullYear(),
		basicSalary: 0,
		components: defaultComponents,
		paymentMethod: "bank_transfer" as PaymentMethod,
		remarks: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen) {
			if (mode === "edit" && payroll) {
				setFormData({
					employeeId: payroll.employee?.id || "",
					month: payroll.month,
					year: payroll.year,
					basicSalary: payroll.basicSalary,
					components:
						payroll.components.length > 0
							? payroll.components
							: defaultComponents,
					paymentMethod: payroll.paymentMethod,
					remarks: payroll.remarks || "",
				});
			} else {
				setFormData({
					employeeId: "",
					month: currentDate.getMonth() + 1,
					year: currentDate.getFullYear(),
					basicSalary: 0,
					components: defaultComponents,
					paymentMethod: "bank_transfer",
					remarks: "",
				});
			}
			setError(null);
		}
	}, [isOpen, payroll, mode]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (mode === "add" && !formData.employeeId) {
			setError("Please select an employee");
			return;
		}

		if (formData.basicSalary <= 0) {
			setError("Basic salary must be greater than 0");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			await onSave(formData);
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save payroll");
		} finally {
			setIsLoading(false);
		}
	};

	const handleComponentChange = (index: number, field: string, value: any) => {
		const newComponents = [...formData.components];
		newComponents[index] = { ...newComponents[index], [field]: value };
		setFormData((prev) => ({ ...prev, components: newComponents }));
	};

	const addComponent = (type: "earning" | "deduction") => {
		setFormData((prev) => ({
			...prev,
			components: [
				...prev.components,
				{ name: "", type, amount: 0, isPercentage: false },
			],
		}));
	};

	const removeComponent = (index: number) => {
		setFormData((prev) => ({
			...prev,
			components: prev.components.filter((_, i) => i !== index),
		}));
	};

	// Calculate preview
	const earnings = formData.components
		.filter((c) => c.type === "earning")
		.reduce((sum, c) => {
			if (c.isPercentage) {
				return sum + (formData.basicSalary * c.amount) / 100;
			}
			return sum + c.amount;
		}, 0);

	const grossSalary = formData.basicSalary + earnings;

	const deductions = formData.components
		.filter((c) => c.type === "deduction")
		.reduce((sum, c) => {
			if (c.isPercentage) {
				return sum + (grossSalary * c.amount) / 100;
			}
			return sum + c.amount;
		}, 0);

	const netSalary = grossSalary - deductions;

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="xl">
			<div className="p-6 max-h-[90vh] overflow-y-auto">
				<div className="flex items-start justify-between mb-6">
					<div>
						<h2 className="text-xl font-semibold text-text-primary">
							{mode === "add" ? "Create Payroll" : "Edit Payroll"}
						</h2>
						<p className="text-sm text-text-muted mt-1">
							{mode === "add"
								? "Generate payroll for an employee"
								: "Update payroll details"}
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-1 text-text-muted hover:text-text-primary transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{error && (
					<div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
						<AlertCircle className="w-4 h-4 flex-shrink-0" />
						<span>{error}</span>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Employee & Period */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{mode === "add" ? (
							<div>
								<label className="block text-sm font-medium text-text-muted mb-1.5">
									Employee *
								</label>
								<Select
									value={formData.employeeId}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											employeeId: e.target.value,
										}))
									}
									options={[
										{ value: "", label: "Select Employee" },
										...employees.map((e) => ({
											value: e.id,
											label: `${e.name} - ${e.department || "No Dept"}`,
										})),
									]}
								/>
							</div>
						) : (
							<div>
								<label className="block text-sm font-medium text-text-muted mb-1.5">
									Employee
								</label>
								<div className="px-3 py-2 bg-surface border border-border rounded-lg text-text-primary">
									{payroll?.employee?.name || "Unknown"}
								</div>
							</div>
						)}
						<div>
							<label className="block text-sm font-medium text-text-muted mb-1.5">
								Month *
							</label>
							<Select
								value={formData.month.toString()}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										month: parseInt(e.target.value),
									}))
								}
								options={Array.from({ length: 12 }, (_, i) => ({
									value: (i + 1).toString(),
									label: getMonthName(i + 1),
								}))}
								disabled={mode === "edit"}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-text-muted mb-1.5">
								Year *
							</label>
							<Select
								value={formData.year.toString()}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										year: parseInt(e.target.value),
									}))
								}
								options={[
									{ value: "2024", label: "2024" },
									{ value: "2025", label: "2025" },
									{ value: "2026", label: "2026" },
								]}
								disabled={mode === "edit"}
							/>
						</div>
					</div>

					{/* Basic Salary */}
					<div>
						<label className="block text-sm font-medium text-text-muted mb-1.5">
							Basic Salary *
						</label>
						<Input
							type="number"
							value={formData.basicSalary}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									basicSalary: parseFloat(e.target.value) || 0,
								}))
							}
							leftIcon={<DollarSign className="w-4 h-4" />}
							placeholder="Enter basic salary"
							fullWidth
						/>
					</div>

					{/* Earnings */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<TrendingUp className="w-4 h-4 text-green-500" />
								<span className="text-sm font-medium text-text-primary">
									Earnings / Allowances
								</span>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => addComponent("earning")}
							>
								<Plus className="w-4 h-4 mr-1" />
								Add
							</Button>
						</div>
						<div className="space-y-2">
							{formData.components
								.map((comp, index) => ({ comp, index }))
								.filter(({ comp }) => comp.type === "earning")
								.map(({ comp, index }) => (
									<div
										key={index}
										className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
									>
										<input
											type="text"
											value={comp.name}
											onChange={(e) =>
												handleComponentChange(index, "name", e.target.value)
											}
											placeholder="Component name"
											className="flex-1 px-3 py-1.5 bg-white dark:bg-surface border border-border rounded text-sm"
										/>
										<input
											type="number"
											value={comp.amount}
											onChange={(e) =>
												handleComponentChange(
													index,
													"amount",
													parseFloat(e.target.value) || 0
												)
											}
											className="w-24 px-3 py-1.5 bg-white dark:bg-surface border border-border rounded text-sm"
										/>
										<label className="flex items-center gap-1 text-xs">
											<input
												type="checkbox"
												checked={comp.isPercentage}
												onChange={(e) =>
													handleComponentChange(
														index,
														"isPercentage",
														e.target.checked
													)
												}
											/>
											%
										</label>
										<button
											type="button"
											onClick={() => removeComponent(index)}
											className="p-1 text-red-500 hover:bg-red-100 rounded"
										>
											<X className="w-4 h-4" />
										</button>
									</div>
								))}
						</div>
					</div>

					{/* Deductions */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
								<span className="text-sm font-medium text-text-primary">
									Deductions
								</span>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => addComponent("deduction")}
							>
								<Plus className="w-4 h-4 mr-1" />
								Add
							</Button>
						</div>
						<div className="space-y-2">
							{formData.components
								.map((comp, index) => ({ comp, index }))
								.filter(({ comp }) => comp.type === "deduction")
								.map(({ comp, index }) => (
									<div
										key={index}
										className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
									>
										<input
											type="text"
											value={comp.name}
											onChange={(e) =>
												handleComponentChange(index, "name", e.target.value)
											}
											placeholder="Component name"
											className="flex-1 px-3 py-1.5 bg-white dark:bg-surface border border-border rounded text-sm"
										/>
										<input
											type="number"
											value={comp.amount}
											onChange={(e) =>
												handleComponentChange(
													index,
													"amount",
													parseFloat(e.target.value) || 0
												)
											}
											className="w-24 px-3 py-1.5 bg-white dark:bg-surface border border-border rounded text-sm"
										/>
										<label className="flex items-center gap-1 text-xs">
											<input
												type="checkbox"
												checked={comp.isPercentage}
												onChange={(e) =>
													handleComponentChange(
														index,
														"isPercentage",
														e.target.checked
													)
												}
											/>
											%
										</label>
										<button
											type="button"
											onClick={() => removeComponent(index)}
											className="p-1 text-red-500 hover:bg-red-100 rounded"
										>
											<X className="w-4 h-4" />
										</button>
									</div>
								))}
						</div>
					</div>

					{/* Payment Method */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-text-muted mb-1.5">
								Payment Method
							</label>
							<Select
								value={formData.paymentMethod}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										paymentMethod: e.target.value as PaymentMethod,
									}))
								}
								options={[
									{ value: "bank_transfer", label: "Bank Transfer" },
									{ value: "check", label: "Check" },
									{ value: "cash", label: "Cash" },
								]}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-text-muted mb-1.5">
								Remarks
							</label>
							<input
								type="text"
								value={formData.remarks}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, remarks: e.target.value }))
								}
								placeholder="Optional notes"
								className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
							/>
						</div>
					</div>

					{/* Salary Preview */}
					<div className="p-4 bg-surface border border-border rounded-lg space-y-3">
						<h4 className="font-medium text-text-primary">Salary Preview</h4>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
							<div>
								<p className="text-text-muted">Basic Salary</p>
								<p className="font-semibold text-text-primary">
									{formatCurrency(formData.basicSalary)}
								</p>
							</div>
							<div>
								<p className="text-text-muted">Total Earnings</p>
								<p className="font-semibold text-green-600">
									+{formatCurrency(earnings)}
								</p>
							</div>
							<div>
								<p className="text-text-muted">Total Deductions</p>
								<p className="font-semibold text-red-600">
									-{formatCurrency(deductions)}
								</p>
							</div>
							<div>
								<p className="text-text-muted">Net Salary</p>
								<p className="font-bold text-lg text-primary">
									{formatCurrency(netSalary)}
								</p>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex justify-end gap-3 pt-4 border-t border-border">
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="primary"
							isLoading={isLoading}
							leftIcon={<Save className="w-4 h-4" />}
						>
							{mode === "add" ? "Create Payroll" : "Save Changes"}
						</Button>
					</div>
				</form>
			</div>
		</Modal>
	);
};

// View Payroll Modal
interface ViewPayrollModalProps {
	payroll: Payroll | null;
	isOpen: boolean;
	onClose: () => void;
}

const ViewPayrollModal = ({
	payroll,
	isOpen,
	onClose,
}: ViewPayrollModalProps) => {
	if (!payroll) return null;

	const earnings = payroll.components.filter((c) => c.type === "earning");
	const deductions = payroll.components.filter((c) => c.type === "deduction");

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg">
			<div className="p-6 max-h-[90vh] overflow-y-auto">
				<div className="flex items-start justify-between mb-6">
					<div>
						<h2 className="text-xl font-semibold text-text-primary">
							Payroll Details
						</h2>
						<p className="text-sm text-text-muted mt-1">
							{getMonthName(payroll.month)} {payroll.year}
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-1 text-text-muted hover:text-text-primary transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Employee Info */}
				<div className="flex items-center gap-4 mb-6 p-4 bg-surface rounded-lg">
					<Avatar
						src={payroll.employee?.avatar}
						name={payroll.employee?.name || "Employee"}
						size="lg"
					/>
					<div>
						<h3 className="font-semibold text-text-primary">
							{payroll.employee?.name}
						</h3>
						<p className="text-sm text-text-muted">
							{payroll.employee?.position} • {payroll.employee?.department}
						</p>
					</div>
					<div className="ml-auto">
						<span
							className={cn(
								"px-3 py-1 rounded-full text-xs font-medium border capitalize",
								getStatusColor(payroll.status)
							)}
						>
							{payroll.status}
						</span>
					</div>
				</div>

				{/* Salary Breakdown */}
				<div className="space-y-4">
					{/* Basic */}
					<div className="flex items-center justify-between py-2 border-b border-border">
						<span className="font-medium text-text-primary">Basic Salary</span>
						<span className="font-semibold text-text-primary">
							{formatCurrency(payroll.basicSalary)}
						</span>
					</div>

					{/* Earnings */}
					{earnings.length > 0 && (
						<div className="space-y-2">
							<h4 className="text-sm font-medium text-green-600">Earnings</h4>
							{earnings.map((comp, index) => (
								<div
									key={index}
									className="flex items-center justify-between text-sm"
								>
									<span className="text-text-muted">
										{comp.name} {comp.isPercentage && `(${comp.amount}%)`}
									</span>
									<span className="text-green-600">
										+
										{formatCurrency(
											comp.isPercentage
												? (payroll.basicSalary * comp.amount) / 100
												: comp.amount
										)}
									</span>
								</div>
							))}
						</div>
					)}

					{/* Gross */}
					<div className="flex items-center justify-between py-2 border-t border-b border-border">
						<span className="font-medium text-text-primary">Gross Salary</span>
						<span className="font-semibold text-text-primary">
							{formatCurrency(payroll.grossSalary)}
						</span>
					</div>

					{/* Deductions */}
					{deductions.length > 0 && (
						<div className="space-y-2">
							<h4 className="text-sm font-medium text-red-600">Deductions</h4>
							{deductions.map((comp, index) => (
								<div
									key={index}
									className="flex items-center justify-between text-sm"
								>
									<span className="text-text-muted">
										{comp.name} {comp.isPercentage && `(${comp.amount}%)`}
									</span>
									<span className="text-red-600">
										-
										{formatCurrency(
											comp.isPercentage
												? (payroll.grossSalary * comp.amount) / 100
												: comp.amount
										)}
									</span>
								</div>
							))}
						</div>
					)}

					{/* Total Deductions */}
					<div className="flex items-center justify-between py-2 border-t border-border">
						<span className="font-medium text-text-muted">
							Total Deductions
						</span>
						<span className="font-semibold text-red-600">
							-{formatCurrency(payroll.totalDeductions)}
						</span>
					</div>

					{/* Net Salary */}
					<div className="flex items-center justify-between py-3 bg-primary/10 rounded-lg px-4">
						<span className="font-bold text-text-primary">Net Salary</span>
						<span className="font-bold text-xl text-primary">
							{formatCurrency(payroll.netSalary)}
						</span>
					</div>
				</div>

				{/* Payment Info */}
				<div className="mt-6 p-4 bg-surface rounded-lg space-y-2 text-sm">
					<div className="flex items-center justify-between">
						<span className="text-text-muted">Payment Method</span>
						<span className="text-text-primary capitalize">
							{payroll.paymentMethod.replace("_", " ")}
						</span>
					</div>
					{payroll.paymentDate && (
						<div className="flex items-center justify-between">
							<span className="text-text-muted">Payment Date</span>
							<span className="text-text-primary">
								{new Date(payroll.paymentDate).toLocaleDateString()}
							</span>
						</div>
					)}
					{payroll.remarks && (
						<div className="flex items-center justify-between">
							<span className="text-text-muted">Remarks</span>
							<span className="text-text-primary">{payroll.remarks}</span>
						</div>
					)}
				</div>

				<div className="flex justify-end mt-6">
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				</div>
			</div>
		</Modal>
	);
};

// Main Payroll Page
export default function PayrollPage() {
	const { role } = useAuth();
	const [payrolls, setPayrolls] = useState<Payroll[]>([]);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [summary, setSummary] = useState<PayrollSummary | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Filters
	const currentDate = new Date();
	const [filterMonth, setFilterMonth] = useState<string>("");
	const [filterYear, setFilterYear] = useState<string>(
		currentDate.getFullYear().toString()
	);
	const [filterStatus, setFilterStatus] = useState<string>("");
	const [searchQuery, setSearchQuery] = useState("");

	// Modals
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);

	const isAdmin = role === "admin";

	// Fetch payroll data
	const fetchPayrolls = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams();
			if (filterMonth) params.append("month", filterMonth);
			if (filterYear) params.append("year", filterYear);
			if (filterStatus) params.append("status", filterStatus);

			const response = await fetch(`/api/payroll?${params.toString()}`, {
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to fetch payroll data");
			}

			const data = await response.json();
			setPayrolls(data.payrolls || []);
			setEmployees(data.employees || []);
			setSummary(data.summary || null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load payroll");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchPayrolls();
	}, [filterMonth, filterYear, filterStatus]);

	// Filter by search
	const filteredPayrolls = payrolls.filter((p) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			p.employee?.name?.toLowerCase().includes(query) ||
			p.employee?.email?.toLowerCase().includes(query) ||
			p.employee?.department?.toLowerCase().includes(query)
		);
	});

	// Handlers
	const handleAddPayroll = async (data: any) => {
		const response = await fetch("/api/payroll", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const result = await response.json();
			throw new Error(result.error || "Failed to create payroll");
		}

		await fetchPayrolls();
	};

	const handleEditPayroll = async (data: any) => {
		if (!selectedPayroll) return;

		const response = await fetch(`/api/payroll/${selectedPayroll.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const result = await response.json();
			throw new Error(result.error || "Failed to update payroll");
		}

		await fetchPayrolls();
	};

	const handleStatusChange = async (
		payrollId: string,
		newStatus: PayrollStatus
	) => {
		try {
			const response = await fetch(`/api/payroll/${payrollId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ status: newStatus }),
			});

			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.error || "Failed to update status");
			}

			await fetchPayrolls();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to update status");
		}
	};

	const handleDeletePayroll = async (payrollId: string) => {
		if (!confirm("Are you sure you want to delete this payroll record?"))
			return;

		try {
			const response = await fetch(`/api/payroll/${payrollId}`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.error || "Failed to delete payroll");
			}

			await fetchPayrolls();
		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to delete payroll");
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">
						Payroll Management
					</h1>
					<p className="text-text-muted mt-1">
						Manage employee salaries and payments
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="sm"
						onClick={fetchPayrolls}
						disabled={isLoading}
					>
						<RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
					</Button>
					<Button
						variant="primary"
						leftIcon={<Plus className="w-4 h-4" />}
						onClick={() => setIsAddModalOpen(true)}
					>
						Create Payroll
					</Button>
				</div>
			</div>

			{/* Summary Cards */}
			{summary && (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<Card padding="md">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-lg bg-primary/10">
								<DollarSign className="w-5 h-5 text-primary" />
							</div>
							<div>
								<p className="text-sm text-text-muted">Total Payroll</p>
								<p className="text-lg font-bold text-text-primary">
									{formatCurrency(summary.totalPayroll)}
								</p>
							</div>
						</div>
					</Card>
					<Card padding="md">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-lg bg-green-500/10">
								<Users className="w-5 h-5 text-green-500" />
							</div>
							<div>
								<p className="text-sm text-text-muted">Employees</p>
								<p className="text-lg font-bold text-text-primary">
									{summary.employeeCount}
								</p>
							</div>
						</div>
					</Card>
					<Card padding="md">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-lg bg-yellow-500/10">
								<Clock className="w-5 h-5 text-yellow-500" />
							</div>
							<div>
								<p className="text-sm text-text-muted">Pending</p>
								<p className="text-lg font-bold text-text-primary">
									{summary.pendingCount}
								</p>
							</div>
						</div>
					</Card>
					<Card padding="md">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-lg bg-blue-500/10">
								<CheckCircle className="w-5 h-5 text-blue-500" />
							</div>
							<div>
								<p className="text-sm text-text-muted">Paid</p>
								<p className="text-lg font-bold text-text-primary">
									{summary.paidCount}
								</p>
							</div>
						</div>
					</Card>
				</div>
			)}

			{/* Filters */}
			<Card padding="md">
				<div className="flex flex-wrap items-center gap-4">
					<div className="relative flex-1 min-w-[200px] max-w-md">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
						<input
							type="search"
							placeholder="Search employees..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full h-10 pl-10 pr-4 bg-surface border border-border rounded-lg text-text-primary"
						/>
					</div>
					<Select
						value={filterMonth}
						onChange={(e) => setFilterMonth(e.target.value)}
						options={[
							{ value: "", label: "All Months" },
							...Array.from({ length: 12 }, (_, i) => ({
								value: (i + 1).toString(),
								label: getMonthName(i + 1),
							})),
						]}
					/>
					<Select
						value={filterYear}
						onChange={(e) => setFilterYear(e.target.value)}
						options={[
							{ value: "", label: "All Years" },
							{ value: "2024", label: "2024" },
							{ value: "2025", label: "2025" },
							{ value: "2026", label: "2026" },
						]}
					/>
					<Select
						value={filterStatus}
						onChange={(e) => setFilterStatus(e.target.value)}
						options={[
							{ value: "", label: "All Status" },
							{ value: "draft", label: "Draft" },
							{ value: "pending", label: "Pending" },
							{ value: "approved", label: "Approved" },
							{ value: "paid", label: "Paid" },
							{ value: "rejected", label: "Rejected" },
						]}
					/>
				</div>
			</Card>

			{/* Error State */}
			{error && (
				<div className="flex items-center gap-2 p-4 rounded-lg bg-error/10 border border-error/30 text-error">
					<AlertCircle className="w-5 h-5" />
					<span>{error}</span>
					<Button variant="ghost" size="sm" onClick={fetchPayrolls}>
						Retry
					</Button>
				</div>
			)}

			{/* Loading State */}
			{isLoading && (
				<div className="flex items-center justify-center py-12">
					<RefreshCw className="w-8 h-8 animate-spin text-primary" />
				</div>
			)}

			{/* Payroll Table */}
			{!isLoading && !error && (
				<Card padding="none">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-surface border-b border-border">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
										Employee
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
										Period
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
										Basic
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
										Gross
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
										Deductions
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
										Net Salary
									</th>
									<th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">
										Status
									</th>
									<th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{filteredPayrolls.length === 0 ? (
									<tr>
										<td
											colSpan={8}
											className="px-4 py-12 text-center text-text-muted"
										>
											No payroll records found
										</td>
									</tr>
								) : (
									filteredPayrolls.map((payroll) => (
										<tr
											key={payroll.id}
											className="hover:bg-surface/50 transition-colors"
										>
											<td className="px-4 py-3">
												<div className="flex items-center gap-3">
													<Avatar
														src={payroll.employee?.avatar}
														name={payroll.employee?.name || "Unknown"}
														size="sm"
													/>
													<div>
														<p className="font-medium text-text-primary">
															{payroll.employee?.name || "Unknown"}
														</p>
														<p className="text-xs text-text-muted">
															{payroll.employee?.department}
														</p>
													</div>
												</div>
											</td>
											<td className="px-4 py-3 text-text-primary">
												{getMonthName(payroll.month)} {payroll.year}
											</td>
											<td className="px-4 py-3 text-right text-text-primary">
												{formatCurrency(payroll.basicSalary)}
											</td>
											<td className="px-4 py-3 text-right text-text-primary">
												{formatCurrency(payroll.grossSalary)}
											</td>
											<td className="px-4 py-3 text-right text-red-500">
												-{formatCurrency(payroll.totalDeductions)}
											</td>
											<td className="px-4 py-3 text-right font-semibold text-primary">
												{formatCurrency(payroll.netSalary)}
											</td>
											<td className="px-4 py-3 text-center">
												<span
													className={cn(
														"px-2 py-1 rounded-full text-xs font-medium border capitalize",
														getStatusColor(payroll.status)
													)}
												>
													{payroll.status}
												</span>
											</td>
											<td className="px-4 py-3">
												<div className="flex items-center justify-center gap-1">
													<button
														onClick={() => {
															setSelectedPayroll(payroll);
															setIsViewModalOpen(true);
														}}
														className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded"
														title="View"
													>
														<Eye className="w-4 h-4" />
													</button>
													{payroll.status !== "paid" && (
														<>
															<button
																onClick={() => {
																	setSelectedPayroll(payroll);
																	setIsEditModalOpen(true);
																}}
																className="p-1.5 text-text-muted hover:text-blue-500 hover:bg-blue-500/10 rounded"
																title="Edit"
															>
																<Edit className="w-4 h-4" />
															</button>
															{payroll.status === "draft" && (
																<button
																	onClick={() =>
																		handleStatusChange(payroll.id, "pending")
																	}
																	className="p-1.5 text-text-muted hover:text-yellow-500 hover:bg-yellow-500/10 rounded"
																	title="Submit for Approval"
																>
																	<Clock className="w-4 h-4" />
																</button>
															)}
															{isAdmin && payroll.status === "pending" && (
																<button
																	onClick={() =>
																		handleStatusChange(payroll.id, "approved")
																	}
																	className="p-1.5 text-text-muted hover:text-green-500 hover:bg-green-500/10 rounded"
																	title="Approve"
																>
																	<CheckCircle className="w-4 h-4" />
																</button>
															)}
															{payroll.status === "approved" && (
																<button
																	onClick={() =>
																		handleStatusChange(payroll.id, "paid")
																	}
																	className="p-1.5 text-text-muted hover:text-green-500 hover:bg-green-500/10 rounded"
																	title="Mark as Paid"
																>
																	<Banknote className="w-4 h-4" />
																</button>
															)}
															{isAdmin && (
																<button
																	onClick={() =>
																		handleDeletePayroll(payroll.id)
																	}
																	className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded"
																	title="Delete"
																>
																	<Trash2 className="w-4 h-4" />
																</button>
															)}
														</>
													)}
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</Card>
			)}

			{/* Modals */}
			<PayrollModal
				employees={employees}
				isOpen={isAddModalOpen}
				onClose={() => setIsAddModalOpen(false)}
				onSave={handleAddPayroll}
				mode="add"
			/>

			<PayrollModal
				payroll={selectedPayroll}
				employees={employees}
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setSelectedPayroll(null);
				}}
				onSave={handleEditPayroll}
				mode="edit"
			/>

			<ViewPayrollModal
				payroll={selectedPayroll}
				isOpen={isViewModalOpen}
				onClose={() => {
					setIsViewModalOpen(false);
					setSelectedPayroll(null);
				}}
			/>
		</div>
	);
}
