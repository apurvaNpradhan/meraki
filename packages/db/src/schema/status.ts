import { sql } from "drizzle-orm";
import {
	bigint,
	index,
	pgEnum,
	pgTable,
	text,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { timestamps } from "../utils/timestamps";
import { user } from "./auth";
import { projects } from "./project";

export const statusesTypes = [
	"not-started",
	"active",
	"done",
	"closed",
] as const;
export type statusType = (typeof statusesTypes)[number];
export const statusTypeEnum = pgEnum("status_type", statusesTypes);

export const statuses = pgTable(
	"statuses",
	{
		id: bigint("id", { mode: "bigint" })
			.primaryKey()
			.generatedAlwaysAsIdentity(),
		publicId: uuid("public_id")
			.notNull()
			.unique()
			.default(sql`uuid_generate_v7()`),
		projectId: bigint("project_id", { mode: "bigint" })
			.notNull()
			.references(() => projects.id),
		createdBy: text("created_by")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		deletedBy: text("deleted_by").references(() => user.id, {
			onDelete: "set null",
		}),
		name: varchar("name", { length: 255 }).notNull(),
		colorCode: varchar("color_code", { length: 255 }).notNull(),
		type: statusTypeEnum("type").notNull().default("not-started"),
		position: text("position").notNull(),
		...timestamps,
	},
	(table) => [index("statuses_position_idx").on(table.position)],
).enableRLS();
