"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button, Avatar, Badge, Dropdown } from "@/components/ui";
import type { UserRole } from "@/types";
import {
	Menu,
	Search,
	Bell,
	Moon,
	Sun,
	ChevronDown,
	User,
	Settings,
	LogOut,
	Shield,
	Users,
	Briefcase,
} from "lucide-react";

interface HeaderProps {
	onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
	const { user, switchRole, role } = useAuth();
	const [showSearch, setShowSearch] = useState(false);
	const [isDark, setIsDark] = useState(true);

	const notifications = [
		{
			id: "1",
			title: "Leave Request Approved",
			time: "5 min ago",
			unread: true,
		},
		{ id: "2", title: "New task assigned", time: "1 hour ago", unread: true },
		{ id: "3", title: "Payslip generated", time: "2 hours ago", unread: false },
	];

	const unreadCount = notifications.filter((n) => n.unread).length;

	const roleIcons: Record<UserRole, React.ReactNode> = {
		admin: <Shield className="w-4 h-4" />,
		hr: <Users className="w-4 h-4" />,
		employee: <Briefcase className="w-4 h-4" />,
	};

	const profileMenuItems = [
		{ id: "profile", label: "My Profile", icon: <User className="w-4 h-4" /> },
		{
			id: "settings",
			label: "Settings",
			icon: <Settings className="w-4 h-4" />,
		},
		{ id: "divider1", label: "", divider: true },
		{
			id: "switch-admin",
			label: "Switch to Admin",
			icon: <Shield className="w-4 h-4" />,
			onClick: () => switchRole("admin"),
		},
		{
			id: "switch-hr",
			label: "Switch to HR",
			icon: <Users className="w-4 h-4" />,
			onClick: () => switchRole("hr"),
		},
		{
			id: "switch-employee",
			label: "Switch to Employee",
			icon: <Briefcase className="w-4 h-4" />,
			onClick: () => switchRole("employee"),
		},
		{ id: "divider2", label: "", divider: true },
		{
			id: "logout",
			label: "Sign Out",
			icon: <LogOut className="w-4 h-4" />,
			danger: true,
		},
	];

	return (
		<header className="sticky top-0 z-30 h-16 bg-surface/80 backdrop-blur-xl border-b border-border">
			<div className="flex items-center justify-between h-full px-4 lg:px-6">
				{/* Left Section */}
				<div className="flex items-center gap-4">
					<button
						onClick={onMenuClick}
						className="lg:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-card transition-colors"
					>
						<Menu className="w-5 h-5" />
					</button>

					{/* Search */}
					<div className="hidden md:flex items-center">
						<div
							className={cn(
								"flex items-center bg-card border border-border rounded-lg transition-all duration-200",
								showSearch ? "w-80" : "w-64"
							)}
						>
							<Search className="w-4 h-4 text-text-muted ml-3" />
							<input
								type="text"
								placeholder="Search employees, documents..."
								className="flex-1 bg-transparent border-none py-2 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
								onFocus={() => setShowSearch(true)}
								onBlur={() => setShowSearch(false)}
							/>
							<kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-1 mr-2 text-2xs text-text-muted bg-surface rounded border border-border">
								<span className="text-xs">⌘</span>K
							</kbd>
						</div>
					</div>
				</div>

				{/* Right Section */}
				<div className="flex items-center gap-2">
					{/* Mobile Search */}
					<button className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-card transition-colors">
						<Search className="w-5 h-5" />
					</button>

					{/* Theme Toggle */}
					<button
						onClick={() => setIsDark(!isDark)}
						className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-card transition-colors"
					>
						{isDark ? (
							<Sun className="w-5 h-5" />
						) : (
							<Moon className="w-5 h-5" />
						)}
					</button>

					{/* Notifications */}
					<Dropdown
						align="right"
						trigger={
							<button className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-card transition-colors">
								<Bell className="w-5 h-5" />
								{unreadCount > 0 && (
									<span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-2xs font-semibold rounded-full flex items-center justify-center">
										{unreadCount}
									</span>
								)}
							</button>
						}
						items={[
							...notifications.map((n) => ({
								id: n.id,
								label: n.title,
								icon: n.unread ? (
									<span className="w-2 h-2 bg-primary rounded-full" />
								) : undefined,
							})),
							{ id: "divider", label: "", divider: true },
							{ id: "view-all", label: "View all notifications" },
						]}
					/>

					{/* Role Badge */}
					{role && (
						<Badge
							variant={
								role === "admin"
									? "error"
									: role === "hr"
									? "primary"
									: "secondary"
							}
							size="md"
							className="hidden sm:flex"
						>
							{roleIcons[role]}
							<span className="capitalize">{role}</span>
						</Badge>
					)}

					{/* Profile Dropdown */}
					{user && (
						<Dropdown
							align="right"
							trigger={
								<button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-card transition-colors">
									<Avatar
										src={user.avatar}
										name={user.name}
										size="sm"
										status="online"
										showStatus
									/>
									<div className="hidden lg:block text-left">
										<p className="text-sm font-medium text-text-primary">
											{user.name}
										</p>
										<p className="text-2xs text-text-muted">{user.position}</p>
									</div>
									<ChevronDown className="hidden lg:block w-4 h-4 text-text-muted" />
								</button>
							}
							items={profileMenuItems}
						/>
					)}
				</div>
			</div>
		</header>
	);
};

export { Header };
