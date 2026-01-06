import type { statusType } from "@meraki/db/schema";
import { IconCheck, IconLayout } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Template {
	id: string;
	name: string;
	description?: string;
	statuses: {
		name: string;
		colorCode: string;
		type: statusType;
		position: string;
	}[];
}

export const getTemplates = (): Template[] => [
	{
		id: "starter",
		name: "Kanban Starter",
		description: "A simple workflow to get you started.",
		statuses: [
			{
				name: "Todo",
				colorCode: "#94a3b8", // slate-400
				type: "not-started",
				position: "a",
			},
			{
				name: "In Progress",
				colorCode: "#3b82f6", // blue-500
				type: "active",
				position: "b",
			},
			{
				name: "Done",
				colorCode: "#22c55e", // green-500
				type: "done",
				position: "c",
			},
		],
	},
	{
		id: "software",
		name: "Software Dev",
		description: "Track bugs, features, and deployments.",
		statuses: [
			{
				name: "Backlog",
				colorCode: "#64748b",
				type: "not-started",
				position: "a",
			},
			{
				name: "In Progress",
				colorCode: "#3b82f6", // blue-500
				type: "active",
				position: "b",
			},
			{
				name: "In Review",
				colorCode: "#eab308", // yellow-500
				type: "active",
				position: "c",
			},
			{
				name: "Done",
				colorCode: "#22c55e", // green-500
				type: "done",
				position: "d",
			},
		],
	},
	{
		id: "linear",
		name: "Linear Style",
		description: "Productivity focused linear workflow.",
		statuses: [
			{
				name: "Triage",
				colorCode: "#ef4444", // red-500
				type: "not-started",
				position: "a",
			},
			{
				name: "Todo",
				colorCode: "#f97316", // orange-500
				type: "not-started",
				position: "b",
			},
			{
				name: "In Progress",
				colorCode: "#eab308", // yellow-500
				type: "active",
				position: "c",
			},
			{
				name: "Done",
				colorCode: "#22c55e", // green-500
				type: "done",
				position: "d",
			},
			{
				name: "Canceled",
				colorCode: "#3f3f46", // zinc-700
				type: "closed",
				position: "e",
			},
		],
	},
];

interface TemplateProjectsProps {
	currentTemplate: Template | null;
	setCurrentTemplate: (template: Template | null) => void;
	showTemplates: boolean;
}

export const TemplateProjects = ({
	currentTemplate,
	setCurrentTemplate,
	showTemplates,
}: TemplateProjectsProps) => {
	const templates = getTemplates();

	if (!showTemplates) return null;

	return (
		<div className="mt-4 space-y-1">
			{templates.map((template) => {
				const isSelected = currentTemplate?.id === template.id;

				return (
					<button
						key={template.id}
						type="button"
						onClick={() => setCurrentTemplate(isSelected ? null : template)}
						className={cn(
							"w-full rounded-md border px-3 py-2 text-left transition",
							"hover:bg-muted/50",
							isSelected ? "border-primary bg-primary/5" : "border-border",
						)}
					>
						<div className="flex items-center justify-between gap-4">
							<div className="flex flex-col">
								<span className="font-medium text-sm">{template.name}</span>
								{template.description && (
									<span className="text-muted-foreground text-xs">
										{template.description}
									</span>
								)}
							</div>

							<div className="flex items-center gap-2">
								{template.statuses.map((status) => (
									<span
										key={status.name}
										className="h-2 w-2 rounded-full"
										style={{ backgroundColor: status.colorCode }}
										title={status.name}
									/>
								))}
							</div>
						</div>
					</button>
				);
			})}
		</div>
	);
};
