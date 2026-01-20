import React from "react";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import {
	SidebarProvider,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
	children: React.ReactNode;
	header?: React.ReactNode;
	headersNumber?: 1 | 2;
}

const isEmptyHeader = (header: React.ReactNode | undefined): boolean => {
	if (!header) return true;

	if (React.isValidElement(header) && header.type === React.Fragment) {
		const props = header.props as { children?: React.ReactNode };

		if (!props.children) return true;

		if (Array.isArray(props.children) && props.children.length === 0) {
			return true;
		}
	}

	return false;
};

export default function MainLayout({
	children,
	header,
	headersNumber = 2,
}: MainLayoutProps) {
	const height = {
		1: "h-[calc(100svh-40px)] lg:h-[calc(100svh-56px)]",
		2: "h-[calc(100svh-80px)] lg:h-[calc(100svh-96px)]",
	};
	return (
		<SidebarProvider>
			<AppSidebar />
			<div className="h-svh w-full lg:p-2">
				<div className="flex h-full w-full flex-col items-center justify-start overflow-hidden bg-container lg:rounded-md lg:border">
					<div className="flex w-full items-center">{header}</div>
					<div
						className={cn(
							"w-full overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
							isEmptyHeader(header)
								? "h-full"
								: height[headersNumber as keyof typeof height],
						)}
					>
						<div className="w-full">{children}</div>
					</div>
				</div>
			</div>
		</SidebarProvider>
	);
}

export function AuotHidingSidebar() {
	const sidebar = useSidebar();
	const isMobile = useIsMobile();
	return (isMobile || sidebar.state === "collapsed") && <SidebarTrigger />;
}
