import { zodResolver } from "@hookform/resolvers/zod";
import { env } from "@meraki/env/web";
import {
	IconBrandGithubFilled,
	IconBrandGoogleFilled,
	IconEye,
	IconEyeOff,
	IconLoader2,
} from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { usePending } from "@/components/ui/pending";
import { authClient, sessionQueryOptions } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useModal } from "@/stores/modal.store";
import { queryClient } from "@/utils/orpc";

const signInSchema = z.object({
	email: z.email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const navigate = useNavigate();
	const { open } = useModal();
	const form = useForm<SignInValues>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const { pendingProps, isPending } = usePending({ isPending: isSubmitting });

	const handleSocialSignIn = async (provider: "google" | "github") => {
		await authClient.signIn.social({
			provider,
			callbackURL: `${env.VITE_BASE_URL}/home`,
		});
	};

	const onSubmit = async (data: SignInValues) => {
		setIsSubmitting(true);

		toast.promise(
			(async () => {
				const { data: resData, error } = await authClient.signIn.email({
					email: data.email,
					password: data.password,
				});

				if (error) {
					setIsSubmitting(false);
					throw error;
				}

				await queryClient.refetchQueries(sessionQueryOptions);
				navigate({ to: "/$slug/home", params: { slug: "active" } });
				return resData;
			})(),
			{
				loading: "Signing in...",
				success: "Sign in successful",
				error: (error) => error.message || "Failed to sign in",
			},
		);
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Welcome back</CardTitle>
					<CardDescription>
						Login with your Github or Google account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FieldGroup>
							<Field className="grid grid-cols-2 gap-4">
								<Button
									disabled={isPending}
									{...pendingProps}
									variant="outline"
									type="button"
									onClick={() => handleSocialSignIn("github")}
									className="relative w-full"
								>
									<IconBrandGithubFilled className="mr-2 h-4 w-4" />
									Github
								</Button>
								<Button
									disabled={isPending}
									variant="outline"
									{...pendingProps}
									type="button"
									onClick={() => handleSocialSignIn("google")}
									className="relative w-full"
								>
									<IconBrandGoogleFilled className="mr-2 h-4 w-4" />
									Google
								</Button>
							</Field>
							<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
								Or continue with
							</FieldSeparator>
							<Field>
								<FieldLabel htmlFor="email" className="relative">
									Email
								</FieldLabel>
								<Controller
									control={form.control}
									name="email"
									render={({ field, fieldState }) => (
										<>
											<Input
												{...field}
												id="email"
												type="email"
												disabled={isPending}
												placeholder="m@example.com"
											/>
											{fieldState.error && (
												<FieldError errors={[fieldState.error]} />
											)}
										</>
									)}
								/>
							</Field>
							<Field>
								<div className="flex items-center">
									<FieldLabel htmlFor="password">Password</FieldLabel>
									<button
										type="button"
										onClick={() => open({ type: "FORGOT_PASSWORD" })}
										className="ml-auto text-sm underline-offset-4 hover:underline"
									>
										Forgot your password?
									</button>
								</div>
								<Controller
									control={form.control}
									name="password"
									render={({ field, fieldState }) => (
										<>
											<div className="relative">
												<Input
													{...field}
													id="password"
													type={showPassword ? "text" : "password"}
													disabled={isPending}
													autoComplete="current-password"
												/>
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
												>
													{showPassword ? (
														<IconEyeOff size={18} />
													) : (
														<IconEye size={18} />
													)}
												</button>
											</div>
											{fieldState.error && (
												<FieldError errors={[fieldState.error]} />
											)}
										</>
									)}
								/>
							</Field>
							<Field>
								<Button type="submit" disabled={isPending} {...pendingProps}>
									{isPending && <IconLoader2 className="size-4 animate-spin" />}
									{isPending ? "Signing in..." : "Sign in"}{" "}
								</Button>
								<FieldDescription className="text-center">
									Don&apos;t have an account?{" "}
									<Link to="/sign-up" className="text-primary hover:underline">
										Sign up
									</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
