import { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useDebouncedCallback } from "use-debounce";
import { IconAndColorPicker } from "@/components/icon-and-colorpicker";
import { Button } from "@/components/ui/button";
import { useSpace, useUpdateSpace } from "@/features/spaces/hooks/use-space";
import { useModal } from "@/stores/modal.store";

export function SpaceOverview({ id }: { id: string }) {
	const { data, isPending } = useSpace(id);
	const updateSpace = useUpdateSpace();
	const { open } = useModal();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [_color, setColor] = useState("");

	useEffect(() => {
		if (!data) return;
		setName(data.name ?? "");
		setDescription(data.description ?? "");
		setColor(data.colorCode ?? "");
	}, [data]);

	const debouncedUpdateName = useDebouncedCallback((value: string) => {
		updateSpace.mutate({
			spacePublicId: id,
			input: { name: value },
		});
	}, 600);

	const debouncedUpdateDescription = useDebouncedCallback((value: string) => {
		updateSpace.mutate({
			spacePublicId: id,
			input: { description: value },
		});
	}, 800);
	const debouncedUpdateColor = useDebouncedCallback((value: string) => {
		updateSpace.mutate({
			spacePublicId: id,
			input: { colorCode: value },
		});
	}, 600);

	if (isPending) return <div>Loading...</div>;
	if (!data) return <div>Space not found</div>;

	return (
		<div className="container flex flex-col gap-4">
			<div className="mt-10 flex flex-row gap-2">
				<IconAndColorPicker
					icon={data.icon}
					color={data.colorCode}
					variant="soft"
					iconSize={30}
					onIconChange={(icon) =>
						updateSpace.mutate({
							spacePublicId: id,
							input: { icon },
						})
					}
					onColorChange={(color) => {
						setColor(color);
						debouncedUpdateColor(color);
					}}
				/>

				<TextareaAutosize
					value={name}
					onChange={(e) => {
						setName(e.target.value);
						debouncedUpdateName(e.target.value);
					}}
					placeholder="Name"
					className="w-full resize-none bg-transparent px-0 font-semibold text-3xl text-foreground outline-none placeholder:text-muted-foreground"
				/>
			</div>
			<div className="flex flex-row items-center gap-3">
				<span className="font-semibold text-muted-foreground text-xs">
					Actions
				</span>
				<Button
					variant={"ghost"}
					size={"xs"}
					onClick={() =>
						open({
							type: "CREATE_PROJECT",
							data: {
								spacePublicId: id,
							},
							modalSize: "lg",
						})
					}
				>
					New Project
				</Button>
			</div>

			<TextareaAutosize
				value={description}
				onChange={(e) => {
					setDescription(e.target.value);
					debouncedUpdateDescription(e.target.value);
				}}
				placeholder="Description"
				className="min-h-10 w-full resize-none bg-transparent px-0 text-base text-muted-foreground outline-none placeholder:text-muted-foreground/80"
			/>
		</div>
	);
}
