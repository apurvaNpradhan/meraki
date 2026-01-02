import {
	IconCaretRightFilled,
	IconHome,
	IconInbox,
	IconPlus,
	IconSearch,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
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
import { useRouteActive } from "@/hooks/use-active-route";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useModal } from "@/stores/modal";
import { NavWorkspace } from "./nav-workspace";
import { SidebarSpaceList } from "./sidebar-space-list";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session, isPending: isSessionPending } =
		authClient.useSession();
	const { isPending: isWorkspacesPending } = authClient.useListOrganizations();

	const isPending = isSessionPending || isWorkspacesPending;

	const isActive = useRouteActive();
	const navigate = useNavigate();
	return (
		<Sidebar collapsible="icon" {...props} variant="inset" className="p-0">
			<SidebarHeader className="px-0">
				{isPending ? <Skeleton className="h-12 w-full" /> : null}
				{!isPending && session && <NavWorkspace />}
			</SidebarHeader>
			<SidebarContent className="flex flex-col gap-5 text-muted-foreground">
				{isPending ? (
					<div className="flex flex-col gap-2 p-2">
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
					</div>
				) : (
					<>
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
						<NavAreas />
					</>
				)}
			</SidebarContent>
			<SidebarFooter />
		</Sidebar>
	);
}

function NavAreas() {
	const { open } = useModal();
	const [isOpen, setIsOpen] = React.useState(true);

	return (
		<SidebarGroup className="p-0">
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<div className="flex items-center justify-between rounded-md hover:bg-primary/5">
					<CollapsibleTrigger className="flex flex-1 items-center gap-1 text-left">
						<SidebarGroupLabel className="cursor-pointer select-none">
							Areas
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
							open({
								type: "CREATE_SPACE",
								title: "Create Space",
								description: "Create a new sapce",
								closeOnClickOutside: true,
							});
						}}
					>
						<IconPlus size={14} />
					</button>
				</div>

				<CollapsibleContent>
					<SidebarGroupContent>
						<SidebarSpaceList />
					</SidebarGroupContent>
				</CollapsibleContent>
			</Collapsible>
		</SidebarGroup>
	);
}
