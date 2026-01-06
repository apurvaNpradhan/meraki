import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";
import { statuses, statusesTypes } from "../schema/status";

export const SelectStatus = createSelectSchema(statuses).omit({
	id: true,
	projectId: true,
	createdBy: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	deletedBy: true,
});
export const InsertStatus = createInsertSchema(statuses, {
	name: z.string().min(1, "Name is required").max(255, "Name is too long"),
	colorCode: z
		.string()
		.min(1, "Color code is required")
		.max(255, "Color code is too long"),
	type: z.enum(statusesTypes),
	position: z
		.string()
		.min(1, "Position is required")
		.max(255, "Position is too long"),
}).omit({
	publicId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	deletedBy: true,
});
export const UpdateStatus = InsertStatus.partial();
