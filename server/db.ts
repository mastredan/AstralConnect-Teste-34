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

// Configure postgres client with better connection settings for Neon
const client = postgres(databaseUrl, {
  // Connection pool settings
  max: 5, // Maximum number of connections
  idle_timeout: 20, // Seconds to wait before closing idle connections
  connect_timeout: 60, // Seconds to wait for connection
  
  // Retry configuration
  max_lifetime: 60 * 10, // 10 minutes max connection lifetime
  
  // SSL configuration for managed databases
  ssl: databaseUrl.includes('neon.tech') ? 'require' : false,
  
  // Connection error handling
  onnotice: () => {}, // Suppress notices
  
  // Handle connection drops gracefully
  connection: {
    statement_timeout: 0,
    idle_in_transaction_session_timeout: 0,
  }
});

export const db = drizzle(client, { schema });