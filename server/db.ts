import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Build DATABASE_URL if not set
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGHOST && process.env.PGPORT && process.env.PGDATABASE) {
  databaseUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
}

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set or PostgreSQL environment variables (PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE) must be provided. Did you forget to provision a database?",
  );
}

const client = postgres(databaseUrl);
export const db = drizzle(client, { schema });