"use client";

import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
} from "react";
import type { User, UserRole } from "@/types";

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	role: UserRole | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	switchRole: (role: UserRole) => void;
	hasPermission: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: Record<UserRole, User> = {
	admin: {
		id: "admin-1",
		email: "admin@dayflow.com",
		name: "Alex Thompson",
		role: "admin",
		avatar:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
		department: "Management",
		position: "System Administrator",
		joinDate: "2022-01-15",
		phone: "+1 (555) 123-4567",
		status: "active",
	},
	hr: {
		id: "hr-1",
		email: "hr@dayflow.com",
		name: "Sarah Johnson",
		role: "hr",
		avatar:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
		department: "Human Resources",
		position: "HR Manager",
		joinDate: "2022-03-10",
		phone: "+1 (555) 234-5678",
		status: "active",
	},
	employee: {
		id: "emp-1",
		email: "employee@dayflow.com",
		name: "Michael Chen",
		role: "employee",
		avatar:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
		department: "Engineering",
		position: "Senior Developer",
		joinDate: "2023-06-01",
		phone: "+1 (555) 345-6789",
		status: "active",
	},
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Simulate loading user from storage
		const storedRole = localStorage.getItem("dayflow_role") as UserRole | null;
		if (storedRole && MOCK_USERS[storedRole]) {
			setUser(MOCK_USERS[storedRole]);
		} else {
			// Default to employee for demo
			setUser(MOCK_USERS.employee);
			localStorage.setItem("dayflow_role", "employee");
		}
		setIsLoading(false);
	}, []);

	const login = useCallback(async (email: string, _password: string) => {
		setIsLoading(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Find user by email (mock)
		const foundUser = Object.values(MOCK_USERS).find((u) => u.email === email);
		if (foundUser) {
			setUser(foundUser);
			localStorage.setItem("dayflow_role", foundUser.role);
		} else {
			// Default to employee
			setUser(MOCK_USERS.employee);
			localStorage.setItem("dayflow_role", "employee");
		}
		setIsLoading(false);
	}, []);

	const logout = useCallback(() => {
		setUser(null);
		localStorage.removeItem("dayflow_role");
	}, []);

	const switchRole = useCallback((role: UserRole) => {
		setUser(MOCK_USERS[role]);
		localStorage.setItem("dayflow_role", role);
	}, []);

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
				logout,
				switchRole,
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
	const { hasPermission } = useAuth();

	if (!hasPermission(allowedRoles)) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
};
