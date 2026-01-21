"use client";

import { IconCheck, IconLabelFilled, IconPlus } from "@tabler/icons-react";
import * as React from "react";
import {
	Tags,
	TagsContent,
	TagsEmpty,
	TagsGroup,
	TagsInput,
	TagsItem,
	TagsList,
	TagsTrigger,
} from "@/components/ui/tag";
import { cn } from "@/lib/utils";

export type Label = {
	id: string;
	publicId: string;
	name: string;
	colorCode: string;
};

interface LabelSelectorProps {
	labels: Label[];
	selectedLabels: Label[];
	onChange: (labels: Label[]) => void;
	className?: string;
	onCreateLabel?: (name: string) => void;
	placeholder?: string;
}

const LabelSelector = ({
	labels,
	selectedLabels,
	onCreateLabel,
	className,
	onChange,
	placeholder = "Search or create labels...",
}: LabelSelectorProps) => {
	const [newTag, setNewTag] = React.useState("");

	const handleSelect = (label: Label) => {
		const isSelected = selectedLabels.some((l) => l.id === label.id);
		if (isSelected) {
			onChange(selectedLabels.filter((l) => l.id !== label.id));
		} else {
			onChange([...selectedLabels, label]);
		}
	};

	const handleCreateLabel = (e: React.MouseEvent) => {
		e.preventDefault();
		if (newTag.trim() && onCreateLabel) {
			onCreateLabel(newTag.trim());
			setNewTag("");
		}
	};

	return (
		<Tags className={cn("max-w-[200px]", className)}>
			<TagsTrigger className="h-7 w-fit min-w-0 justify-start rounded-md px-2.5 py-0 hover:bg-muted/50">
				{selectedLabels.length === 0 ? (
					<div className="flex flex-row items-center gap-2 text-xs">
						<IconLabelFilled size={14} /> Labels
					</div>
				) : selectedLabels.length === 1 ? (
					<div className="flex items-center gap-1.5 overflow-hidden">
						<div
							className="size-2 shrink-0 rounded-full"
							style={{ backgroundColor: selectedLabels[0].colorCode }}
						/>
						<span className="truncate font-medium text-[11px]">
							{selectedLabels[0].name}
						</span>
					</div>
				) : (
					<div className="flex items-center gap-2">
						<div className="flex items-center -space-x-1.5">
							{selectedLabels.slice(0, 3).map((label) => (
								<div
									key={label.id}
									className="size-3.5 rounded-full border border-background shadow-xs ring-1 ring-border/10"
									style={{ backgroundColor: label.colorCode }}
								/>
							))}
						</div>
						<span className="font-medium text-[11px] leading-none">
							{selectedLabels.length} labels
						</span>
					</div>
				)}
			</TagsTrigger>
			<TagsContent
				align="start"
				className="overflow-hidden rounded-xl shadow-lg ring-1 ring-border/50"
			>
				<TagsInput
					onValueChange={(value) => setNewTag(value)}
					value={newTag}
					placeholder={placeholder}
					className="border-none focus:ring-0"
				/>
				<TagsList className="no-scrollbar max-h-64 overflow-y-auto">
					<TagsEmpty>
						{newTag.trim() ? (
							<button
								className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 font-medium text-xs hover:bg-muted/50"
								onClick={handleCreateLabel}
								type="button"
							>
								<IconPlus className="text-muted-foreground" size={14} />
								Create "{newTag}"
							</button>
						) : (
							<div className="px-3 py-2 text-muted-foreground text-xs">
								No labels found.
							</div>
						)}
					</TagsEmpty>
					<TagsGroup>
						{labels.map((label) => {
							const isSelected = selectedLabels.some((l) => l.id === label.id);
							return (
								<TagsItem
									key={label.id}
									onSelect={() => handleSelect(label)}
									value={label.name}
									className="flex cursor-pointer items-center px-2 py-1.5 transition-colors data-selected:bg-muted/80"
								>
									<div className="flex w-full items-center gap-3">
										<div
											className={cn(
												"flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-all",
												isSelected
													? "border-primary bg-primary text-primary-foreground shadow-xs"
													: "bg-background",
											)}
										>
											{isSelected && <IconCheck size={12} strokeWidth={3} />}
										</div>
										<div className="flex items-center gap-2">
											<div
												className="size-1.5 rounded-full"
												style={{ backgroundColor: label.colorCode }}
											/>
											<span className="font-medium text-[13px]">
												{label.name}
											</span>
										</div>
									</div>
								</TagsItem>
							);
						})}
					</TagsGroup>
				</TagsList>
			</TagsContent>
		</Tags>
	);
};

export { LabelSelector };
