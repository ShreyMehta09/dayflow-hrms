"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook to simulate async data fetching with loading and error states
 * @param fetchFn - The async function to fetch data
 * @param deps - Dependencies to trigger refetch
 * @param delay - Simulated delay in ms (for demo purposes)
 */
export function useAsyncData<T>(
	fetchFn: () => T | Promise<T>,
	deps: React.DependencyList = [],
	delay: number = 800
) {
	const [data, setData] = useState<T | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const refetch = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Simulate network delay for demo
			await new Promise((resolve) => setTimeout(resolve, delay));
			const result = await fetchFn();
			setData(result);
		} catch (err) {
			setError(err instanceof Error ? err : new Error("An error occurred"));
		} finally {
			setIsLoading(false);
		}
	}, [fetchFn, delay]);

	useEffect(() => {
		refetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

	return { data, isLoading, error, refetch };
}

/**
 * Hook to manage optimistic updates
 */
export function useOptimisticUpdate<T>(initialValue: T) {
	const [value, setValue] = useState<T>(initialValue);
	const [isUpdating, setIsUpdating] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const update = async (
		newValue: T,
		asyncUpdate?: () => Promise<void>
	) => {
		const previousValue = value;
		setValue(newValue);
		setIsUpdating(true);
		setError(null);

		if (asyncUpdate) {
			try {
				await asyncUpdate();
			} catch (err) {
				setValue(previousValue);
				setError(err instanceof Error ? err : new Error("Update failed"));
			} finally {
				setIsUpdating(false);
			}
		} else {
			setIsUpdating(false);
		}
	};

	return { value, update, isUpdating, error };
}

/**
 * Hook to detect reduced motion preference
 */
export function useReducedMotion() {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		setPrefersReducedMotion(mediaQuery.matches);

		const handleChange = (e: MediaQueryListEvent) => {
			setPrefersReducedMotion(e.matches);
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, []);

	return prefersReducedMotion;
}

/**
 * Hook for keyboard navigation focus management
 */
export function useFocusTrap(isActive: boolean) {
	useEffect(() => {
		if (!isActive) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				// Allow parent to handle escape
				return;
			}

			if (e.key === "Tab") {
				const focusableElements = document.querySelectorAll(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				);
				const firstElement = focusableElements[0] as HTMLElement;
				const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

				if (e.shiftKey && document.activeElement === firstElement) {
					e.preventDefault();
					lastElement?.focus();
				} else if (!e.shiftKey && document.activeElement === lastElement) {
					e.preventDefault();
					firstElement?.focus();
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isActive]);
}

/**
 * Hook to announce changes to screen readers
 */
export function useAriaAnnounce() {
	const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
		const announcement = document.createElement("div");
		announcement.setAttribute("role", "status");
		announcement.setAttribute("aria-live", priority);
		announcement.setAttribute("aria-atomic", "true");
		announcement.className = "sr-only";
		announcement.textContent = message;

		document.body.appendChild(announcement);

		// Remove after announcement
		setTimeout(() => {
			document.body.removeChild(announcement);
		}, 1000);
	}, []);

	return announce;
}
