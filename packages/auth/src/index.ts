import { expo } from "@better-auth/expo";
import { db } from "@meraki/db";
import * as schema from "@meraki/db/schema/auth";
import { env } from "@meraki/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession, organization } from "better-auth/plugins";
import { eq } from "drizzle-orm";

const _getInitialOrganization = async (_userId: string) => {
	const _member = await db.query.member.findFirst({
		with: {
			organization: true,
		},
	});
};

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",

		schema: schema,
	}),
	trustedOrigins: [env.CORS_ORIGIN, "mybettertapp://", "exp://"],
	emailAndPassword: {
		enabled: true,
	},
	// uncomment cookieCache setting when ready to deploy to Cloudflare using *.workers.dev domains
	// session: {
	//   cookieCache: {
	//     enabled: true,
	//     maxAge: 60,
	//   },
	// },
	socialProviders: {
		github: {
			enabled: true,
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
		},
		/* 	google:{
			enabled:true,
			clientId:env.GOOGLE_CLIENT_ID,
			clientSecret:env.GOOGLE_CLIENT_SECRET,
		} */
	},
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	session: {
		additionalFields: {
			activeOrganizationId: {
				type: "string",
				required: false,
			},
		},
	},
	user: {
		additionalFields: {
			onboardingCompleted: {
				type: "date",
				required: false,
				defaultValue: null,
				input: true,
			},
			defaultOrganizationId: {
				type: "string",
				required: true,
				defaultValue: null,
				input: true,
			},
		},
	},
	databaseHooks: {
		session: {
			create: {
				before: async (session) => {
					const member = await db.query.member.findFirst({
						where: eq(schema.member.userId, session.userId ?? ""),
						with: {
							organization: true,
						},
					});
					return {
						data: {
							...session,
							...(member?.organizationId && {
								activeOrganizationId: member?.organizationId,
							}),
						},
					};
				},
			},
		},
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
		// uncomment crossSubDomainCookies setting when ready to deploy and replace <your-workers-subdomain> with your actual workers subdomain
		// https://developers.cloudflare.com/workers/wrangler/configuration/#workersdev
		// crossSubDomainCookies: {
		//   enabled: true,
		//   domain: "<your-workers-subdomain>",
		// },
	},
	plugins: [
		organization(),
		expo(),
		customSession(async ({ user, session }) => {
			return {
				session: {
					...session,
					activeOrganizationId: (session as any).activeOrganizationId,
				},
				user: {
					...user,
					onboardingCompleted: (user as any).onboardingCompleted,
				},
			};
		}),
	],
});
