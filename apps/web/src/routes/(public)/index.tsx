import { createFileRoute } from "@tanstack/react-router";
import PublicLayout from "@/components/layout/public-layout";
import { ModeToggle } from "@/components/mode-toggle";
import UserMenu from "@/components/user-menu";

export const Route = createFileRoute("/(public)/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<PublicLayout headerContent={<Header />}>
			<div className="flex flex-col gap-2">
				<h1 className="font-bold text-6xl">Meraki</h1>

				<p className="text-lg">
					A simple workspace for managing life, projects, and focused work.
				</p>
				<span className="mt-5 font-bold text-lg">Features</span>

				<ul className="list-disc" style={{ listStylePosition: "inside" }}>
					<li>Areas.</li>
					<li>Projects.</li>
					<li>Tasks.</li>
					<li>Notes.</li>
					<li>No noise.</li>
				</ul>
			</div>
		</PublicLayout>
	);
}

function Header() {
	return (
		<div className="flex w-full items-center justify-between">
			<span className="font-bold">Meraki</span>
			<div className="flex gap-2">
				<ModeToggle />
				<UserMenu />
			</div>
		</div>
	);
}
