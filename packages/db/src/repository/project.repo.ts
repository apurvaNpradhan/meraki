import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "..";
import { projects } from "../schema/project";

export const getProjectsBySpaceId = (
	spaceId: bigint,
	organizationId: string,
) => {
	return db.query.projects.findMany({
		where: and(
			eq(projects.spaceId, spaceId),
			eq(projects.organizationId, organizationId),
			isNull(projects.deletedAt),
		),
		with: {
			status: {
				columns: {
					publicId: true,
					name: true,
					colorCode: true,
					type: true,
				},
			},
			createdBy: {
				columns: {
					name: true,
					image: true,
				},
			},
		},
		orderBy: [desc(projects.createdAt)],
	});
};

export const getByPublicId = async (
	publicId: string,
	organizationId: string,
) => {
	const project = await db.query.projects.findFirst({
		where: and(
			eq(projects.publicId, publicId),
			eq(projects.organizationId, organizationId),
			isNull(projects.deletedAt),
		),
		with: {
			status: {
				columns: {
					publicId: true,
					name: true,
					colorCode: true,
					type: true,
				},
			},
			space: {
				columns: {
					publicId: true,
					name: true,
				},
			},
			createdBy: {
				columns: {
					name: true,
					image: true,
				},
			},
		},
	});
	return project ?? null;
};

export const create = async (input: {
	name: string;
	description?: string | null;
	statusId: bigint;
	spaceId: bigint;
	organizationId: string;
	position: string;
	startDate?: Date | null;
	dueDate?: Date | null;
	createdBy: string;
	priority: number;
}) => {
	const [result] = await db
		.insert(projects)
		.values({
			position: input.position,
			priority: input.priority,
			name: input.name,
			description: input.description,
			statusId: input.statusId,
			spaceId: input.spaceId,
			organizationId: input.organizationId,
			startDate: input.startDate,
			dueDate: input.dueDate,
			createdBy: input.createdBy,
		})
		.returning({
			publicId: projects.publicId,
			name: projects.name,
		});
	return result;
};

export const update = async (input: {
	publicId: string;
	name?: string;
	description?: string | null;
	statusId?: bigint;
	startDate?: Date | null;
	dueDate?: Date | null;
}) => {
	const [result] = await db
		.update(projects)
		.set({
			name: input.name,
			description: input.description,
			statusId: input.statusId,
			startDate: input.startDate,
			dueDate: input.dueDate,
		})
		.where(eq(projects.publicId, input.publicId))
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

export const getIdByPublicId = async (publicId: string) => {
	const project = await db.query.projects.findFirst({
		columns: {
			id: true,
			organizationId: true,
		},
		where: eq(projects.publicId, publicId),
	});
	return project;
};

export const getAllByWorkspaceId = (workspaceId: string) => {
	return db.query.projects.findMany({
		where: and(
			eq(projects.organizationId, workspaceId),
			isNull(projects.deletedAt),
		),
		with: {
			status: {
				columns: {
					name: true,
					colorCode: true,
					type: true,
				},
			},
			space: {
				columns: {
					name: true,
					publicId: true,
				},
			},
		},
		orderBy: [desc(projects.createdAt)],
	});
};

export const getLastProjectBySpaceId = async (spaceId: bigint) => {
	return db.query.projects.findFirst({
		where: and(eq(projects.spaceId, spaceId), isNull(projects.deletedAt)),
		orderBy: [desc(projects.createdAt)],
	});
};
