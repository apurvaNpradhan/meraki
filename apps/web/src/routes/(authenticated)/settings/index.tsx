import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)/settings/")({
	beforeLoad: () => {
		redirect({
			to: "/settings/preferences",
			throw: true,
		});
	},
});
