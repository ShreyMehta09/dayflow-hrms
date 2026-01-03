"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface DropdownItem {
	id: string;
	label: string;
	icon?: React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	danger?: boolean;
	divider?: boolean;
}

export interface DropdownProps {
	trigger: React.ReactNode;
	items: DropdownItem[];
	align?: "left" | "right";
	className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
	trigger,
	items,
	align = "left",
	className,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscape);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, []);

	return (
		<div ref={dropdownRef} className={cn("relative inline-block", className)}>
			<div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
				{trigger}
			</div>

			{isOpen && (
				<div
					className={cn(
						"absolute top-full mt-2 py-1 min-w-[180px] z-50",
						"bg-card border border-border rounded-lg shadow-lg",
						"animate-scale-in origin-top",
						align === "right" ? "right-0" : "left-0"
					)}
				>
					{items.map((item, index) => {
						if (item.divider) {
							return (
								<div key={index} className="my-1 border-t border-border" />
							);
						}

						return (
							<button
								key={item.id}
								onClick={() => {
									if (!item.disabled) {
										item.onClick?.();
										setIsOpen(false);
									}
								}}
								disabled={item.disabled}
								className={cn(
									"w-full px-3 py-2 text-left text-sm flex items-center gap-2",
									"transition-colors duration-150",
									item.disabled
										? "opacity-50 cursor-not-allowed"
										: item.danger
										? "text-error hover:bg-error-muted"
										: "text-text-primary hover:bg-surface"
								)}
							>
								{item.icon}
								{item.label}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};

Dropdown.displayName = "Dropdown";

export { Dropdown };
