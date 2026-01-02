import { zodResolver } from "@hookform/resolvers/zod";
import { InsertSpace, type SelectSpace } from "@meraki/db/schema/space";
import type { InsertStatusGroupWithStatuses } from "@meraki/db/schema/status";
import { projectManagementFlow, starterFlow } from "@meraki/shared/constants";
import { IconArrowRight } from "@tabler/icons-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { IconAndColorPicker } from "@/components/icon-and-color-picer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useModal } from "@/stores/modal";

const FormCtxSchema = InsertSpace.pick({
	name: true,
	description: true,
	icon: true,
	colorCode: true,
}).extend({
	flow: z.enum(["starter", "project_management"]),
	customStatuses: z.custom<InsertStatusGroupWithStatuses[]>().optional(),
});
type FormValues = z.infer<typeof FormCtxSchema>;

type Props = {
	type?: "create" | "update";
	space?: SelectSpace;
	onSubmit: (values: FormValues) => void;
};

const FlowPreview = ({
	flowType,
	customFlow,
}: {
	flowType: "starter" | "project_management" | "custom";
	customFlow?: InsertStatusGroupWithStatuses[];
}) => {
	const flow: InsertStatusGroupWithStatuses[] =
		flowType === "starter" ? starterFlow : projectManagementFlow;
	const allStatuses = flow.flatMap((group) => group.statuses);

	return (
		<div className="flex flex-wrap items-center gap-2 overflow-hidden">
			{allStatuses.map((status, index) => (
				<div key={status.name} className="flex items-center gap-2">
					<Badge variant={"outline"} style={{ borderColor: status.color }}>
						{status.name}
					</Badge>
					{index < allStatuses.length - 1 && (
						<IconArrowRight className="h-3 w-3 text-muted-foreground/50" />
					)}
				</div>
			))}
		</div>
	);
};

export const SpaceForm = ({ type = "create", space, onSubmit }: Props) => {
	const { close, open } = useModal();
	const [step, setStep] = useState<1 | 2>(1);

	const form = useForm<FormValues>({
		resolver: zodResolver(FormCtxSchema),
		defaultValues: {
			name: space?.name ?? "",
			description: space?.description ?? "",
			icon: space?.icon ?? "IconFolder",
			colorCode: space?.colorCode ?? "#98BB6C",
			flow: "starter",
		},
	});

	const onNext = async () => {
		const valid = await form.trigger([
			"name",
			"description",
			"icon",
			"colorCode",
		]);
		if (valid) {
			setStep(2);
		}
	};

	const handleSubmit = (data: FormValues) => {
		onSubmit(data);
		close();
	};

	return (
		<div className="flex flex-col p-4">
			<form
				id="space-form"
				onSubmit={form.handleSubmit(handleSubmit)}
				className="flex flex-col gap-4"
			>
				{step === 1 && (
					<div className="fade-in slide-in-from-left-4 flex animate-in flex-col gap-4 duration-300">
						<div className="flex items-center gap-4">
							<Controller
								control={form.control}
								name="icon"
								render={({ field: iconField }) => (
									<Controller
										control={form.control}
										name="colorCode"
										render={({ field: colorField }) => (
											<IconAndColorPicker
												icon={iconField.value}
												onIconChange={iconField.onChange}
												color={colorField.value}
												onColorChange={colorField.onChange}
												className="outline"
											/>
										)}
									/>
								)}
							/>
						</div>

						<Controller
							control={form.control}
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
												onNext();
											}
										}}
									/>
									{fieldState.error && (
										<FieldError errors={[fieldState.error]} />
									)}
								</>
							)}
						/>
						<Controller
							control={form.control}
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
					</div>
				)}

				{/* Step 2: Flow Selection */}
				{step === 2 && type === "create" && (
					<div className="fade-in slide-in-from-right-4 flex animate-in flex-col gap-6 duration-300">
						{/* Header Section */}
						<div>
							<h3 className="font-semibold text-lg">Define your workflow</h3>
						</div>

						{/* Workflow Grid */}
						<Controller
							control={form.control}
							name="flow"
							render={({ field }) => (
								<div className="grid grid-cols-2 gap-4">
									<button
										type="button"
										className={cn(
											"flex cursor-pointer flex-col gap-2 rounded-xl border p-4 text-left transition-all hover:border-primary/50 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
											field.value === "starter" &&
												"border-primary bg-primary/5 ring-1 ring-primary",
										)}
										onClick={() => {
											field.onChange("starter");
											// Reset custom statuses when switching back to a preset
											form.setValue("customStatuses", undefined);
										}}
									>
										<span className="font-semibold">Starter</span>
										<span className="text-muted-foreground text-xs">
											For everyday tasks
										</span>
									</button>

									<button
										type="button"
										className={cn(
											"flex cursor-pointer flex-col gap-2 rounded-xl border p-4 text-left transition-all hover:border-primary/50 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
											field.value === "project_management" &&
												"border-primary bg-primary/5 ring-1 ring-primary",
										)}
										onClick={() => {
											field.onChange("project_management");
											form.setValue("customStatuses", undefined);
										}}
									>
										<span className="font-semibold">Project Management</span>
										<span className="text-muted-foreground text-xs">
											Plan, manage, and execute projects
										</span>
									</button>
								</div>
							)}
						/>

						<div className="flex flex-col gap-3">
							<div className="font-medium text-sm">
								Customize defaults for{" "}
								{form.watch("flow") === "starter"
									? "Starter"
									: "Project Management"}
							</div>

							<div className="overflow-hidden rounded-xl border bg-card">
								<div className="flex cursor-pointer items-center justify-between p-4">
									<div className="flex items-center gap-3 overflow-hidden">
										<div className="flex flex-col gap-2 overflow-hidden">
											<span className="font-medium text-sm">
												Project and task statuses
											</span>
											<FlowPreview
												flowType={
													form.watch("customStatuses")
														? "custom"
														: (form.watch("flow") as any)
												}
												customFlow={form.watch("customStatuses")}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</form>

			<div className="flex items-center justify-between gap-3 pt-6">
				{step === 2 && (
					<Button
						type="button"
						variant="ghost"
						onClick={() => setStep(1)}
						className="mr-auto text-muted-foreground hover:bg-accent/50"
					>
						Back
					</Button>
				)}

				{step === 1 && type === "create" ? (
					<Button
						type="button"
						size={"lg"}
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onNext();
						}}
						className="ml-auto"
					>
						Continue
					</Button>
				) : (
					<Button
						type="submit"
						size={"lg"}
						form="space-form"
						onClick={(e) => e.stopPropagation()}
						className="ml-auto"
					>
						{type === "create" ? "Create Space" : "Update Space"}
					</Button>
				)}
			</div>
		</div>
	);
};

export default SpaceForm;
