import z from "zod";

export const onboardingSchema = z.object({
	name: z.string().min(2, {
		message: "Workspace name must be at least 2 characters.",
	}),
	slug: z.string().min(2, {
		message: "Slug must be at least 2 characters.",
	}),
});

export type OnboardingSchema = z.infer<typeof onboardingSchema>;
