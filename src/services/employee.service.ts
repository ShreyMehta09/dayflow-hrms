/**
 * Employee Service
 *
 * Handles employee creation with auto-generated credentials
 */

import {
	generateEmployeeCredentials,
	initializeSerialFromExisting,
	type GeneratedCredentials,
} from "@/lib/login-id";
import type { Employee, CreateEmployeeInput, UserRole } from "@/types";

export interface CreateEmployeeResult {
	employee: Employee;
	credentials: GeneratedCredentials;
}

export interface CompanyInfo {
	id: string;
	code: string; // Short code used in login ID (e.g., "OI" for "Odoo Inc")
	name: string;
}

/**
 * Creates a new employee with auto-generated login ID and temporary password
 *
 * @param input - Employee details from the creation form
 * @param company - Company information for login ID generation
 * @param createdBy - ID of the Admin/HR creating this employee
 * @returns Created employee with credentials
 */
export function createEmployee(
	input: CreateEmployeeInput,
	company: CompanyInfo,
	createdBy: string
): CreateEmployeeResult {
	// Parse name into first and last name
	const nameParts = parseFullName(input.firstName, input.lastName);

	// Get joining year from join date
	const joiningYear = new Date(input.joinDate).getFullYear();

	// Generate credentials
	const credentials = generateEmployeeCredentials({
		companyCode: company.code,
		firstName: nameParts.firstName,
		lastName: nameParts.lastName,
		joiningYear,
	});

	// Create employee record
	const employee: Employee = {
		id: generateEmployeeId(),
		loginId: credentials.loginId,
		email: input.email,
		name: `${input.firstName} ${input.lastName}`,
		role: "employee" as UserRole,
		department: input.department,
		position: input.position,
		joinDate: input.joinDate,
		phone: input.phone,
		status: "active",
		managerId: input.managerId,
		salary: input.salary,
		mustChangePassword: true,
		createdBy,
	};

	return {
		employee,
		credentials,
	};
}

/**
 * Parses first and last name, handling edge cases
 */
function parseFullName(
	firstName: string,
	lastName: string
): { firstName: string; lastName: string } {
	return {
		firstName: firstName.trim() || "Unknown",
		lastName: lastName.trim() || "User",
	};
}

/**
 * Generates a unique employee ID
 */
function generateEmployeeId(): string {
	return `emp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validates employee creation input
 */
export function validateCreateEmployeeInput(
	input: CreateEmployeeInput
): { valid: boolean; errors: Record<string, string> } {
	const errors: Record<string, string> = {};

	if (!input.firstName?.trim()) {
		errors.firstName = "First name is required";
	}

	if (!input.lastName?.trim()) {
		errors.lastName = "Last name is required";
	}

	if (!input.email?.trim()) {
		errors.email = "Email is required";
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
		errors.email = "Invalid email format";
	}

	if (!input.department?.trim()) {
		errors.department = "Department is required";
	}

	if (!input.position?.trim()) {
		errors.position = "Position is required";
	}

	if (!input.joinDate) {
		errors.joinDate = "Join date is required";
	}

	return {
		valid: Object.keys(errors).length === 0,
		errors,
	};
}

/**
 * Formats credentials for display/email
 */
export function formatCredentialsForEmail(
	credentials: GeneratedCredentials,
	employeeName: string,
	companyName: string
): string {
	return `
Welcome to ${companyName}!

Dear ${employeeName},

Your account has been created. Please use the following credentials to log in:

Login ID: ${credentials.loginId}
Temporary Password: ${credentials.temporaryPassword}

IMPORTANT: You will be required to change your password upon first login.

Please keep your credentials secure and do not share them with anyone.

Best regards,
${companyName} HR Team
  `.trim();
}

/**
 * Initializes the serial tracker from existing employees
 * Should be called on application startup
 */
export function initializeFromExistingEmployees(
	employees: Array<{ loginId: string; companyCode: string }>
): void {
	// Group by company and year, find max serial
	const maxSerials: Record<string, Record<number, number>> = {};

	for (const emp of employees) {
		// Parse the login ID to extract year and serial
		const loginId = emp.loginId;
		if (loginId.length < 14) continue;

		const serial = parseInt(loginId.slice(-4), 10);
		const year = parseInt(loginId.slice(-8, -4), 10);
		const companyCode = emp.companyCode;

		if (isNaN(serial) || isNaN(year)) continue;

		if (!maxSerials[companyCode]) {
			maxSerials[companyCode] = {};
		}

		if (!maxSerials[companyCode][year] || maxSerials[companyCode][year] < serial) {
			maxSerials[companyCode][year] = serial;
		}
	}

	// Initialize the tracker with max values
	for (const [companyCode, years] of Object.entries(maxSerials)) {
		for (const [year, serial] of Object.entries(years)) {
			initializeSerialFromExisting(companyCode, parseInt(year, 10), serial);
		}
	}
}
