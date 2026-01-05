import { zodResolver } from "@hookform/resolvers/zod";
import { SpaceInsertInput } from "@meraki/api/types/model";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import type z from "zod";
import { IconAndColorPicker } from "@/components/icon-and-color-picer";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useModal } from "@/stores/modal";
import { useCreateSpace, useSpaces } from "../hooks/use-space";

const formSchema = SpaceInsertInput;
type FormValues = z.infer<typeof formSchema>;

export function NewSpaceForm() {
	const { refetch } = useSpaces();
	const { close } = useModal();
	const _navigate = useNavigate();
	const { handleSubmit, control } = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			icon: "IconFolder",
			colorCode: "#98BB6C",
		},
	});
	const createSpace = useCreateSpace();

	const onSubmit = (data: FormValues) => {
		createSpace.mutate(data, {
			onSuccess: () => {
				close();
			},
		});
	};

	useEffect(() => {
		const titleElement: HTMLElement | null =
			document.querySelector<HTMLElement>("#name");
		if (titleElement) titleElement.focus();
	}, []);

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 p-4">
			<div className="flex items-center gap-4">
				<Controller
					control={control}
					name="icon"
					render={({ field: iconField }) => (
						<Controller
							control={control}
							name="colorCode"
							render={({ field: colorField }) => (
								<IconAndColorPicker
									icon={iconField.value}
									onIconChange={iconField.onChange}
									color={colorField.value}
									onColorChange={colorField.onChange}
									variant="soft"
									className="outline"
								/>
							)}
						/>
					)}
				/>
				<Controller
					control={control}
					name="name"
					render={({ field, fieldState }) => (
						<>
							<Input
								{...field}
								placeholder="Space name"
								className="border-none bg-transparent px-0 py-2 font-semibold shadow-none placeholder:opacity-30 focus-visible:ring-0 md:text-xl dark:bg-transparent"
								autoFocus
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
									}
								}}
							/>
							{fieldState.error && <FieldError errors={[fieldState.error]} />}
						</>
					)}
				/>
			</div>
			<Controller
				control={control}
				name="description"
				render={({ field }) => (
					<TextareaAutosize
						placeholder="Add a short description..."
						{...field}
						value={field.value ?? ""}
						minRows={2}
						className="resize-none border-none bg-transparent p-0 outline-none focus-visible:ring-0 md:text-md dark:bg-transparent"
					/>
				)}
			/>
			<div className="flex flex-row justify-end gap-3 pt-6">
				<Button onClick={close}>Cancel</Button>
				<Button type="submit" disabled={createSpace.isPending}>
					{createSpace.isPending ? "Creating..." : "Create"}
				</Button>
			</div>
		</form>
	);
}
