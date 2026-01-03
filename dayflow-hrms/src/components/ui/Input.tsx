import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	hint?: string;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			type = "text",
			label,
			error,
			hint,
			leftIcon,
			rightIcon,
			fullWidth = false,
			disabled,
			id,
			...props
		},
		ref
	) => {
		const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

		return (
			<div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
				{label && (
					<label
						htmlFor={inputId}
						className="text-sm font-medium text-text-muted"
					>
						{label}
					</label>
				)}
				<div className="relative">
					{leftIcon && (
						<div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
							{leftIcon}
						</div>
					)}
					<input
						ref={ref}
						id={inputId}
						type={type}
						disabled={disabled}
						className={cn(
							`
                w-full h-10 px-3 py-2
                bg-surface border border-border rounded-lg
                text-text-primary placeholder:text-text-muted
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
              `,
							leftIcon && "pl-10",
							rightIcon && "pr-10",
							error && "border-error focus:ring-error",
							className
						)}
						{...props}
					/>
					{rightIcon && (
						<div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
							{rightIcon}
						</div>
					)}
				</div>
				{error && <span className="text-xs text-error">{error}</span>}
				{hint && !error && (
					<span className="text-xs text-text-muted">{hint}</span>
				)}
			</div>
		);
	}
);

Input.displayName = "Input";

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	error?: string;
	hint?: string;
	fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	(
		{
			className,
			label,
			error,
			hint,
			fullWidth = false,
			disabled,
			id,
			...props
		},
		ref
	) => {
		const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

		return (
			<div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
				{label && (
					<label
						htmlFor={textareaId}
						className="text-sm font-medium text-text-muted"
					>
						{label}
					</label>
				)}
				<textarea
					ref={ref}
					id={textareaId}
					disabled={disabled}
					className={cn(
						`
              w-full px-3 py-2 min-h-[100px]
              bg-surface border border-border rounded-lg
              text-text-primary placeholder:text-text-muted
              transition-all duration-200 resize-y
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
            `,
						error && "border-error focus:ring-error",
						className
					)}
					{...props}
				/>
				{error && <span className="text-xs text-error">{error}</span>}
				{hint && !error && (
					<span className="text-xs text-text-muted">{hint}</span>
				)}
			</div>
		);
	}
);

Textarea.displayName = "Textarea";

export { Input, Textarea };
