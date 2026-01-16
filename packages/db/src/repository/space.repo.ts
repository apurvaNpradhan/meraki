import { and, count, desc, eq, isNull } from "drizzle-orm";
import type z from "zod";
import { db } from "..";
import type { InsertSpaceSchema, UpdateSpaceSchema } from "../lib/zod-schemas";
import { spaces } from "../schema/space";

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
