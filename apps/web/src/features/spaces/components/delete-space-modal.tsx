import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	ResponsiveModalDescription,
	ResponsiveModalFooter,
	ResponsiveModalHeader,
	ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { useModal } from "@/stores/modal.store";
import { useDeleteSpace } from "../hooks/use-space";

export function DeleteSpaceModal({
	space,
}: {
	space: { publicId: string; name: string };
}) {
	const { close } = useModal();
	const deleteSpace = useDeleteSpace();

	const handleDelete = () => {
		deleteSpace.mutate(
			{ spacePublicId: space.publicId },
			{
				onSuccess: () => {
					close();
				},
			},
		);
	};

	return (
		<div className="flex flex-col gap-6 p-1">
			<ResponsiveModalHeader>
				<div className="flex items-center gap-2 text-destructive">
					<IconAlertTriangle size={24} />
					<ResponsiveModalTitle>Delete Space</ResponsiveModalTitle>
				</div>
				<ResponsiveModalDescription>
					Are you sure you want to delete{" "}
					<span className="font-semibold">{space.name}</span>? This action will
					move the space to trash.
				</ResponsiveModalDescription>
			</ResponsiveModalHeader>

			<ResponsiveModalFooter className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
				<Button
					type="button"
					variant="ghost"
					onClick={close}
					disabled={deleteSpace.isPending}
				>
					Cancel
				</Button>
				<Button
					type="button"
					variant="destructive"
					onClick={handleDelete}
					disabled={deleteSpace.isPending}
				>
					{deleteSpace.isPending ? (
						<>
							<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
							Deleting...
						</>
					) : (
						"Delete Space"
					)}
				</Button>
			</ResponsiveModalFooter>
		</div>
	);
}
