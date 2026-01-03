"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Avatar, Modal } from "@/components/ui";
import { useAuth, RoleGuard } from "@/context/AuthContext";
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
} from "lucide-react";

// Status types
type EmployeeStatus = "present" | "absent" | "on_leave";

// Mock employee data
const employees = [
	{
		id: "1",
		name: "Sarah Johnson",
		email: "sarah.johnson@company.com",
		phone: "+1 (555) 234-5678",
		department: "Human Resources",
		position: "HR Manager",
		status: "present" as EmployeeStatus,
		avatar:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
		joinDate: "2022-03-10",
	},
	{
		id: "2",
		name: "Michael Chen",
		email: "michael.chen@company.com",
		phone: "+1 (555) 345-6789",
		department: "Engineering",
		position: "Senior Developer",
		status: "present" as EmployeeStatus,
		avatar:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
		joinDate: "2023-06-01",
	},
	{
		id: "3",
		name: "Emily Watson",
		email: "emily.watson@company.com",
		phone: "+1 (555) 456-7890",
		department: "Marketing",
		position: "Marketing Lead",
		status: "on_leave" as EmployeeStatus,
		avatar:
			"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
		joinDate: "2023-01-15",
	},
	{
		id: "4",
		name: "David Kim",
		email: "david.kim@company.com",
		phone: "+1 (555) 567-8901",
		department: "Engineering",
		position: "Backend Developer",
		status: "absent" as EmployeeStatus,
		avatar:
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
		joinDate: "2023-09-01",
	},
	{
		id: "5",
		name: "Lisa Chen",
		email: "lisa.chen@company.com",
		phone: "+1 (555) 678-9012",
		department: "Design",
		position: "UI/UX Designer",
		status: "present" as EmployeeStatus,
		avatar:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
		joinDate: "2023-04-20",
	},
	{
		id: "6",
		name: "James Wilson",
		email: "james.wilson@company.com",
		phone: "+1 (555) 789-0123",
		department: "Sales",
		position: "Sales Manager",
		status: "present" as EmployeeStatus,
		avatar:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
		joinDate: "2022-08-15",
	},
	{
		id: "7",
		name: "Amanda Foster",
		email: "amanda.foster@company.com",
		phone: "+1 (555) 890-1234",
		department: "Engineering",
		position: "Frontend Developer",
		status: "on_leave" as EmployeeStatus,
		avatar:
			"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
		joinDate: "2023-11-01",
	},
	{
		id: "8",
		name: "Robert Taylor",
		email: "robert.taylor@company.com",
		phone: "+1 (555) 901-2345",
		department: "Finance",
		position: "Financial Analyst",
		status: "present" as EmployeeStatus,
		avatar:
			"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
		joinDate: "2023-02-20",
	},
];

// Status indicator component
const StatusIndicator = ({ status }: { status: EmployeeStatus }) => {
	if (status === "on_leave") {
		return (
			<div className="absolute top-3 right-3 p-1.5 bg-secondary/20 rounded-full">
				<Plane className="w-3.5 h-3.5 text-secondary" />
			</div>
		);
	}

	return (
		<div
			className={`absolute top-3 right-3 w-3 h-3 rounded-full border-2 border-card ${
				status === "present" ? "bg-success" : "bg-warning"
			}`}
		/>
	);
};

// Employee Card Component
interface EmployeeCardProps {
	employee: (typeof employees)[0];
	onClick: () => void;
}

const EmployeeCard = ({ employee, onClick }: EmployeeCardProps) => {
	return (
		<Card
			padding="none"
			className="group cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
			onClick={onClick}
		>
			<div className="relative p-6 flex flex-col items-center text-center">
				{/* Status Indicator */}
				<StatusIndicator status={employee.status} />

				{/* Profile Picture */}
				<Avatar
					src={employee.avatar}
					name={employee.name}
					size="xl"
					className="mb-4 ring-2 ring-border group-hover:ring-primary/50 transition-all"
				/>

				{/* Employee Name */}
				<h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
					{employee.name}
				</h3>

				{/* Position */}
				<p className="text-sm text-text-muted mt-1">{employee.position}</p>
			</div>
		</Card>
	);
};

// Employee Profile Modal
interface EmployeeProfileModalProps {
	employee: (typeof employees)[0] | null;
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
								className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
									employee.status === "present"
										? "bg-success/20 text-success"
										: employee.status === "absent"
										? "bg-warning/20 text-warning"
										: "bg-secondary/20 text-secondary"
								}`}
							>
								{employee.status === "on_leave" && (
									<Plane className="w-3 h-3" />
								)}
								{employee.status === "present" && (
									<span className="w-2 h-2 bg-success rounded-full" />
								)}
								{employee.status === "absent" && (
									<span className="w-2 h-2 bg-warning rounded-full" />
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
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedEmployee, setSelectedEmployee] = useState<
		(typeof employees)[0] | null
	>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const canEdit = role === "admin" || role === "hr";

	// Filter employees based on search
	const filteredEmployees = employees.filter(
		(emp) =>
			emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
			emp.department.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleCardClick = (employee: (typeof employees)[0]) => {
		setSelectedEmployee(employee);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedEmployee(null);
	};

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">Employees</h1>
					<p className="text-text-muted mt-1">
						Manage your organization&apos;s workforce
					</p>
				</div>
				<RoleGuard allowedRoles={["admin", "hr"]}>
					<Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
						Add Employee
					</Button>
				</RoleGuard>
			</div>

			{/* Search Bar */}
			<div className="relative max-w-md">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
				<input
					type="text"
					placeholder="Search employees..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
				/>
			</div>

			{/* Status Legend */}
			<div className="flex flex-wrap items-center gap-6 text-sm">
				<div className="flex items-center gap-2">
					<span className="w-3 h-3 bg-success rounded-full" />
					<span className="text-text-muted">Present</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="w-3 h-3 bg-warning rounded-full" />
					<span className="text-text-muted">Absent</span>
				</div>
				<div className="flex items-center gap-2">
					<Plane className="w-3.5 h-3.5 text-secondary" />
					<span className="text-text-muted">On Leave</span>
				</div>
			</div>

			{/* Employee Grid */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
				{filteredEmployees.map((employee) => (
					<EmployeeCard
						key={employee.id}
						employee={employee}
						onClick={() => handleCardClick(employee)}
					/>
				))}
			</div>

			{/* Empty State */}
			{filteredEmployees.length === 0 && (
				<div className="text-center py-12">
					<p className="text-text-muted">
						No employees found matching your search.
					</p>
				</div>
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
