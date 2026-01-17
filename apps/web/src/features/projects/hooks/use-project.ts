import * as reactQuery from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { generateKeyBetween } from "fractional-indexing";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";

export function useProjects() {
	return reactQuery.useInfiniteQuery(
		orpc.project.list.infiniteOptions({
			input: (pageParam) => ({
				limit: 20,
				cursor: pageParam as string | undefined,
			}),
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			initialPageParam: undefined as string | undefined,
		}),
	);
}

export function useProject(publicId: string) {
	return reactQuery.useSuspenseQuery(
		orpc.project.byId.queryOptions({
			input: {
				projectPublicId: publicId,
			},
		}),
	);
}

export function useUpdateProject({
	spacePublicId,
}: {
	spacePublicId?: string;
}) {
	const queryClient = reactQuery.useQueryClient();

	return reactQuery.useMutation(
		orpc.project.update.mutationOptions({
			onMutate: async (newProject) => {
				// 1. Optimistically update the list
				const queryKey = orpc.project.list.queryKey({
					input: { limit: 20 },
				});
				await queryClient.cancelQueries({ queryKey });

				const previousProjects = queryClient.getQueryData(queryKey);

				if (previousProjects) {
					queryClient.setQueryData(queryKey, (old: any) => {
						if (!old) return old;

						return {
							...old,
							pages: old.pages.map((page: any) => ({
								...page,
								items: page.items.map((item: any) => {
									if (item.publicId === newProject.projectPublicId) {
										const updatedItem = { ...item, ...newProject };
										if (newProject.projectStatusPublicId) {
											updatedItem.status = {
												...(item.status ?? {}),
												publicId: newProject.projectStatusPublicId,
											};
										}
										return updatedItem;
									}
									return item;
								}),
							})),
						};
					});
				}

				const singleProjectQueryKey = orpc.project.byId.queryKey({
					input: { projectPublicId: newProject.projectPublicId },
				});
				await queryClient.cancelQueries({ queryKey: singleProjectQueryKey });
				const previousSingleProject = queryClient.getQueryData(
					singleProjectQueryKey,
				);

				queryClient.setQueryData(singleProjectQueryKey, (old) => {
					if (!old) return old;

					return {
						...old,
						...newProject,
						projectStatus: newProject.projectStatusPublicId
							? { publicId: newProject.projectStatusPublicId }
							: old.projectStatus,
					};
				});

				let previousSpace: any;
				if (spacePublicId) {
					const spaceQueryKey = orpc.space.byId.queryKey({
						input: {
							spaceId: spacePublicId,
						},
					});
					await queryClient.cancelQueries({ queryKey: spaceQueryKey });
					previousSpace = queryClient.getQueryData(spaceQueryKey);

					if (previousSpace) {
						queryClient.setQueryData(spaceQueryKey, (old) => {
							if (!old) return old;
							return {
								...old,
								projects: (old.projects ?? [])
									.map((p) => {
										if (p.publicId === newProject.projectPublicId) {
											const updatedP = {
												...p,
												...newProject,
											};
											if (newProject.projectStatusPublicId) {
												updatedP.projectStatus = {
													...(p.projectStatus ?? {}),
													publicId: newProject.projectStatusPublicId,
												};
											}
											return updatedP;
										}
										return p;
									})
									.sort((a, b) => {
										if (a.position < b.position) return -1;
										if (a.position > b.position) return 1;
										return 0;
									}),
							};
						});
					}
				}

				return { previousProjects, previousSingleProject, previousSpace };
			},
			onError: (_err, newProject, context) => {
				queryClient.setQueryData(
					orpc.project.list.queryKey({ input: { limit: 20 } }),
					context?.previousProjects,
				);
				queryClient.setQueryData(
					orpc.project.byId.queryKey({
						input: { projectPublicId: newProject.projectPublicId },
					}),
					context?.previousSingleProject,
				);
				if (spacePublicId && context?.previousSpace) {
					queryClient.setQueryData(
						orpc.space.byId.queryKey({
							input: { spaceId: spacePublicId },
						}),
						context.previousSpace,
					);
				}
			},
			onSettled: (_data, _error, variables) => {
				queryClient.invalidateQueries({
					queryKey: orpc.project.list.queryKey({ input: { limit: 20 } }),
				});
				queryClient.invalidateQueries({
					queryKey: orpc.project.byId.queryKey({
						input: { projectPublicId: variables.projectPublicId },
					}),
				});
				if (spacePublicId) {
					queryClient.invalidateQueries({
						queryKey: orpc.space.byId.queryKey({
							input: { spaceId: spacePublicId },
						}),
					});
				}
			},
		}),
	);
}

export function useCreateProject({ spacePublicId }: { spacePublicId: string }) {
	const _navigate = useNavigate();
	const queryClient = reactQuery.useQueryClient();

	return reactQuery.useMutation(
		orpc.project.create.mutationOptions({
			onMutate: async (input) => {
				const queryKey = orpc.project.list.queryKey({
					input: { limit: 20 },
				});
				await queryClient.cancelQueries({ queryKey });

				const spaceQueryKey = orpc.space.byId.queryKey({
					input: {
						spaceId: spacePublicId,
					},
				});
				await queryClient.cancelQueries({ queryKey: spaceQueryKey });

				const previousProjects = queryClient.getQueryData(queryKey) as any;
				const previousSpace = queryClient.getQueryData(spaceQueryKey);

				const optimisticProject = {
					publicId: crypto.randomUUID(),
					name: input.name,
					position: "not-set",
					colorCode: input.colorCode,
					icon: input.icon,
					description: input.description ?? "",
					summary: input.summary,
					priority: input.priority ?? 0,
					startDate: input.startDate ?? null,
					updatedAt: new Date(),
					targetDate: input.targetDate ?? null,
					projectStatus: { publicId: input.projectStatusPublicId },
					space: previousSpace
						? {
								name: previousSpace.name,
								publicId: previousSpace.publicId,
								colorCode: previousSpace.colorCode,
								icon: previousSpace.icon,
							}
						: {
								name: "",
								publicId: spacePublicId,
								colorCode: "",
								icon: "",
							},
				};

				if (previousProjects?.pages) {
					let lastProject = null;
					// Find the last project in the last non-empty page
					for (let i = previousProjects.pages.length - 1; i >= 0; i--) {
						const page = previousProjects.pages[i];
						if (page.items && page.items.length > 0) {
							lastProject = page.items[page.items.length - 1];
							break;
						}
					}

					const position = generateKeyBetween(
						lastProject?.position ?? null,
						null,
					);
					const newProjectWithPosition = { ...optimisticProject, position };

					queryClient.setQueryData(queryKey, (old: any) => {
						if (!old || !old.pages || old.pages.length === 0) {
							return {
								pages: [{ items: [newProjectWithPosition] }],
								pageParams: [undefined],
							};
						}

						const newPages = [...old.pages];
						const lastPageIndex = newPages.length - 1;
						const lastPage = newPages[lastPageIndex];

						newPages[lastPageIndex] = {
							...lastPage,
							items: [...(lastPage.items || []), newProjectWithPosition],
						};

						return {
							...old,
							pages: newPages,
						};
					});
				}

				if (previousSpace) {
					queryClient.setQueryData(spaceQueryKey, (old) => {
						if (!old) return old;
						return {
							...old,
							projects: [...(old.projects ?? []), optimisticProject],
						};
					});
				}

				return { previousProjects, previousSpace };
			},
			onError: (err, _variables, context) => {
				if (context?.previousProjects) {
					queryClient.setQueryData(
						orpc.project.list.queryKey({ input: { limit: 20 } }),
						context.previousProjects,
					);
				}
				if (context?.previousSpace) {
					queryClient.setQueryData(
						orpc.space.byId.queryKey({
							input: {
								spaceId: spacePublicId,
							},
						}),
						context.previousSpace,
					);
				}
				toast.error(err.message || "Failed to create project");
			},
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.project.list.queryKey({ input: { limit: 20 } }),
				});
				queryClient.invalidateQueries({
					queryKey: orpc.space.byId.queryKey({
						input: {
							spaceId: spacePublicId,
						},
					}),
				});
				toast.success("Project created successfully");
			},
		}),
	);
}

export function useDeleteProject() {
	const queryClient = reactQuery.useQueryClient();
	return reactQuery.useMutation(
		orpc.project.delete.mutationOptions({
			onMutate: async ({ projectPublicId: publicId }) => {
				const queryKey = orpc.project.list.queryKey({
					input: { limit: 20 },
				});
				await queryClient.cancelQueries({ queryKey });

				const previousProjects = queryClient.getQueryData(queryKey);

				if (previousProjects) {
					queryClient.setQueryData(queryKey, (old: any) => {
						if (!old || !old.pages) return old;
						return {
							...old,
							pages: old.pages.map((page: any) => ({
								...page,
								items: page.items.filter(
									(item: any) => item.publicId !== publicId,
								),
							})),
						};
					});
				}

				return { previousProjects };
			},
			onError: (err, _variables, context) => {
				if (context?.previousProjects) {
					queryClient.setQueryData(
						orpc.project.list.queryKey({ input: { limit: 20 } }),
						context.previousProjects,
					);
				}
				toast.error(err.message || "Failed to delete project");
			},
			onSuccess: ({ deletedPublicId }) => {
				queryClient.invalidateQueries({
					queryKey: orpc.project.list.queryKey({ input: { limit: 20 } }),
				});
				toast.success("Project deleted successfully");
			},
		}),
	);
}
