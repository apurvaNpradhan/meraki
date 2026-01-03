import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOnboardingStore } from "@/features/onboarding/store";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(authenticated)/onboarding/complete")({
	component: RouteComponent,
});

function RouteComponent() {
	// For now a empty form with just a submit

	const navigate = useNavigate();
	const orgName = useOnboardingStore((state) => state.name);
	const orgSlug = useOnboardingStore((state) => state.slug);
	const form = useForm({});
	const onSubmit = async () => {
		if (!orgName || !orgSlug) {
			navigate({ to: "/onboarding/workspace" });
			return;
		}
		const { data, error } = await authClient.organization.create({
			name: orgName,
			slug: orgSlug,
		});

		if (error) {
			toast.error(error.message);
			return;
		}
		await authClient.organization.setActive({
			organizationId: data.id,
		}),
			await authClient.updateUser({
				onboardingCompleted: new Date(),
				defaultOrganizationId: data.id,
			}),
			toast.success("Onboarding completed successfully");
		navigate({ to: "/" });
	};
	useEffect(() => {
		if (!useOnboardingStore.persist.hasHydrated()) return;
		if (!orgName || !orgSlug) {
			navigate({ to: "/onboarding/workspace" });
		}
	}, [orgName, orgSlug, navigate]);
	return (
		<div className="flex h-svh w-full items-center justify-center">
			<Card className="w-full max-w-md">
				<CardContent>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col gap-4"
					>
						<Button
							type="submit"
							className="mt-4 w-full"
							disabled={form.formState.isSubmitting}
						>
							Finish onboarding
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
