import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: "default" | "bordered" | "gradient" | "glass";
	padding?: "none" | "sm" | "md" | "lg";
	hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
	(
		{
			className,
			variant = "default",
			padding = "md",
			hover = false,
			children,
			...props
		},
		ref
	) => {
		const baseStyles = "rounded-xl";

		const variants = {
			default: "bg-card border border-border",
			bordered: "bg-card border-2 border-border",
			gradient: "gradient-border",
			glass: "glass",
		};

		const paddings = {
			none: "",
			sm: "p-4",
			md: "p-6",
			lg: "p-8",
		};

		const hoverStyles = hover
			? "transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer"
			: "";

		return (
			<div
				ref={ref}
				className={cn(
					baseStyles,
					variants[variant],
					paddings[padding],
					hoverStyles,
					className
				)}
				{...props}
			>
				{children}
			</div>
		);
	}
);

Card.displayName = "Card";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
	({ className, children, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn("flex items-center justify-between mb-4", className)}
				{...props}
			>
				{children}
			</div>
		);
	}
);

CardHeader.displayName = "CardHeader";

export interface CardTitleProps
	extends React.HTMLAttributes<HTMLHeadingElement> {
	as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
	({ className, as: Component = "h3", children, ...props }, ref) => {
		return (
			<Component
				ref={ref}
				className={cn("text-lg font-semibold text-text-primary", className)}
				{...props}
			>
				{children}
			</Component>
		);
	}
);

CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps
	extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
	({ className, children, ...props }, ref) => {
		return (
			<p
				ref={ref}
				className={cn("text-sm text-text-muted", className)}
				{...props}
			>
				{children}
			</p>
		);
	}
);

CardDescription.displayName = "CardDescription";

export interface CardContentProps
	extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
	({ className, children, ...props }, ref) => {
		return (
			<div ref={ref} className={cn("", className)} {...props}>
				{children}
			</div>
		);
	}
);

CardContent.displayName = "CardContent";

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
	({ className, children, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					"flex items-center justify-between mt-4 pt-4 border-t border-border",
					className
				)}
				{...props}
			>
				{children}
			</div>
		);
	}
);

CardFooter.displayName = "CardFooter";

export {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
};
