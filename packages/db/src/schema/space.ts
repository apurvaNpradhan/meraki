import { sql } from "drizzle-orm";
import {
	bigint,
	index,
	pgTable,
	text,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { organization, user } from "../schema/auth";
import { timestamps } from "../utils/timestamps";

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
		name: varchar("name", { length: 255 }).notNull(),
		description: text("description"),
		position: varchar("position", { length: 32 }).notNull(),
		colorCode: varchar("color_code", { length: 255 }).notNull(),
		icon: varchar("icon", { length: 255 }).notNull(),
		createdBy: uuid("created_by")
			.notNull()
			.references(() => user.id),
		organizationId: uuid("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		deletedBy: uuid("deleted_by").references(() => user.id, {
			onDelete: "set null",
		}),

		...timestamps,
	},
	(table) => [
		index("space_organizationId_idx").on(table.organizationId),
		index("space_createdBy_idx").on(table.createdBy),
	],
).enableRLS();
