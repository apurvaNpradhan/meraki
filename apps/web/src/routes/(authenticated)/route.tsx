import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { NotFound } from "@/components/not-found";
import { ModalProvider } from "@/components/providers/modal-provider";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(authenticated)")({
	component: RouteComponent,
	errorComponent: NotFound,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			redirect({
				to: "/login",
				throw: true,
			});
		}
		return { session };
	},
});

function RouteComponent() {
	return (
		<>
			<Outlet />
			<ModalProvider />
		</>
	);
}
