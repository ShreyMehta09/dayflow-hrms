"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: "default" | "circular" | "rectangular" | "text";
	width?: string | number;
	height?: string | number;
	animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
	className,
	variant = "default",
	width,
	height,
	animation = "pulse",
	style,
	...props
}: SkeletonProps) {
	const baseStyles = "bg-surface";

	const variantStyles = {
		default: "rounded-md",
		circular: "rounded-full",
		rectangular: "rounded-none",
		text: "rounded h-4 w-full",
	};

	const animationStyles = {
		pulse: "animate-pulse",
		wave: "animate-shimmer",
		none: "",
	};

	return (
		<div
			className={cn(
				baseStyles,
				variantStyles[variant],
				animationStyles[animation],
				className
			)}
			style={{
				width: typeof width === "number" ? `${width}px` : width,
				height: typeof height === "number" ? `${height}px` : height,
				...style,
			}}
			aria-hidden="true"
			role="presentation"
			{...props}
		/>
	);
}

// Preset skeleton components for common use cases
export function SkeletonCard({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"bg-card border border-border rounded-xl p-6 space-y-4",
				className
			)}
			aria-hidden="true"
			role="presentation"
		>
			<div className="flex items-center gap-4">
				<Skeleton variant="circular" width={48} height={48} />
				<div className="flex-1 space-y-2">
					<Skeleton height={16} width="60%" />
					<Skeleton height={12} width="40%" />
				</div>
			</div>
			<div className="space-y-2">
				<Skeleton height={12} width="100%" />
				<Skeleton height={12} width="90%" />
				<Skeleton height={12} width="80%" />
			</div>
		</div>
	);
}

export function SkeletonTable({
	rows = 5,
	columns = 4,
	className,
}: {
	rows?: number;
	columns?: number;
	className?: string;
}) {
	return (
		<div
			className={cn("w-full", className)}
			aria-hidden="true"
			role="presentation"
		>
			{/* Header */}
			<div className="flex gap-4 px-6 py-4 border-b border-border bg-surface/50">
				{Array.from({ length: columns }).map((_, i) => (
					<Skeleton key={i} height={12} className="flex-1" />
				))}
			</div>
			{/* Rows */}
			{Array.from({ length: rows }).map((_, rowIndex) => (
				<div
					key={rowIndex}
					className="flex gap-4 px-6 py-4 border-b border-border last:border-0"
				>
					{Array.from({ length: columns }).map((_, colIndex) => (
						<Skeleton
							key={colIndex}
							height={16}
							className="flex-1"
							style={{
								animationDelay: `${(rowIndex * columns + colIndex) * 50}ms`,
							}}
						/>
					))}
				</div>
			))}
		</div>
	);
}

export function SkeletonStats({
	count = 4,
	className,
}: {
	count?: number;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
				className
			)}
			aria-hidden="true"
			role="presentation"
		>
			{Array.from({ length: count }).map((_, i) => (
				<div
					key={i}
					className="bg-card border border-border rounded-xl p-6"
					style={{ animationDelay: `${i * 100}ms` }}
				>
					<div className="flex items-center justify-between">
						<div className="space-y-2 flex-1">
							<Skeleton height={12} width="50%" />
							<Skeleton height={28} width="40%" />
						</div>
						<Skeleton variant="circular" width={48} height={48} />
					</div>
					<Skeleton height={8} className="mt-4" />
				</div>
			))}
		</div>
	);
}

export function SkeletonAvatar({
	size = "md",
	className,
}: {
	size?: "sm" | "md" | "lg" | "xl";
	className?: string;
}) {
	const sizeMap = {
		sm: 32,
		md: 40,
		lg: 48,
		xl: 64,
	};

	return (
		<Skeleton
			variant="circular"
			width={sizeMap[size]}
			height={sizeMap[size]}
			className={className}
		/>
	);
}

export function SkeletonText({
	lines = 3,
	className,
}: {
	lines?: number;
	className?: string;
}) {
	return (
		<div
			className={cn("space-y-2", className)}
			aria-hidden="true"
			role="presentation"
		>
			{Array.from({ length: lines }).map((_, i) => (
				<Skeleton
					key={i}
					variant="text"
					style={{
						width: i === lines - 1 ? "60%" : "100%",
						animationDelay: `${i * 100}ms`,
					}}
				/>
			))}
		</div>
	);
}

export function SkeletonEmployeeCard({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"bg-card border border-border rounded-xl p-6 space-y-4",
				className
			)}
			aria-hidden="true"
			role="presentation"
		>
			<div className="flex flex-col items-center text-center">
				<Skeleton variant="circular" width={80} height={80} />
				<div className="mt-4 space-y-2 w-full">
					<Skeleton height={18} width="70%" className="mx-auto" />
					<Skeleton height={14} width="50%" className="mx-auto" />
				</div>
			</div>
			<div className="space-y-2">
				<Skeleton height={12} width="100%" />
				<Skeleton height={12} width="80%" />
			</div>
			<Skeleton height={36} width="100%" className="rounded-lg" />
		</div>
	);
}
