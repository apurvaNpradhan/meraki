export const DEFAULT_PROJECT_STATUSES = [
	{
		name: "Backlog",
		type: "backlog",
		position: "a",
		colorCode: "#94a3b8",
		description: null,
	},
	{
		name: "Planned",
		type: "planned",
		position: "b",
		colorCode: "#e2e8f0", // slate-200
		description: null,
	},
	{
		name: "In Progress",
		type: "in_progress",
		position: "c",
		colorCode: "#3b82f6", // blue-500
		description: null,
	},
	{
		name: "Completed",
		type: "completed",
		position: "d",
		colorCode: "#22c55e", // green-500
		description: null,
	},
	{
		name: "Canceled",
		type: "canceled",
		position: "e",
		colorCode: "#ef4444", // red-500
		description: null,
	},
] as const;
