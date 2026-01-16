import { ORPCError, type RouterClient } from "@orpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";
import { spaceRouter } from "./space";
import { TaskRouter } from "./task";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
	"image/png",
	"image/jpeg",
	"image/webp",
	"application/pdf",
];
export const appRouter = {
	task: TaskRouter,
	space: spaceRouter,
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session?.user,
		};
	}),
	upload: protectedProcedure
		.input(
			z.object({
				file: z
					.instanceof(File)
					.refine((file) => file.size > 0, "File is empty")
					.refine(
						(file) => file.size <= MAX_FILE_SIZE,
						`File size must be ≤ ${MAX_FILE_SIZE / 1024 / 1024}MB`,
					)
					.refine(
						(file) => ALLOWED_MIME_TYPES.includes(file.type),
						"Unsupported file type",
					),
			}),
		)
		.handler(async ({ context, input }) => {
			const { file } = input;

			if (!context.bucket) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Storage bucket not configured",
				});
			}
			const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
			const key = `${crypto.randomUUID()}-${safeName}`;
			let buffer: ArrayBuffer;
			try {
				buffer = await file.arrayBuffer();
			} catch {
				throw new ORPCError("BAD_REQUEST", {
					message: "Failed to read file contents",
				});
			}
			try {
				await context.bucket.put(key, buffer, {
					httpMetadata: {
						contentType: file.type,
					},
				});
			} catch (err) {
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "File upload failed",
					cause: err,
				});
			}

			return {
				key,
				url: `/storage/${key}`,
			};
		}),
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;

export type RouterInputs = InferRouterInputs<AppRouter>;
export type RouterOutputs = InferRouterOutputs<AppRouter>;
