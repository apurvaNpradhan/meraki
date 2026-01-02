export const starterFlow = [
	{
		name: "To Do",
		type: "not_started",
		position: "a",
		statuses: [
			{
				name: "To Do",
				color: "#e2e8f0", // slate-200
				position: "a",
				isDefault: true,
			},
		],
	},
	{
		name: "In Progress",
		type: "in_progress",
		position: "b",
		statuses: [
			{
				name: "In Progress",
				color: "#3b82f6", // blue-500
				position: "a",
				isDefault: false,
			},
		],
	},
	{
		name: "Done",
		type: "completed",
		position: "c",
		statuses: [
			{
				name: "Done",
				color: "#22c55e", // green-500
				position: "a",
				isDefault: false,
			},
		],
	},
];

export const projectManagementFlow = [
	{
		name: "Backlog",
		type: "backlog",
		position: "a",
		statuses: [
			{
				name: "Backlog",
				color: "#94a3b8", // slate-400
				position: "a",
				isDefault: true,
			},
		],
	},
	{
		name: "To Do",
		type: "not_started",
		position: "b",
		statuses: [
			{
				name: "To Do",
				color: "#e2e8f0", // slate-200
				position: "a",
				isDefault: false,
			},
		],
	},
	{
		name: "In Progress",
		type: "in_progress",
		position: "c",
		statuses: [
			{
				name: "In Progress",
				color: "#3b82f6", // blue-500
				position: "a",
				isDefault: false,
			},
			{
				name: "In Review",
				color: "#a855f7", // purple-500
				position: "b",
				isDefault: false,
			},
		],
	},
	{
		name: "Done",
		type: "completed",
		position: "d",
		statuses: [
			{
				name: "Done",
				color: "#22c55e", // green-500
				position: "a",
				isDefault: false,
			},
		],
	},
	{
		name: "Canceled",
		type: "canceled",
		position: "e",
		statuses: [
			{
				name: "Canceled",
				color: "#ef4444", // red-500
				position: "a",
				isDefault: false,
			},
		],
	},
];
