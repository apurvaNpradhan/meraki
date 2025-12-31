import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(public)")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (session.data) {
			redirect({
				to: "/home",
				throw: true,
			});
		}
		return { session };
	},
});

function RouteComponent() {
	return <Outlet />;
}
