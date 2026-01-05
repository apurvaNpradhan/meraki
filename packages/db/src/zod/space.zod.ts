import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";
import { spaces } from "../schema";

export const SelectSpace = createSelectSchema(spaces).omit({
	id: true,
	deletedBy: true,
	slug: true,
	organizationId: true,
	createdBy: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});
export const InsertSpace = createInsertSchema(spaces, {
	name: z.string().min(1, "Name is required").max(255, "Name is too long"),
}).omit({
	publicId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	deletedBy: true,
});
export const UpdateSpace = InsertSpace.partial();
