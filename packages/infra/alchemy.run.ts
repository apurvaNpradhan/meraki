import alchemy from "alchemy";
import { R2Bucket, Vite, Worker } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env" });

const app = await alchemy("meraki");
const bucket = await R2Bucket("meraki-bucket", {
	name: "meraki-bucket",
});
export const web = await Vite("web", {
	name: "meraki",
	cwd: "../../apps/web",
	assets: "dist",
	bindings: {
		VITE_SERVER_URL: alchemy.env.VITE_SERVER_URL!,
	},
});

export const server = await Worker("server", {
	name: "meraki-server",
	cwd: "../../apps/server",
	entrypoint: "src/index.ts",
	compatibility: "node",
	bindings: {
		DATABASE_URL: alchemy.secret.env.DATABASE_URL!,
		CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
		BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
		BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
		RESEND_API_KEY: alchemy.env.RESEND_API_KEY!,
		RESEND_EMAIL_SENDER_NAME: alchemy.env.RESEND_EMAIL_SENDER_NAME!,
		RESEND_EMAIL_SENDER_ADDRESS: alchemy.env.RESEND_EMAIL_SENDER_ADDRESS!,
		GITHUB_CLIENT_ID: alchemy.env.GITHUB_CLIENT_ID!,
		GITHUB_CLIENT_SECRET: alchemy.env.GITHUB_CLIENT_SECRET!,
		BASE_BUCKET: bucket,
	},
	dev: {
		port: 3000,
	},
});

console.log(`Web    -> ${web.url}`);
console.log(`Server -> ${server.url}`);

await app.finalize();
