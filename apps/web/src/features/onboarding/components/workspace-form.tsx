import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import type z from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useOnboardingStore } from "@/features/store";

import { onboardingSchema } from "../schema";

const onboardingWorkspaceSchema = onboardingSchema.pick({
	name: true,
	slug: true,
});
type OnboardingWorkspaceSchema = z.infer<typeof onboardingWorkspaceSchema>;

export default function OnboardingWorkspaceForm() {
	const navigate = useNavigate();
	const setData = useOnboardingStore((state) => state.setData);
	const form = useForm<OnboardingWorkspaceSchema>({
		resolver: zodResolver(onboardingWorkspaceSchema),
		defaultValues: {
			name: "",
			slug: "",
		},
	});
	const onSubmit = async (data: OnboardingWorkspaceSchema) => {
		setData(data);
		navigate({ to: "/onboarding/complete" });
	};
	return (
		<div className="flex h-svh w-full items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Welcome to Meraki</CardTitle>
					<CardDescription>Create a workspace to get started.</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col gap-4"
					>
						<Controller
							control={form.control}
							name="name"
							render={({ field, fieldState }) => (
								<div>
									<Input
										{...field}
										placeholder="Workspace Name"
										className="border-none bg-transparent px-0 py-2 font-semibold shadow-none placeholder:opacity-30 focus-visible:ring-0 md:text-xl dark:bg-transparent"
										autoFocus
										onChange={(e) => {
											field.onChange(e);
											// Auto-generate slug from name if slug hasn't been manually edited
											if (!form.formState.dirtyFields.slug) {
												const slug = e.target.value
													.toLowerCase()
													.replace(/[^a-z0-9]+/g, "-")
													.replace(/(^-|-$)+/g, "");
												form.setValue("slug", slug, { shouldValidate: true });
											}
										}}
									/>
									{fieldState.error && (
										<FieldError errors={[fieldState.error]} />
									)}
								</div>
							)}
						/>

						<Controller
							control={form.control}
							name="slug"
							render={({ field, fieldState }) => (
								<div>
									<div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1">
										<span className="text-muted-foreground text-sm">
											meraki.com/
										</span>
										<Input
											{...field}
											placeholder="slug"
											className="h-7 border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
										/>
									</div>
									{fieldState.error && (
										<FieldError errors={[fieldState.error]} />
									)}
								</div>
							)}
						/>

						<Button
							type="submit"
							className="mt-4 w-full"
							disabled={form.formState.isSubmitting}
						>
							Continue
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
