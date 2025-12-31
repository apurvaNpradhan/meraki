import { Link } from "@tanstack/react-router";
import { buttonVariants } from "./ui/button";

export function ErrorComponent({ error }: { error: Error }) {
	return (
		<div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-4">
			<h1 className="font-bold text-4xl text-destructive">Error</h1>
			<p className="text-center text-muted-foreground">
				{error.message || "Something went wrong"}
			</p>
			<Link to="/" className={buttonVariants({ variant: "outline" })}>
				Go Home
			</Link>
		</div>
	);
}
