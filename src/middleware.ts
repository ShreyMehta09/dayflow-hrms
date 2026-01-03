import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = [
	"/auth/sign-in",
	"/auth/sign-up",
	"/api/auth/login",
	"/api/auth/signup",
	"/api/auth/logout",
];

// Routes that are only for non-authenticated users
const authRoutes = ["/auth/sign-in", "/auth/sign-up"];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get("auth-token")?.value;

	// Check if the route is public
	const isPublicRoute = publicRoutes.some(
		(route) => pathname.startsWith(route) || pathname === "/"
	);

	// Check if the route is auth-only (login/signup)
	const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

	// API routes that need protection
	if (pathname.startsWith("/api/") && !isPublicRoute) {
		if (!token) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}
	}

	// If user is authenticated and trying to access auth routes, redirect to dashboard
	if (token && isAuthRoute) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// If user is not authenticated and trying to access protected routes
	if (!token && !isPublicRoute) {
		const signInUrl = new URL("/auth/sign-in", request.url);
		signInUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(signInUrl);
	}

	// Root path handling
	if (pathname === "/") {
		if (token) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		} else {
			return NextResponse.redirect(new URL("/auth/sign-in", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
