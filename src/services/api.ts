// API Service for HRMS Application
// Provides type-safe API calls for all features

// Types
export interface Employee {
	id: string;
	email: string;
	name: string;
	role?: string;
	avatar?: string;
	department?: string;
	position?: string;
	joinDate?: string;
	phone?: string;
	status: "present" | "absent" | "on_leave" | "active" | "inactive";
}

export interface AttendanceRecord {
	id: string;
	employee: {
		id: string;
		name: string;
		email: string;
		avatar?: string;
		department?: string;
	};
	date: string;
	checkIn?: string;
	checkOut?: string;
	status: "present" | "absent" | "late" | "half_day" | "on_leave";
	workHours: number;
	breakTime: number;
	overtime: number;
	notes?: string;
}

export interface TodayAttendance {
	today: {
		id: string;
		checkIn?: string;
		checkOut?: string;
		status: string;
		workHours: number;
	} | null;
	isCheckedIn: boolean;
	isCheckedOut: boolean;
}

export interface TimeOffRequest {
	id: string;
	employee: {
		id: string;
		name: string;
		email: string;
		avatar?: string;
		department?: string;
		position?: string;
	};
	type: string;
	startDate: string;
	endDate: string;
	days: number;
	reason: string;
	status: "pending" | "approved" | "rejected" | "cancelled";
	attachment?: string;
	approvedBy?: { id: string; name: string };
	approvedAt?: string;
	rejectionReason?: string;
	createdAt: string;
}

export interface LeaveBalance {
	year: number;
	paidTimeOff: { total: number; used: number; pending: number; available: number };
	sickLeave: { total: number; used: number; pending: number; available: number };
	unpaidLeave: { total: number; used: number; pending: number; available: number };
}

export interface DashboardStats {
	stats: {
		totalEmployees: number;
		presentToday: number;
		absentToday: number;
		lateToday: number;
		onLeaveToday: number;
		pendingLeaveRequests: number;
		attendanceRate: number;
	};
	activities: Array<{
		id: string;
		type: string;
		employeeName: string;
		employeeAvatar?: string;
		department?: string;
		leaveType: string;
		status: string;
		days: number;
		createdAt: string;
	}>;
	onLeave: Array<{
		id: string;
		name: string;
		avatar?: string;
		department?: string;
		position?: string;
		leaveType: string;
		returnDate: string;
	}>;
	myStats?: {
		presentDays: number;
		lateDays: number;
		totalWorkHours: number;
		avgWorkHours: number;
		pendingLeaveRequests: number;
		approvedLeaveRequests: number;
	};
}

// API Functions
const apiCall = async <T>(url: string, options?: RequestInit): Promise<T> => {
	const response = await fetch(url, {
		...options,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error || "API request failed");
	}

	return data;
};

// Employee APIs
export const employeeApi = {
	getAll: async (search?: string): Promise<{ employees: Employee[] }> => {
		const params = new URLSearchParams();
		if (search) params.append("search", search);
		return apiCall(`/api/employees?${params.toString()}`);
	},

	getById: async (id: string): Promise<{ employee: Employee }> => {
		return apiCall(`/api/employees/${id}`);
	},

	create: async (data: Partial<Employee> & { password: string }): Promise<{ employee: Employee }> => {
		return apiCall("/api/employees", {
			method: "POST",
			body: JSON.stringify(data),
		});
	},

	update: async (id: string, data: Partial<Employee>): Promise<{ employee: Employee }> => {
		return apiCall(`/api/employees/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	},

	delete: async (id: string): Promise<{ message: string }> => {
		return apiCall(`/api/employees/${id}`, {
			method: "DELETE",
		});
	},
};

// Attendance APIs
export const attendanceApi = {
	getAll: async (params?: {
		date?: string;
		employeeId?: string;
		startDate?: string;
		endDate?: string;
	}): Promise<{ attendance: AttendanceRecord[] }> => {
		const searchParams = new URLSearchParams();
		if (params?.date) searchParams.append("date", params.date);
		if (params?.employeeId) searchParams.append("employeeId", params.employeeId);
		if (params?.startDate) searchParams.append("startDate", params.startDate);
		if (params?.endDate) searchParams.append("endDate", params.endDate);
		return apiCall(`/api/attendance?${searchParams.toString()}`);
	},

	getToday: async (): Promise<TodayAttendance> => {
		return apiCall("/api/attendance/today");
	},

	checkIn: async (notes?: string, location?: string): Promise<{ message: string; attendance: { id: string; checkIn: string; status: string } }> => {
		return apiCall("/api/attendance", {
			method: "POST",
			body: JSON.stringify({ action: "check-in", notes, location }),
		});
	},

	checkOut: async (notes?: string): Promise<{ message: string; attendance: { id: string; checkIn: string; checkOut: string; workHours: number; status: string } }> => {
		return apiCall("/api/attendance", {
			method: "POST",
			body: JSON.stringify({ action: "check-out", notes }),
		});
	},
};

// Time-Off APIs
export const timeOffApi = {
	getAll: async (params?: {
		status?: string;
		type?: string;
		view?: "my" | "all";
	}): Promise<{ requests: TimeOffRequest[] }> => {
		const searchParams = new URLSearchParams();
		if (params?.status) searchParams.append("status", params.status);
		if (params?.type) searchParams.append("type", params.type);
		if (params?.view) searchParams.append("view", params.view);
		return apiCall(`/api/time-off?${searchParams.toString()}`);
	},

	getById: async (id: string): Promise<{ request: TimeOffRequest }> => {
		return apiCall(`/api/time-off/${id}`);
	},

	create: async (data: {
		type: string;
		startDate: string;
		endDate: string;
		reason: string;
		attachment?: string;
	}): Promise<{ request: TimeOffRequest }> => {
		return apiCall("/api/time-off", {
			method: "POST",
			body: JSON.stringify(data),
		});
	},

	approve: async (id: string): Promise<{ message: string }> => {
		return apiCall(`/api/time-off/${id}`, {
			method: "PUT",
			body: JSON.stringify({ action: "approve" }),
		});
	},

	reject: async (id: string, reason: string): Promise<{ message: string }> => {
		return apiCall(`/api/time-off/${id}`, {
			method: "PUT",
			body: JSON.stringify({ action: "reject", rejectionReason: reason }),
		});
	},

	cancel: async (id: string): Promise<{ message: string }> => {
		return apiCall(`/api/time-off/${id}`, {
			method: "DELETE",
		});
	},

	getBalance: async (year?: number, employeeId?: string): Promise<{ balance: LeaveBalance }> => {
		const params = new URLSearchParams();
		if (year) params.append("year", year.toString());
		if (employeeId) params.append("employeeId", employeeId);
		return apiCall(`/api/time-off/balance?${params.toString()}`);
	},
};

// Dashboard APIs
export const dashboardApi = {
	getStats: async (): Promise<DashboardStats> => {
		return apiCall("/api/dashboard");
	},
};

// Profile APIs
export const profileApi = {
	update: async (data: Partial<Employee>): Promise<{ employee: Employee }> => {
		return apiCall("/api/profile", {
			method: "PUT",
			body: JSON.stringify(data),
		});
	},
};
