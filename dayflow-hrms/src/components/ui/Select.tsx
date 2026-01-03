"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
	extends React.SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	error?: string;
	hint?: string;
	options: Array<{ value: string; label: string; disabled?: boolean }>;
	placeholder?: string;
	fullWidth?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
	(
		{
			className,
			label,
			error,
			hint,
			options,
			placeholder,
			fullWidth = false,
			disabled,
			id,
			...props
		},
		ref
	) => {
		const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

		return (
			<div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
				{label && (
					<label
						htmlFor={selectId}
						className="text-sm font-medium text-text-muted"
					>
						{label}
					</label>
				)}
				<div className="relative">
					<select
						ref={ref}
						id={selectId}
						disabled={disabled}
						className={cn(
							`
                w-full h-10 px-3 py-2 pr-10
                bg-surface border border-border rounded-lg
                text-text-primary
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                appearance-none cursor-pointer
              `,
							error && "border-error focus:ring-error",
							className
						)}
						{...props}
					>
						{placeholder && (
							<option value="" disabled>
								{placeholder}
							</option>
						)}
						{options.map((option) => (
							<option
								key={option.value}
								value={option.value}
								disabled={option.disabled}
							>
								{option.label}
							</option>
						))}
					</select>
					<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="m6 9 6 6 6-6" />
						</svg>
					</div>
				</div>
				{error && <span className="text-xs text-error">{error}</span>}
				{hint && !error && (
					<span className="text-xs text-text-muted">{hint}</span>
				)}
			</div>
		);
	}
);

Select.displayName = "Select";

export { Select };
