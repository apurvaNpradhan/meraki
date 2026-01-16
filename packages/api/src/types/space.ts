import {
	InsertSpaceSchema,
	UpdateSpaceSchema,
} from "@meraki/db/lib/zod-schemas";
import type z from "zod";
export const InsertSpaceInput = InsertSpaceSchema.omit({
	createdBy: true,
	organizationId: true,
	position: true,
}).extend({});

export const UpdateSpaceInput = UpdateSpaceSchema.omit({
	createdBy: true,
	updatedAt: true,
});

export type InsertSpaceType = z.infer<typeof InsertSpaceInput>;
export type UpdateSpaceType = z.infer<typeof UpdateSpaceInput>;
