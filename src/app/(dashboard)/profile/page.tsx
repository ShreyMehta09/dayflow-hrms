"use client";

import React, { useState } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	Button,
	Avatar,
	Badge,
} from "@/components/ui";
import { Tabs, TabPanel } from "@/components/ui/Tabs";
import { useAuth } from "@/context/AuthContext";
import {
	Mail,
	Phone,
	Building2,
	Briefcase,
	Calendar,
	Edit,
	Shield,
	Clock,
	MapPin,
	User,
	Lock,
	DollarSign,
	FileText,
	Users,
} from "lucide-react";

export default function ProfilePage() {
	const { user, role } = useAuth();
	const [activeTab, setActiveTab] = useState("resume");

	if (!user) {
		return null;
	}

	if (!user) {
		return null;
	}

	// Define tabs based on user role
	const tabs = [
		{ id: "resume", label: "Resume", icon: <FileText className="w-4 h-4" /> },
		{
			id: "private",
			label: "Private Info",
			icon: <User className="w-4 h-4" />,
		},
		// Only show Salary tab for admin and hr
		...(role === "admin" || role === "hr"
			? [
					{
						id: "salary",
						label: "Salary Info",
						icon: <DollarSign className="w-4 h-4" />,
					},
			  ]
			: []),
		{ id: "security", label: "Security", icon: <Lock className="w-4 h-4" /> },
	];

	// Mock data (replace with actual data from API)
	const employeeData = {
		company: "DayFlow HRMS Inc.",
		manager: "John Smith",
		employeeId: "EMP2024001",
		// Private Info
		dateOfBirth: "1990-05-15",
		gender: "Male",
		nationality: "American",
		address: "123 Main Street, San Francisco, CA 94102",
		emergencyContact: "Jane Doe",
		emergencyPhone: "+1 (555) 999-8888",
		// Salary Info
		wageType: "Fixed",
		monthlyWage: 85000,
		salaryComponents: [
			{ name: "Basic", type: "percentage", value: 40, amount: 34000 },
			{ name: "HRA", type: "percentage", value: 20, amount: 17000 },
			{
				name: "Standard Allowance",
				type: "percentage",
				value: 10,
				amount: 8500,
			},
			{
				name: "Performance Bonus",
				type: "percentage",
				value: 15,
				amount: 12750,
			},
			{
				name: "Leave Travel Allowance",
				type: "fixed",
				value: 8000,
				amount: 8000,
			},
			{ name: "Fixed Allowance", type: "fixed", value: 4750, amount: 4750 },
		],
		pf: 4200,
		professionalTax: 2400,
		// Security
		lastPasswordChange: "2025-12-15",
		twoFactorEnabled: false,
	};

	// Calculate total salary components
	const totalComponents = employeeData.salaryComponents.reduce(
		(sum, comp) => sum + comp.amount,
		0
	);
	const netSalary =
		totalComponents - employeeData.pf - employeeData.professionalTax;

	return (
		<div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">My Profile</h1>
					<p className="text-text-muted mt-1">
						View and manage your employee profile
					</p>
				</div>
				<Button variant="outline" leftIcon={<Edit className="w-4 h-4" />}>
					Edit Profile
				</Button>
			</div>

			{/* Profile Header Card */}
			<Card className="overflow-hidden">
				<div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 h-32" />
				<div className="px-6 pb-6 -mt-16">
					<div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
						{/* Profile Picture */}
						<Avatar
							src={user.avatar}
							name={user.name}
							size="2xl"
							className="ring-4 ring-card"
						/>

						{/* Basic Info */}
						<div className="flex-1 text-center sm:text-left">
							<div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
								<h2 className="text-2xl font-bold text-text-primary">
									{user.name}
								</h2>
								<Badge
									variant={
										user.role === "admin"
											? "error"
											: user.role === "hr"
											? "primary"
											: "secondary"
									}
								>
									<Shield className="w-3 h-3" />
									{user.role.toUpperCase()}
								</Badge>
							</div>
							<p className="text-text-muted text-lg">{user.position}</p>
							<div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-text-muted">
								<div className="flex items-center gap-1.5">
									<Building2 className="w-4 h-4" />
									<span>{employeeData.company}</span>
								</div>
								<div className="flex items-center gap-1.5">
									<Briefcase className="w-4 h-4" />
									<span>{user.department}</span>
								</div>
								<div className="flex items-center gap-1.5">
									<Users className="w-4 h-4" />
									<span>Manager: {employeeData.manager}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Card>

			{/* Tabs Navigation */}
			<Tabs
				items={tabs}
				value={activeTab}
				onChange={setActiveTab}
				variant="underline"
			/>

			{/* Tab Content */}
			<div className="pb-8">
				{/* Resume Tab */}
				<TabPanel value="resume" activeValue={activeTab}>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Contact Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Mail className="w-5 h-5 text-primary" />
									Contact Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Email Address
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{user.email}
									</p>
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Phone Number
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{user.phone || "Not Provided"}
									</p>
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Employee ID
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{employeeData.employeeId}
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Work Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Briefcase className="w-5 h-5 text-secondary" />
									Work Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Company
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{employeeData.company}
									</p>
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Department
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{user.department || "Not Assigned"}
									</p>
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Manager
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{employeeData.manager}
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Employment Details */}
						<Card className="lg:col-span-2">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Calendar className="w-5 h-5 text-success" />
									Employment Details
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
									<div>
										<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
											Position
										</label>
										<p className="mt-1 text-text-primary font-medium">
											{user.position}
										</p>
									</div>
									<div>
										<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
											Join Date
										</label>
										<p className="mt-1 text-text-primary font-medium">
											{new Date(user.joinDate).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</p>
									</div>
									<div>
										<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
											Employment Type
										</label>
										<p className="mt-1 text-text-primary font-medium">
											Full-time
										</p>
									</div>
									<div>
										<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
											Work Location
										</label>
										<p className="mt-1 text-text-primary font-medium">Remote</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabPanel>

				{/* Private Info Tab */}
				<TabPanel value="private" activeValue={activeTab}>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Personal Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="w-5 h-5 text-primary" />
									Personal Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Full Name
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{user.name}
									</p>
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Date of Birth
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{new Date(employeeData.dateOfBirth).toLocaleDateString(
											"en-US",
											{
												year: "numeric",
												month: "long",
												day: "numeric",
											}
										)}
									</p>
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Gender
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{employeeData.gender}
									</p>
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Nationality
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{employeeData.nationality}
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Address & Emergency Contact */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<MapPin className="w-5 h-5 text-warning" />
									Address & Emergency Contact
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Address
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{employeeData.address}
									</p>
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Emergency Contact Name
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{employeeData.emergencyContact}
									</p>
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Emergency Contact Phone
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{employeeData.emergencyPhone}
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabPanel>

				{/* Salary Info Tab (Admin/HR Only) */}
				{(role === "admin" || role === "hr") && (
					<TabPanel value="salary" activeValue={activeTab}>
						<div className="space-y-6">
							{/* Access Badge */}
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-semibold text-text-primary">
									Salary Structure
								</h2>
								<Badge variant="error">
									<Shield className="w-3 h-3" />
									ADMIN/HR ONLY
								</Badge>
							</div>

							{/* Wage Type & Total */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<DollarSign className="w-5 h-5 text-success" />
										Wage Information
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
										<div>
											<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
												Wage Type
											</label>
											<p className="mt-1 text-text-primary font-semibold text-lg">
												{employeeData.wageType}
											</p>
										</div>
										<div>
											<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
												Monthly Wage
											</label>
											<p className="mt-1 text-text-primary font-semibold text-lg">
												${employeeData.monthlyWage.toLocaleString()}
											</p>
										</div>
										<div>
											<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
												Total Components
											</label>
											<p
												className={`mt-1 font-semibold text-lg ${
													totalComponents > employeeData.monthlyWage
														? "text-error"
														: "text-success"
												}`}
											>
												${totalComponents.toLocaleString()}
											</p>
										</div>
									</div>

									{/* Validation Warning */}
									{totalComponents > employeeData.monthlyWage && (
										<div className="mt-4 p-4 bg-error/10 border border-error/30 rounded-lg">
											<p className="text-sm text-error font-medium">
												⚠️ Warning: Total components exceed monthly wage by $
												{(
													totalComponents - employeeData.monthlyWage
												).toLocaleString()}
											</p>
										</div>
									)}

									{/* Success Message */}
									{totalComponents <= employeeData.monthlyWage && (
										<div className="mt-4 p-4 bg-success/10 border border-success/30 rounded-lg">
											<p className="text-sm text-success font-medium">
												✓ Total components are within the monthly wage limit
											</p>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Salary Components */}
							<Card>
								<CardHeader>
									<CardTitle>Salary Components</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{/* Table Header */}
										<div className="grid grid-cols-12 gap-4 pb-3 border-b border-border font-medium text-sm text-text-muted">
											<div className="col-span-4">Component</div>
											<div className="col-span-2 text-center">Type</div>
											<div className="col-span-3 text-right">Value</div>
											<div className="col-span-3 text-right">Amount</div>
										</div>

										{/* Component Rows */}
										{employeeData.salaryComponents.map((component, index) => (
											<div
												key={index}
												className="grid grid-cols-12 gap-4 py-3 border-b border-border/50 hover:bg-surface/50 transition-colors rounded-lg px-2"
											>
												<div className="col-span-4 font-medium text-text-primary flex items-center">
													{component.name}
												</div>
												<div className="col-span-2 text-center flex items-center justify-center">
													<Badge
														variant={
															component.type === "percentage"
																? "primary"
																: "secondary"
														}
														size="sm"
													>
														{component.type === "percentage" ? "%" : "$"}
													</Badge>
												</div>
												<div className="col-span-3 text-right font-medium text-text-primary flex items-center justify-end">
													{component.type === "percentage"
														? `${component.value}%`
														: `$${component.value.toLocaleString()}`}
												</div>
												<div className="col-span-3 text-right font-semibold text-success flex items-center justify-end">
													${component.amount.toLocaleString()}
												</div>
											</div>
										))}

										{/* Total Row */}
										<div className="grid grid-cols-12 gap-4 pt-4 border-t-2 border-border font-semibold text-text-primary">
											<div className="col-span-9 text-right">
												Total Gross Salary:
											</div>
											<div className="col-span-3 text-right text-lg text-success">
												${totalComponents.toLocaleString()}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Deductions */}
							<Card>
								<CardHeader>
									<CardTitle>Deductions</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div className="p-4 bg-surface rounded-lg border border-border">
												<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
													Provident Fund (PF)
												</label>
												<p className="mt-1 text-text-primary font-semibold text-lg">
													${employeeData.pf.toLocaleString()}
												</p>
												<p className="text-xs text-text-muted mt-1">
													{(
														(employeeData.pf / employeeData.monthlyWage) *
														100
													).toFixed(2)}
													% of wage
												</p>
											</div>
											<div className="p-4 bg-surface rounded-lg border border-border">
												<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
													Professional Tax
												</label>
												<p className="mt-1 text-text-primary font-semibold text-lg">
													${employeeData.professionalTax.toLocaleString()}
												</p>
												<p className="text-xs text-text-muted mt-1">
													{(
														(employeeData.professionalTax /
															employeeData.monthlyWage) *
														100
													).toFixed(2)}
													% of wage
												</p>
											</div>
										</div>

										{/* Total Deductions */}
										<div className="p-4 bg-error/5 border border-error/20 rounded-lg">
											<div className="flex items-center justify-between">
												<span className="font-medium text-text-primary">
													Total Deductions:
												</span>
												<span className="font-semibold text-lg text-error">
													$
													{(
														employeeData.pf + employeeData.professionalTax
													).toLocaleString()}
												</span>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Net Salary Summary */}
							<Card className="bg-gradient-to-br from-success/10 to-primary/10 border-success/30">
								<CardContent className="py-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-text-muted uppercase tracking-wider">
												Net Monthly Salary
											</p>
											<p className="text-xs text-text-muted mt-1">
												After all deductions
											</p>
										</div>
										<div className="text-right">
											<p className="text-3xl font-bold text-success">
												${netSalary.toLocaleString()}
											</p>
											<p className="text-xs text-text-muted mt-1">
												{((netSalary / employeeData.monthlyWage) * 100).toFixed(
													1
												)}
												% of gross
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Salary Breakdown Chart */}
							<Card>
								<CardHeader>
									<CardTitle>Salary Breakdown</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{employeeData.salaryComponents.map((component, index) => {
											const percentage = (
												(component.amount / totalComponents) *
												100
											).toFixed(1);
											return (
												<div key={index}>
													<div className="flex items-center justify-between text-sm mb-1">
														<span className="text-text-primary font-medium">
															{component.name}
														</span>
														<span className="text-text-muted">
															${component.amount.toLocaleString()} ({percentage}
															%)
														</span>
													</div>
													<div className="w-full bg-surface rounded-full h-2 overflow-hidden">
														<div
															className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-300"
															style={{ width: `${percentage}%` }}
														/>
													</div>
												</div>
											);
										})}
									</div>
								</CardContent>
							</Card>
						</div>
					</TabPanel>
				)}

				{/* Security Tab */}
				<TabPanel value="security" activeValue={activeTab}>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Password & Authentication */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Lock className="w-5 h-5 text-error" />
									Password & Authentication
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Last Password Change
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{new Date(
											employeeData.lastPasswordChange
										).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</p>
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Two-Factor Authentication
									</label>
									<div className="mt-1 flex items-center gap-2">
										<Badge
											variant={
												employeeData.twoFactorEnabled ? "success" : "warning"
											}
										>
											{employeeData.twoFactorEnabled ? "Enabled" : "Disabled"}
										</Badge>
									</div>
								</div>
								<div className="pt-4">
									<Button variant="outline" size="sm">
										Change Password
									</Button>
								</div>
							</CardContent>
						</Card>

						{/* Account Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Shield className="w-5 h-5 text-primary" />
									Account Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Account Status
									</label>
									<div className="mt-1">
										<Badge variant="success">Active</Badge>
									</div>
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Role
									</label>
									<p className="mt-1 text-text-primary font-medium capitalize">
										{user.role}
									</p>
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Login ID
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{user.email}
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabPanel>
			</div>
		</div>
	);
}
