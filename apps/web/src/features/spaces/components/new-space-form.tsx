import { zodResolver } from "@hookform/resolvers/zod";
import { InsertSpaceInput } from "@meraki/api/types/space";
import { IconLoader2 } from "@tabler/icons-react";
import { useLoaderData, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import type z from "zod";
import ContentEditor from "@/components/editor/editors/content-editor";
import { IconAndColorPicker } from "@/components/icon-and-colorpicker";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import {
	ResponsiveModalFooter,
	ResponsiveModalHeader,
	ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useModal } from "@/stores/modal.store";
import { useCreateSpace } from "../hooks/use-space";

const formSchema = InsertSpaceInput;
type FormValues = z.infer<typeof formSchema>;

export function NewSpaceForm() {
	const isMobile = useIsMobile();
	const { close, setDirty } = useModal();
	const navigate = useNavigate();
	const { workspace } = useLoaderData({ from: "/(authenicated)/$slug" });
	const {
		handleSubmit,
		control,
		formState: { isDirty },
	} = useForm<FormValues>({
		mode: "onChange",
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: {},
			icon: "IconInfinity",
			colorCode: "#C2D94C",
		},
	});

	useEffect(() => {
		setDirty(isDirty);
	}, [isDirty, setDirty]);
	const createSpace = useCreateSpace();

	const onSubmit = (data: FormValues) => {
		createSpace.mutate(data, {
			onSuccess: (result) => {
				close();
				if (result) {
					navigate({
						to: "/$slug/spaces/$id",
						params: { slug: workspace.slug, id: result.publicId },
					});
				}
			},
		});
	};

	useEffect(() => {
		const titleElement: HTMLElement | null =
			document.querySelector<HTMLElement>("#name");
		if (titleElement) titleElement.focus();
	}, []);

	return (
		<div className="flex flex-col gap-3">
			<ResponsiveModalHeader>
				<ResponsiveModalTitle className={"sr-only"}>
					New Space
				</ResponsiveModalTitle>
			</ResponsiveModalHeader>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="relative flex flex-col gap-3 overflow-auto"
			>
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
										icon={iconField.value ?? undefined}
										onIconChange={iconField.onChange}
										color={colorField.value ?? undefined}
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
							<div className="space-y-1">
								<TextareaAutosize
									{...field}
									placeholder="Space name"
									className="w-full resize-none font-semibold text-xl outline-none placeholder:text-muted-foreground"
									autoFocus={!isMobile}
									onFocus={(e) => {
										e.target.scrollIntoView({
											behavior: "smooth",
											block: "center",
										});
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleSubmit(onSubmit)();
										}
									}}
								/>
								{fieldState.error && <FieldError errors={[fieldState.error]} />}
							</div>
						)}
					/>
				</div>
				<Controller
					control={control}
					name="description"
					render={({ field }) => (
						<ContentEditor
							initialContent={field.value ?? undefined}
							onUpdate={field.onChange}
							placeholder="Add a short description..."
						/>
					)}
				/>
				<ResponsiveModalFooter className="flex flex-row justify-end gap-3 pt-6">
					<Button
						type="submit"
						disabled={createSpace.isPending}
						className="min-w-[100px]"
					>
						{createSpace.isPending ? (
							<>
								<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
								Adding...
							</>
						) : (
							"Create space"
						)}
					</Button>
				</ResponsiveModalFooter>
			</form>
		</div>
	);
}
