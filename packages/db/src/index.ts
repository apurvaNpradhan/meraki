import { env } from "@meraki/env/server";
import { neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

//Transactions don't work on neon-http
// const sql = neon(env.DATABASE_URL || "");
export const db = drizzle({ connection: env.DATABASE_URL, ws: ws, schema });
