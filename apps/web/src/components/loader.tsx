import { IconLoader2 } from "@tabler/icons-react";

export default function Loader() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<IconLoader2
				className="h-6 w-6 animate-spin"
				role="status"
				aria-label="Loading"
			/>
		</div>
	);
}
