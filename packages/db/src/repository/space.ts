import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "..";
import { type InsertSpace, spaces, type UpdateSpace } from "../schema/space";
import type { InsertStatusGroupWithStatuses } from "../schema/status";
import { initializeStatuses } from "./status";

export const createSpace = async (data: InsertSpace) => {
	const [space] = await db.insert(spaces).values(data).returning();
	return space;
};

export const createSpaceWithStatuses = async (args: {
	data: InsertSpace;
	flow: "starter" | "project_management" | "custom";
	customData?: InsertStatusGroupWithStatuses[];
}) => {
	const space = await db.transaction(async (tx) => {
		const [space] = await tx.insert(spaces).values(args.data).returning();
		if (space) {
			await initializeStatuses(tx, space.id, {
				flow: args.flow,
				customData: args.customData,
			});
			return space;
		}
	});
	return space;
};
export const getSpaceById = async (args: {
	id: bigint;
	organizationId: string;
}) => {
	const space = await db.query.spaces.findFirst({
		where: and(
			eq(spaces.id, args.id),
			eq(spaces.organizationId, args.organizationId),
			isNull(spaces.deletedAt),
		),
		columns: {
			publicId: true,
			slug: true,
			name: true,
			description: true,
			position: true,
			colorCode: true,
			icon: true,
			createdAt: true,
			updatedAt: true,
			deletedAt: true,
		},
		with: {
			creator: {
				columns: {
					id: true,
					email: true,
				},
			},
			statuses: {
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
	return space;
};

export const getSpaceByPublicId = async (args: {
	publicId: string;
	organizationId: string;
}) => {
	const space = await db.query.spaces.findFirst({
		where: and(
			eq(spaces.publicId, args.publicId),
			eq(spaces.organizationId, args.organizationId),
			isNull(spaces.deletedAt),
		),
		columns: {
			id: true,
			publicId: true,
			slug: true,
			name: true,
			description: true,
			position: true,
			colorCode: true,
			icon: true,
			createdAt: true,
			updatedAt: true,
			deletedAt: true,
		},
		with: {
			creator: {
				columns: {
					id: true,
					email: true,
				},
			},
			statuses: {
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
	return space;
};

export const getSpaceBySlug = async (args: {
	organizationId: string;
	slug: string;
}) => {
	const space = await db.query.spaces.findFirst({
		where: and(
			eq(spaces.organizationId, args.organizationId),
			eq(spaces.slug, args.slug),
			isNull(spaces.deletedAt),
		),
		columns: {
			publicId: true,
			slug: true,
			name: true,
			description: true,
			position: true,
			colorCode: true,
			icon: true,
			createdAt: true,
			updatedAt: true,
			deletedAt: true,
		},
		with: {
			creator: {
				columns: {
					id: true,
					email: true,
				},
			},
			statuses: {
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
	return space;
};

export const getSpaces = async (args: { organizationId: string }) => {
	const allSpaces = await db.query.spaces.findMany({
		where: and(
			eq(spaces.organizationId, args.organizationId),
			isNull(spaces.deletedAt),
		),
		orderBy: [asc(spaces.position)],
		columns: {
			publicId: true,
			slug: true,
			name: true,
			description: true,
			position: true,
			colorCode: true,
			icon: true,
			createdAt: true,
			updatedAt: true,
			deletedAt: true,
		},
		with: {
			creator: {
				columns: {
					id: true,
					email: true,
				},
			},
			statuses: {
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
	return allSpaces;
};

export const updateSpace = async (args: {
	id: bigint;
	organizationId: string;
	data: UpdateSpace;
}) => {
	const [updated] = await db
		.update(spaces)
		.set({ ...args.data, updatedAt: new Date() })
		.where(
			and(
				eq(spaces.id, args.id),
				eq(spaces.organizationId, args.organizationId),
			),
		)
		.returning();
	return updated;
};

export const softDeleteSpace = async (args: {
	id: bigint;
	organizationId: string;
}) => {
	const [deleted] = await db
		.update(spaces)
		.set({ deletedAt: new Date() })
		.where(
			and(
				eq(spaces.id, args.id),
				eq(spaces.organizationId, args.organizationId),
			),
		)
		.returning();
	return deleted;
};

export const getLastSpacePosition = async (args: {
	organizationId: string;
}) => {
	const [space] = await db
		.select({
			position: spaces.position,
		})
		.from(spaces)
		.where(
			and(
				eq(spaces.organizationId, args.organizationId),
				isNull(spaces.deletedAt),
			),
		)
		.orderBy(desc(spaces.position))
		.limit(1);
	return space?.position ?? null;
};
