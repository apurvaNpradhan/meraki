import { COLORS, ICONS } from "@meraki/shared/constants";
import * as TablerIcons from "@tabler/icons-react";
import * as React from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

interface variantProps {
	variant?: "default" | "soft";
}

interface IconPickerProps extends variantProps {
	icon?: string;
	onIconChange: (iconName: string) => void;
	color?: string;
	onColorChange?: (color: string) => void;
	placeholder?: string;
	iconSize?: number;
	className?: string;
	trigger?: React.ReactNode;
}

export function IconAndColorPicker({
	icon,
	onIconChange,
	variant = "default",
	color = "#1F1F28",
	onColorChange,
	placeholder = "Select icon...",
	iconSize = 24,
	className,
	trigger,
}: IconPickerProps) {
	const [open, setOpen] = React.useState(false);
	const [showHexPicker, setShowHexPicker] = React.useState(false);
	const [search, setSearch] = React.useState("");

	const filteredIcons = React.useMemo(() => {
		const uniqueCommonIcons = Array.from(new Set(ICONS));

		const validIcons = uniqueCommonIcons.filter((name) =>
			// @ts-expect-error
			Boolean(TablerIcons[name]),
		);

		if (!search) return validIcons;
		const lowerSearch = search.toLowerCase();
		return validIcons.filter((name) =>
			name.toLowerCase().includes(lowerSearch),
		);
	}, [search]);

	const SelectedIcon = icon
		? // @ts-ignore
			(TablerIcons[icon] as React.ElementType)
		: null;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					trigger ? (trigger as React.ReactElement) : <button type="button" />
				}
				className={cn(
					"flex w-fit items-center rounded-md p-1 outline-none transition-colors hover:bg-(--hover-background-color)",
					className,
				)}
				style={
					{
						color: color,
						backgroundColor: variant === "soft" ? `${color}20` : undefined,
						"--hover-background-color": `${color}30`,
					} as React.CSSProperties
				}
			>
				{!trigger &&
					(icon ? (
						<div className="flex items-center gap-2">
							{SelectedIcon && (
								<SelectedIcon size={iconSize} style={{ color: color }} />
							)}
							<span className={cn("sr-only")}>{icon}</span>
						</div>
					) : (
						<span className={cn("text-muted-foreground", "")}>
							{placeholder}
						</span>
					))}
			</PopoverTrigger>
			<PopoverContent className="w-[380px] p-0" align="start">
				<Command shouldFilter={false} className="w-full">
					{onColorChange && (
						<div className="border-border/10 border-b p-2">
							{!showHexPicker ? (
								<div className="flex flex-wrap items-center justify-between gap-1 px-1">
									<div className="flex flex-wrap items-center gap-1">
										<button
											type="button"
											className={cn(
												"flex size-5 items-center justify-center rounded-full transition-all",
												"hover:scale-110",
												"border border-border/40",
												(!color || color === "") &&
													"bg-muted ring-2 ring-ring ring-offset-1",
											)}
											onClick={() => onColorChange("")}
											title="No Color"
										>
											<TablerIcons.IconCircleOff
												size={14}
												className="text-muted-foreground"
											/>
										</button>
										{COLORS.map((c) => (
											<button
												key={c.name}
												type="button"
												className={cn(
													"size-5 rounded-full transition-all",
													"hover:scale-110",
													"border border-border/40",
													color === c.value && "ring-2 ring-ring ring-offset-1",
												)}
												style={{ backgroundColor: c.value }}
												onClick={() => onColorChange(c.value)}
												title={c.name}
											/>
										))}
									</div>
									<Separator orientation="vertical" className="h-4" />
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 rounded-full"
										onClick={() => setShowHexPicker(true)}
										title="Custom Color"
									>
										<TablerIcons.IconPalette size={16} />
									</Button>
								</div>
							) : (
								<div className="flex flex-col gap-2">
									<div className="flex items-center justify-between px-1">
										<span className="font-medium text-muted-foreground text-xs">
											Custom Color
										</span>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6 rounded-full"
											onClick={() => setShowHexPicker(false)}
											title="Back to Presets"
										>
											<TablerIcons.IconArrowLeft size={16} />
										</Button>
									</div>
									<div className="rounded-md border bg-muted/20 p-2">
										<HexColorPicker
											color={color}
											onChange={onColorChange}
											style={{ width: "100%", height: "120px" }}
										/>
										<div className="mt-2 flex items-center gap-2">
											<div
												className="h-8 w-8 shrink-0 rounded-full outline"
												style={{ backgroundColor: color }}
											/>
											<Input
												value={color}
												onChange={(e) => onColorChange(e.target.value)}
												className="h-8 font-mono uppercase"
												maxLength={7}
											/>
										</div>
									</div>
								</div>
							)}
						</div>
					)}
					<CommandInput
						className="dark:bg-"
						name="icon"
						placeholder="Search icon..."
						value={search}
						onValueChange={setSearch}
					/>
					<CommandList className="max-h-[300px] overflow-y-auto">
						<CommandEmpty>No icons found</CommandEmpty>
						<div className="grid grid-cols-10 gap-2 p-2">
							{filteredIcons.map((iconName) => {
								const Icon =
									// @ts-expect-error
									TablerIcons[iconName] as React.ElementType;
								return (
									<CommandItem
										key={iconName}
										value={iconName}
										className={cn(
											"h-6 w-full justify-center rounded-md p-0 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:last-child]:hidden",
											icon === iconName
												? "bg-accent text-accent-foreground"
												: "text-muted-foreground",
										)}
										style={
											{
												"--hover-background-color": `${color}60`,
												color:
													icon === iconName
														? undefined
														: (`${color}` as string),
											} as React.CSSProperties
										}
										onSelect={() => {
											onIconChange(iconName);
											setOpen(false);
										}}
									>
										<Icon className="size-5 shrink-0" />
										<span className="sr-only">{iconName}</span>
									</CommandItem>
								);
							})}
						</div>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

export const RenderIcon = ({
	icon,
	color,
	size,
}: {
	icon: string;
	color: string;
	size?: number;
}) => {
	const Icon = TablerIcons[
		icon as keyof typeof TablerIcons
	] as React.ElementType;
	return (
		<div className="flex items-center gap-2">
			<Icon size={size} style={{ color: color }} />
		</div>
	);
};
