"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
	const router = useRouter();

	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Please enter a valid email";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsLoading(true);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// On success, redirect to dashboard
		router.push("/dashboard");
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
						Welcome back to
						<br />
						<span className="text-gradient">DayFlow</span>
					</h2>

					<p className="text-lg text-text-muted max-w-md mb-8">
						Sign in to access your dashboard and manage your team efficiently.
					</p>

					{/* Stats */}
					<div className="grid grid-cols-3 gap-6">
						{[
							{ value: "10K+", label: "Companies" },
							{ value: "500K+", label: "Employees" },
							{ value: "99.9%", label: "Uptime" },
						].map((stat, index) => (
							<div key={index}>
								<p className="text-2xl font-bold text-text-primary">
									{stat.value}
								</p>
								<p className="text-sm text-text-muted">{stat.label}</p>
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
							Sign in to your account
						</h1>
						<p className="text-text-muted">
							Enter your credentials to continue
						</p>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-5">
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

						{/* Password */}
						<div>
							<div className="flex items-center justify-between mb-1.5">
								<label className="text-sm font-medium text-text-muted">
									Password
								</label>
								<Link
									href="/auth/forgot-password"
									className="text-xs text-primary hover:text-primary-hover transition-colors"
								>
									Forgot password?
								</Link>
							</div>
							<Input
								name="password"
								type={showPassword ? "text" : "password"}
								placeholder="Enter your password"
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

						{/* Remember Me */}
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-primary focus:ring-offset-0"
							/>
							<span className="text-sm text-text-muted">Keep me signed in</span>
						</label>

						{/* Submit Button */}
						<Button
							type="submit"
							variant="primary"
							size="lg"
							isLoading={isLoading}
							className="w-full"
						>
							Sign In
						</Button>
					</form>

					{/* Sign Up Link */}
					<p className="mt-6 text-center text-text-muted">
						Don&apos;t have an account?{" "}
						<Link
							href="/auth/sign-up"
							className="text-primary font-medium hover:text-primary-hover transition-colors"
						>
							Sign Up
						</Link>
					</p>

					{/* Demo Accounts */}
					<div className="mt-8 pt-6 border-t border-border">
						<p className="text-xs text-text-muted text-center mb-3">
							Demo Accounts
						</p>
						<div className="grid grid-cols-3 gap-2">
							{[
								{ role: "Admin", email: "admin@dayflow.com" },
								{ role: "HR", email: "hr@dayflow.com" },
								{ role: "Employee", email: "employee@dayflow.com" },
							].map((demo) => (
								<button
									key={demo.role}
									type="button"
									onClick={() => {
										setFormData({ email: demo.email, password: "demo123" });
									}}
									className="p-2 rounded-lg bg-surface border border-border text-xs text-text-muted hover:text-text-primary hover:border-primary/50 transition-colors"
								>
									{demo.role}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
