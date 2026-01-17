import { and, count, desc, eq, isNull, lt } from "drizzle-orm";
import type z from "zod";
import { db } from "..";
import type { InsertProject, UpdateProject } from "../lib/zod-schemas";
import { projects } from "../schema/project";

export const getCount = async () => {
	const result = await db
		.select({ count: count() })
		.from(projects)
		.where(isNull(projects.deletedAt));
	return result[0]?.count ?? 0;
};

export const getAllByWorkspaceId = (workspaceId: string) => {
	return db.query.projects.findMany({
		columns: {
			publicId: true,
			colorCode: true,
			icon: true,
			position: true,
			name: true,
			priority: true,
			startDate: true,
			targetDate: true,
		},
		with: {
			space: {
				columns: {
					publicId: true,
					name: true,
					icon: true,
					colorCode: true,
				},
			},
		},
		where: and(
			eq(projects.organizationId, workspaceId),
			isNull(projects.deletedAt),
		),
		orderBy: (p, { asc }) => [asc(p.position)],
	});
};

export const getIdByPublicId = async (projectPublicId: string) => {
	const project = await db.query.projects.findFirst({
		columns: {
			id: true,
		},
		where: eq(projects.publicId, projectPublicId),
	});
	return project;
};

export const getById = async (projectId: bigint, workspaceId: string) => {
	const project = db.query.projects.findFirst({
		columns: {
			publicId: true,
			name: true,
			description: true,
			summary: true,
			priority: true,
			startDate: true,
			targetDate: true,
			position: true,
			colorCode: true,
			icon: true,
			updatedAt: true,
		},
		with: {
			organization: {
				columns: {
					id: true,
				},
			},
			projectStatus: {
				columns: {
					publicId: true,
				},
			},
			space: {
				columns: {
					publicId: true,
					name: true,
					icon: true,
					colorCode: true,
				},
			},
		},
		where: and(
			eq(projects.id, projectId),
			eq(projects.organizationId, workspaceId),
			isNull(projects.deletedAt),
		),
	});
	if (!project) return null;
	return project;
};

export const getLastPositionByWorkspaceId = (organizationId: string) => {
	const result = db.query.projects.findFirst({
		columns: {
			position: true,
		},
		where: and(
			eq(projects.organizationId, organizationId),
			isNull(projects.deletedAt),
		),
		orderBy: [desc(projects.position)],
	});
	return result ?? null;
};
export const getLastPositionBySpaceId = (spaceId: bigint) => {
	const result = db.query.projects.findFirst({
		columns: {
			position: true,
		},
		where: and(eq(projects.spaceId, spaceId), isNull(projects.deletedAt)),
		orderBy: [desc(projects.position)],
	});
	return result ?? null;
};

export const create = async (args: {
	input: z.infer<typeof InsertProject>;
}) => {
	const { input } = args;
	const [result] = await db
		.insert(projects)
		.values({
			name: input.name,
			description: input.description,
			summary: input.summary,
			priority: input.priority || 0,
			startDate: input.startDate,
			targetDate: input.targetDate,
			colorCode: input.colorCode,
			icon: input.icon,
			position: input.position,
			organizationId: input.organizationId,
			createdBy: input.createdBy,
			spaceId: input.spaceId,
			statusId: input.statusId,
		})
		.returning({
			id: projects.id,
			publicId: projects.publicId,
			name: projects.name,
		});
	return result;
};

export const update = async (args: {
	input: z.infer<typeof UpdateProject>;
	projectId: bigint;
}) => {
	const { projectId, input } = args;
	const [result] = await db
		.update(projects)
		.set({
			name: input.name,
			description: input.description,
			summary: input.summary,
			priority: input.priority,
			startDate: input.startDate,
			targetDate: input.targetDate,
			position: input.position,
			colorCode: input.colorCode,
			icon: input.icon,
			statusId: input.statusId,
		})
		.where(eq(projects.id, projectId))
		.returning({
			publicId: projects.publicId,
			name: projects.name,
		});
	return result;
};

export const softDelete = async (args: {
	projectId: bigint;
	deletedBy: string;
	deletedAt: Date;
}) => {
	const [result] = await db
		.update(projects)
		.set({
			deletedAt: args.deletedAt,
			deletedBy: args.deletedBy,
		})
		.where(eq(projects.id, args.projectId))
		.returning({
			publicId: projects.publicId,
			name: projects.name,
		});
	return result;
};

export const getWorkspaceAndProjectIdByPublicId = async (
	projectPublicId: string,
) => {
	const project = await db.query.projects.findFirst({
		columns: {
			id: true,
			organizationId: true,
		},
		where: and(
			eq(projects.publicId, projectPublicId),
			isNull(projects.deletedAt),
		),
	});
	return project;
};
export const getProjectIdByPublicId = async (projectPublicId: string) => {
	const project = await db.query.projects.findFirst({
		columns: {
			id: true,
		},
		where: and(
			eq(projects.publicId, projectPublicId),
			isNull(projects.deletedAt),
		),
	});
	return project;
};

export const hardDelete = async (workspaceId: string) => {
	const result = await db
		.delete(projects)
		.where(eq(projects.organizationId, workspaceId));
	return result;
};

export const list = async (args: {
	organizationId: string;
	limit: number;
	cursor?: string;
}) => {
	const { organizationId, limit, cursor } = args;

	let cursorId: bigint | undefined;

	if (cursor) {
		const project = await db.query.projects.findFirst({
			columns: { id: true },
			where: eq(projects.publicId, cursor),
		});
		cursorId = project?.id;
	}

	const items = await db.query.projects.findMany({
		columns: {
			publicId: true,
			name: true,
			description: true,
			summary: true,
			priority: true,
			startDate: true,
			targetDate: true,
			position: true,
			colorCode: true,
			icon: true,
			updatedAt: true,
		},
		with: {
			space: {
				columns: {
					publicId: true,
					name: true,
					icon: true,
					colorCode: true,
				},
			},
			projectStatus: {
				columns: {
					publicId: true,
				},
			},
		},
		where: and(
			eq(projects.organizationId, organizationId),
			isNull(projects.deletedAt),
			cursorId ? lt(projects.id, cursorId) : undefined,
		),
		orderBy: [desc(projects.id)],
		limit: limit + 1,
	});

	let nextCursor: string | undefined;
	if (items.length > limit) {
		const nextItem = items.pop();
		nextCursor = nextItem?.publicId;
	}

	return {
		items,
		nextCursor,
	};
};
