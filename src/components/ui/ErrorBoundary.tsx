"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./Button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Error caught by boundary:", error, errorInfo);
		this.props.onError?.(error, errorInfo);
	}

	handleRetry = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<ErrorFallback error={this.state.error} onRetry={this.handleRetry} />
			);
		}

		return this.props.children;
	}
}

// Error Fallback Component
interface ErrorFallbackProps {
	error?: Error | null;
	onRetry?: () => void;
	title?: string;
	description?: string;
}

export function ErrorFallback({
	error,
	onRetry,
	title = "Something went wrong",
	description = "An unexpected error occurred. Please try again.",
}: ErrorFallbackProps) {
	return (
		<div
			className="flex flex-col items-center justify-center text-center py-16 px-4 animate-fade-in"
			role="alert"
			aria-live="assertive"
		>
			{/* Error Icon */}
			<div className="flex items-center justify-center w-20 h-20 rounded-full bg-error/10 mb-6">
				<AlertTriangle className="w-10 h-10 text-error" aria-hidden="true" />
			</div>

			{/* Error Message */}
			<h2 className="text-xl font-semibold text-text-primary mb-2">{title}</h2>
			<p className="text-text-muted max-w-md mb-6">{description}</p>

			{/* Error Details (for development) */}
			{error && process.env.NODE_ENV === "development" && (
				<details className="mb-6 max-w-lg w-full">
					<summary className="text-sm text-text-muted cursor-pointer hover:text-text-primary transition-colors">
						View error details
					</summary>
					<pre className="mt-2 p-4 bg-surface rounded-lg text-left text-xs text-error overflow-auto max-h-40">
						{error.message}
						{error.stack && (
							<>
								{"\n\n"}
								{error.stack}
							</>
						)}
					</pre>
				</details>
			)}

			{/* Actions */}
			<div className="flex items-center gap-3">
				{onRetry && (
					<Button
						variant="primary"
						leftIcon={<RefreshCw className="w-4 h-4" />}
						onClick={onRetry}
					>
						Try Again
					</Button>
				)}
				<Button
					variant="outline"
					leftIcon={<Home className="w-4 h-4" />}
					onClick={() => (window.location.href = "/dashboard")}
				>
					Go to Dashboard
				</Button>
			</div>
		</div>
	);
}

// Inline Error Display for smaller sections
interface InlineErrorProps {
	message?: string;
	onRetry?: () => void;
	className?: string;
}

export function InlineError({
	message = "Failed to load data",
	onRetry,
	className,
}: InlineErrorProps) {
	return (
		<div
			className={`flex items-center justify-between p-4 bg-error/10 border border-error/30 rounded-lg ${className}`}
			role="alert"
		>
			<div className="flex items-center gap-3">
				<AlertTriangle
					className="w-5 h-5 text-error flex-shrink-0"
					aria-hidden="true"
				/>
				<p className="text-sm text-error">{message}</p>
			</div>
			{onRetry && (
				<Button
					variant="ghost"
					size="sm"
					onClick={onRetry}
					className="text-error hover:text-error hover:bg-error/10"
				>
					<RefreshCw className="w-4 h-4" />
					Retry
				</Button>
			)}
		</div>
	);
}
