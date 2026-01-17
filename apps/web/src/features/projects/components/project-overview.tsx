import { IconCalendar, IconCircleDashed, IconFlag } from "@tabler/icons-react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useDebouncedCallback } from "use-debounce";
import ContentEditor from "@/components/editor/content-editor";
import { IconAndColorPicker } from "@/components/icon-and-colorpicker";
import { PrioritySelector } from "@/components/priority-selector";
import { DatePicker } from "@/components/ui/date-picker";
import {
	useProject,
	useUpdateProject,
} from "@/features/projects/hooks/use-project";

import type { ProjectBySpaceItem } from "@/types/project";
import { orpc } from "@/utils/orpc";
import { StatusSelector } from "./status-selector";

export function ProjectOverview({ id }: { id: string }) {
	const { data, isPending } = useProject(id);
	const projectStatuses = useSuspenseQuery(
		orpc.projectStatus.all.queryOptions(),
	);
	const updateProject = useUpdateProject({});
	const [name, setName] = useState("");
	const [_color, setColor] = useState("");
	const [summary, setSummary] = useState("");

	useEffect(() => {
		if (!data) return;
		setName(data.name ?? "");
		setColor(data.colorCode ?? "");
		setSummary(data.summary ?? "");
	}, [data]);

	const debouncedUpdateName = useDebouncedCallback((value: string) => {
		updateProject.mutate({
			projectPublicId: id,
			name: value,
		});
	}, 600);

	const debouncedUpdateColor = useDebouncedCallback((value: string) => {
		updateProject.mutate({
			projectPublicId: id,
			colorCode: value,
		});
	}, 600);

	const debouncedUpdateSummary = useDebouncedCallback((value: string) => {
		updateProject.mutate({
			projectPublicId: id,
			summary: value,
		});
	}, 600);

	if (isPending) return <div>Loading...</div>;
	if (!data) return <div>Project not found</div>;

	const properties = [
		{
			label: "Status",
			icon: IconCircleDashed,
			content: (
				<StatusSelector
					project={data as unknown as ProjectBySpaceItem}
					statuses={projectStatuses.data}
					projectPublicId={id}
					spacePublicId={data.space?.publicId}
					showLabel={true}
					className="h-8 justify-start px-2 font-normal hover:bg-transparent"
				/>
			),
		},
		{
			label: "Priority",
			icon: IconFlag,
			content: (
				<PrioritySelector
					value={data.priority ?? 0}
					onPriorityChange={(priority) =>
						updateProject.mutate({
							projectPublicId: id,
							priority,
						})
					}
					showLabel={true}
					className="h-8 justify-start px-2 font-normal hover:bg-transparent"
				/>
			),
		},
		{
			label: "Start Date",
			icon: IconCalendar,
			content: (
				<DatePicker
					date={data.startDate ? new Date(data.startDate) : undefined}
					setDate={(date) =>
						updateProject.mutate({
							projectPublicId: id,
							startDate: date,
						})
					}
					className="h-8 justify-start px-2 font-normal hover:bg-transparent"
				/>
			),
		},
		{
			label: "End Date",
			icon: IconCalendar,
			content: (
				<DatePicker
					date={data.targetDate ? new Date(data.targetDate) : undefined}
					setDate={(date) =>
						updateProject.mutate({
							projectPublicId: id,
							targetDate: date,
						})
					}
					className="h-8 justify-start px-2 font-normal hover:bg-transparent"
				/>
			),
		},
	];

	return (
		<div className="container flex flex-col gap-4">
			<div className="mt-10 flex flex-row gap-2">
				<IconAndColorPicker
					icon={data.icon}
					color={data.colorCode}
					variant="soft"
					iconSize={30}
					onIconChange={(icon) =>
						updateProject.mutate({
							projectPublicId: id,
							icon,
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
					placeholder="Project Name"
					className="w-full resize-none bg-transparent px-0 font-semibold text-3xl text-foreground outline-none placeholder:text-muted-foreground"
				/>
			</div>
			<TextareaAutosize
				value={summary}
				onChange={(e) => {
					setSummary(e.target.value);
					debouncedUpdateSummary(e.target.value);
				}}
				placeholder="Project summary..."
				className="w-full resize-none bg-transparent px-0 text-foreground text-sm outline-none placeholder:text-muted-foreground"
			/>
			<div className="mt-4 flex flex-col gap-1 border-b py-2">
				{properties.map((prop) => (
					<div
						key={prop.label}
						className="group flex flex-row items-center gap-4 rounded-md px-2 py-1 transition-colors hover:bg-muted/30"
					>
						<div className="flex w-32 items-center gap-2 text-muted-foreground text-sm">
							<prop.icon size={16} />
							<span>{prop.label}</span>
						</div>
						<div className="flex-1">{prop.content}</div>
					</div>
				))}
			</div>

			<ContentEditor
				initialContent={data?.description ?? {}}
				placeholder="Description..."
				className="mt-5 text-muted-foreground"
				onUpdate={(content) => {
					updateProject.mutate({
						projectPublicId: id,
						description: content,
					});
				}}
			/>
		</div>
	);
}
