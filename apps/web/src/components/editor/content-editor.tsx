import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { cn } from "@/lib/utils";
import type { Editor, JSONContent } from ".";
import {
	EditorBubbleMenu,
	EditorClearFormatting,
	EditorFormatBold,
	EditorFormatCode,
	EditorFormatItalic,
	EditorFormatStrike,
	EditorFormatSubscript,
	EditorFormatSuperscript,
	EditorFormatUnderline,
	EditorLinkSelector,
	EditorNodeBulletList,
	EditorNodeCode,
	EditorNodeHeading1,
	EditorNodeHeading2,
	EditorNodeHeading3,
	EditorNodeOrderedList,
	EditorNodeQuote,
	EditorNodeTaskList,
	EditorNodeText,
	EditorProvider,
	EditorSelector,
	EditorTableColumnAfter,
	EditorTableColumnBefore,
	EditorTableColumnDelete,
	EditorTableColumnMenu,
	EditorTableDelete,
	EditorTableFix,
	EditorTableGlobalMenu,
	EditorTableHeaderColumnToggle,
	EditorTableHeaderRowToggle,
	EditorTableMenu,
	EditorTableMergeCells,
	EditorTableRowAfter,
	EditorTableRowBefore,
	EditorTableRowDelete,
	EditorTableRowMenu,
	EditorTableSplitCell,
} from ".";

interface ContentEditorProps {
	initialContent?: JSONContent;
	className?: string;
	placeholder?: string;
	onUpdate?: (content: JSONContent) => void;
}
const ContentEditor = ({
	initialContent,
	onUpdate,
	placeholder,
	className,
}: ContentEditorProps) => {
	const [content, setContent] = useState<JSONContent | undefined>(
		initialContent,
	);
	const debouncedUpdateContent = useDebouncedCallback(
		(content: JSONContent) => {
			onUpdate?.(content);
		},
		1000,
	);

	const handleUpdate = ({ editor }: { editor: Editor }) => {
		const json = editor.getJSON();

		setContent(json);
		debouncedUpdateContent(json);
	};

	return (
		<EditorProvider
			className={cn("h-full w-full overflow-y-auto", className)}
			content={content}
			onUpdate={handleUpdate}
			placeholder={placeholder ?? "Start typing..."}
		>
			{/* 			<EditorFloatingMenu>
				<EditorNodeHeading1 hid1eName />
				<EditorNodeBulletList hideName />
				<EditorNodeQuote hideName />
				<EditorNodeCode hideName />
				<EditorNodeTable hideName />
			</EditorFloatingMenu> */}
			<EditorBubbleMenu>
				<EditorSelector title="Text">
					<EditorNodeText />
					<EditorNodeHeading1 />
					<EditorNodeHeading2 />
					<EditorNodeHeading3 />
					<EditorNodeBulletList />
					<EditorNodeOrderedList />
					<EditorNodeTaskList />
					<EditorNodeQuote />
					<EditorNodeCode />
				</EditorSelector>
				<EditorSelector title="Format">
					<EditorFormatBold />
					<EditorFormatItalic />
					<EditorFormatUnderline />
					<EditorFormatStrike />
					<EditorFormatCode />
					<EditorFormatSuperscript />
					<EditorFormatSubscript />
				</EditorSelector>
				<EditorLinkSelector />
				<EditorClearFormatting />
			</EditorBubbleMenu>
			<EditorTableMenu>
				<EditorTableColumnMenu>
					<EditorTableColumnBefore />
					<EditorTableColumnAfter />
					<EditorTableColumnDelete />
				</EditorTableColumnMenu>
				<EditorTableRowMenu>
					<EditorTableRowBefore />
					<EditorTableRowAfter />
					<EditorTableRowDelete />
				</EditorTableRowMenu>
				<EditorTableGlobalMenu>
					<EditorTableHeaderColumnToggle />
					<EditorTableHeaderRowToggle />
					<EditorTableDelete />
					<EditorTableMergeCells />
					<EditorTableSplitCell />
					<EditorTableFix />
				</EditorTableGlobalMenu>
			</EditorTableMenu>
		</EditorProvider>
	);
};

export default ContentEditor;
