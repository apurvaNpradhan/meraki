import {
	IconCaretRightFilled,
	IconHome,
	IconInbox,
	IconPlus,
	IconSearch,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import SidebarSpaceList from "@/features/spaces/components/sortable-sidebar-space-list";
import { useRouteActive } from "@/hooks/use-active-route";
import { sessionQueryOptions } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Route } from "@/routes/(authenticated)/route";
import { useModal } from "@/stores/modal";
import { NavUser } from "./nav-user";
import { NavWorkspace } from "./nav-workspace";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { session: initialSession } = Route.useRouteContext();
	const { data: sessionData } = useQuery({
		...sessionQueryOptions,
		initialData: initialSession,
	});
	const session = sessionData?.data;
	const isActive = useRouteActive();
	const navigate = useNavigate();
	return (
		<Sidebar collapsible="icon" {...props} variant="inset">
			<SidebarHeader className="p-0">
				<NavWorkspace
					activeOrganizationId={
						session?.session.activeOrganizationId ?? undefined
					}
				/>
			</SidebarHeader>
			<SidebarContent className="mt-5 flex flex-col gap-5 text-muted-foreground">
				<SidebarGroup className="p-0">
					<SidebarGroupContent className="flex flex-col gap-1">
						<SidebarMenuButton size={"sm"}>
							<IconSearch />
							Search
						</SidebarMenuButton>
						<SidebarMenuButton
							size={"sm"}
							isActive={isActive("/home")}
							onClick={() => navigate({ to: "/home" })}
						>
							<IconHome />
							Home
						</SidebarMenuButton>
						<SidebarMenuButton size={"sm"} isActive={isActive("/inbox")}>
							<IconInbox />
							Inbox
						</SidebarMenuButton>
					</SidebarGroupContent>
				</SidebarGroup>
				<NavSpaces />
			</SidebarContent>
			<SidebarFooter className="flex items-center">
				{!session ? (
					<Skeleton className="h-12 w-full" />
				) : (
					<NavUser user={session.user} />
				)}
			</SidebarFooter>
		</Sidebar>
	);
}

function NavSpaces() {
	const [isOpen, setIsOpen] = useState(true);
	const { open } = useModal();
	return (
		<SidebarGroup className="p-0">
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<div className="flex items-center justify-between rounded-md hover:bg-primary/5">
					<CollapsibleTrigger className="flex flex-1 items-center gap-1 text-left">
						<SidebarGroupLabel className="cursor-pointer select-none">
							Spaces
						</SidebarGroupLabel>
						<IconCaretRightFilled
							size={12}
							className={cn(
								"transition-transform duration-200",
								isOpen && "rotate-90",
							)}
						/>
					</CollapsibleTrigger>

					<button
						type="button"
						className="h-6 w-6 text-muted-foreground hover:text-primary"
						onClick={(e) => {
							e.stopPropagation();
							open({ type: "CREATE_SPACE" });
						}}
					>
						<IconPlus size={14} />
					</button>
				</div>

				<CollapsibleContent>
					<SidebarSpaceList />
				</CollapsibleContent>
			</Collapsible>
		</SidebarGroup>
	);
}
