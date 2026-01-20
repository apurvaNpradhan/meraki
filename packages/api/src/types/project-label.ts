import {
	InsertProjectLabel,
	SelectProjectLabel,
	UpdateProjectLabel,
} from "@meraki/db/lib/zod-schemas";
import z from "zod";

export const ProjectLabelInsertInput = InsertProjectLabel.omit({
	createdBy: true,
	spaceId: true,
}).extend({
	spacePublicId: z.string(),
});

export type ProjectLabelInsertInput = z.infer<typeof ProjectLabelInsertInput>;

export const ProjectLabelUpdateInput = UpdateProjectLabel.omit({
	createdBy: true,
}).extend({
	projectLabelPublicId: z.string(),
});

export type ProjectLabelUpdateInput = z.infer<typeof ProjectLabelUpdateInput>;

export const ProjectLabel = SelectProjectLabel.omit({});
export type ProjectLabel = z.infer<typeof ProjectLabel>;
