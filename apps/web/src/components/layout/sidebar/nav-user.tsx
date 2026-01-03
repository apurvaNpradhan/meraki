import { IconLogout, IconSettings } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import type { User } from "better-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

export function NavUser({ user }: { user: User }) {
	const { isMobile } = useSidebar();
	const navigate = useNavigate();
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<SidebarMenuButton
						size="lg"
						className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					/>
				}
			>
				<Avatar className="h-8 w-8 rounded-lg">
					<AvatarImage src={user.image ?? ""} alt={user.name} />
					<AvatarFallback className="rounded-lg">
						{user.name
							.split(" ")
							.map((name) => name.charAt(0))
							.join("")}
					</AvatarFallback>
				</Avatar>
				<div className="grid flex-1 text-left text-sm leading-tight">
					<span className="truncate font-semibold">{user.name}</span>
					<span className="truncate text-xs">{user.email}</span>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
				align="start"
				side={isMobile ? "bottom" : "right"}
				sideOffset={4}
			>
				<DropdownMenuItem className="gap-2 p-2 font-medium">
					<div className="flex size-6 items-center justify-center rounded-sm border">
						<Avatar className="h-6 w-6 rounded-sm">
							<AvatarImage src={user.image ?? ""} alt={user.name} />
							<AvatarFallback className="rounded-sm">
								{user.name
									.split(" ")
									.map((name) => name.charAt(0))
									.join("")}
							</AvatarFallback>
						</Avatar>
					</div>
					<div className="flex flex-col gap-0.5">
						<span className="font-semibold text-sm">{user.name}</span>
						<span className="text-muted-foreground text-xs">{user.email}</span>
					</div>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem
						onClick={() => navigate({ to: "/settings/preferences" })}
					>
						<IconSettings className="size-4 text-muted-foreground" />
						Settings
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					variant="destructive"
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
