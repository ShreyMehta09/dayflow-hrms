/**
 * Login ID Generation Utility
 *
 * Format: [CompanyCode][First2LettersOfFirstName][First2LettersOfLastName][YearOfJoining][4-digit-serial]
 * Example: OIJO20230001
 *
 * Rules:
 * - Generated automatically when Admin/HR creates employee
 * - Serial resets per year
 * - Employees cannot edit Login ID
 * - First-time password is auto-generated
 * - User must change password after first login
 */

// Types
export interface LoginIdComponents {
	companyCode: string;
	firstName: string;
	lastName: string;
	joiningYear: number;
}

export interface GeneratedCredentials {
	loginId: string;
	temporaryPassword: string;
	mustChangePassword: boolean;
	createdAt: Date;
}

export interface SerialTracker {
	[companyCode: string]: {
		[year: number]: number;
	};
}

// In-memory serial tracker (in production, this would be stored in database)
let serialTracker: SerialTracker = {};

/**
 * Extracts first N letters from a string, converts to uppercase
 * Handles edge cases like single-letter names
 */
export function extractLetters(str: string, count: number = 2): string {
	const cleaned = str.trim().replace(/[^a-zA-Z]/g, "");
	if (cleaned.length === 0) {
		return "XX"; // Fallback for empty or invalid strings
	}
	return cleaned.substring(0, count).toUpperCase().padEnd(count, "X");
}

/**
 * Formats company code to uppercase, removes special characters
 * Limits to reasonable length
 */
export function formatCompanyCode(code: string, maxLength: number = 4): string {
	const cleaned = code.trim().replace(/[^a-zA-Z0-9]/g, "");
	if (cleaned.length === 0) {
		return "COMP"; // Fallback for empty codes
	}
	return cleaned.substring(0, maxLength).toUpperCase();
}

/**
 * Gets the next serial number for a company and year
 * Resets to 1 for each new year
 */
export function getNextSerial(companyCode: string, year: number): number {
	const code = formatCompanyCode(companyCode);

	if (!serialTracker[code]) {
		serialTracker[code] = {};
	}

	if (!serialTracker[code][year]) {
		serialTracker[code][year] = 0;
	}

	serialTracker[code][year] += 1;
	return serialTracker[code][year];
}

/**
 * Gets current serial without incrementing (for preview purposes)
 */
export function peekNextSerial(companyCode: string, year: number): number {
	const code = formatCompanyCode(companyCode);
	const current = serialTracker[code]?.[year] || 0;
	return current + 1;
}

/**
 * Formats serial number as 4-digit string with leading zeros
 */
export function formatSerial(serial: number): string {
	if (serial > 9999) {
		// Handle overflow - extend to 5 digits if needed
		return serial.toString().padStart(5, "0");
	}
	return serial.toString().padStart(4, "0");
}

/**
 * Generates a Login ID based on the specified format
 *
 * @param components - The components needed to generate the login ID
 * @returns The generated login ID string
 *
 * @example
 * generateLoginId({
 *   companyCode: 'OI',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   joiningYear: 2023
 * })
 * // Returns: 'OIJO20230001'
 */
export function generateLoginId(components: LoginIdComponents): string {
	const { companyCode, firstName, lastName, joiningYear } = components;

	// Extract and format each component
	const code = formatCompanyCode(companyCode);
	const firstNamePart = extractLetters(firstName, 2);
	const lastNamePart = extractLetters(lastName, 2);
	const year = joiningYear.toString();
	const serial = formatSerial(getNextSerial(companyCode, joiningYear));

	return `${code}${firstNamePart}${lastNamePart}${year}${serial}`;
}

/**
 * Generates a login ID without incrementing the serial (preview only)
 */
export function previewLoginId(components: LoginIdComponents): string {
	const { companyCode, firstName, lastName, joiningYear } = components;

	const code = formatCompanyCode(companyCode);
	const firstNamePart = extractLetters(firstName, 2);
	const lastNamePart = extractLetters(lastName, 2);
	const year = joiningYear.toString();
	const serial = formatSerial(peekNextSerial(companyCode, joiningYear));

	return `${code}${firstNamePart}${lastNamePart}${year}${serial}`;
}

/**
 * Parses a login ID to extract its components
 */
export function parseLoginId(loginId: string): {
	companyCode: string;
	firstNameInitials: string;
	lastNameInitials: string;
	year: number;
	serial: number;
} | null {
	// Minimum length: 2 (code) + 2 (first) + 2 (last) + 4 (year) + 4 (serial) = 14
	if (loginId.length < 14) {
		return null;
	}

	// Extract from the end since serial and year have fixed lengths
	const serial = parseInt(loginId.slice(-4), 10);
	const year = parseInt(loginId.slice(-8, -4), 10);
	const remaining = loginId.slice(0, -8);

	if (remaining.length < 4) {
		return null;
	}

	const lastNameInitials = remaining.slice(-2);
	const firstNameInitials = remaining.slice(-4, -2);
	const companyCode = remaining.slice(0, -4);

	if (isNaN(serial) || isNaN(year)) {
		return null;
	}

	return {
		companyCode,
		firstNameInitials,
		lastNameInitials,
		year,
		serial,
	};
}

/**
 * Generates a secure temporary password
 *
 * Format: Mix of uppercase, lowercase, numbers, and special characters
 * Length: 12 characters by default
 */
export function generateTemporaryPassword(length: number = 12): string {
	const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // Excluded I, O to avoid confusion
	const lowercase = "abcdefghjkmnpqrstuvwxyz"; // Excluded i, l, o to avoid confusion
	const numbers = "23456789"; // Excluded 0, 1 to avoid confusion
	const special = "@#$%&*!?";

	const allChars = uppercase + lowercase + numbers + special;

	// Ensure at least one of each type
	let password = "";
	password += uppercase[Math.floor(Math.random() * uppercase.length)];
	password += lowercase[Math.floor(Math.random() * lowercase.length)];
	password += numbers[Math.floor(Math.random() * numbers.length)];
	password += special[Math.floor(Math.random() * special.length)];

	// Fill the rest randomly
	for (let i = password.length; i < length; i++) {
		password += allChars[Math.floor(Math.random() * allChars.length)];
	}

	// Shuffle the password
	return password
		.split("")
		.sort(() => Math.random() - 0.5)
		.join("");
}

/**
 * Generates complete credentials for a new employee
 *
 * @param components - Employee and company details
 * @returns Complete credentials object with login ID and temporary password
 */
export function generateEmployeeCredentials(
	components: LoginIdComponents
): GeneratedCredentials {
	return {
		loginId: generateLoginId(components),
		temporaryPassword: generateTemporaryPassword(),
		mustChangePassword: true,
		createdAt: new Date(),
	};
}

/**
 * Validates a login ID format
 */
export function isValidLoginIdFormat(loginId: string): boolean {
	// Must be at least 14 characters
	if (loginId.length < 14) {
		return false;
	}

	// Must end with year (4 digits) and serial (4+ digits)
	const yearSerialPattern = /\d{8,}$/;
	if (!yearSerialPattern.test(loginId)) {
		return false;
	}

	// Rest should be alphabetic company code and name initials
	const prefix = loginId.replace(/\d+$/, "");
	if (!/^[A-Z]{4,}$/.test(prefix)) {
		return false;
	}

	return true;
}

/**
 * Resets the serial tracker (useful for testing)
 */
export function resetSerialTracker(): void {
	serialTracker = {};
}

/**
 * Sets the serial tracker state (useful for restoring from database)
 */
export function setSerialTracker(tracker: SerialTracker): void {
	serialTracker = { ...tracker };
}

/**
 * Gets the current serial tracker state (useful for persisting to database)
 */
export function getSerialTracker(): SerialTracker {
	return { ...serialTracker };
}

/**
 * Initializes serial tracker for a company/year from existing data
 * Useful when loading existing employees from database
 */
export function initializeSerialFromExisting(
	companyCode: string,
	year: number,
	lastSerial: number
): void {
	const code = formatCompanyCode(companyCode);

	if (!serialTracker[code]) {
		serialTracker[code] = {};
	}

	serialTracker[code][year] = lastSerial;
}
