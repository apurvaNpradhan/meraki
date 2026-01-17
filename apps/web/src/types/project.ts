import type { RouterOutputs } from "@meraki/api/routers/index";

export interface ProjectStatus {
	publicId: string;
	name: string;
	colorCode: string;
	type: "backlog" | "planned" | "in_progress" | "completed" | "canceled";
	position: string;
}

export type ProjectBySpaceItem = NonNullable<
	RouterOutputs["space"]["byId"]
>["projects"][number];

export type ProjectById = RouterOutputs["project"]["byId"];
