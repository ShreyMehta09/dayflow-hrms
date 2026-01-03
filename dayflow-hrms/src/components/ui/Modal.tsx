"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	description?: string;
	children: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl" | "full";
	showClose?: boolean;
	className?: string;
}

const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	description,
	children,
	size = "md",
	showClose = true,
	className,
}) => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen, onClose]);

	const handleTransitionEnd = () => {
		if (!isOpen) {
			setIsVisible(false);
		}
	};

	if (!isVisible && !isOpen) return null;

	const sizes = {
		sm: "max-w-md",
		md: "max-w-lg",
		lg: "max-w-2xl",
		xl: "max-w-4xl",
		full: "max-w-[calc(100vw-2rem)]",
	};

	return (
		<div
			className={cn(
				"fixed inset-0 z-50 flex items-center justify-center p-4",
				"transition-opacity duration-200",
				isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
			)}
			onTransitionEnd={handleTransitionEnd}
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div
				className={cn(
					"relative w-full bg-card border border-border rounded-xl shadow-2xl",
					"transition-all duration-200",
					isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0",
					sizes[size],
					className
				)}
			>
				{/* Header */}
				{(title || showClose) && (
					<div className="flex items-start justify-between p-6 border-b border-border">
						<div>
							{title && (
								<h2 className="text-xl font-semibold text-text-primary">
									{title}
								</h2>
							)}
							{description && (
								<p className="mt-1 text-sm text-text-muted">{description}</p>
							)}
						</div>
						{showClose && (
							<button
								onClick={onClose}
								className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
							>
								<X className="w-5 h-5" />
							</button>
						)}
					</div>
				)}

				{/* Content */}
				<div className="p-6">{children}</div>
			</div>
		</div>
	);
};

Modal.displayName = "Modal";

export interface ModalFooterProps {
	children: React.ReactNode;
	className?: string;
}

const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => {
	return (
		<div
			className={cn(
				"flex items-center justify-end gap-3 pt-4 mt-4 border-t border-border",
				className
			)}
		>
			{children}
		</div>
	);
};

ModalFooter.displayName = "ModalFooter";

export { Modal, ModalFooter };
