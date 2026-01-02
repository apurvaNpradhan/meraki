import { createFileRoute } from "@tanstack/react-router";
import SettingLayout from "@/components/layout/setting-layout";
import { ModeToggle } from "@/components/mode-toggle";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";

export const Route = createFileRoute("/(authenticated)/settings/preferences/")({
	component: RouteComponent,
	head: () => ({
		meta: [
			{
				name: "description",
				content: "Preferences",
			},
			{
				title: "Preferences",
			},
		],
	}),
});

function RouteComponent() {
	return (
		<SettingLayout>
			<div className="mx-auto mt-15 flex max-w-4xl flex-col gap-7">
				<span className="font-bold text-3xl">Preferences</span>
				<div className="flex flex-col gap-3">
					<span className="font-semibold">Interface and theme</span>
					<ItemGroup className="gap-0">
						<Item variant={"muted"}>
							<ItemContent>
								<ItemTitle>Theme</ItemTitle>
								<ItemDescription>Select your theme</ItemDescription>
							</ItemContent>
							<ItemActions>
								<ModeToggle />
							</ItemActions>
						</Item>
					</ItemGroup>
				</div>
			</div>
		</SettingLayout>
	);
}
