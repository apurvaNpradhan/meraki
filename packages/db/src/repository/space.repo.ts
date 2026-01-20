import { and, count, countDistinct, desc, eq, isNull, sql } from "drizzle-orm";
import type z from "zod";
import { db } from "..";
import type { InsertSpaceSchema, UpdateSpaceSchema } from "../lib/zod-schemas";
import { projectLabels, projects, tasks } from "../schema";
import { spaces } from "../schema/space";

export const getSpaceDetails = async (workspaceId: string, spaceId: bigint) => {
	const result = await db
		.select({
			publicId: spaces.publicId,
			name: spaces.name,
			description: spaces.description,
			colorCode: spaces.colorCode,
			icon: spaces.icon,
			createdAt: spaces.createdAt,
			updatedAt: spaces.updatedAt,
			deletedAt: spaces.deletedAt,
			deletedBy: spaces.deletedBy,
			createdBy: spaces.createdBy,
			projectCount: countDistinct(projects.id),
			projectLabelCount: countDistinct(projectLabels.id),
			taskCount: countDistinct(
				sql`CASE WHEN ${tasks.deletedAt}  IS NULL AND ${tasks.isArchived} IS FALSE THEN ${tasks.id} END`,
			),
		})
		.from(spaces)
		.leftJoin(projects, eq(spaces.id, projects.spaceId))
		.leftJoin(tasks, eq(projects.id, tasks.projectId))
		.leftJoin(projectLabels, eq(projectLabels.spaceId, spaces.id))
		.where(
			and(
				eq(spaces.organizationId, workspaceId),
				eq(spaces.id, spaceId),
				isNull(spaces.deletedAt),
			),
		)
		.groupBy(spaces.id);

	return result[0];
};

export const getSpaceCount = async (workspaceId: string) => {
	const result = await db
		.select({ count: count() })
		.from(spaces)
		.where(
			and(isNull(spaces.deletedAt), eq(spaces.organizationId, workspaceId)),
		);
	return result[0]?.count ?? 0;
};

export const getAllByWorkspaceId = (workspaceId: string) => {
	const result = db.query.spaces.findMany({
		columns: {
			publicId: true,
			colorCode: true,
			icon: true,
			position: true,
			name: true,
		},
		where: and(
			eq(spaces.organizationId, workspaceId),
			isNull(spaces.deletedAt),
		),
		orderBy: (p, { asc }) => [asc(p.position)],
	});
	return result ?? null;
};

export const getIdByPublicId = async (spacePublicId: string) => {
	const space = await db.query.spaces.findFirst({
		columns: {
			id: true,
		},
		where: eq(spaces.publicId, spacePublicId),
	});
	return space;
};

export const getById = async (spaceId: bigint, workspaceId: string) => {
	const space = db.query.spaces.findFirst({
		columns: {
			publicId: true,
			name: true,
			description: true,
			colorCode: true,
			icon: true,
			position: true,
		},
		with: {
			projects: {
				columns: {
					publicId: true,
					name: true,
					description: true,
					position: true,
					colorCode: true,
					icon: true,
					priority: true,
					startDate: true,
					targetDate: true,
					updatedAt: true,
				},

				with: {
					projectStatus: {
						columns: {
							publicId: true,
						},
					},
				},

				orderBy: (p, { asc }) => [asc(p.position)],
			},
			organization: {
				columns: {
					id: true,
				},
				with: {
					projectStatuses: {
						columns: {
							publicId: true,
							name: true,
							description: true,
							position: true,
							colorCode: true,
						},
						orderBy: (p, { asc }) => [asc(p.position)],
					},
					members: {
						columns: {
							id: true,
						},
						with: {
							user: {
								columns: {
									name: true,
									email: true,
									image: true,
								},
							},
						},
					},
				},
			},
		},
		where: and(
			eq(spaces.id, spaceId),
			eq(spaces.organizationId, workspaceId),
			isNull(spaces.deletedAt),
		),
	});
	return space;
};

export const getLastPositionByWorkspaceId = async (workspaceId: string) => {
	const space = db.query.spaces.findFirst({
		columns: {
			position: true,
		},
		where: and(
			eq(spaces.organizationId, workspaceId),
			isNull(spaces.deletedAt),
		),
		orderBy: [desc(spaces.position)],
	});
	return space;
};

export const create = async (args: {
	input: z.infer<typeof InsertSpaceSchema>;
}) => {
	const { input } = args;
	const [result] = await db
		.insert(spaces)
		.values({
			name: input.name,
			description: input.description,
			colorCode: input.colorCode,
			icon: input.icon,
			position: input.position,
			organizationId: input.organizationId,
			createdBy: input.createdBy,
		})
		.returning({
			id: spaces.id,
			publicId: spaces.publicId,
			name: spaces.name,
		});
	return result;
};

export const update = async (args: {
	spaceId: bigint;
	input: z.infer<typeof UpdateSpaceSchema>;
}) => {
	const { spaceId, input } = args;
	const [result] = await db
		.update(spaces)
		.set({
			name: input.name,
			position: input.position,
			colorCode: input.colorCode,
			icon: input.icon,
			description: input.description,
		})
		.where(eq(spaces.id, spaceId))
		.returning({
			publicId: spaces.publicId,
			name: spaces.name,
		});
	return result;
};

export const softDelete = async (args: {
	spaceId: bigint;
	deletedBy: string;
}) => {
	const { spaceId, deletedBy } = args;
	const [result] = await db
		.update(spaces)
		.set({
			deletedAt: new Date(),
			deletedBy: deletedBy,
		})
		.where(eq(spaces.id, spaceId))
		.returning({
			publicId: spaces.publicId,
		});
	return result;
};

export const hardDelete = async (args: { spaceId: bigint }) => {
	const { spaceId } = args;
	const [result] = await db
		.delete(spaces)
		.where(eq(spaces.id, spaceId))
		.returning({
			publicId: spaces.publicId,
		});
	return result;
};
