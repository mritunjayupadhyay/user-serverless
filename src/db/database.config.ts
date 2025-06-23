import { drizzle } from 'drizzle-orm/postgres-js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import postgres = require('postgres');
import * as dotenv from 'dotenv';
import * as schema from './schema';

// Connection pooling is different in serverless environments
let db: PostgresJsDatabase<typeof schema>;
let sql: ReturnType<typeof postgres>;

// Create a new Drizzle client (avoiding multiple connections in serverless environment)
function createDrizzleClient(): PostgresJsDatabase<typeof schema> {
  dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

  const isProduction = process.env.NODE_ENV === 'production';
  console.log('isProduction', isProduction);

  const connectionString = process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    throw new Error('NEON_DATABASE_URL is required');
  }

  // Optimized config for Neon serverless
  const config: postgres.Options<any> = {
    // Since you're using Neon's pooled connection, we can have slightly more connections
    max: isProduction ? 1 : 2,

    // Neon handles SSL automatically, but we can be explicit
    ssl: 'require',

    // Connection timeouts optimized for serverless
    idle_timeout: 20, // 20 seconds - quick cleanup
    connect_timeout: 10, // 10 seconds - fail fast

    // Disable prepared statements for better compatibility with pooled connections
    prepare: false,

    // Enable debug logging based on LOG_LEVEL
    debug: process.env.LOG_LEVEL === 'debug',
  };

  console.log('Connecting to Neon database...');

  // Create postgres connection
  sql = postgres(connectionString, config);

  // Create drizzle instance
  return drizzle(sql, { schema });
}

// Export a function to get the DB connection (ensures connection reuse)
export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!db) {
    db = createDrizzleClient();
  }
  return db;
}

// Export for migrations and cleanup (compatible with both pg and postgres patterns)
export const connection = {
  // For migration compatibility - returns the postgres.js sql instance
  get pool() {
    if (!sql) {
      // Ensure the connection is created if accessed directly
      db = createDrizzleClient();
    }
    return sql;
  },

  // Direct access to postgres.js sql instance
  get sql() {
    if (!sql) {
      db = createDrizzleClient();
    }
    return sql;
  },

  // Cleanup function
  end: async () => {
    if (sql) {
      await sql.end();
      sql = undefined!;
      db = undefined!;
    }
  },
};
