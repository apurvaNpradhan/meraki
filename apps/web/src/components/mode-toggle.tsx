import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
	const { theme, setTheme } = useTheme();
	const [reveal, setReveal] = React.useState<{
		x: number;
		y: number;
		color: string;
	} | null>(null);

	function toggleTheme(e: React.MouseEvent) {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = rect.left + rect.width / 2;
		const y = rect.top + rect.height / 2;

		const nextTheme = theme === "dark" ? "light" : "dark";

		setReveal({
			x,
			y,
			color: nextTheme === "dark" ? "#000" : "#fff",
		});

		setTimeout(() => {
			setTheme(nextTheme);
		}, 80);

		setTimeout(() => setReveal(null), 1000);
	}

	return (
		<>
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={toggleTheme}
				className="relative overflow-hidden rounded-full"
			>
				<IconSun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
				<IconMoon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				<span className="sr-only">Toggle theme</span>
			</Button>

			{reveal && (
				<div
					className="theme-reveal pointer-events-none fixed z-[9999] rounded-full"
					style={{
						left: reveal.x,
						top: reveal.y,
						width: 300,
						height: 300,
						background: reveal.color,
						transformOrigin: "center",
						translate: "-50% -50%",
					}}
				/>
			)}
		</>
	);
}
