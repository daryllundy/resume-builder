import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Explicitly set the WebSocket constructor for Neon
neonConfig.webSocketConstructor = ws;

// Workaround for connection issues - add more error handling in storage.ts

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure the pool with explicit options
const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({ 
  connectionString,
  // Add connection pool settings for better stability
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000
});

export const db = drizzle(pool, { schema });