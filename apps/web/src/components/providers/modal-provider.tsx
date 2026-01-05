import type { ProjectInsertInput } from "@meraki/api/types/model";
import type * as React from "react";
import { NewProjectForm } from "@/features/projects/hooks/components/new-project-form";
import { NewSpaceForm } from "@/features/spaces/components/new-space-form";
import { useDeleteSpace } from "@/features/spaces/hooks/use-space";
import { useModal } from "@/stores/modal";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
export function ModalProvider() {
	const modal = useModal();
	const ModalRegistry: Record<string, React.ComponentType<any>> = {
		CREATE_SPACE: () => <NewSpaceForm />,
		DELETE_SPACE: ({ space }: { space: any }) => (
			<DeleteSpaceContent space={space} />
		),
		CREATE_PROJECT: ({
			data,
			spacePublicId,
		}: {
			data?: ProjectInsertInput;
			spacePublicId: string;
		}) => <NewProjectForm data={data} spacePublicId={spacePublicId} />,
	};
	if (modal.stack.length === 0) return null;

	return (
		<>
			{modal.stack.map((instance) => {
				const Component = ModalRegistry[instance.type];

				if (!Component) {
					console.warn(`No component found for modal type: ${instance.type}`);
					return null;
				}

				return (
					<Dialog
						key={instance.id}
						open={modal.isOpen}
						onOpenChange={(value) =>
							value ? modal.open(instance) : modal.close()
						}
					>
						<DialogContent className="w-full p-0 shadow-xl sm:max-w-lg">
							<DialogHeader>
								<DialogTitle className="sr-only">{instance.title}</DialogTitle>
							</DialogHeader>
							<Component {...(instance.data || {})} />
						</DialogContent>
					</Dialog>
				);
			})}
		</>
	);
}

function DeleteSpaceContent({ space }: { space: any }) {
	const deleteMutation = useDeleteSpace();
	const { close } = useModal();

	return (
		<div className="flex flex-col gap-4 p-6">
			<div className="flex flex-col gap-2">
				<h3 className="font-semibold text-lg tracking-tight">Delete Space?</h3>
				<p className="text-muted-foreground text-sm">
					Are you sure you want to delete{" "}
					<span className="font-medium text-foreground">{space.name}</span>?
					This action cannot be undone and will permanently remove all
					associated data.
				</p>
			</div>

			<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
				<Button variant="outline" onClick={close}>
					Cancel
				</Button>
				<Button
					variant="destructive"
					onClick={(e) => {
						e.stopPropagation();
						deleteMutation.mutate({ spacePublicId: space.publicId });
						close();
					}}
				>
					Delete Space
				</Button>
			</div>
		</div>
	);
}
