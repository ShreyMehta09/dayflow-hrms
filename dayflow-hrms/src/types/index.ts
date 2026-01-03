// User Roles
export type UserRole = 'admin' | 'hr' | 'employee';

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  position?: string;
  joinDate: string;
  phone?: string;
  status: 'active' | 'inactive' | 'on_leave';
}

// Employee Types
export interface Employee extends User {
  loginId: string; // System-generated login ID
  managerId?: string;
  teamId?: string;
  salary?: number;
  skills?: string[];
  bio?: string;
  mustChangePassword: boolean; // True for first-time login
  passwordChangedAt?: string;
  createdBy?: string; // Admin/HR who created this employee
}

// Employee Creation Input (used by Admin/HR)
export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  joinDate: string;
  managerId?: string;
  salary?: number;
}

// Department Types
export interface Department {
  id: string;
  name: string;
  description?: string;
  headId?: string;
  memberCount: number;
  budget?: number;
  createdAt: string;
}

// Attendance Types
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave' | 'holiday';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  workHours?: number;
  notes?: string;
}

// Leave Types
export type LeaveType = 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approverId?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface LeaveBalance {
  type: LeaveType;
  total: number;
  used: number;
  remaining: number;
}

// Payroll Types
export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'processed' | 'paid';
  paidAt?: string;
}

// Announcement Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  priority: 'low' | 'medium' | 'high';
  targetRoles?: UserRole[];
  targetDepartments?: string[];
  publishedAt: string;
  expiresAt?: string;
}

// Task/Project Types
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  assignerId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
}

// Event Types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: 'meeting' | 'holiday' | 'birthday' | 'event' | 'deadline';
  attendees?: string[];
  location?: string;
  isRecurring?: boolean;
}

// Notification Types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// Stats/Dashboard Types
export interface DashboardStats {
  totalEmployees: number;
  activeToday: number;
  onLeave: number;
  pendingRequests: number;
  openPositions?: number;
  upcomingBirthdays: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: UserRole[];
  badge?: number;
  children?: NavItem[];
}
