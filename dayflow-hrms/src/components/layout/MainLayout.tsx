"use client";

import React from "react";
import { TopNavbar } from "@/components/layout/TopNavbar";

interface MainLayoutProps {
	children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
	return (
		<div className="min-h-screen bg-background flex flex-col">
			<TopNavbar />

			<main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				{children}
			</main>
		</div>
	);
};
