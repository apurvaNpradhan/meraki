import { sql } from "drizzle-orm";
import {
	bigint,
	bigserial,
	index,
	integer,
	pgTable,
	text,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import type z from "zod";
import { timestamps } from "../utils/timestamps";
import { nameSchema, slugSchema } from "../utils/validators";
import { organization, user } from "./auth";

export const spaces = pgTable(
	"space",
	{
		id: bigint("id", { mode: "bigint" })
			.primaryKey()
			.generatedAlwaysAsIdentity(),
		publicId: uuid("public_id")
			.notNull()
			.unique()
			.default(sql`uuid_generate_v7()`),
		createdBy: text("created_by")
			.notNull()
			.references(() => user.id),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		name: varchar("name", { length: 255 }).notNull(),
		description: text("description"),
		slug: varchar("slug", { length: 255 }).notNull(),
		position: varchar("position", { length: 32 }).notNull(),
		colorCode: varchar("color_code", { length: 255 }).notNull(),
		icon: varchar("icon", { length: 255 }).notNull(),
		...timestamps,
	},
	(table) => [
		index("space_organizationId_idx").on(table.organizationId),
		index("space_position_idx").on(table.organizationId, table.position),
		uniqueIndex("unique_slug_per_workspace")
			.on(table.organizationId, table.slug)
			.where(sql`${table.deletedAt} IS NULL`),
		index("space_createdBy_idx").on(table.createdBy),
	],
);
export const SelectSpace = createSelectSchema(spaces).omit({
	id: true,
	organizationId: true,
});
export const InsertSpace = createInsertSchema(spaces, {
	name: nameSchema,
	slug: slugSchema,
}).omit({
	publicId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});
export const UpdateSpace = createUpdateSchema(spaces).omit({
	publicId: true,
	createdBy: true,
	organizationId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
});
export type SelectSpace = z.infer<typeof SelectSpace>;
export type InsertSpace = z.infer<typeof InsertSpace>;
export type UpdateSpace = z.infer<typeof UpdateSpace>;
