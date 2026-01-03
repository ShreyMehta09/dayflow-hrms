"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Avatar, Dropdown } from "@/components/ui";
import { User, LogOut, ChevronDown, Menu, X } from "lucide-react";

interface NavTab {
	label: string;
	href: string;
}

const navTabs: NavTab[] = [
	{ label: "Employees", href: "/employees" },
	{ label: "Attendance", href: "/attendance" },
	{ label: "Time Off", href: "/time-off" },
];

export const TopNavbar: React.FC = () => {
	const pathname = usePathname();
	const { user, logout } = useAuth();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const isActiveTab = (href: string) => {
		return pathname === href || pathname.startsWith(href + "/");
	};

	const profileMenuItems = [
		{
			id: "profile",
			label: "My Profile",
			icon: <User className="w-4 h-4" />,
			onClick: () => {
				// Navigate to profile
				window.location.href = "/profile";
			},
		},
		{ id: "divider", label: "", divider: true },
		{
			id: "logout",
			label: "Logout",
			icon: <LogOut className="w-4 h-4" />,
			onClick: logout,
			danger: true,
		},
	];

	return (
		<header className="sticky top-0 z-50 bg-surface border-b border-border">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Left: Logo */}
					<div className="flex items-center gap-8">
						<Link href="/dashboard" className="flex items-center gap-3">
							<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
								<span className="text-white font-bold text-lg">D</span>
							</div>
							<span className="font-bold text-text-primary text-lg hidden sm:block">
								DayFlow
							</span>
						</Link>

						{/* Desktop Navigation Tabs */}
						<nav className="hidden md:flex items-center gap-1">
							{navTabs.map((tab) => (
								<Link
									key={tab.href}
									href={tab.href}
									className={cn(
										"px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
										isActiveTab(tab.href)
											? "bg-primary text-white shadow-sm"
											: "text-text-muted hover:text-text-primary hover:bg-card"
									)}
								>
									{tab.label}
								</Link>
							))}
						</nav>
					</div>

					{/* Right: User Avatar & Dropdown */}
					<div className="flex items-center gap-4">
						{/* Desktop User Menu */}
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
											<p className="text-xs text-text-muted capitalize">
												{user.role}
											</p>
										</div>
										<ChevronDown className="hidden lg:block w-4 h-4 text-text-muted" />
									</button>
								}
								items={profileMenuItems}
							/>
						)}

						{/* Mobile Menu Button */}
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-card transition-colors"
						>
							{mobileMenuOpen ? (
								<X className="w-5 h-5" />
							) : (
								<Menu className="w-5 h-5" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{mobileMenuOpen && (
					<div className="md:hidden py-4 border-t border-border animate-fade-in">
						<nav className="flex flex-col gap-1">
							{navTabs.map((tab) => (
								<Link
									key={tab.href}
									href={tab.href}
									onClick={() => setMobileMenuOpen(false)}
									className={cn(
										"px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
										isActiveTab(tab.href)
											? "bg-primary text-white"
											: "text-text-muted hover:text-text-primary hover:bg-card"
									)}
								>
									{tab.label}
								</Link>
							))}
						</nav>
					</div>
				)}
			</div>
		</header>
	);
};
