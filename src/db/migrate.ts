// import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import config from '../../drizzle.config';
import { connection } from './database.config';

async function runMigrations() {
  const sql = connection.sql; // This will create the connection if needed
  const db = drizzle(sql);

  await migrate(db, { migrationsFolder: config.out });
  await connection.end();
}

runMigrations().catch((error) => {
  console.error(error);
  process.exit(1);
});
