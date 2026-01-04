import { and, count, desc, eq, isNull } from "drizzle-orm";
import { db } from "..";
import { spaces } from "../schema/space";

export const getCount = async () => {
	const result = await db
		.select({ count: count() })
		.from(spaces)
		.where(isNull(spaces.deletedAt));
	return result[0]?.count ?? 0;
};

export const getAllByWorkspaceId = (workspaceId: string) => {
	return db.query.spaces.findMany({
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

export const getByPublicId = async (
	spacePublicId: string,
	workspaceId: string,
) => {
	const space = db.query.spaces.findFirst({
		columns: {
			publicId: true,
			name: true,
			description: true,
			slug: true,
			colorCode: true,
			icon: true,
		},
		with: {
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
			eq(spaces.publicId, spacePublicId),
			eq(spaces.organizationId, workspaceId),
			isNull(spaces.deletedAt),
		),
	});
	if (!space) return null;
	return space;
};

export const getBySlug = async (spaceSlug: string, workspaceId: string) => {
	const space = db.query.spaces.findFirst({
		columns: {
			publicId: true,
			name: true,
			description: true,
			slug: true,
			colorCode: true,
			icon: true,
		},
		with: {
			organization: {
				columns: {
					id: true,
				},
				with: {
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
			eq(spaces.slug, spaceSlug),
			eq(spaces.organizationId, workspaceId),
			isNull(spaces.deletedAt),
		),
	});
	if (!space) return null;
	return space;
};
export const getLastPositionByPublicId = (organizationId: string) => {
	const result = db.query.spaces.findFirst({
		columns: {
			position: true,
		},
		where: and(
			eq(spaces.organizationId, organizationId),
			isNull(spaces.deletedAt),
		),
		orderBy: [desc(spaces.position)],
	});
	return result ?? null;
};

export const create = async (spaceInput: {
	publicId?: string;
	name: string;
	description?: string;
	slug: string;
	colorCode: string;
	icon: string;
	position: string;
	organizationId: string;
	createdBy: string;
}) => {
	const [result] = await db
		.insert(spaces)
		.values({
			name: spaceInput.name,
			description: spaceInput.description,
			slug: spaceInput.slug,
			colorCode: spaceInput.colorCode,
			icon: spaceInput.icon,
			position: spaceInput.position,
			organizationId: spaceInput.organizationId,
			createdBy: spaceInput.createdBy,
		})
		.returning({
			id: spaces.id,
			publicId: spaces.publicId,
			name: spaces.name,
		});
	return result;
};

export const update = async (spaceInput: {
	name: string | undefined;
	slug: string | undefined;
	position: string | undefined;
	colorCode: string | undefined;
	icon: string | undefined;
	description: string | undefined;
	spacePublicId: string;
}) => {
	const [result] = await db
		.update(spaces)
		.set({
			name: spaceInput.name,
			slug: spaceInput.slug,
			position: spaceInput.position,
			colorCode: spaceInput.colorCode,
			icon: spaceInput.icon,
			description: spaceInput.description,
		})
		.where(eq(spaces.publicId, spaceInput.spacePublicId))
		.returning({
			publicId: spaces.publicId,
			name: spaces.name,
		});
	return result;
};

export const softDelete = async (args: {
	spaceId: bigint;
	deletedBy: string;
	deletedAt: Date;
}) => {
	const [result] = await db
		.update(spaces)
		.set({
			deletedAt: args.deletedAt,
			deletedBy: args.deletedBy,
		})
		.where(eq(spaces.id, args.spaceId))
		.returning({
			publicId: spaces.publicId,
			name: spaces.name,
		});
	return result;
};

export const isSlugUnique = async (args: {
	slug: string;
	workspaceId: string;
}) => {
	const space = await db.query.spaces.findFirst({
		columns: {
			slug: true,
		},
		where: and(
			eq(spaces.slug, args.slug),
			eq(spaces.organizationId, args.workspaceId),
			isNull(spaces.deletedAt),
		),
	});
	return space === undefined;
};
export const getWorkspaceAndSpaceIdBySpacePublicId = async (
	spacePublicId: string,
) => {
	const space = await db.query.spaces.findFirst({
		columns: {
			id: true,
			organizationId: true,
		},
		where: and(eq(spaces.publicId, spacePublicId), isNull(spaces.deletedAt)),
	});
	return space;
};

export const isSpaceSlugAvailable = async (
	spaceSlug: string,
	workspaceId: string,
) => {
	const space = await db.query.spaces.findFirst({
		columns: {
			slug: true,
		},
		where: and(
			eq(spaces.slug, spaceSlug),
			eq(spaces.organizationId, workspaceId),
			isNull(spaces.deletedAt),
		),
	});
	return space === undefined;
};

export const hardDelete = async (workspaceId: string) => {
	const result = await db
		.delete(spaces)
		.where(eq(spaces.organizationId, workspaceId));
	return result;
};
