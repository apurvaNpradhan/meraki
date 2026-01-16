import { IconCaretRightFilled, IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { SidebarSpaceList } from "@/features/spaces/components/sidebar-space-list";
import { cn } from "@/lib/utils";
import { useModal } from "@/stores/modal.store";

export function NavSpaces() {
	const [isOpen, setIsOpen] = useState(true);
	const { open } = useModal();
	return (
		<SidebarGroup className="p-0">
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<div className="flex items-center justify-between rounded-md hover:bg-primary/5">
					<CollapsibleTrigger className="flex flex-1 items-center gap-1 text-left">
						<SidebarGroupLabel className="cursor-pointer select-none">
							Spaces
						</SidebarGroupLabel>
						<IconCaretRightFilled
							size={12}
							className={cn(
								"transition-transform duration-200",
								isOpen && "rotate-90",
							)}
						/>
					</CollapsibleTrigger>

					<button
						type="button"
						className="mr-2 flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-primary"
						onClick={(e) => {
							e.stopPropagation();
							open({ type: "CREATE_SPACE" });
						}}
					>
						<IconPlus size={14} />
					</button>
				</div>

				<CollapsibleContent>
					<SidebarSpaceList />
				</CollapsibleContent>
			</Collapsible>
		</SidebarGroup>
	);
}
