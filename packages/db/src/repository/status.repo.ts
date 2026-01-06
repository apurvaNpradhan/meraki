import { and, desc, eq, isNull } from "drizzle-orm";
import type z from "zod";
import { db } from "..";
import { statuses } from "../schema/status";
import type { InsertStatus, UpdateStatus } from "../zod/status.zod";

export const getAllByProjectId = async (projectId: bigint) => {
	return db.query.statuses.findMany({
		columns: {
			publicId: true,
			name: true,
			colorCode: true,
			type: true,
			position: true,
		},
		where: and(eq(statuses.projectId, projectId), isNull(statuses.deletedAt)),
		orderBy: (s, { asc }) => [asc(s.position)],
	});
};

export const getIdByPublicId = async (publicId: string) => {
	const status = await db.query.statuses.findFirst({
		columns: {
			id: true,
			projectId: true,
		},
		with: {
			project: {
				columns: {
					organizationId: true,
				},
			},
		},
		where: eq(statuses.publicId, publicId),
	});
	return status;
};

export const getByPublicId = async (publicId: string) => {
	const status = await db.query.statuses.findFirst({
		columns: {
			publicId: true,
			name: true,
			colorCode: true,
			type: true,
			position: true,
		},
		where: and(eq(statuses.publicId, publicId), isNull(statuses.deletedAt)),
	});
	return status ?? null;
};

export const getLastPositionByProjectId = async (projectId: bigint) => {
	const result = await db.query.statuses.findFirst({
		columns: {
			position: true,
		},
		where: and(eq(statuses.projectId, projectId), isNull(statuses.deletedAt)),
		orderBy: [desc(statuses.position)],
	});
	return result ?? null;
};

export const create = async (
	input: z.infer<typeof InsertStatus> & {
		projectId: bigint;
		createdBy: string;
	},
) => {
	const [result] = await db
		.insert(statuses)
		.values({
			name: input.name,
			colorCode: input.colorCode,
			type: input.type,
			position: input.position,
			projectId: input.projectId,
			createdBy: input.createdBy,
		})
		.returning({
			id: statuses.id,
			publicId: statuses.publicId,
			name: statuses.name,
		});
	return result;
};
export const bulkCreate = async (input: z.infer<typeof InsertStatus>[]) => {
	const result = await db.insert(statuses).values(input).returning({
		id: statuses.id,
		publicId: statuses.publicId,
		name: statuses.name,
	});
};

export const update = async (args: {
	statusId: bigint;
	input: z.infer<typeof UpdateStatus>;
}) => {
	const { statusId, input } = args;
	const [result] = await db
		.update(statuses)
		.set({
			name: input.name,
			colorCode: input.colorCode,
			type: input.type,
			position: input.position,
		})
		.where(eq(statuses.id, statusId))
		.returning({
			publicId: statuses.publicId,
			name: statuses.name,
		});
	return result;
};

export const softDelete = async (args: {
	statusId: bigint;
	deletedBy: string;
	deletedAt: Date;
}) => {
	const [result] = await db
		.update(statuses)
		.set({
			deletedAt: args.deletedAt,
			deletedBy: args.deletedBy,
		})
		.where(eq(statuses.id, args.statusId))
		.returning({
			publicId: statuses.publicId,
			name: statuses.name,
		});
	return result;
};

export const hardDelete = async (projectId: bigint) => {
	const result = await db
		.delete(statuses)
		.where(eq(statuses.projectId, projectId));
	return result;
};
