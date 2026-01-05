import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { NotFound } from "@/components/not-found";
import { ModalProvider } from "@/components/providers/modal-provider";
import { sessionQueryOptions } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/(authenticated)")({
	component: RouteComponent,
	errorComponent: NotFound,
	beforeLoad: async ({ context, location }) => {
		const session =
			await context.queryClient.ensureQueryData(sessionQueryOptions);

		if (!session.data) {
			redirect({
				to: "/sign-up",
				throw: true,
			});
		} else if (
			session.data?.user.onboardingCompleted === null &&
			location.pathname.startsWith("/onboarding") === false
		) {
			redirect({
				to: "/onboarding/workspace",
				throw: true,
			});
		}

		return { session };
	},
	loader: async ({ context }) => {
		return {
			projectStatuses: context.queryClient.ensureQueryData(
				orpc.projectStatus.all.queryOptions(),
			),
		};
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
