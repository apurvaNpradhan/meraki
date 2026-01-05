import { Space } from "@meraki/api/types/model";
import type z from "zod";

const SidebarSpaceSchema = Space.pick({
	name: true,
	colorCode: true,
	icon: true,
	position: true,
	publicId: true,
});
export type SidebarSpace = z.infer<typeof SidebarSpaceSchema>;
