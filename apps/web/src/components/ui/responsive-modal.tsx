import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { IconX } from "@tabler/icons-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ResponsiveModal = DialogPrimitive.Root;

const ResponsiveModalTrigger = DialogPrimitive.Trigger;

const ResponsiveModalClose = DialogPrimitive.Close;

const ResponsiveModalPortal = DialogPrimitive.Portal;
const ResponsiveModalOverlay = React.forwardRef<
	HTMLDivElement,
	DialogPrimitive.Backdrop.Props
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Backdrop
		ref={ref}
		className={cn(
			// Match content animation durations to prevent flicker
			"fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
			"data-closed:animate-out data-open:animate-in",
			"data-closed:fade-out-0 data-open:fade-in-0",
			"data-closed:duration-300 data-open:duration-300", // Matched duration
			className,
		)}
		{...props}
	/>
));

const responsiveModalVariants = (
	side: "top" | "bottom" | "left" | "right" = "bottom",
) => {
	const baseClasses = cn(
		"fixed z-50 gap-4 overflow-y-auto bg-background p-3 shadow-lg",
		// Unified animation timing
		"transition ease-in-out",
		"data-closed:animate-out data-open:animate-in",
		"data-closed:duration-300 data-open:duration-300", // Consistent timing
		// Desktop styles - remove conflicting animations
		"lg:top-[50%] lg:left-[50%]",
		"lg:translate-x-[-50%] lg:translate-y-[-50%]",
		"lg:rounded-xl lg:border",
		// Only desktop fade/zoom, no duration override
		"lg:data-closed:fade-out-0 lg:data-open:fade-in-0",
		"lg:data-closed:zoom-out-95 lg:data-open:zoom-in-95",
	);

	const sideClasses = {
		top: "inset-x-0 top-0 border-b rounded-b-xl max-h-[80dvh] lg:h-fit data-closed:slide-out-to-top data-open:slide-in-from-top lg:data-closed:slide-out-to-top-0 lg:data-open:slide-in-from-top-0",
		bottom:
			"inset-x-0 bottom-0 border-t rounded-t-xl max-h-[80dvh] lg:h-fit data-closed:slide-out-to-bottom data-open:slide-in-from-bottom lg:data-closed:slide-out-to-bottom-0 lg:data-open:slide-in-from-bottom-0",
		left: "inset-y-0 left-0 h-full lg:h-fit w-3/4 border-r rounded-r-xl data-closed:slide-out-to-left data-open:slide-in-from-left lg:data-closed:slide-out-to-left-0 lg:data-open:slide-in-from-left-0 sm:max-w-sm",
		right:
			"inset-y-0 right-0 h-full lg:h-fit w-3/4 border-l rounded-l-xl data-closed:slide-out-to-right data-open:slide-in-from-right lg:data-closed:slide-out-to-right-0 lg:data-open:slide-in-from-right-0 sm:max-w-sm",
	};

	return cn(baseClasses, sideClasses[side]);
};

interface ResponsiveModalContentProps extends DialogPrimitive.Popup.Props {
	side?: "top" | "bottom" | "left" | "right";
}

const ResponsiveModalContent = React.forwardRef<
	HTMLDivElement,
	ResponsiveModalContentProps
>(({ side = "bottom", className, children, ...props }, ref) => (
	<ResponsiveModalPortal>
		<ResponsiveModalOverlay />
		<DialogPrimitive.Popup
			ref={ref}
			className={cn(responsiveModalVariants(side), className)}
			{...props}
		>
			{children}
			<ResponsiveModalClose
				render={
					<Button
						variant="ghost"
						size="icon-sm"
						className="absolute top-4 right-4 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-open:bg-secondary"
					/>
				}
			>
				<IconX className="h-4 w-4" />
				<span className="sr-only">Close</span>
			</ResponsiveModalClose>
		</DialogPrimitive.Popup>
	</ResponsiveModalPortal>
));
ResponsiveModalContent.displayName = "ResponsiveModalContent";

const ResponsiveModalHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col space-y-2 text-center sm:text-left",
			className,
		)}
		{...props}
	/>
);
ResponsiveModalHeader.displayName = "ResponsiveModalHeader";

const ResponsiveModalFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
			className,
		)}
		{...props}
	/>
);
ResponsiveModalFooter.displayName = "ResponsiveModalFooter";

const ResponsiveModalTitle = React.forwardRef<
	HTMLHeadingElement,
	DialogPrimitive.Title.Props
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn("font-semibold text-foreground text-lg", className)}
		{...props}
	/>
));
ResponsiveModalTitle.displayName = "ResponsiveModalTitle";

const ResponsiveModalDescription = React.forwardRef<
	HTMLParagraphElement,
	DialogPrimitive.Description.Props
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn("text-muted-foreground text-sm", className)}
		{...props}
	/>
));
ResponsiveModalDescription.displayName = "ResponsiveModalDescription";

export {
	ResponsiveModal,
	ResponsiveModalPortal,
	ResponsiveModalOverlay,
	ResponsiveModalTrigger,
	ResponsiveModalClose,
	ResponsiveModalContent,
	ResponsiveModalHeader,
	ResponsiveModalFooter,
	ResponsiveModalTitle,
	ResponsiveModalDescription,
};
