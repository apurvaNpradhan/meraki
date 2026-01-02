import { IconArrowLeft, IconSettings2 } from "@tabler/icons-react";
import { Link, useRouter } from "@tanstack/react-router";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRouteActive } from "@/hooks/use-active-route";

export function SettingSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const isActive = useRouteActive();
	const router = useRouter();
	const onBack = () => {
		router.navigate({ to: "/home" });
	};
	return (
		<Sidebar collapsible="offExamples" variant="inset" {...props}>
			<SidebarHeader className="px-0">
				<SidebarMenuButton
					onClick={() => {
						onBack();
					}}
				>
					<IconArrowLeft />
					<span>Back to app</span>
				</SidebarMenuButton>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup className="p-0">
					<SidebarGroupContent className="flex flex-col gap-1">
						<SidebarMenuButton
							size={"sm"}
							isActive={isActive("/settings/preferences")}
						>
							<IconSettings2 />
							Preferences
						</SidebarMenuButton>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
