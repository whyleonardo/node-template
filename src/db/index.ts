import { env } from "@/env"
import { drizzle } from "drizzle-orm/postgres-js"
import { Client } from "pg"
import * as schema from "./schema"

const client = new Client(env.DATABASE_URL)

export const db = drizzle(client, { schema })
