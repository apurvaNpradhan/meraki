import type {
	InferRouterInputs,
	InferRouterOutputs,
	RouterClient,
} from "@orpc/server";

import { publicProcedure } from "../index";
import { projectStatusRouter } from "./project-status";
import { spaceRouter } from "./space";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	space: spaceRouter,
	projectStatus: projectStatusRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;

export type RouterInputs = InferRouterInputs<AppRouter>;
export type RouterOutputs = InferRouterOutputs<AppRouter>;
