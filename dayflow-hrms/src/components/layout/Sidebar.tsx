"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth, RoleGuard } from "@/context/AuthContext";
import type { UserRole } from "@/types";
import {
	LayoutDashboard,
	Users,
	Calendar,
	ClipboardList,
	Clock,
	DollarSign,
	FileText,
	Settings,
	Building2,
	BarChart3,
	MessageSquare,
	HelpCircle,
	Briefcase,
	UserCheck,
	LogOut,
} from "lucide-react";

interface NavItemType {
	label: string;
	href: string;
	icon: React.ReactNode;
	roles?: UserRole[];
	badge?: number;
}

interface NavGroupType {
	title: string;
	items: NavItemType[];
}

const navigation: NavGroupType[] = [
	{
		title: "Overview",
		items: [
			{
				label: "Dashboard",
				href: "/dashboard",
				icon: <LayoutDashboard className="w-5 h-5" />,
			},
			{
				label: "Analytics",
				href: "/analytics",
				icon: <BarChart3 className="w-5 h-5" />,
				roles: ["admin", "hr"],
			},
		],
	},
	{
		title: "Organization",
		items: [
			{
				label: "Employees",
				href: "/employees",
				icon: <Users className="w-5 h-5" />,
				roles: ["admin", "hr"],
			},
			{
				label: "Departments",
				href: "/departments",
				icon: <Building2 className="w-5 h-5" />,
				roles: ["admin", "hr"],
			},
			{
				label: "Recruitment",
				href: "/recruitment",
				icon: <Briefcase className="w-5 h-5" />,
				roles: ["admin", "hr"],
			},
		],
	},
	{
		title: "Time & Attendance",
		items: [
			{
				label: "Attendance",
				href: "/attendance",
				icon: <UserCheck className="w-5 h-5" />,
			},
			{
				label: "Time Tracking",
				href: "/time-tracking",
				icon: <Clock className="w-5 h-5" />,
			},
			{
				label: "Leave",
				href: "/leave",
				icon: <Calendar className="w-5 h-5" />,
				badge: 3,
			},
		],
	},
	{
		title: "Payroll",
		items: [
			{
				label: "Payroll",
				href: "/payroll",
				icon: <DollarSign className="w-5 h-5" />,
				roles: ["admin", "hr"],
			},
			{
				label: "My Payslips",
				href: "/payslips",
				icon: <FileText className="w-5 h-5" />,
				roles: ["employee"],
			},
		],
	},
	{
		title: "Tasks & Projects",
		items: [
			{
				label: "Tasks",
				href: "/tasks",
				icon: <ClipboardList className="w-5 h-5" />,
				badge: 5,
			},
		],
	},
];

const bottomNavigation: NavItemType[] = [
	{
		label: "Announcements",
		href: "/announcements",
		icon: <MessageSquare className="w-5 h-5" />,
		badge: 2,
	},
	{
		label: "Settings",
		href: "/settings",
		icon: <Settings className="w-5 h-5" />,
	},
	{
		label: "Help & Support",
		href: "/support",
		icon: <HelpCircle className="w-5 h-5" />,
	},
];

interface SidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
	const pathname = usePathname();
	const { user, logout } = useAuth();

	const NavLink: React.FC<{ item: NavItemType }> = ({ item }) => {
		const isActive =
			pathname === item.href || pathname.startsWith(item.href + "/");

		return (
			<Link
				href={item.href}
				onClick={onClose}
				className={cn(
					"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
					isActive
						? "bg-primary text-white shadow-glow-primary"
						: "text-text-muted hover:text-text-primary hover:bg-surface"
				)}
			>
				<span className={cn(isActive ? "text-white" : "text-text-muted")}>
					{item.icon}
				</span>
				<span className="flex-1">{item.label}</span>
				{item.badge && (
					<span
						className={cn(
							"min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold flex items-center justify-center",
							isActive
								? "bg-white/20 text-white"
								: "bg-primary-muted text-primary"
						)}
					>
						{item.badge}
					</span>
				)}
			</Link>
		);
	};

	return (
		<>
			{/* Backdrop for mobile */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
					onClick={onClose}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed top-0 left-0 z-50 h-full w-64 bg-surface border-r border-border",
					"flex flex-col transition-transform duration-300 ease-in-out",
					"lg:translate-x-0 lg:static lg:z-auto",
					isOpen ? "translate-x-0" : "-translate-x-full"
				)}
			>
				{/* Logo */}
				<div className="flex items-center gap-3 h-16 px-4 border-b border-border">
					<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
						<span className="text-white font-bold text-lg">D</span>
					</div>
					<div>
						<h1 className="font-bold text-text-primary text-lg">DayFlow</h1>
						<p className="text-2xs text-text-muted -mt-0.5">HRMS Platform</p>
					</div>
				</div>

				{/* Main Navigation */}
				<nav className="flex-1 overflow-y-auto py-4 px-3">
					{navigation.map((group) => (
						<div key={group.title} className="mb-6">
							<h3 className="px-3 mb-2 text-2xs font-semibold text-text-muted uppercase tracking-wider">
								{group.title}
							</h3>
							<ul className="space-y-1">
								{group.items.map((item) => (
									<li key={item.href}>
										{item.roles ? (
											<RoleGuard allowedRoles={item.roles}>
												<NavLink item={item} />
											</RoleGuard>
										) : (
											<NavLink item={item} />
										)}
									</li>
								))}
							</ul>
						</div>
					))}
				</nav>

				{/* Bottom Navigation */}
				<div className="border-t border-border py-4 px-3">
					<ul className="space-y-1">
						{bottomNavigation.map((item) => (
							<li key={item.href}>
								<NavLink item={item} />
							</li>
						))}
					</ul>

					{/* User Profile & Logout */}
					{user && (
						<div className="mt-4 pt-4 border-t border-border">
							<div className="flex items-center gap-3 px-3 py-2">
								<img
									src={user.avatar}
									alt={user.name}
									className="w-9 h-9 rounded-full object-cover ring-2 ring-border"
								/>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-text-primary truncate">
										{user.name}
									</p>
									<p className="text-2xs text-text-muted truncate capitalize">
										{user.role}
									</p>
								</div>
							</div>
							<button
								onClick={logout}
								className="w-full flex items-center gap-3 px-3 py-2.5 mt-2 rounded-lg text-sm font-medium text-error hover:bg-error-muted transition-colors"
							>
								<LogOut className="w-5 h-5" />
								<span>Sign Out</span>
							</button>
						</div>
					)}
				</div>
			</aside>
		</>
	);
};

export { Sidebar };
