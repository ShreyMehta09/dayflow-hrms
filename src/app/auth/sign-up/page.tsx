"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
	Building2,
	Upload,
	User,
	Mail,
	Phone,
	Lock,
	Eye,
	EyeOff,
	X,
	Image as ImageIcon,
	AlertCircle,
} from "lucide-react";

export default function SignUpPage() {
	const { signup } = useAuth();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [formData, setFormData] = useState({
		companyName: "",
		name: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
	});

	const [logo, setLogo] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [apiError, setApiError] = useState<string | null>(null);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
		if (apiError) {
			setApiError(null);
		}
	};

	const handleLogoClick = () => {
		fileInputRef.current?.click();
	};

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				setErrors((prev) => ({ ...prev, logo: "Logo must be less than 5MB" }));
				return;
			}
			if (!file.type.startsWith("image/")) {
				setErrors((prev) => ({ ...prev, logo: "Please upload an image file" }));
				return;
			}
			setLogo(file);
			setLogoPreview(URL.createObjectURL(file));
			setErrors((prev) => ({ ...prev, logo: "" }));
		}
	};

	const removeLogo = () => {
		setLogo(null);
		setLogoPreview(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.companyName.trim()) {
			newErrors.companyName = "Company name is required";
		}

		if (!formData.name.trim()) {
			newErrors.name = "Name is required";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Please enter a valid email";
		}

		if (!formData.phone.trim()) {
			newErrors.phone = "Phone number is required";
		} else if (!/^[\d\s+()-]{10,}$/.test(formData.phone)) {
			newErrors.phone = "Please enter a valid phone number";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsLoading(true);
		setApiError(null);

		const result = await signup({
			name: formData.name,
			email: formData.email,
			password: formData.password,
			department: formData.companyName,
			phone: formData.phone,
		});

		if (!result.success) {
			setApiError(result.error || "Registration failed. Please try again.");
		}

		setIsLoading(false);
	};

	return (
		<div className="min-h-screen bg-background flex">
			{/* Left Panel - Branding */}
			<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
				{/* Background Pattern */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />

				{/* Content */}
				<div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
					{/* Logo */}
					<div className="flex items-center gap-3 mb-12">
						<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
							<span className="text-white font-bold text-2xl">D</span>
						</div>
						<div>
							<h1 className="font-bold text-text-primary text-2xl">DayFlow</h1>
							<p className="text-sm text-text-muted">HRMS Platform</p>
						</div>
					</div>

					{/* Hero Text */}
					<h2 className="text-4xl xl:text-5xl font-bold text-text-primary leading-tight mb-6">
						Streamline your
						<br />
						<span className="text-gradient">HR operations</span>
						<br />
						effortlessly
					</h2>

					<p className="text-lg text-text-muted max-w-md mb-8">
						Join thousands of companies managing their workforce with DayFlow.
						Modern, intuitive, and powerful.
					</p>

					{/* Features */}
					<div className="space-y-4">
						{[
							"Complete employee lifecycle management",
							"Automated payroll & attendance tracking",
							"Role-based access control",
						].map((feature, index) => (
							<div key={index} className="flex items-center gap-3">
								<div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
									<div className="w-2 h-2 rounded-full bg-primary" />
								</div>
								<span className="text-text-muted">{feature}</span>
							</div>
						))}
					</div>
				</div>

				{/* Decorative Elements */}
				<div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-secondary/20 to-transparent rounded-full blur-3xl" />
				<div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />
			</div>

			{/* Right Panel - Form */}
			<div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
				<div className="w-full max-w-md">
					{/* Mobile Logo */}
					<div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
						<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
							<span className="text-white font-bold text-xl">D</span>
						</div>
						<span className="font-bold text-text-primary text-xl">DayFlow</span>
					</div>

					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-2xl font-bold text-text-primary mb-2">
							Create your account
						</h1>
						<p className="text-text-muted">
							Register your company to get started
						</p>
					</div>

					{/* Notice */}
					<div className="mb-6 p-3 rounded-lg bg-primary-muted border border-primary/30">
						<p className="text-sm text-primary flex items-start gap-2">
							<Building2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
							<span>
								This registration is for <strong>company administrators</strong>{" "}
								only. Employees will be invited by their admin.
							</span>
						</p>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-5">
						{/* API Error */}
						{apiError && (
							<div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
								<AlertCircle className="w-4 h-4 flex-shrink-0" />
								<span>{apiError}</span>
							</div>
						)}

						{/* Company Name */}
						<Input
							name="companyName"
							label="Company Name"
							placeholder="Enter your company name"
							value={formData.companyName}
							onChange={handleInputChange}
							error={errors.companyName}
							leftIcon={<Building2 className="w-4 h-4" />}
							fullWidth
						/>

						{/* Company Logo Upload */}
						<div className="flex flex-col gap-1.5">
							<label className="text-sm font-medium text-text-muted">
								Company Logo{" "}
								<span className="text-text-muted/60">(optional)</span>
							</label>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handleLogoChange}
								className="hidden"
							/>
							{logoPreview ? (
								<div className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg">
									<img
										src={logoPreview}
										alt="Company logo preview"
										className="w-12 h-12 rounded-lg object-cover"
									/>
									<div className="flex-1 min-w-0">
										<p className="text-sm text-text-primary truncate">
											{logo?.name}
										</p>
										<p className="text-xs text-text-muted">
											{logo && (logo.size / 1024).toFixed(1)} KB
										</p>
									</div>
									<button
										type="button"
										onClick={removeLogo}
										className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-muted transition-colors"
									>
										<X className="w-4 h-4" />
									</button>
								</div>
							) : (
								<button
									type="button"
									onClick={handleLogoClick}
									className={cn(
										"flex items-center justify-center gap-3 p-4",
										"bg-surface border-2 border-dashed border-border rounded-lg",
										"text-text-muted hover:text-text-primary hover:border-primary/50",
										"transition-all duration-200",
										errors.logo && "border-error"
									)}
								>
									<div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center">
										<Upload className="w-5 h-5" />
									</div>
									<div className="text-left">
										<p className="text-sm font-medium">Upload Logo</p>
										<p className="text-xs text-text-muted">
											PNG, JPG up to 5MB
										</p>
									</div>
								</button>
							)}
							{errors.logo && (
								<span className="text-xs text-error">{errors.logo}</span>
							)}
						</div>

						{/* Name */}
						<Input
							name="name"
							label="Full Name"
							placeholder="Enter your full name"
							value={formData.name}
							onChange={handleInputChange}
							error={errors.name}
							leftIcon={<User className="w-4 h-4" />}
							fullWidth
						/>

						{/* Email */}
						<Input
							name="email"
							type="email"
							label="Email Address"
							placeholder="you@company.com"
							value={formData.email}
							onChange={handleInputChange}
							error={errors.email}
							leftIcon={<Mail className="w-4 h-4" />}
							fullWidth
						/>

						{/* Phone */}
						<Input
							name="phone"
							type="tel"
							label="Phone Number"
							placeholder="+1 (555) 000-0000"
							value={formData.phone}
							onChange={handleInputChange}
							error={errors.phone}
							leftIcon={<Phone className="w-4 h-4" />}
							fullWidth
						/>

						{/* Password */}
						<div className="relative">
							<Input
								name="password"
								type={showPassword ? "text" : "password"}
								label="Password"
								placeholder="Create a strong password"
								value={formData.password}
								onChange={handleInputChange}
								error={errors.password}
								leftIcon={<Lock className="w-4 h-4" />}
								rightIcon={
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="text-text-muted hover:text-text-primary transition-colors"
									>
										{showPassword ? (
											<EyeOff className="w-4 h-4" />
										) : (
											<Eye className="w-4 h-4" />
										)}
									</button>
								}
								fullWidth
							/>
						</div>

						{/* Confirm Password */}
						<div className="relative">
							<Input
								name="confirmPassword"
								type={showConfirmPassword ? "text" : "password"}
								label="Confirm Password"
								placeholder="Confirm your password"
								value={formData.confirmPassword}
								onChange={handleInputChange}
								error={errors.confirmPassword}
								leftIcon={<Lock className="w-4 h-4" />}
								rightIcon={
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="text-text-muted hover:text-text-primary transition-colors"
									>
										{showConfirmPassword ? (
											<EyeOff className="w-4 h-4" />
										) : (
											<Eye className="w-4 h-4" />
										)}
									</button>
								}
								fullWidth
							/>
						</div>

						{/* Terms */}
						<p className="text-xs text-text-muted text-center">
							By signing up, you agree to our{" "}
							<Link
								href="/terms"
								className="text-primary hover:text-primary-hover transition-colors"
							>
								Terms of Service
							</Link>{" "}
							and{" "}
							<Link
								href="/privacy"
								className="text-primary hover:text-primary-hover transition-colors"
							>
								Privacy Policy
							</Link>
						</p>

						{/* Submit Button */}
						<Button
							type="submit"
							variant="primary"
							size="lg"
							isLoading={isLoading}
							className="w-full"
						>
							Sign Up
						</Button>
					</form>

					{/* Sign In Link */}
					<p className="mt-6 text-center text-text-muted">
						Already have an account?{" "}
						<Link
							href="/auth/sign-in"
							className="text-primary font-medium hover:text-primary-hover transition-colors"
						>
							Sign In
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
