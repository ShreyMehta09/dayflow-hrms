import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?:
		| "primary"
		| "secondary"
		| "outline"
		| "ghost"
		| "danger"
		| "success";
	size?: "xs" | "sm" | "md" | "lg";
	isLoading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant = "primary",
			size = "md",
			isLoading = false,
			leftIcon,
			rightIcon,
			disabled,
			children,
			...props
		},
		ref
	) => {
		const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-lg
      transition-all duration-200
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

		const variants = {
			primary: `
        bg-primary text-white
        hover:bg-primary-hover
        focus-visible:ring-primary
        shadow-sm hover:shadow-md
      `,
			secondary: `
        bg-secondary text-background
        hover:bg-secondary-hover
        focus-visible:ring-secondary
        shadow-sm hover:shadow-md
      `,
			outline: `
        border border-border bg-transparent text-text-primary
        hover:bg-surface hover:border-text-muted
        focus-visible:ring-primary
      `,
			ghost: `
        bg-transparent text-text-primary
        hover:bg-surface
        focus-visible:ring-primary
      `,
			danger: `
        bg-error text-white
        hover:bg-red-600
        focus-visible:ring-error
        shadow-sm hover:shadow-md
      `,
			success: `
        bg-success text-white
        hover:bg-green-600
        focus-visible:ring-success
        shadow-sm hover:shadow-md
      `,
		};

		const sizes = {
			xs: "h-7 px-2.5 text-xs",
			sm: "h-8 px-3 text-sm",
			md: "h-10 px-4 text-sm",
			lg: "h-12 px-6 text-base",
		};

		return (
			<button
				ref={ref}
				className={cn(baseStyles, variants[variant], sizes[size], className)}
				disabled={disabled || isLoading}
				{...props}
			>
				{isLoading ? (
					<svg
						className="animate-spin h-4 w-4"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
				) : (
					leftIcon
				)}
				{children}
				{rightIcon}
			</button>
		);
	}
);

Button.displayName = "Button";

export { Button };
