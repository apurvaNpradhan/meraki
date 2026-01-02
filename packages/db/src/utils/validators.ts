import { z } from "zod";

export const nameSchema = z
	.string()
	.min(2, "Name is too short")
	.max(100, "Name is too long")
	.trim();

export const titleSchema = z.string().min(1).max(150).trim();

export const descriptionSchema = z.string().max(500).trim().optional();

export const slugSchema = z
	.string()
	.min(1)
	.max(120)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");

export const hexColorSchema = z
	.string()
	.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color");
