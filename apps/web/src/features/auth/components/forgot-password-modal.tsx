import { zodResolver } from "@hookform/resolvers/zod";
import { env } from "@meraki/env/web";
import { IconLoader2, IconMail } from "@tabler/icons-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	ResponsiveModalDescription,
	ResponsiveModalFooter,
	ResponsiveModalHeader,
	ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { authClient } from "@/lib/auth-client";
import { useModal } from "@/stores/modal.store";

const formSchema = z.object({
	email: z.email("Invalid email address"),
});

type FormValues = z.infer<typeof formSchema>;

export function ForgotPasswordModal() {
	const { close } = useModal();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	async function onSubmit(values: FormValues) {
		setIsLoading(true);
		try {
			const { error } = await authClient.requestPasswordReset({
				email: values.email,
				redirectTo: `${env.VITE_BASE_URL}/reset-password`,
			});

			if (error) {
				throw error;
			}

			toast.success("Password reset email sent. Please check your inbox.");
			close();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to send reset email";
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex flex-col gap-6 p-1">
			<ResponsiveModalHeader>
				<div className="flex items-center gap-2">
					<IconMail size={24} className="text-primary" />
					<ResponsiveModalTitle>Forgot Password</ResponsiveModalTitle>
				</div>
				<ResponsiveModalDescription>
					Enter your email address and we'll send you a link to reset your
					password.
				</ResponsiveModalDescription>
			</ResponsiveModalHeader>

			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="email"
						className="font-medium text-foreground/80 text-sm"
					>
						Email Address
					</label>
					<Input
						id="email"
						type="email"
						placeholder="m@example.com"
						{...form.register("email")}
						className={
							form.formState.errors.email
								? "border-destructive focus-visible:ring-destructive/20"
								: ""
						}
					/>
					{form.formState.errors.email && (
						<p className="text-destructive text-xs">
							{form.formState.errors.email.message}
						</p>
					)}
				</div>

				<ResponsiveModalFooter className="mt-2">
					<Button
						type="button"
						variant="ghost"
						onClick={close}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? (
							<>
								<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
								Sending...
							</>
						) : (
							"Send Reset Link"
						)}
					</Button>
				</ResponsiveModalFooter>
			</form>
		</div>
	);
}
