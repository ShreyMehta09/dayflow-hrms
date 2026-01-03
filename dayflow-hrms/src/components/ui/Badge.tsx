import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?:
		| "default"
		| "primary"
		| "secondary"
		| "success"
		| "warning"
		| "error"
		| "outline";
	size?: "sm" | "md" | "lg";
	dot?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
	className,
	variant = "default",
	size = "md",
	dot = false,
	children,
	...props
}) => {
	const baseStyles =
		"inline-flex items-center gap-1.5 font-medium rounded-full";

	const variants = {
		default: "bg-surface text-text-primary border border-border",
		primary: "bg-primary-muted text-primary",
		secondary: "bg-secondary-muted text-secondary",
		success: "bg-success-muted text-success",
		warning: "bg-warning-muted text-warning",
		error: "bg-error-muted text-error",
		outline: "bg-transparent border border-border text-text-muted",
	};

	const sizes = {
		sm: "px-2 py-0.5 text-2xs",
		md: "px-2.5 py-1 text-xs",
		lg: "px-3 py-1.5 text-sm",
	};

	const dotColors = {
		default: "bg-text-muted",
		primary: "bg-primary",
		secondary: "bg-secondary",
		success: "bg-success",
		warning: "bg-warning",
		error: "bg-error",
		outline: "bg-text-muted",
	};

	return (
		<span
			className={cn(baseStyles, variants[variant], sizes[size], className)}
			{...props}
		>
			{dot && (
				<span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />
			)}
			{children}
		</span>
	);
};

Badge.displayName = "Badge";

export { Badge };
