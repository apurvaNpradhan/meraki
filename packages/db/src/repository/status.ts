import { and, asc, eq } from "drizzle-orm";
import { db } from "..";
import { projectManagementFlow, starterFlow } from "../data/status-constants";
import {
	type InsertStatus,
	type InsertStatusGroup,
	type InsertStatusGroupWithStatuses,
	statuses,
	statusGroups,
	type UpdateStatus,
	type UpdateStatusGroup,
} from "../schema/status";
import type { Transaction } from "../types/transactions";

export const getGroupsBySpaceId = async (spaceId: bigint) => {
	const groups = await db.query.statusGroups.findMany({
		where: eq(statusGroups.spaceId, spaceId),
		orderBy: asc(statusGroups.position),
		columns: {
			publicId: true,
			name: true,
			type: true,
			position: true,
		},
		with: {
			statuses: {
				orderBy: asc(statuses.position),
				columns: {
					publicId: true,
					name: true,
					color: true,
					position: true,
					isDefault: true,
				},
			},
		},
	});
	return groups;
};

export const createStatusGroup = async (
	data: InsertStatusGroup & { spaceId: bigint },
) => {
	const [group] = await db.insert(statusGroups).values(data).returning();
	return group;
};

export const updateStatusGroup = async (
	id: bigint,
	spaceId: bigint,
	data: UpdateStatusGroup,
) => {
	const [group] = await db
		.update(statusGroups)
		.set(data)
		.where(and(eq(statusGroups.id, id), eq(statusGroups.spaceId, spaceId)))
		.returning();
	return group;
};

export const deleteStatusGroup = async (id: bigint, spaceId: bigint) => {
	const [group] = await db
		.delete(statusGroups)
		.where(and(eq(statusGroups.id, id), eq(statusGroups.spaceId, spaceId)))
		.returning();
	return group;
};

export const createStatus = async (
	data: InsertStatus & { spaceId: bigint; groupId: bigint },
) => {
	const [status] = await db.insert(statuses).values(data).returning();
	return status;
};

export const updateStatus = async (
	id: bigint,
	spaceId: bigint,
	data: UpdateStatus,
) => {
	const [status] = await db
		.update(statuses)
		.set(data)
		.where(and(eq(statuses.id, id), eq(statuses.spaceId, spaceId)))
		.returning();
	return status;
};

export const deleteStatus = async (id: bigint, spaceId: bigint) => {
	const [status] = await db
		.delete(statuses)
		.where(and(eq(statuses.id, id), eq(statuses.spaceId, spaceId)))
		.returning();
	return status;
};

export const initializeStatuses = async (
	tx: Transaction,
	spaceId: bigint,
	options: {
		flow?: "starter" | "project_management" | "custom";
		customData?: InsertStatusGroupWithStatuses[];
	} = {},
) => {
	const { flow = "starter", customData } = options;

	let selectedFlow: InsertStatusGroupWithStatuses[] = starterFlow;

	if (flow === "custom" && customData) {
		selectedFlow = customData;
	} else if (flow === "project_management") {
		selectedFlow = projectManagementFlow;
	}

	const groups = [];
	for (const group of selectedFlow) {
		const [newGroup] = await tx
			.insert(statusGroups)
			.values({
				spaceId,
				name: group.name,
				type: group.type,
				position: group.position,
			})
			.returning();

		if (newGroup) {
			groups.push(newGroup);
			if (group.statuses.length > 0) {
				await tx.insert(statuses).values(
					group.statuses.map((status) => ({
						spaceId,
						groupId: newGroup.id,
						...status,
					})),
				);
			}
		}
	}
	return groups;
};

export const getStatusIdByPublicId = async (publicId: string) => {
	const status = await db.query.statuses.findFirst({
		columns: {
			id: true,
		},
		where: eq(statuses.publicId, publicId),
	});
	return status?.id;
};
