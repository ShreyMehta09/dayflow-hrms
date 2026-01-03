import React from "react";
import { cn, getInitials } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
	src?: string;
	alt?: string;
	name?: string;
	size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
	status?: "online" | "offline" | "busy" | "away";
	showStatus?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
	className,
	src,
	alt,
	name,
	size = "md",
	status,
	showStatus = false,
	...props
}) => {
	const sizes = {
		xs: "w-6 h-6 text-2xs",
		sm: "w-8 h-8 text-xs",
		md: "w-10 h-10 text-sm",
		lg: "w-12 h-12 text-base",
		xl: "w-16 h-16 text-lg",
		"2xl": "w-20 h-20 text-xl",
	};

	const statusSizes = {
		xs: "w-1.5 h-1.5 border",
		sm: "w-2 h-2 border",
		md: "w-2.5 h-2.5 border-2",
		lg: "w-3 h-3 border-2",
		xl: "w-4 h-4 border-2",
		"2xl": "w-5 h-5 border-2",
	};

	const statusColors = {
		online: "bg-success",
		offline: "bg-text-muted",
		busy: "bg-error",
		away: "bg-warning",
	};

	const initials = name ? getInitials(name) : "?";

	return (
		<div className={cn("relative inline-flex", className)} {...props}>
			{src ? (
				<img
					src={src}
					alt={alt || name || "Avatar"}
					className={cn(
						"rounded-full object-cover bg-surface ring-2 ring-border",
						sizes[size]
					)}
				/>
			) : (
				<div
					className={cn(
						"rounded-full flex items-center justify-center bg-primary-muted text-primary font-semibold ring-2 ring-border",
						sizes[size]
					)}
				>
					{initials}
				</div>
			)}
			{showStatus && status && (
				<span
					className={cn(
						"absolute bottom-0 right-0 rounded-full border-background",
						statusSizes[size],
						statusColors[status]
					)}
				/>
			)}
		</div>
	);
};

Avatar.displayName = "Avatar";

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	max?: number;
	size?: AvatarProps["size"];
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
	className,
	children,
	max = 4,
	size = "md",
	...props
}) => {
	const childArray = React.Children.toArray(children);
	const visibleChildren = childArray.slice(0, max);
	const remainingCount = childArray.length - max;

	const overlapSizes = {
		xs: "-ml-1.5",
		sm: "-ml-2",
		md: "-ml-2.5",
		lg: "-ml-3",
		xl: "-ml-4",
		"2xl": "-ml-5",
	};

	const countSizes = {
		xs: "w-6 h-6 text-2xs",
		sm: "w-8 h-8 text-xs",
		md: "w-10 h-10 text-sm",
		lg: "w-12 h-12 text-base",
		xl: "w-16 h-16 text-lg",
		"2xl": "w-20 h-20 text-xl",
	};

	return (
		<div className={cn("flex items-center", className)} {...props}>
			{visibleChildren.map((child, index) => (
				<div key={index} className={cn(index !== 0 && overlapSizes[size])}>
					{React.isValidElement(child)
						? React.cloneElement(child as React.ReactElement<AvatarProps>, {
								size,
						  })
						: child}
				</div>
			))}
			{remainingCount > 0 && (
				<div
					className={cn(
						"rounded-full flex items-center justify-center bg-surface text-text-muted font-medium ring-2 ring-background",
						overlapSizes[size],
						countSizes[size]
					)}
				>
					+{remainingCount}
				</div>
			)}
		</div>
	);
};

AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarGroup };
