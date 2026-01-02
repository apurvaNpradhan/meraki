import type { SelectSpace } from "@meraki/db/schema/space";
import type * as React from "react";
import SpaceForm from "@/features/spaces/components/space-form";
import {
	useCreateSpaceWithStatuses,
	useDeleteSpace,
	useUpdateSpace,
} from "@/hooks/use-spaces";
import { useModal } from "@/stores/modal";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export function ModalProvider() {
	const modal = useModal();
	const ModalRegistry: Record<string, React.ComponentType<any>> = {
		CREATE_SPACE: () => <CreateSpaceModalContent />,
		UPDATE_SPACE: ({
			values,
			publicId,
		}: {
			values: SelectSpace;
			publicId: string;
		}) => <UpdateSpaceModalContent space={values} publicId={publicId} />,
		DELETE_SPACE: ({ space }: { space: SelectSpace }) => (
			<DeleteSpaceModalContent space={space} />
		),
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

function CreateSpaceModalContent() {
	const createMutation = useCreateSpaceWithStatuses();
	return (
		<SpaceForm
			type="create"
			onSubmit={(values) =>
				createMutation.mutate({
					spaceInput: {
						...values,
					},
				})
			}
		/>
	);
}

function UpdateSpaceModalContent({
	space,
	publicId,
}: {
	space: SelectSpace;
	publicId: string;
}) {
	const updateMutation = useUpdateSpace();

	return (
		<SpaceForm
			type="update"
			space={space}
			onSubmit={(values) =>
				updateMutation.mutate({
					publicId: publicId,
					data: {
						...values,
					},
				})
			}
		/>
	);
}

function DeleteSpaceModalContent({ space }: { space: SelectSpace }) {
	const deleteMutation = useDeleteSpace();
	const { close } = useModal();

	return (
		<div>
			<span>Are you absolutely sure?</span>
			<p>You are about to delete {space.name}. This action cannot be undone.</p>
			<div>
				<Button onClick={close}>Cancel</Button>
				<Button
					variant="destructive"
					onClick={(e) => {
						e.stopPropagation();
						deleteMutation.mutate({ publicId: space.publicId });
						close();
					}}
				>
					Delete
				</Button>
			</div>
		</div>
	);
}
