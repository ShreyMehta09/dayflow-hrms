"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import {
	FileX,
	Users,
	Calendar,
	Clock,
	Search,
	Inbox,
	AlertCircle,
	FolderOpen,
} from "lucide-react";

export interface EmptyStateProps {
	icon?: React.ReactNode;
	iconType?:
		| "users"
		| "calendar"
		| "clock"
		| "search"
		| "inbox"
		| "file"
		| "folder"
		| "alert";
	title: string;
	description?: string;
	action?: {
		label: string;
		onClick: () => void;
		variant?: "primary" | "secondary" | "outline";
	};
	className?: string;
	size?: "sm" | "md" | "lg";
}

const iconMap = {
	users: Users,
	calendar: Calendar,
	clock: Clock,
	search: Search,
	inbox: Inbox,
	file: FileX,
	folder: FolderOpen,
	alert: AlertCircle,
};

export function EmptyState({
	icon,
	iconType = "inbox",
	title,
	description,
	action,
	className,
	size = "md",
}: EmptyStateProps) {
	const IconComponent = iconMap[iconType];

	const sizeStyles = {
		sm: {
			wrapper: "py-8",
			iconSize: "w-10 h-10",
			iconWrapper: "w-16 h-16",
			title: "text-base",
			description: "text-sm",
		},
		md: {
			wrapper: "py-12",
			iconSize: "w-12 h-12",
			iconWrapper: "w-20 h-20",
			title: "text-lg",
			description: "text-sm",
		},
		lg: {
			wrapper: "py-16",
			iconSize: "w-16 h-16",
			iconWrapper: "w-24 h-24",
			title: "text-xl",
			description: "text-base",
		},
	};

	const styles = sizeStyles[size];

	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center text-center animate-fade-in",
				styles.wrapper,
				className
			)}
			role="status"
			aria-label={title}
		>
			{/* Icon */}
			<div
				className={cn(
					"flex items-center justify-center rounded-full bg-surface mb-4",
					styles.iconWrapper
				)}
			>
				{icon || (
					<IconComponent
						className={cn(styles.iconSize, "text-text-muted")}
						aria-hidden="true"
					/>
				)}
			</div>

			{/* Title */}
			<h3 className={cn("font-semibold text-text-primary mb-2", styles.title)}>
				{title}
			</h3>

			{/* Description */}
			{description && (
				<p className={cn("text-text-muted max-w-sm mb-4", styles.description)}>
					{description}
				</p>
			)}

			{/* Action Button */}
			{action && (
				<Button
					variant={action.variant || "primary"}
					onClick={action.onClick}
					className="mt-2"
				>
					{action.label}
				</Button>
			)}
		</div>
	);
}

// Preset empty states for common use cases
export function NoEmployeesFound({
	onAction,
	className,
}: {
	onAction?: () => void;
	className?: string;
}) {
	return (
		<EmptyState
			iconType="users"
			title="No employees found"
			description="There are no employees matching your search criteria. Try adjusting your filters."
			action={
				onAction
					? { label: "Clear Filters", onClick: onAction, variant: "outline" }
					: undefined
			}
			className={className}
		/>
	);
}

export function NoAttendanceRecords({
	onAction,
	className,
}: {
	onAction?: () => void;
	className?: string;
}) {
	return (
		<EmptyState
			iconType="calendar"
			title="No attendance records"
			description="There are no attendance records for the selected period."
			action={
				onAction
					? { label: "Refresh", onClick: onAction, variant: "outline" }
					: undefined
			}
			className={className}
		/>
	);
}

export function NoLeaveRequests({
	onAction,
	className,
}: {
	onAction?: () => void;
	className?: string;
}) {
	return (
		<EmptyState
			iconType="clock"
			title="No leave requests"
			description="You haven't submitted any leave requests yet."
			action={
				onAction
					? { label: "Request Time Off", onClick: onAction, variant: "primary" }
					: undefined
			}
			className={className}
		/>
	);
}

export function NoSearchResults({
	query,
	onClear,
	className,
}: {
	query?: string;
	onClear?: () => void;
	className?: string;
}) {
	return (
		<EmptyState
			iconType="search"
			title="No results found"
			description={
				query
					? `No results found for "${query}". Try a different search term.`
					: "No results match your search criteria."
			}
			action={
				onClear
					? { label: "Clear Search", onClick: onClear, variant: "outline" }
					: undefined
			}
			className={className}
		/>
	);
}

export function NoNotifications({ className }: { className?: string }) {
	return (
		<EmptyState
			iconType="inbox"
			title="All caught up!"
			description="You have no new notifications."
			size="sm"
			className={className}
		/>
	);
}
