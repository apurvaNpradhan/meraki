import { IconHome, IconInbox, IconSearch } from "@tabler/icons-react";
import type * as React from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouteActive } from "@/hooks/use-active-route";
import { authClient } from "@/lib/auth-client";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session, isPending } = authClient.useSession();
	const isActive = useRouteActive();
	return (
		<Sidebar
			collapsible="offExamples"
			{...props}
			variant="inset"
			className="p-0"
		>
			<SidebarHeader className="px-0">
				{isPending && <Skeleton />}
				{!isPending && session && <NavUser user={session?.user} />}
			</SidebarHeader>
			<SidebarContent className="flex flex-col gap-5 text-muted-foreground">
				<SidebarGroup className="p-0">
					<SidebarGroupContent className="flex flex-col gap-1">
						<SidebarMenuButton size={"sm"}>
							<IconSearch />
							Search
						</SidebarMenuButton>

						<SidebarMenuButton size={"sm"} isActive={isActive("/home")}>
							<IconHome />
							Home
						</SidebarMenuButton>
						<SidebarMenuButton size={"sm"} isActive={isActive("/inbox")}>
							<IconInbox />
							Inbox
						</SidebarMenuButton>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup className="p-0">
					<SidebarGroupLabel>Areas</SidebarGroupLabel>
					<SidebarGroupContent className="flex flex-col gap-1" />
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter />
		</Sidebar>
	);
}
