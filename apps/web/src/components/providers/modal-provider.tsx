import type * as React from "react";
import { useModal } from "@/stores/modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export function ModalProvider() {
	const modal = useModal();
	const ModalRegistry: Record<string, React.ComponentType<any>> = {
		CREATE_AREA: () => {
			return <CreateAreaModalContent />;
		},
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
						<DialogContent className="w-full p-0 p-4 shadow-xl sm:max-w-lg">
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

function CreateAreaModalContent() {
	return <div>Create area</div>;
}
