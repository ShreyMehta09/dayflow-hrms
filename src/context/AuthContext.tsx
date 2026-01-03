"use client";

import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
} from "react";
import { useRouter, usePathname } from "next/navigation";

// Types
export type UserRole = "admin" | "hr" | "employee";
export type UserStatus = "active" | "inactive" | "on_leave";

export interface User {
	id: string;
	email: string;
	name: string;
	role: UserRole;
	avatar?: string;
	department?: string;
	position?: string;
	joinDate?: string;
	phone?: string;
	address?: string;
	status: UserStatus;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	role: UserRole | null;
	login: (
		email: string,
		password: string
	) => Promise<{ success: boolean; error?: string }>;
	signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
	hasPermission: (allowedRoles: UserRole[]) => boolean;
}

interface SignupData {
	name: string;
	email: string;
	password: string;
	department?: string;
	position?: string;
	phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const pathname = usePathname();

	// Check session on mount
	const checkSession = useCallback(async () => {
		try {
			const response = await fetch("/api/auth/me", {
				method: "GET",
				credentials: "include",
			});

			if (response.ok) {
				const data = await response.json();
				if (data.user) {
					setUser(data.user);
				} else {
					setUser(null);
				}
			} else {
				setUser(null);
			}
		} catch (error) {
			console.error("Session check failed:", error);
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		checkSession();
	}, [checkSession]);

	// Redirect if not authenticated (except on auth pages)
	useEffect(() => {
		if (!isLoading && !user) {
			const authPages = ["/auth/sign-in", "/auth/sign-up"];
			if (!authPages.includes(pathname)) {
				// Middleware handles redirection
			}
		}
	}, [isLoading, user, pathname]);

	const login = useCallback(
		async (
			email: string,
			password: string
		): Promise<{ success: boolean; error?: string }> => {
			setIsLoading(true);
			try {
				const response = await fetch("/api/auth/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ email, password }),
					credentials: "include",
				});

				const data = await response.json();

				if (response.ok && data.user) {
					setUser(data.user);
					router.push("/dashboard");
					return { success: true };
				} else {
					return { success: false, error: data.error || "Login failed" };
				}
			} catch (error) {
				console.error("Login error:", error);
				return { success: false, error: "Network error. Please try again." };
			} finally {
				setIsLoading(false);
			}
		},
		[router]
	);

	const signup = useCallback(
		async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
			setIsLoading(true);
			try {
				const response = await fetch("/api/auth/signup", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				});

				const result = await response.json();

				if (response.ok) {
					// Auto login after signup
					return await login(data.email, data.password);
				} else {
					return { success: false, error: result.error || "Signup failed" };
				}
			} catch (error) {
				console.error("Signup error:", error);
				return { success: false, error: "Network error. Please try again." };
			} finally {
				setIsLoading(false);
			}
		},
		[login]
	);

	const logout = useCallback(async () => {
		try {
			await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include",
			});
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			setUser(null);
			router.push("/auth/sign-in");
		}
	}, [router]);

	const refreshUser = useCallback(async () => {
		await checkSession();
	}, [checkSession]);

	const hasPermission = useCallback(
		(allowedRoles: UserRole[]) => {
			if (!user) return false;
			return allowedRoles.includes(user.role);
		},
		[user]
	);

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				isAuthenticated: !!user,
				role: user?.role || null,
				login,
				signup,
				logout,
				refreshUser,
				hasPermission,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

// Higher-order component for role-based rendering
export const withRole = <P extends object>(
	WrappedComponent: React.ComponentType<P>,
	allowedRoles: UserRole[]
) => {
	const ComponentWithRole = (props: P) => {
		const { hasPermission, isLoading } = useAuth();

		if (isLoading) {
			return (
				<div className="flex items-center justify-center p-8">
					<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
				</div>
			);
		}

		if (!hasPermission(allowedRoles)) {
			return (
				<div className="flex flex-col items-center justify-center p-8 text-center">
					<div className="text-4xl mb-4">🔒</div>
					<h2 className="text-lg font-semibold text-text-primary mb-2">
						Access Denied
					</h2>
					<p className="text-text-muted">
						You don&apos;t have permission to view this content.
					</p>
				</div>
			);
		}

		return <WrappedComponent {...props} />;
	};

	ComponentWithRole.displayName = `withRole(${
		WrappedComponent.displayName || WrappedComponent.name || "Component"
	})`;

	return ComponentWithRole;
};

// Component for conditional role-based rendering
export const RoleGuard: React.FC<{
	allowedRoles: UserRole[];
	children: React.ReactNode;
	fallback?: React.ReactNode;
}> = ({ allowedRoles, children, fallback = null }) => {
	const { hasPermission, user } = useAuth();

	const hasAccess = hasPermission(allowedRoles);
	console.log(
		"RoleGuard - User role:",
		user?.role,
		"Allowed:",
		allowedRoles,
		"Has access:",
		hasAccess
	);

	if (!hasAccess) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
};
