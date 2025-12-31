import { IconError404, IconFaceIdError } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import MainLayout from "./layout/app-layout";
import { buttonVariants } from "./ui/button";

export function NotFoundPublic() {
	return (
		<div className="flex h-screen w-full flex-col items-center justify-center gap-4">
			<h1 className="font-bold text-4xl">404</h1>
			<p className="text-muted-foreground">Page not found</p>
			<Link to="/" className={buttonVariants({ variant: "default" })}>
				Go Home
			</Link>
		</div>
	);
}
export function NotFound() {
	return (
		<MainLayout>
			<div className="flex h-screen w-full flex-col items-center justify-center gap-2">
				{" "}
				<IconFaceIdError className="text-muted-foreground" size={150} />{" "}
				<p className="font-bold text-lg">Not found</p>{" "}
				<p className="text-lg text-muted-foreground">
					{" "}
					The page you are looking for does not exist.{" "}
				</p>
			</div>
		</MainLayout>
	);
}
