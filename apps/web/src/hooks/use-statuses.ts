import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc, queryClient } from "@/utils/orpc";

export const useStatuses = (spaceId: bigint) => {
	return useQuery(orpc.status.all.queryOptions({ input: { spaceId } }));
};

export const useCreateStatus = () => {
	return useMutation(
		orpc.status.create.mutationOptions({
			onMutate: async (data) => {
				const { spaceId } = data;
				await queryClient.cancelQueries({
					queryKey: orpc.status.all.queryKey({ input: { spaceId } }),
				});

				const previousGroups = queryClient.getQueryData(
					orpc.status.all.queryKey({ input: { spaceId } }),
				);
				if (previousGroups) {
					queryClient.setQueryData(
						orpc.status.all.queryKey({ input: { spaceId } }),
						(old) => {
							if (!old) return old;
							return old.map((group) => {
								if (group.id === data.groupId) {
									return {
										...group,
										statuses: [
											...group.statuses,
											{
												...data,
												id: BigInt(Date.now()),
												publicId: crypto.randomUUID(),
												isDefault: false,
											},
										],
									};
								}
								return group;
							});
						},
					);
				}

				return { previousGroups };
			},
			onError: (err, variables, context) => {
				if (context?.previousGroups) {
					queryClient.setQueryData(
						orpc.status.all.queryKey({ input: { spaceId: variables.spaceId } }),
						context.previousGroups,
					);
				}
				toast.error(err.message || "Failed to create status");
			},
			onSuccess: (_data, variables) => {
				queryClient.invalidateQueries({
					queryKey: orpc.status.all.queryKey({
						input: { spaceId: variables.spaceId },
					}),
				});
				toast.success("Status created successfully");
			},
		}),
	);
};

export const useUpdateStatus = () => {
	return useMutation(
		orpc.status.update.mutationOptions({
			onMutate: async (input) => {
				const { publicId, spaceId, data } = input;
				await queryClient.cancelQueries({
					queryKey: orpc.status.all.queryKey({ input: { spaceId } }),
				});

				const previousGroups = queryClient.getQueryData(
					orpc.status.all.queryKey({ input: { spaceId } }),
				);

				if (previousGroups) {
					queryClient.setQueryData(
						orpc.status.all.queryKey({ input: { spaceId } }),
						(old) => {
							if (!old) return old;
							return old.map((group) => ({
								...group,
								statuses: group.statuses.map((status) =>
									status.publicId === publicId
										? { ...status, ...data }
										: status,
								),
							}));
						},
					);
				}

				return { previousGroups };
			},
			onError: (err, variables, context) => {
				if (context?.previousGroups) {
					queryClient.setQueryData(
						orpc.status.all.queryKey({ input: { spaceId: variables.spaceId } }),
						context.previousGroups,
					);
				}
				toast.error(err.message || "Failed to update status");
			},
			onSuccess: (_data, variables) => {
				queryClient.invalidateQueries({
					queryKey: orpc.status.all.queryKey({
						input: { spaceId: variables.spaceId },
					}),
				});
				toast.success("Status updated successfully");
			},
		}),
	);
};

export const useDeleteStatus = () => {
	return useMutation(
		orpc.status.delete.mutationOptions({
			onMutate: async ({ publicId, spaceId }) => {
				await queryClient.cancelQueries({
					queryKey: orpc.status.all.queryKey({ input: { spaceId } }),
				});

				const previousGroups = queryClient.getQueryData<any[]>(
					orpc.status.all.queryKey({ input: { spaceId } }),
				);

				if (previousGroups) {
					queryClient.setQueryData(
						orpc.status.all.queryKey({ input: { spaceId } }),
						(old) => {
							if (!old) return old;
							return old.map((group) => ({
								...group,
								statuses: group.statuses.filter(
									(status) => status.publicId !== publicId,
								),
							}));
						},
					);
				}

				return { previousGroups };
			},
			onError: (err, variables, context) => {
				if (context?.previousGroups) {
					queryClient.setQueryData(
						orpc.status.all.queryKey({ input: { spaceId: variables.spaceId } }),
						context.previousGroups,
					);
				}
				toast.error(err.message || "Failed to delete status");
			},
			onSuccess: (_data, variables) => {
				queryClient.invalidateQueries({
					queryKey: orpc.status.all.queryKey({
						input: { spaceId: variables.spaceId },
					}),
				});
				toast.success("Status deleted successfully");
			},
		}),
	);
};
