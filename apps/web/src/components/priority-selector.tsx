import { IconCheck } from "@tabler/icons-react";
import type React from "react";
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
import type { ProjectBySpaceItem } from "@/types/project";

interface PrioritySelectorProps {
	project?: ProjectBySpaceItem;
	onPriorityChange?: (priority: number) => void;
}

export function PrioritySelector({
	project,
	onPriorityChange,
}: PrioritySelectorProps) {
	const id = useId();
	const [open, setOpen] = useState<boolean>(false);
	const [value, setValue] = useState<number>(project?.priority ?? 0);

	const handlePriorityChange = (priority: string) => {
		const newPriority = Number.parseInt(priority, 10);
		setValue(newPriority);
		setOpen(false);

		if (onPriorityChange) {
			onPriorityChange(newPriority);
		}
	};
	useEffect(() => {
		setValue(project?.priority ?? 0);
	}, [project]);

	return (
		<div>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger>
					<Button
						id={id}
						className="flex items-center justify-center"
						size="icon"
						variant="ghost"
						role="combobox"
						aria-expanded={open}
					>
						{(() => {
							const selectedItem = priorities.find(
								(item) => item.value === value,
							);
							if (selectedItem) {
								const Icon = selectedItem.icon;
								return <Icon className="size-4 text-muted-foreground" />;
							}
							return null;
						})()}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-48 border-input p-0" align="start">
					<Command>
						<CommandInput placeholder="Set priority..." />
						<CommandList>
							<CommandEmpty>No priority found.</CommandEmpty>
							<CommandGroup>
								{priorities.map((item) => (
									<CommandItem
										key={item.value}
										value={item.value.toString()}
										onSelect={handlePriorityChange}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-2">
											<item.icon className="size-4 text-muted-foreground" />
											<span className="text-xs">{item.name}</span>
										</div>
										{value === item.value && (
											<IconCheck size={14} className="ml-auto" />
										)}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}

interface IconProps extends React.SVGProps<SVGSVGElement> {
	className?: string;
}

const NoPriorityIcon = ({ className, ...props }: IconProps) => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="currentColor"
		className={className}
		aria-label="No Priority"
		role="img"
		focusable="false"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<rect x="1.5" y="7.25" width="3" height="1.5" rx="0.5" opacity="0.9" />
		<rect x="6.5" y="7.25" width="3" height="1.5" rx="0.5" opacity="0.9" />
		<rect x="11.5" y="7.25" width="3" height="1.5" rx="0.5" opacity="0.9" />
	</svg>
);

const UrgentPriorityIcon = ({ className, ...props }: IconProps) => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="currentColor"
		className={className}
		aria-label="Urgent Priority"
		role="img"
		focusable="false"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<path d="M3 1C1.91067 1 1 1.91067 1 3V13C1 14.0893 1.91067 15 3 15H13C14.0893 15 15 14.0893 15 13V3C15 1.91067 14.0893 1 13 1H3ZM7 4L9 4L8.75391 8.99836H7.25L7 4ZM9 11C9 11.5523 8.55228 12 8 12C7.44772 12 7 11.5523 7 11C7 10.4477 7.44772 10 8 10C8.55228 10 9 10.4477 9 11Z" />
	</svg>
);

const HighPriorityIcon = ({ className, ...props }: IconProps) => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="currentColor"
		className={className}
		aria-label="High Priority"
		role="img"
		focusable="false"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<rect x="1.5" y="8" width="3" height="6" rx="1" />
		<rect x="6.5" y="5" width="3" height="9" rx="1" />
		<rect x="11.5" y="2" width="3" height="12" rx="1" />
	</svg>
);

const MediumPriorityIcon = ({ className, ...props }: IconProps) => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="currentColor"
		className={className}
		aria-label="Medium Priority"
		role="img"
		focusable="false"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<rect x="1.5" y="8" width="3" height="6" rx="1" />
		<rect x="6.5" y="5" width="3" height="9" rx="1" />
		<rect x="11.5" y="2" width="3" height="12" rx="1" fillOpacity="0.4" />
	</svg>
);

const LowPriorityIcon = ({ className, ...props }: IconProps) => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="currentColor"
		className={className}
		aria-label="Low Priority"
		role="img"
		focusable="false"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<rect x="1.5" y="8" width="3" height="6" rx="1" />
		<rect x="6.5" y="5" width="3" height="9" rx="1" fillOpacity="0.4" />
		<rect x="11.5" y="2" width="3" height="12" rx="1" fillOpacity="0.4" />
	</svg>
);

export interface Priority {
	id: string;
	name: string;
	icon: React.FC<React.SVGProps<SVGSVGElement>>;
	value: number;
}

export const priorities: Priority[] = [
	{ id: "no-priority", name: "No priority", value: 0, icon: NoPriorityIcon },
	{ id: "urgent", name: "Urgent", value: 4, icon: UrgentPriorityIcon },
	{ id: "high", name: "High", value: 3, icon: HighPriorityIcon },
	{ id: "medium", name: "Medium", value: 2, icon: MediumPriorityIcon },
	{ id: "low", name: "Low", value: 1, icon: LowPriorityIcon },
];
