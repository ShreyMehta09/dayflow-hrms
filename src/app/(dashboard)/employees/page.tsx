"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	Card,
	Button,
	Avatar,
	Modal,
	SkeletonEmployeeCard,
	NoEmployeesFound,
	NoSearchResults,
	InlineError,
} from "@/components/ui";
import { useAuth, RoleGuard } from "@/context/AuthContext";
import { useReducedMotion, useAriaAnnounce } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import {
	Plus,
	Search,
	Plane,
	X,
	Mail,
	Phone,
	Building2,
	Briefcase,
	Calendar,
	Edit,
	Shield,
	RefreshCw,
} from "lucide-react";

// Status types
type EmployeeStatus = "present" | "absent" | "on_leave";

// Employee interface
interface Employee {
	id: string;
	name: string;
	email: string;
	phone?: string;
	department?: string;
	position?: string;
	status: EmployeeStatus;
	avatar?: string;
	joinDate?: string;
	role?: string;
}

// Status indicator component (positioned at top-right corner)
const StatusIndicator = ({ status }: { status: EmployeeStatus }) => {
	if (status === "on_leave") {
		return (
			<div className="absolute top-2.5 right-2.5 p-1.5 bg-blue-500/20 rounded-full backdrop-blur-sm border border-blue-500/30">
				<Plane className="w-3.5 h-3.5 text-blue-500" />
			</div>
		);
	}

	// Green dot for Present, Yellow dot for Absent
	return (
		<div
			className={`absolute top-2.5 right-2.5 w-3 h-3 rounded-full border-2 border-white shadow-lg ${
				status === "present" ? "bg-green-500" : "bg-yellow-500"
			}`}
		/>
	);
};

// Employee Card Component
interface EmployeeCardProps {
	employee: Employee;
	onClick: () => void;
}

const EmployeeCard = ({ employee, onClick }: EmployeeCardProps) => {
	return (
		<Card
			padding="none"
			className="group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02]"
			onClick={onClick}
		>
			<div className="relative p-5 flex flex-col items-center text-center">
				{/* Status Indicator - positioned at top-right corner */}
				<StatusIndicator status={employee.status} />

				{/* Profile Picture */}
				<Avatar
					src={employee.avatar}
					name={employee.name}
					size="xl"
					className="mb-3 ring-2 ring-border group-hover:ring-primary/50 transition-all duration-300"
				/>

				{/* Employee Name */}
				<h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
					{employee.name}
				</h3>

				{/* Position */}
				<p className="text-sm text-text-muted mt-0.5 line-clamp-1">
					{employee.position}
				</p>
			</div>
		</Card>
	);
};

// Employee Profile Modal
interface EmployeeProfileModalProps {
	employee: Employee | null;
	isOpen: boolean;
	onClose: () => void;
	canEdit: boolean;
}

const EmployeeProfileModal = ({
	employee,
	isOpen,
	onClose,
	canEdit,
}: EmployeeProfileModalProps) => {
	if (!employee) return null;

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg">
			<div className="p-6">
				{/* Header */}
				<div className="flex items-start justify-between mb-6">
					<h2 className="text-xl font-semibold text-text-primary">
						Employee Profile
					</h2>
					<button
						onClick={onClose}
						className="p-1 text-text-muted hover:text-text-primary transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Profile Header */}
				<div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
					<div className="relative">
						<Avatar
							src={employee.avatar}
							name={employee.name}
							size="2xl"
							className="ring-4 ring-border"
						/>
						<StatusIndicator status={employee.status} />
					</div>
					<div className="text-center sm:text-left flex-1">
						<h3 className="text-2xl font-bold text-text-primary">
							{employee.name}
						</h3>
						<p className="text-text-muted mt-1">{employee.position}</p>
						<div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
							<span
								className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
									employee.status === "present"
										? "bg-green-500/20 text-green-700 border-green-500/30"
										: employee.status === "absent"
										? "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
										: "bg-blue-500/20 text-blue-700 border-blue-500/30"
								}`}
							>
								{employee.status === "on_leave" && (
									<Plane className="w-3 h-3" />
								)}
								{employee.status === "present" && (
									<span className="w-2 h-2 bg-green-500 rounded-full" />
								)}
								{employee.status === "absent" && (
									<span className="w-2 h-2 bg-yellow-500 rounded-full" />
								)}
								{employee.status === "present"
									? "Present"
									: employee.status === "absent"
									? "Absent"
									: "On Leave"}
							</span>
						</div>
					</div>
					{canEdit && (
						<Button
							variant="outline"
							size="sm"
							leftIcon={<Edit className="w-4 h-4" />}
						>
							Edit
						</Button>
					)}
				</div>

				{/* Details Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="flex items-start gap-3">
						<div className="p-2 rounded-lg bg-primary-muted">
							<Mail className="w-5 h-5 text-primary" />
						</div>
						<div>
							<label className="text-xs font-medium text-text-muted">
								Email Address
							</label>
							<p className="mt-0.5 text-text-primary">{employee.email}</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<div className="p-2 rounded-lg bg-secondary-muted">
							<Phone className="w-5 h-5 text-secondary" />
						</div>
						<div>
							<label className="text-xs font-medium text-text-muted">
								Phone Number
							</label>
							<p className="mt-0.5 text-text-primary">{employee.phone}</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<div className="p-2 rounded-lg bg-success-muted">
							<Building2 className="w-5 h-5 text-success" />
						</div>
						<div>
							<label className="text-xs font-medium text-text-muted">
								Department
							</label>
							<p className="mt-0.5 text-text-primary">{employee.department}</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<div className="p-2 rounded-lg bg-warning-muted">
							<Briefcase className="w-5 h-5 text-warning" />
						</div>
						<div>
							<label className="text-xs font-medium text-text-muted">
								Position
							</label>
							<p className="mt-0.5 text-text-primary">{employee.position}</p>
						</div>
					</div>

					<div className="flex items-start gap-3 md:col-span-2">
						<div className="p-2 rounded-lg bg-primary-muted">
							<Calendar className="w-5 h-5 text-primary" />
						</div>
						<div>
							<label className="text-xs font-medium text-text-muted">
								Join Date
							</label>
							<p className="mt-0.5 text-text-primary">
								{new Date(employee.joinDate).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</p>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default function EmployeesPage() {
	const { role } = useAuth();
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
		null
	);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const prefersReducedMotion = useReducedMotion();
	const announce = useAriaAnnounce();

	const canEdit = role === "admin" || role === "hr";

	// Fetch employees from API
	const fetchEmployees = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/employees", {
				credentials: "include",
			});
			if (!response.ok) {
				throw new Error("Failed to fetch employees");
			}
			const data = await response.json();
			setEmployees(data.employees || []);
			announce(`${data.employees?.length || 0} employees loaded`);
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error("Failed to load employees")
			);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchEmployees();
	}, [announce]);

	// Filter employees based on search
	const filteredEmployees = employees.filter(
		(emp) =>
			emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
			emp.department.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleCardClick = (employee: Employee) => {
		setSelectedEmployee(employee);
		setIsModalOpen(true);
		announce(`Viewing profile of ${employee.name}`);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedEmployee(null);
	};

	const handleRefresh = () => {
		fetchEmployees();
	};

	// Animation classes
	const animationClass = prefersReducedMotion ? "" : "animate-fade-in";
	const staggerClass = (index: number) =>
		prefersReducedMotion ? "" : `stagger-${Math.min((index % 6) + 1, 6)}`;

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
			className={cn("space-y-6", animationClass)}
			role="main"
			aria-label="Employees directory"
		>
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">Employees</h1>
					<p className="text-text-muted mt-1">
						Manage your organization&apos;s workforce
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleRefresh}
						aria-label="Refresh employee list"
						className="focus-ring"
						disabled={isLoading}
					>
						<RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
					</Button>
					<RoleGuard allowedRoles={["admin", "hr"]}>
						<Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
							Add Employee
						</Button>
					</RoleGuard>
				</div>
			</div>

			{/* Search Bar */}
			<div className="relative max-w-md">
				<Search
					className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
					aria-hidden="true"
				/>
				<input
					type="search"
					placeholder="Search employees..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus-ring"
					aria-label="Search employees by name, position, or department"
					disabled={isLoading}
				/>
			</div>

			{/* Status Legend */}
			<div
				className="flex flex-wrap items-center gap-6 px-1 py-2 text-sm"
				role="legend"
				aria-label="Employee status legend"
			>
				<div className="flex items-center gap-2">
					<span
						className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow"
						aria-hidden="true"
					/>
					<span className="text-text-muted font-medium">Present</span>
				</div>
				<div className="flex items-center gap-2">
					<span
						className="w-3 h-3 bg-yellow-500 rounded-full border-2 border-white shadow"
						aria-hidden="true"
					/>
					<span className="text-text-muted font-medium">Absent</span>
				</div>
				<div className="flex items-center gap-2">
					<div
						className="p-1 bg-blue-500/20 rounded-full border border-blue-500/30"
						aria-hidden="true"
					>
						<Plane className="w-3 h-3 text-blue-500" />
					</div>
					<span className="text-text-muted font-medium">On Leave</span>
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div
					className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
					aria-label="Loading employees"
					aria-busy="true"
				>
					{Array.from({ length: 12 }).map((_, index) => (
						<SkeletonEmployeeCard key={index} />
					))}
				</div>
			)}

			{/* Employee Grid */}
			{!isLoading && filteredEmployees.length > 0 && (
				<div
					className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
					role="list"
					aria-label={`${filteredEmployees.length} employees`}
				>
					{filteredEmployees.map((employee, index) => (
						<div
							key={employee.id}
							className={cn(animationClass, staggerClass(index))}
							role="listitem"
						>
							<EmployeeCard
								employee={employee}
								onClick={() => handleCardClick(employee)}
							/>
						</div>
					))}
				</div>
			)}

			{/* Empty State - No Results from Search */}
			{!isLoading && filteredEmployees.length === 0 && searchQuery && (
				<NoSearchResults
					title="No employees found"
					description={`No employees match "${searchQuery}". Try a different search term.`}
					actionLabel="Clear Search"
					onAction={() => setSearchQuery("")}
				/>
			)}

			{/* Empty State - No Employees at All */}
			{!isLoading && employees.length === 0 && !searchQuery && (
				<NoEmployeesFound
					actionLabel={canEdit ? "Add First Employee" : undefined}
					onAction={canEdit ? () => {} : undefined}
				/>
			)}

			{/* Employee Profile Modal */}
			<EmployeeProfileModal
				employee={selectedEmployee}
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				canEdit={canEdit}
			/>
		</div>
	);
}
