import { IconArrowLeft, IconCircle, IconSettings2 } from "@tabler/icons-react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenuButton,
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
	const navigate = useNavigate();
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
							onClick={() =>
								navigate({
									to: "/settings/preferences",
								})
							}
						>
							<IconSettings2 />
							Preferences
						</SidebarMenuButton>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupContent className="flex flex-col gap-1">
						<SidebarGroupLabel>Projects</SidebarGroupLabel>
						<SidebarMenuButton
							size={"sm"}
							isActive={isActive("/settings/project-statuses")}
							onClick={() =>
								navigate({
									to: "/settings/project-statuses",
								})
							}
						>
							<IconCircle />
							Project statuses
						</SidebarMenuButton>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
