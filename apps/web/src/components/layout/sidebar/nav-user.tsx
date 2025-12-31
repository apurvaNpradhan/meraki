import { IconCaretDownFilled, IconLogout } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import type { User } from "better-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
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
			<DropdownMenuTrigger>
				<SidebarMenuButton
					size="lg"
					className="border data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					render={<div />}
				>
					<Avatar className="h-8 w-8 rounded-lg grayscale">
						<AvatarImage src={user.image ?? ""} alt={user.name} />
						<AvatarFallback className="rounded-lg">
							{user.name
								.split(" ")
								.map((name) => name.charAt(0))
								.join("")}
						</AvatarFallback>
					</Avatar>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-medium">{user.name}</span>
					</div>
					<IconCaretDownFilled className="ml-auto size-4" />
				</SidebarMenuButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
				side={"bottom"}
			>
				<DropdownMenuGroup>
					<DropdownMenuLabel className="p-0 font-normal">
						<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={user.image ?? ""} alt={user.name} />
								<AvatarFallback className="rounded-lg">
									{user.name.charAt(0)}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{user.name}</span>
								<span className="truncate text-muted-foreground text-xs">
									{user.email}
								</span>
							</div>
						</div>
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					variant="destructive"
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
					<IconLogout />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
