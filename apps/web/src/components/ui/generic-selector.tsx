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
import { cn } from "@/lib/utils";

export interface SelectorItem<T> {
	id: string;
	name: string;
	icon: React.FC<React.SVGProps<SVGSVGElement>>;
	value: T;
	color?: string;
}

interface GenericSelectorProps<T> {
	items: SelectorItem<T>[];
	value: T;
	onValueChange?: (value: T) => void;
	showLabel?: boolean;
	placeholder?: string;
	className?: string;
	size?: "default" | "sm" | "lg" | "icon" | "icon-xs";
}

export function GenericSelector<T>({
	items,
	value,
	onValueChange,
	showLabel = false,
	placeholder = "Select...",
	className,
	size = "sm",
}: GenericSelectorProps<T>) {
	const id = useId();
	const [open, setOpen] = useState<boolean>(false);
	const [internalValue, setInternalValue] = useState<T>(value);

	const handleSelect = (newValue: T) => {
		setInternalValue(newValue);
		setOpen(false);
		onValueChange?.(newValue);
	};

	useEffect(() => {
		setInternalValue(value);
	}, [value]);

	const selectedItem = items.find((item) => item.value === internalValue);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<Button
						id={id}
						variant="ghost"
						size={size}
						className={cn("flex w-full gap-2 px-2", className)}
						role="combobox"
						onClick={(e) => e.stopPropagation()}
						aria-expanded={open}
					>
						{selectedItem ? (
							<>
								<selectedItem.icon
									className={cn(
										size === "default" || size === "lg" ? "size-5" : "size-4",
										"text-muted-foreground",
									)}
								/>
								{showLabel && (
									<span
										className={cn(
											"font-medium",
											size === "default" || size === "lg"
												? "text-base"
												: "text-xs",
										)}
									>
										{selectedItem.name}
									</span>
								)}
							</>
						) : (
							<span
								className={cn(
									"text-muted-foreground",
									size === "default" || size === "lg" ? "text-base" : "text-xs",
								)}
							>
								{placeholder}
							</span>
						)}
					</Button>
				}
			/>
			<PopoverContent className="w-48 p-0" align="start">
				<Command>
					<CommandInput placeholder={placeholder} />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{items.map((item) => (
								<CommandItem
									key={item.id}
									onSelect={() => handleSelect(item.value)}
									className="flex items-center justify-between"
								>
									<div className="flex items-center gap-2">
										<item.icon className="size-4 text-muted-foreground" />
										<span className="text-xs">{item.name}</span>
									</div>
									{internalValue === item.value && (
										<IconCheck size={14} className="ml-auto" />
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
