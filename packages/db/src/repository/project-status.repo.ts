import { DEFAULT_PROJECT_STATUSES } from "@meraki/shared/constants";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "..";
import { projectStatuses } from "../schema/project-status";

export const createDefaults = async (args: {
	workspaceId: string;
	userId: string;
}) => {
	const result = await db
		.insert(projectStatuses)
		.values(
			DEFAULT_PROJECT_STATUSES.map((status) => ({
				...status,
				organizationId: args.workspaceId,
				createdBy: args.userId,
			})),
		)
		.returning();
	return result;
};

export const getAllByWorkspaceId = (workspaceId: string) => {
	return db.query.projectStatuses.findMany({
		columns: {
			publicId: true,
			name: true,
			description: true,
			colorCode: true,
			type: true,
			position: true,
		},
		where: and(
			eq(projectStatuses.organizationId, workspaceId),
			isNull(projectStatuses.deletedAt),
		),
		orderBy: (p, { asc }) => [asc(p.position)],
	});
};

export const getIdByPublicId = async (publicId: string) => {
	const status = await db.query.projectStatuses.findFirst({
		columns: {
			id: true,
			organizationId: true,
		},
		where: eq(projectStatuses.publicId, publicId),
	});
	return status;
};

export const getByPublicId = async (publicId: string, workspaceId: string) => {
	const status = await db.query.projectStatuses.findFirst({
		columns: {
			publicId: true,
			name: true,
			description: true,
			colorCode: true,
			type: true,
			position: true,
		},
		where: and(
			eq(projectStatuses.publicId, publicId),
			eq(projectStatuses.organizationId, workspaceId),
			isNull(projectStatuses.deletedAt),
		),
	});
	return status ?? null;
};

export const getLastPositionByWorkspaceId = async (workspaceId: string) => {
	const result = await db.query.projectStatuses.findFirst({
		columns: {
			position: true,
		},
		where: and(
			eq(projectStatuses.organizationId, workspaceId),
			isNull(projectStatuses.deletedAt),
		),
		orderBy: [desc(projectStatuses.position)],
	});
	return result ?? null;
};

export const create = async (input: {
	name: string;
	description?: string | null;
	colorCode: string;
	type: "backlog" | "planned" | "in_progress" | "completed" | "canceled";
	position: string;
	organizationId: string;
	createdBy: string;
}) => {
	const [result] = await db
		.insert(projectStatuses)
		.values({
			name: input.name,
			description: input.description,
			colorCode: input.colorCode,
			type: input.type,
			position: input.position,
			organizationId: input.organizationId,
			createdBy: input.createdBy,
		})
		.returning({
			publicId: projectStatuses.publicId,
			name: projectStatuses.name,
		});
	return result;
};

export const update = async (input: {
	publicId: string;
	name?: string;
	description?: string | null;
	colorCode?: string;
	type?: "backlog" | "planned" | "in_progress" | "completed" | "canceled";
	position?: string;
}) => {
	const [result] = await db
		.update(projectStatuses)
		.set({
			name: input.name,
			description: input.description,
			colorCode: input.colorCode,
			type: input.type,
			position: input.position,
		})
		.where(eq(projectStatuses.publicId, input.publicId))
		.returning({
			publicId: projectStatuses.publicId,
			name: projectStatuses.name,
		});
	return result;
};

export const softDelete = async (args: {
	statusId: bigint;
	deletedBy: string;
	deletedAt: Date;
}) => {
	const [result] = await db
		.update(projectStatuses)
		.set({
			deletedAt: args.deletedAt,
			deletedBy: args.deletedBy,
		})
		.where(eq(projectStatuses.id, args.statusId))
		.returning({
			publicId: projectStatuses.publicId,
			name: projectStatuses.name,
		});
	return result;
};

export const hardDelete = async (workspaceId: string) => {
	const result = await db
		.delete(projectStatuses)
		.where(eq(projectStatuses.organizationId, workspaceId));
	return result;
};

export const getProjectIdByPublicId = async (publicId: string) => {
	const result = await db.query.projectStatuses.findFirst({
		columns: {
			id: true,
		},
		where: eq(projectStatuses.publicId, publicId),
	});
	return result ?? null;
};
