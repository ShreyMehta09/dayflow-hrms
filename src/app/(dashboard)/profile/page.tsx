"use client";

import React, { useState, useRef, useEffect } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	Button,
	Avatar,
	Badge,
	Modal,
	Input,
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
	Camera,
	X,
	Save,
	AlertCircle,
} from "lucide-react";

// Edit Profile Modal Component
interface EditProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
	user: {
		id: string;
		phone?: string;
		address?: string;
		avatar?: string;
		name?: string;
		email?: string;
		department?: string;
		position?: string;
	};
	isAdmin: boolean;
	onSave: (data: EditProfileData) => Promise<void>;
}

interface EditProfileData {
	phone?: string;
	address?: string;
	avatar?: string;
	name?: string;
	email?: string;
	department?: string;
	position?: string;
}

const EditProfileModal = ({
	isOpen,
	onClose,
	user,
	isAdmin,
	onSave,
}: EditProfileModalProps) => {
	const [formData, setFormData] = useState<EditProfileData>({
		phone: user.phone || "",
		address: user.address || "",
		avatar: user.avatar || "",
		name: user.name || "",
		email: user.email || "",
		department: user.department || "",
		position: user.position || "",
	});
	const [avatarPreview, setAvatarPreview] = useState<string | null>(
		user.avatar || null
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isOpen) {
			setFormData({
				phone: user.phone || "",
				address: user.address || "",
				avatar: user.avatar || "",
				name: user.name || "",
				email: user.email || "",
				department: user.department || "",
				position: user.position || "",
			});
			setAvatarPreview(user.avatar || null);
			setError(null);
		}
	}, [isOpen, user]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleAvatarClick = () => {
		fileInputRef.current?.click();
	};

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				setError("Image must be less than 5MB");
				return;
			}
			if (!file.type.startsWith("image/")) {
				setError("Please upload an image file");
				return;
			}
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64 = reader.result as string;
				setAvatarPreview(base64);
				setFormData((prev) => ({ ...prev, avatar: base64 }));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await onSave(formData);
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update profile");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg">
			<div className="p-6">
				<div className="flex items-start justify-between mb-6">
					<div>
						<h2 className="text-xl font-semibold text-text-primary">
							Edit Profile
						</h2>
						<p className="text-sm text-text-muted mt-1">
							{isAdmin
								? "Update all profile details"
								: "Update your contact information"}
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
					{/* Avatar Upload */}
					<div className="flex flex-col items-center gap-4">
						<div className="relative">
							<Avatar
								src={avatarPreview || undefined}
								name={formData.name || "User"}
								size="2xl"
								className="ring-4 ring-border"
							/>
							<button
								type="button"
								onClick={handleAvatarClick}
								className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors shadow-lg"
							>
								<Camera className="w-4 h-4" />
							</button>
							<input
								type="file"
								ref={fileInputRef}
								onChange={handleAvatarChange}
								accept="image/*"
								className="hidden"
							/>
						</div>
						<p className="text-xs text-text-muted">
							Click camera icon to change photo
						</p>
					</div>

					{/* Admin-only fields */}
					{isAdmin && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-surface rounded-lg border border-border">
							<div className="md:col-span-2 flex items-center gap-2 mb-2">
								<Shield className="w-4 h-4 text-error" />
								<span className="text-sm font-medium text-error">
									Admin Only Fields
								</span>
							</div>
							<Input
								name="name"
								label="Full Name"
								value={formData.name}
								onChange={handleInputChange}
								leftIcon={<User className="w-4 h-4" />}
								fullWidth
							/>
							<Input
								name="email"
								label="Email Address"
								type="email"
								value={formData.email}
								onChange={handleInputChange}
								leftIcon={<Mail className="w-4 h-4" />}
								fullWidth
							/>
							<Input
								name="department"
								label="Department"
								value={formData.department}
								onChange={handleInputChange}
								leftIcon={<Building2 className="w-4 h-4" />}
								fullWidth
							/>
							<Input
								name="position"
								label="Position"
								value={formData.position}
								onChange={handleInputChange}
								leftIcon={<Briefcase className="w-4 h-4" />}
								fullWidth
							/>
						</div>
					)}

					{/* Employee-editable fields */}
					<div className="space-y-4">
						<div className="flex items-center gap-2 mb-2">
							<User className="w-4 h-4 text-primary" />
							<span className="text-sm font-medium text-text-primary">
								Contact Information
							</span>
						</div>
						<Input
							name="phone"
							label="Phone Number"
							value={formData.phone}
							onChange={handleInputChange}
							leftIcon={<Phone className="w-4 h-4" />}
							placeholder="Enter your phone number"
							fullWidth
						/>
						<div>
							<label className="block text-sm font-medium text-text-muted mb-1.5">
								Address
							</label>
							<textarea
								name="address"
								value={formData.address}
								onChange={handleInputChange}
								placeholder="Enter your address"
								rows={3}
								className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
							/>
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
							Save Changes
						</Button>
					</div>
				</form>
			</div>
		</Modal>
	);
};

export default function ProfilePage() {
	const { user, role, refreshUser } = useAuth();
	const [activeTab, setActiveTab] = useState("resume");
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	if (!user) {
		return null;
	}

	const isAdmin = role === "admin" || role === "hr";

	const handleSaveProfile = async (data: EditProfileData) => {
		const response = await fetch(`/api/employees/${user.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const result = await response.json();
			throw new Error(result.error || "Failed to update profile");
		}

		// Refresh user data in context
		if (refreshUser) {
			await refreshUser();
		}
	};

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

	// Employee profile data - derived from user where available
	const employeeData = {
		company: "DayFlow HRMS Inc.",
		manager: role === "admin" ? "N/A" : role === "hr" ? "Admin" : "HR Manager",
		employeeId: `EMP${user.id?.slice(-6)?.toUpperCase() || "000001"}`,
		// Private Info - from user data
		dateOfBirth: null as string | null,
		gender: null as string | null,
		nationality: null as string | null,
		address: user.address || null,
		emergencyContact: null as string | null,
		emergencyPhone: null as string | null,
		// Salary Info - not stored in database yet
		wageType: null as string | null,
		monthlyWage: null as number | null,
		salaryComponents: [] as {
			name: string;
			type: string;
			value: number;
			amount: number;
		}[],
		pf: 0,
		professionalTax: 0,
		// Security
		lastPasswordChange: null as string | null,
		twoFactorEnabled: false,
	};

	// Calculate total salary components (only if salary data exists)
	const totalComponents = employeeData.salaryComponents.reduce(
		(sum, comp) => sum + comp.amount,
		0
	);
	const netSalary = employeeData.monthlyWage
		? totalComponents - employeeData.pf - employeeData.professionalTax
		: null;

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
				<Button
					variant="outline"
					leftIcon={<Edit className="w-4 h-4" />}
					onClick={() => setIsEditModalOpen(true)}
				>
					Edit Profile
				</Button>
			</div>

			{/* Edit Profile Modal */}
			<EditProfileModal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				user={{
					id: user.id,
					phone: user.phone,
					address: user.address,
					avatar: user.avatar,
					name: user.name,
					email: user.email,
					department: user.department,
					position: user.position,
				}}
				isAdmin={isAdmin}
				onSave={handleSaveProfile}
			/>

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
										{employeeData.dateOfBirth
											? new Date(employeeData.dateOfBirth).toLocaleDateString(
													"en-US",
													{
														year: "numeric",
														month: "long",
														day: "numeric",
													}
											  )
											: "Not configured"}
									</p>
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Gender
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{employeeData.gender || "Not configured"}
									</p>
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Nationality
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{employeeData.nationality || "Not configured"}
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
										{employeeData.address || "Not configured"}
									</p>
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Emergency Contact Name
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{employeeData.emergencyContact || "Not configured"}
									</p>
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted uppercase tracking-wider">
										Emergency Contact Phone
									</label>
									<p className="mt-1 text-text-primary font-medium">
										{employeeData.emergencyPhone || "Not configured"}
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

							{employeeData.monthlyWage ? (
								<>
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
														{employeeData.wageType || "Fixed"}
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
													<p className="mt-1 font-semibold text-lg text-success">
														${totalComponents.toLocaleString()}
													</p>
												</div>
											</div>
										</CardContent>
									</Card>

									{/* Salary Components */}
									{employeeData.salaryComponents.length > 0 && (
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
													{employeeData.salaryComponents.map(
														(component, index) => (
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
																		{component.type === "percentage"
																			? "%"
																			: "$"}
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
														)
													)}

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
									)}

									{/* Net Salary Summary */}
									{netSalary !== null && (
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
													</div>
												</div>
											</CardContent>
										</Card>
									)}
								</>
							) : (
								<Card>
									<CardContent className="py-12">
										<div className="text-center text-text-muted">
											<DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
											<p className="text-lg font-medium">
												Salary information not configured
											</p>
											<p className="text-sm mt-1">
												Contact HR to set up salary details
											</p>
										</div>
									</CardContent>
								</Card>
							)}
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
										{employeeData.lastPasswordChange
											? new Date(
													employeeData.lastPasswordChange
											  ).toLocaleDateString("en-US", {
													year: "numeric",
													month: "long",
													day: "numeric",
											  })
											: "Not available"}
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
