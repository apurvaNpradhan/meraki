import type { SelectProject } from "@meraki/db/schema/project";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { generateKeyBetween } from "fractional-indexing";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";

export function useCreateProject() {
	const qc = useQueryClient();
	const router = useRouter();

	return useMutation(
		orpc.project.create.mutationOptions({
			onMutate: async (input) => {
				const queryKey = orpc.project.allBySpaceId.queryKey({
					input: { spacePublicId: input.spacePublicId },
				});

				await qc.cancelQueries({ queryKey });

				const previousProjects = qc.getQueryData<SelectProject[]>(queryKey);

				const optimisticProject = {
					publicId: crypto.randomUUID(),
					name: input.name,
					description: input.description ?? null,
					position: generateKeyBetween(null, null),
					priority: input.priority || 0,
					startDate: input.startDate ? new Date(input.startDate) : null,
					dueDate: input.dueDate ? new Date(input.dueDate) : null,
					status: {
						publicId: input.statusPublicId,
						name: "", // We don't have this, but UI might handle it or we can try to guess from cache if we wanted
						colorCode: "",
						type: "not_started", // Default
					},
					createdBy: {
						name: "You", // Placeholder
						image: null,
					},
				};

				if (previousProjects) {
					const lastProject = previousProjects[previousProjects.length - 1];
					const position = generateKeyBetween(null, null);

					qc.setQueryData(queryKey, [
						...previousProjects,
						{
							...optimisticProject,
							position,
							status: {
								publicId: input.statusPublicId,
								name: "Loading...",
								colorCode: "#ccc",
							},
						},
					]);

					// We also need to find the status to improve the optimistic update if possible
					// But this is good enough for now.
				}

				return { previousProjects, queryKey };
			},
			onError: (err, _variables, context) => {
				if (context?.previousProjects) {
					qc.setQueryData(context.queryKey, context.previousProjects);
				}
				toast.error(err.message || "Failed to create project");
			},
			onSuccess: (data, _variables) => {
				qc.invalidateQueries({
					queryKey: orpc.project.allBySpaceId.key,
				});

				toast.success("Project created successfully");
				router.navigate({
					to: "/projects/$id",
					params: { id: data.publicId },
				});
			},
		}),
	);
}
