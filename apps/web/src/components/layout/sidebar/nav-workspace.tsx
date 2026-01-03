import { IconCheck, IconChevronDown, IconPlus } from "@tabler/icons-react";

import { useNavigate } from "@tanstack/react-router";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/orpc";

export function NavWorkspace({
	activeOrganizationId,
}: {
	activeOrganizationId?: string;
}) {
	const navigate = useNavigate();
	const { data: workspaces, isPending: isWorkspacesPending } =
		authClient.useListOrganizations();
	const currentWorkspace = workspaces?.find(
		(w) => w.id === activeOrganizationId,
	);

	const handleSwitchWorkspace = async (organizationId: string) => {
		await authClient.organization.setActive({
			organizationId,
		});
		queryClient.invalidateQueries();
		navigate({
			to: "/home",
		});
	};

	if (isWorkspacesPending) {
		return <Skeleton className="h-12 w-full" />;
	}

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
					<DropdownMenuSub>
						<DropdownMenuSubTrigger gap-2>
							<IconPlus className="size-4" />
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
									{org.id === currentWorkspace?.id && (
										<IconCheck className="ml-auto size-4" />
									)}
								</DropdownMenuItem>
							))}
							<DropdownMenuSeparator />
							<DropdownMenuItem
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
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
