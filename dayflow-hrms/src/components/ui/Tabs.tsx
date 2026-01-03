"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
	id: string;
	label: string;
	icon?: React.ReactNode;
	badge?: number;
	disabled?: boolean;
}

export interface TabsProps {
	items: TabItem[];
	defaultValue?: string;
	value?: string;
	onChange?: (value: string) => void;
	variant?: "default" | "pills" | "underline";
	size?: "sm" | "md" | "lg";
	className?: string;
}

const Tabs: React.FC<TabsProps> = ({
	items,
	defaultValue,
	value: controlledValue,
	onChange,
	variant = "default",
	size = "md",
	className,
}) => {
	const [internalValue, setInternalValue] = useState(
		defaultValue || items[0]?.id
	);
	const value = controlledValue ?? internalValue;

	const handleChange = (newValue: string) => {
		setInternalValue(newValue);
		onChange?.(newValue);
	};

	const baseStyles = "flex";

	const variants = {
		default: "gap-1 bg-surface p-1 rounded-lg",
		pills: "gap-2",
		underline: "gap-0 border-b border-border",
	};

	const sizes = {
		sm: "text-xs",
		md: "text-sm",
		lg: "text-base",
	};

	const getItemStyles = (isActive: boolean, isDisabled?: boolean) => {
		const base = `
      inline-flex items-center justify-center gap-2
      font-medium transition-all duration-200
      focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

		const variantStyles = {
			default: cn(
				"px-3 py-2 rounded-md",
				isActive
					? "bg-card text-text-primary shadow-sm"
					: "text-text-muted hover:text-text-primary"
			),
			pills: cn(
				"px-4 py-2 rounded-full",
				isActive
					? "bg-primary text-white"
					: "text-text-muted hover:bg-surface hover:text-text-primary"
			),
			underline: cn(
				"px-4 py-3 border-b-2 -mb-[1px]",
				isActive
					? "border-primary text-primary"
					: "border-transparent text-text-muted hover:text-text-primary hover:border-border"
			),
		};

		return cn(
			base,
			variantStyles[variant],
			isDisabled && "opacity-50 cursor-not-allowed"
		);
	};

	return (
		<div className={cn(baseStyles, variants[variant], sizes[size], className)}>
			{items.map((item) => (
				<button
					key={item.id}
					onClick={() => !item.disabled && handleChange(item.id)}
					disabled={item.disabled}
					className={getItemStyles(value === item.id, item.disabled)}
				>
					{item.icon}
					{item.label}
					{item.badge !== undefined && (
						<span
							className={cn(
								"min-w-[18px] h-[18px] px-1 rounded-full text-2xs font-semibold flex items-center justify-center",
								value === item.id
									? "bg-white/20 text-white"
									: "bg-surface text-text-muted"
							)}
						>
							{item.badge}
						</span>
					)}
				</button>
			))}
		</div>
	);
};

Tabs.displayName = "Tabs";

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
	value: string;
	activeValue: string;
}

const TabPanel: React.FC<TabPanelProps> = ({
	value,
	activeValue,
	children,
	className,
	...props
}) => {
	if (value !== activeValue) return null;

	return (
		<div className={cn("animate-fade-in", className)} {...props}>
			{children}
		</div>
	);
};

TabPanel.displayName = "TabPanel";

export { Tabs, TabPanel };
