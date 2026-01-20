import { and, desc, eq, isNull } from "drizzle-orm";
import type z from "zod";
import { db } from "..";
import type {
	InsertProjectLabel,
	UpdateProjectLabel,
} from "../lib/zod-schemas";
import { projectLabelMappings, projectLabels } from "../schema/project";

export const getAllBySpaceId = (spaceId: bigint) => {
	return db.query.projectLabels.findMany({
		columns: {
			publicId: true,
			name: true,
			colorCode: true,
			updatedAt: true,
		},
		where: and(
			eq(projectLabels.spaceId, spaceId),
			isNull(projectLabels.deletedAt),
		),
		orderBy: [desc(projectLabels.createdAt)],
	});
};

export const getIdByPublicId = async (publicId: string) => {
	const label = await db.query.projectLabels.findFirst({
		columns: {
			id: true,
		},
		where: eq(projectLabels.publicId, publicId),
	});
	return label;
};

export const create = async (args: {
	input: z.infer<typeof InsertProjectLabel>;
}) => {
	const { input } = args;
	const [result] = await db
		.insert(projectLabels)
		.values({
			name: input.name,
			colorCode: input.colorCode,
			spaceId: input.spaceId,
			createdBy: input.createdBy,
		})
		.returning({
			id: projectLabels.id,
			publicId: projectLabels.publicId,
			name: projectLabels.name,
		});
	return result;
};

export const bulkCreate = async (
	labels: z.infer<typeof InsertProjectLabel>[],
) => {
	return db.insert(projectLabels).values(labels).returning({
		id: projectLabels.id,
		publicId: projectLabels.publicId,
		name: projectLabels.name,
	});
};

export const update = async (args: {
	id: bigint;
	input: z.infer<typeof UpdateProjectLabel>;
}) => {
	const { id, input } = args;
	const [result] = await db
		.update(projectLabels)
		.set({
			name: input.name,
			colorCode: input.colorCode,
		})
		.where(eq(projectLabels.id, id))
		.returning({
			publicId: projectLabels.publicId,
			name: projectLabels.name,
		});
	return result;
};

export const softDelete = async (args: { id: bigint; deletedBy: string }) => {
	const [result] = await db
		.update(projectLabels)
		.set({
			deletedAt: new Date(),
			deletedBy: args.deletedBy,
		})
		.where(eq(projectLabels.id, args.id))
		.returning({
			publicId: projectLabels.publicId,
		});
	return result;
};

export const createDefaultLabels = async (args: {
	spaceId: bigint;
	userId: string;
}) => {
	const defaultLabels = [
		{ name: "Frontend", colorCode: "#59C2FF" },
		{ name: "Backend", colorCode: "#C2D94C" },
		{ name: "Design", colorCode: "#FF7EB6" },
		{ name: "Bug", colorCode: "#FF595E" },
		{ name: "Feature", colorCode: "#9ADF7F" },
	];

	const labelInputs = defaultLabels.map((l) => ({
		...l,
		spaceId: args.spaceId,
		createdBy: args.userId,
	}));

	return bulkCreate(labelInputs);
};

export const setProjectLabels = async (args: {
	projectId: bigint;
	labelIds: bigint[];
}) => {
	const { projectId, labelIds } = args;

	await db.transaction(async (tx) => {
		await tx
			.delete(projectLabelMappings)
			.where(eq(projectLabelMappings.projectId, projectId));

		if (labelIds.length > 0) {
			await tx.insert(projectLabelMappings).values(
				labelIds.map((labelId) => ({
					projectId,
					labelId,
				})),
			);
		}
	});
};
