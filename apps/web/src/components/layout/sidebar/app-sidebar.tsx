import {
	IconCaretRightFilled,
	IconChevronCompactDown,
	IconHome,
	IconInbox,
	IconPlus,
	IconSearch,
} from "@tabler/icons-react";
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
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session, isPending } = authClient.useSession();
	const isActive = useRouteActive();
	return (
		<Sidebar collapsible="icon" {...props} variant="inset" className="p-0">
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
				<NavAreas />
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
								type: "CREATE_AREA",
								title: "Create Area",
								description: "Create a new area",
								closeOnClickOutside: true,
							});
						}}
					>
						<IconPlus size={14} />
					</button>
				</div>

				<CollapsibleContent>
					<SidebarGroupContent />
				</CollapsibleContent>
			</Collapsible>
		</SidebarGroup>
	);
}
