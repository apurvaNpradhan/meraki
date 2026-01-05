//Spaces

import { InsertSpace, SelectSpace, UpdateSpace } from "@meraki/db/zod";
import z from "zod";

export const SpaceInsertInput = InsertSpace.omit({
	organizationId: true,
	createdBy: true,
	slug: true,
	position: true,
});

export type SpaceInsertInput = z.infer<typeof SpaceInsertInput>;

export const SpaceUpdateInput = UpdateSpace.omit({
	organizationId: true,
	createdBy: true,
}).extend({
	spacePublicId: z.string(),
});

export type SpaceUpdateInput = z.infer<typeof SpaceUpdateInput>;

export const Space = SelectSpace;
export type Space = z.infer<typeof Space>;
