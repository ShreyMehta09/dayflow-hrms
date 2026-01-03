import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
	value: number;
	max?: number;
	size?: "sm" | "md" | "lg";
	variant?: "primary" | "secondary" | "success" | "warning" | "error";
	showLabel?: boolean;
	label?: string;
}

const Progress: React.FC<ProgressProps> = ({
	className,
	value,
	max = 100,
	size = "md",
	variant = "primary",
	showLabel = false,
	label,
	...props
}) => {
	const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

	const sizes = {
		sm: "h-1.5",
		md: "h-2.5",
		lg: "h-4",
	};

	const variants = {
		primary: "bg-primary",
		secondary: "bg-secondary",
		success: "bg-success",
		warning: "bg-warning",
		error: "bg-error",
	};

	return (
		<div className={cn("w-full", className)} {...props}>
			{(showLabel || label) && (
				<div className="flex justify-between mb-1.5">
					{label && <span className="text-sm text-text-muted">{label}</span>}
					{showLabel && (
						<span className="text-sm font-medium text-text-primary">
							{Math.round(percentage)}%
						</span>
					)}
				</div>
			)}
			<div
				className={cn(
					"w-full bg-surface rounded-full overflow-hidden",
					sizes[size]
				)}
			>
				<div
					className={cn(
						"h-full rounded-full transition-all duration-500 ease-out",
						variants[variant]
					)}
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	);
};

Progress.displayName = "Progress";

export { Progress };
