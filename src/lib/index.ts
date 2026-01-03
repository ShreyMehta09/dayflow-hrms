export { cn, formatCurrency, formatDate, formatTime, formatRelativeTime, getInitials, truncate, generateId, sleep, debounce, capitalizeFirst, pluralize } from "./utils";

export {
	generateLoginId,
	previewLoginId,
	parseLoginId,
	generateTemporaryPassword,
	generateEmployeeCredentials,
	isValidLoginIdFormat,
	extractLetters,
	formatCompanyCode,
	formatSerial,
	getNextSerial,
	peekNextSerial,
	resetSerialTracker,
	setSerialTracker,
	getSerialTracker,
	initializeSerialFromExisting,
	type LoginIdComponents,
	type GeneratedCredentials,
	type SerialTracker,
} from "./login-id";

export {
	useAsyncData,
	useOptimisticUpdate,
	useReducedMotion,
	useFocusTrap,
	useAriaAnnounce,
} from "./hooks";
