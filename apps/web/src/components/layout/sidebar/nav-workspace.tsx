import {
	IconCheck,
	IconChevronDown,
	IconLogout,
	IconPlus,
	IconSettings,
	IconUsers,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/orpc";

export function NavWorkspace() {
	const { isMobile } = useSidebar();
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();
	const { data: workspaces } = authClient.useListOrganizations();

	const activeOrganizationId = session?.session.activeOrganizationId;
	const currentWorkspace = workspaces?.find(
		(org) => org.id === activeOrganizationId,
	);

	const handleSwitchWorkspace = async (organizationId: string) => {
		await authClient.organization.setActive({
			organizationId,
		});
		await authClient.updateUser({
			defaultOrganizationId: organizationId,
		});
		queryClient.invalidateQueries();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<SidebarMenuButton
					size="lg"
					className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					render={<div />}
				>
					<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
						{currentWorkspace?.logo ? (
							<img
								src={currentWorkspace.logo}
								alt={currentWorkspace.name}
								className="size-4"
							/>
						) : (
							<span className="font-semibold">
								{currentWorkspace?.name?.charAt(0) ?? "W"}
							</span>
						)}
					</div>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-semibold">
							{currentWorkspace?.name ?? "Workspace"}
						</span>
						<span className="truncate text-xs">
							{currentWorkspace?.slug ?? "Select a workspace"}
						</span>
					</div>
					<IconChevronDown className="ml-auto size-4" />
				</SidebarMenuButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
				align="start"
				side={"bottom"}
				sideOffset={4}
			>
				<DropdownMenuItem className="gap-2 p-2 font-medium">
					<div className="flex size-6 items-center justify-center rounded-sm border">
						{currentWorkspace?.logo ? (
							<img
								src={currentWorkspace.logo}
								alt={currentWorkspace.name}
								className="size-4"
							/>
						) : (
							<span className="font-bold">
								{currentWorkspace?.name?.charAt(0) ?? "W"}
							</span>
						)}
					</div>
					{currentWorkspace?.name ?? "Workspace"}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuLabel className="text-muted-foreground text-xs">
						Workspace
					</DropdownMenuLabel>

					<DropdownMenuItem gap-2>
						<IconSettings className="size-4 text-muted-foreground" />
						Settings
					</DropdownMenuItem>
					<DropdownMenuItem gap-2>
						<IconUsers className="size-4 text-muted-foreground" />
						Invite and manage members
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger gap-2>
							<div className="flex size-6 items-center justify-center rounded-md border bg-background">
								<IconPlus className="size-4" />
							</div>
							Switch workspace
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent className="w-48 rounded-lg">
							{workspaces?.map((org) => (
								<DropdownMenuItem
									key={org.id}
									onClick={() => handleSwitchWorkspace(org.id)}
									className="gap-2"
								>
									<div className="flex size-6 items-center justify-center rounded-sm border">
										{org.logo ? (
											<img src={org.logo} alt={org.name} className="size-4" />
										) : (
											<span className="font-bold">{org.name.charAt(0)}</span>
										)}
									</div>
									{org.name}
									{org.id === activeOrganizationId && (
										<IconCheck className="ml-auto size-4" />
									)}
								</DropdownMenuItem>
							))}
							<DropdownMenuSeparator />
							<DropdownMenuItem
								gap-2
								onClick={() => navigate({ to: "/workspace/new" })}
							>
								<div className="flex size-6 items-center justify-center rounded-md border bg-background">
									<IconPlus className="size-4" />
								</div>
								Create workspace
							</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					gap-2
					onClick={() => {
						authClient.signOut({
							fetchOptions: {
								onSuccess: () => {
									navigate({
										to: "/",
									});
								},
							},
						});
					}}
				>
					<IconLogout className="size-4" />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
