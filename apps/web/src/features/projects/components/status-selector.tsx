import {
	IconCheck,
	IconCircle,
	IconCircleCheckFilled,
	IconCircleDashed,
	IconCircleHalf2,
	IconCircleXFilled,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useUpdateProject } from "@/features/projects/hooks/use-project";
import { cn } from "@/lib/utils";
import type { ProjectBySpaceItem } from "@/types/project";
import { orpc } from "@/utils/orpc";

interface StatusSelectorProps {
	project?: ProjectBySpaceItem;
	showLabel?: boolean;
	// statuses: ProjectStatus[];
	projectPublicId?: string;
	spacePublicId?: string;
	className?: string;
	readOnly?: boolean;
	selectedStatusId?: string;
	onStatusChange?: (statusId: string) => void;
	size?: "default" | "sm" | "lg" | "icon" | "icon-xs";
}
export const getStatusIcon = (
	type: string,
	color: string,
	className?: string,
	size = 16,
) => {
	const props = { size, style: { color }, className };
	switch (type) {
		case "backlog":
			return <IconCircleDashed {...props} />;
		case "planned":
			return <IconCircle {...props} />;
		case "in_progress":
			return <IconCircleHalf2 {...props} />;
		case "completed":
			return <IconCircleCheckFilled {...props} />;
		case "canceled":
			return <IconCircleXFilled {...props} />;
		default:
			return <IconCircle {...props} />;
	}
};
export function StatusSelector({
	project,
	showLabel = false,
	projectPublicId,
	spacePublicId,
	className,
	readOnly = false,
	selectedStatusId,
	onStatusChange,
	size = "sm",
}: StatusSelectorProps) {
	const id = useId();
	const [open, setOpen] = useState<boolean>(false);
	const [currentStatusId, setCurrentStatusId] = useState<string | undefined>(
		selectedStatusId ?? project?.projectStatus?.publicId,
	);
	const updateProject = useUpdateProject({
		spacePublicId: spacePublicId ?? "",
	});

	const { data: statuses } = useQuery(orpc.projectStatus.all.queryOptions());

	useEffect(() => {
		if (selectedStatusId) {
			setCurrentStatusId(selectedStatusId);
		} else if (project) {
			setCurrentStatusId(project.projectStatus?.publicId);
		}
	}, [project, selectedStatusId]);

	const handleStatusChange = (statusId: string) => {
		setCurrentStatusId(statusId);
		setOpen(false);

		if (onStatusChange) {
			onStatusChange(statusId);
		}

		const idToUpdate = projectPublicId ?? project?.publicId;

		if (idToUpdate && spacePublicId) {
			const newStatus = statuses?.find((s) => s.publicId === statusId);
			if (newStatus) {
				updateProject.mutate({
					projectPublicId: idToUpdate,
					projectStatusPublicId: newStatus.publicId,
				});
			}
		}
	};

	const currentStatus = statuses?.find((s) => s.publicId === currentStatusId);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<Button
						id={id}
						variant="ghost"
						size={size}
						role="combobox"
						aria-expanded={open}
						className={cn(!currentStatus && "text-muted-foreground", className)}
						disabled={readOnly}
					/>
				}
			>
				{currentStatus ? (
					<div className="flex items-center gap-2">
						{getStatusIcon(
							currentStatus.type,
							currentStatus.colorCode,
							undefined,
							size === "default" ? 20 : 16,
						)}
						{showLabel && (
							<span className="truncate font-semibold">
								{currentStatus.name}
							</span>
						)}
					</div>
				) : (
					<span className="text-xs">Select Status</span>
				)}
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0" align="start">
				<Command>
					<CommandInput placeholder="Set status..." />
					<CommandList>
						<CommandEmpty>No status found.</CommandEmpty>
						<CommandGroup>
							{statuses?.map((item) => (
								<CommandItem
									key={item.publicId}
									value={item.publicId}
									keywords={[item.name]}
									onSelect={() => handleStatusChange(item.publicId)}
									className="flex cursor-pointer items-center gap-2"
								>
									{getStatusIcon(item.type, item.colorCode)}
									<span>{item.name}</span>
									{currentStatusId === item.publicId && (
										<IconCheck size={16} className="ml-auto opacity-100" />
									)}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
