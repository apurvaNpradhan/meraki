import type React from "react";
import { cn } from "@/lib/utils";

type Props = {
	headerContent: React.ReactNode;
	children: React.ReactNode;
	className?: string;
};

function PublicLayout({ headerContent, children, className }: Props) {
	return (
		<div className="relative flex min-h-screen w-full flex-col bg-background selection:bg-primary/10">
			<header className="sticky top-0 z-40 flex h-12 w-full items-center justify-between border-border/5 border-b bg-background/70 px-4 backdrop-blur-xl">
				{headerContent}
			</header>
			<main
				className={cn(
					"w-full flex-1 px-6 pt-16 pb-32 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] md:px-12 md:pt-24",
					className,
				)}
			>
				<div className="fade-in slide-in-from-bottom-2 animate-in fill-mode-both duration-1000 ease-out">
					<div className="container mx-auto max-w-3xl px-4 py-2">
						{children}
					</div>
				</div>
			</main>
		</div>
	);
}

export default PublicLayout;
