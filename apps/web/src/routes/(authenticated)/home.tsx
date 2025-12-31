import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "@/components/layout/app-layout";
import { ModeToggle } from "@/components/mode-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(authenticated)/home")({
	component: RouteComponent,
});

function RouteComponent() {
	const { isPending, data } = authClient.useSession();
	return (
		<AppLayout header={<Header />}>
			<div className="mt-5 flex flex-col gap-4 px-4">
				<div className="text-center font-semibold text-3xl">
					{getGreeting()}
				</div>
			</div>
		</AppLayout>
	);
}

function Header() {
	return (
		<div className="flex w-full flex-row items-center justify-between px-2 py-1">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<span className="font-semibold text-sm">Home</span>
			</div>
			<ModeToggle />
		</div>
	);
}

function getGreeting() {
	const date = new Date();
	const hour = date.getHours();
	if (hour < 12) {
		return "Good Morning";
	}
	if (hour < 18) {
		return "Good Afternoon";
	}
	return "Good Evening";
}
