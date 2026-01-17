export interface ProjectStatus {
	publicId: string;
	name: string;
	colorCode: string;
	type: "backlog" | "planned" | "in_progress" | "completed" | "canceled";
	position: string;
}

export interface ProjectBySpaceItem {
	publicId: string;
	name: string;
	summary?: string | null;
	description?: string | null;
	icon: string;
	colorCode: string;
	priority: number;
	position: string;
	projectStatus: ProjectStatus;
	startDate?: string | null;
	targetDate?: string | null;
}
