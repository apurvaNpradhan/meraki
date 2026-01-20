import * as reactQuery from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";

export function useTasks() {
	return reactQuery.useQuery(orpc.task.all.queryOptions({}));
}

export function useCreateTask({
	projectPublicId,
}: {
	projectPublicId?: string;
}) {
	const queryClient = reactQuery.useQueryClient();

	return reactQuery.useMutation(
		orpc.task.create.mutationOptions({
			onSuccess: () => {
				toast.success("Task created successfully");
				queryClient.invalidateQueries({
					queryKey: orpc.task.all.queryKey({}),
				});
				if (projectPublicId) {
					queryClient.invalidateQueries({
						queryKey: orpc.project.byId.queryKey({
							input: {
								projectPublicId,
							},
						}),
					});
					queryClient.invalidateQueries({
						queryKey: orpc.task.allByProjectId.queryKey({
							input: {
								projectPublicId,
							},
						}),
					});
					queryClient.invalidateQueries({
						queryKey: orpc.project.getOverview.queryKey({
							input: {
								projectPublicId,
							},
						}),
					});
				}
			},
			onError: () => {
				toast.error("Failed to create task");
			},
		}),
	);
}

export function useUpdateTask({
	projectPublicId,
}: {
	projectPublicId?: string;
}) {
	const queryClient = reactQuery.useQueryClient();

	return reactQuery.useMutation(
		orpc.task.update.mutationOptions({
			onMutate: async (variables) => {
				const allTasksQueryKey = orpc.task.all.queryKey({});
				let projectTasksQueryKey = null;

				if (projectPublicId) {
					projectTasksQueryKey = orpc.task.allByProjectId.queryKey({
						input: { projectPublicId },
					});
				}

				await queryClient.cancelQueries({ queryKey: allTasksQueryKey });
				if (projectTasksQueryKey) {
					await queryClient.cancelQueries({ queryKey: projectTasksQueryKey });
				}

				const previousAllTasks = queryClient.getQueryData(allTasksQueryKey);
				const previousProjectTasks = projectTasksQueryKey
					? queryClient.getQueryData(projectTasksQueryKey)
					: null;

				queryClient.setQueryData(allTasksQueryKey, (old) => {
					if (!old) return old;
					return old.map((t) =>
						t.publicId === variables.taskId
							? {
									...t,
									...variables.input,
									status: variables.input.statusPublicId
										? { publicId: variables.input.statusPublicId, name: "" }
										: t.status,
								}
							: t,
					);
				});

				if (projectTasksQueryKey) {
					queryClient.setQueryData(projectTasksQueryKey, (old) => {
						if (!old) return old;
						return old.map((t) =>
							t.publicId === variables.taskId
								? {
										...t,
										...variables.input,
										status: variables.input.statusPublicId
											? { publicId: variables.input.statusPublicId, name: "" }
											: t.status,
									}
								: t,
						);
					});
				}

				return { previousAllTasks, previousProjectTasks };
			},
			onSettled: (_data, _error, _variables) => {
				queryClient.invalidateQueries({
					queryKey: orpc.task.all.queryKey({}),
				});
				if (projectPublicId) {
					queryClient.invalidateQueries({
						queryKey: orpc.task.allByProjectId.queryKey({
							input: { projectPublicId },
						}),
					});
					queryClient.invalidateQueries({
						queryKey: orpc.project.getOverview.queryKey({
							input: { projectPublicId },
						}),
					});
				}
			},
			onError: (_err, _variables, context) => {
				if (context?.previousAllTasks) {
					queryClient.setQueryData(
						orpc.task.all.queryKey({}),
						context.previousAllTasks,
					);
				}
				if (context?.previousProjectTasks && projectPublicId) {
					queryClient.setQueryData(
						orpc.task.allByProjectId.queryKey({ input: { projectPublicId } }),
						context.previousProjectTasks,
					);
				}
				toast.error("Failed to update task");
			},
		}),
	);
}

export function useDeleteTask({
	projectPublicId,
}: {
	projectPublicId?: string;
}) {
	const queryClient = reactQuery.useQueryClient();

	return reactQuery.useMutation(
		orpc.task.softDelete.mutationOptions({
			onMutate: async (variables) => {
				const allTasksQueryKey = orpc.task.all.queryKey({});
				let projectTasksQueryKey = null;

				if (projectPublicId) {
					projectTasksQueryKey = orpc.task.allByProjectId.queryKey({
						input: { projectPublicId },
					});
				}

				await queryClient.cancelQueries({ queryKey: allTasksQueryKey });
				if (projectTasksQueryKey) {
					await queryClient.cancelQueries({ queryKey: projectTasksQueryKey });
				}

				const previousAllTasks = queryClient.getQueryData(allTasksQueryKey);
				const previousProjectTasks = projectTasksQueryKey
					? queryClient.getQueryData(projectTasksQueryKey)
					: null;

				queryClient.setQueryData(allTasksQueryKey, (old) => {
					if (!old) return old;
					return old.filter((t) => t.publicId !== variables.taskId);
				});

				if (projectTasksQueryKey) {
					queryClient.setQueryData(projectTasksQueryKey, (old) => {
						if (!old) return old;
						return old.filter((t) => t.publicId !== variables.taskId);
					});
				}

				return { previousAllTasks, previousProjectTasks };
			},
			onSuccess: () => {
				toast.success("Task deleted successfully", {
					action: {
						label: "Undo",
						onClick: () => {
							// TODO: Implement undo logic if backend supports it
						},
					},
				});
			},
			onSettled: () => {
				queryClient.invalidateQueries(orpc.task.all.queryOptions({}));
				if (projectPublicId) {
					queryClient.invalidateQueries(
						orpc.project.byId.queryOptions({ input: { projectPublicId } }),
					);
					queryClient.invalidateQueries(
						orpc.task.allByProjectId.queryOptions({
							input: { projectPublicId },
						}),
					);
					queryClient.invalidateQueries(
						orpc.project.getOverview.queryOptions({
							input: { projectPublicId },
						}),
					);
				}
			},
			onError: (_err, _variables, context) => {
				if (context?.previousAllTasks) {
					queryClient.setQueryData(
						orpc.task.all.queryKey({}),
						context.previousAllTasks,
					);
				}
				if (context?.previousProjectTasks && projectPublicId) {
					queryClient.setQueryData(
						orpc.task.allByProjectId.queryKey({ input: { projectPublicId } }),
						context.previousProjectTasks,
					);
				}
				toast.error("Failed to delete task");
			},
		}),
	);
}
