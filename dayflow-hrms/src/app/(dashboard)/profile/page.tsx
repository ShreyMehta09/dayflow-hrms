"use client";

import React from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	Button,
	Avatar,
	Badge,
} from "@/components/ui";
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
} from "lucide-react";

export default function ProfilePage() {
	const { user } = useAuth();

	if (!user) {
		return null;
	}

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-text-primary">My Profile</h1>
					<p className="text-text-muted mt-1">
						Manage your personal information
					</p>
				</div>
				<Button variant="outline" leftIcon={<Edit className="w-4 h-4" />}>
					Edit Profile
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Profile Card */}
				<Card className="lg:col-span-1">
					<div className="flex flex-col items-center text-center p-6">
						<Avatar
							src={user.avatar}
							name={user.name}
							size="2xl"
							className="mb-4"
						/>
						<h2 className="text-xl font-semibold text-text-primary">
							{user.name}
						</h2>
						<p className="text-text-muted">{user.position}</p>
						<Badge
							variant={
								user.role === "admin"
									? "error"
									: user.role === "hr"
									? "primary"
									: "secondary"
							}
							size="md"
							className="mt-3"
						>
							<Shield className="w-3 h-3" />
							{user.role.toUpperCase()}
						</Badge>

						<div className="w-full mt-6 pt-6 border-t border-border space-y-3">
							<div className="flex items-center gap-3 text-sm">
								<Mail className="w-4 h-4 text-text-muted" />
								<span className="text-text-primary">{user.email}</span>
							</div>
							<div className="flex items-center gap-3 text-sm">
								<Phone className="w-4 h-4 text-text-muted" />
								<span className="text-text-primary">
									{user.phone || "+1 (555) 000-0000"}
								</span>
							</div>
							<div className="flex items-center gap-3 text-sm">
								<Building2 className="w-4 h-4 text-text-muted" />
								<span className="text-text-primary">
									{user.department || "Not Assigned"}
								</span>
							</div>
						</div>
					</div>
				</Card>

				{/* Details */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Personal Information</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
									{user.phone || "+1 (555) 000-0000"}
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
									Position
								</label>
								<p className="mt-1 text-text-primary font-medium">
									{user.position || "Not Assigned"}
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
						</div>
					</CardContent>
				</Card>

				{/* Employment Details */}
				<Card className="lg:col-span-3">
					<CardHeader>
						<CardTitle>Employment Details</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
							<div className="flex items-start gap-3">
								<div className="p-2 rounded-lg bg-primary-muted">
									<Briefcase className="w-5 h-5 text-primary" />
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted">
										Employee ID
									</label>
									<p className="mt-0.5 text-text-primary font-medium">
										{user.id.toUpperCase().slice(0, 12)}
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="p-2 rounded-lg bg-secondary-muted">
									<Calendar className="w-5 h-5 text-secondary" />
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted">
										Work Anniversary
									</label>
									<p className="mt-0.5 text-text-primary font-medium">
										{new Date(user.joinDate).toLocaleDateString("en-US", {
											month: "long",
											day: "numeric",
										})}
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="p-2 rounded-lg bg-success-muted">
									<Clock className="w-5 h-5 text-success" />
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted">
										Employment Type
									</label>
									<p className="mt-0.5 text-text-primary font-medium">
										Full-time
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="p-2 rounded-lg bg-warning-muted">
									<MapPin className="w-5 h-5 text-warning" />
								</div>
								<div>
									<label className="text-xs font-medium text-text-muted">
										Work Location
									</label>
									<p className="mt-0.5 text-text-primary font-medium">Remote</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
