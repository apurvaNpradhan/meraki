import { Input } from "@base-ui/react/input";
import { ICON_COLORS } from "@meraki/shared/constants/colors";
import { IconArrowLeft, IconPalette } from "@tabler/icons-react";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function ColorPicker({
	color,
	onChange,
	icon: Icon,
}: {
	color: string;
	onChange: (color: string) => void;
	icon?: React.ElementType;
}) {
	const [open, setOpen] = useState(false);
	const [showHexPicker, setShowHexPicker] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger>
				<button
					type="button"
					className="flex size-8 shrink-0 items-center justify-center rounded-md border border-transparent transition-all hover:border-border"
					style={{
						backgroundColor: `${color}20`,
						color: color,
					}}
				>
					{Icon ? (
						<Icon className="size-5" />
					) : (
						<div
							className="size-5 rounded-full"
							style={{ backgroundColor: color }}
						/>
					)}
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-[300px] p-0" align="start">
				<div className="flex flex-col gap-1 p-2">
					{!showHexPicker ? (
						<div className="flex flex-wrap items-center gap-1 px-1">
							{ICON_COLORS.map((c) => (
								<button
									key={c.name}
									type="button"
									className={cn(
										"size-5 rounded-full border border-border/40 transition-all hover:scale-110",
										color === c.value && "ring-2 ring-ring ring-offset-1",
									)}
									style={{ backgroundColor: c.value }}
									onClick={() => {
										onChange(c.value);
										// setOpen(false); // Optional: close on pick
									}}
									title={c.name}
								/>
							))}
							<Separator orientation="vertical" className="mx-1 h-5" />
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 rounded-full"
								onClick={() => setShowHexPicker(true)}
								title="Custom Color"
							>
								<IconPalette size={16} />
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
									<IconArrowLeft size={16} />
								</Button>
							</div>
							<div className="rounded-md border bg-muted/20 p-2">
								<HexColorPicker
									color={color}
									onChange={onChange}
									style={{ width: "100%", height: "120px" }}
								/>
								<div className="mt-2 flex items-center gap-2">
									<div
										className="h-8 w-8 shrink-0 rounded-full outline"
										style={{ backgroundColor: color }}
									/>
									<Input
										value={color}
										onChange={(e) => onChange(e.target.value)}
										className="h-8 font-mono uppercase"
										maxLength={7}
									/>
								</div>
							</div>
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
