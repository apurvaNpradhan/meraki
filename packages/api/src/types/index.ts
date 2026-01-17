export * from "./project";
export * from "./space";
export * from "./task";

import type { RouterInputs, RouterOutputs } from "../routers/index";

export type NewSpaceInput = RouterInputs["space"]["create"];
export type UpdateSpaceInput = RouterInputs["space"]["update"];
export type GetSpaceByIdOutput = RouterOutputs["space"]["byId"];
