import type { RouterOutputs } from "@meraki/api/routers/index";

export type ProjectBySpaceItem = NonNullable<
	RouterOutputs["space"]["byId"]
>["projects"][number];
export type ProjectStatus = RouterOutputs["projectStatus"]["all"][number];
