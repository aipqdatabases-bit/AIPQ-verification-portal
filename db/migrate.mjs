import { readdir, readFile } from "node:fs/promises";
import pg from "pg";

const migrationsDirectory = new URL("./migrations/", import.meta.url);

async function migrate(connectionString) {
  const migrations = (await readdir(migrationsDirectory))
    .filter((file) => /^\d+_.+\.sql$/.test(file))
    .sort();
  if (!migrations.length) throw new Error("No migration files found.");

  const client = new pg.Client({
    connectionString,
    connectionTimeoutMillis: 5_000,
    statement_timeout: 30_000,
  });
  let currentMigration;

  try {
    await client.connect();
    await client.query("BEGIN");
    await client.query("SET LOCAL lock_timeout = '10s'");
    // Serialize migrations from concurrent deploys on the same database.
    await client.query("SELECT pg_advisory_xact_lock(854431, 1)");
    await client.query("CREATE SCHEMA IF NOT EXISTS aipq");
    await client.query(`
      CREATE TABLE IF NOT EXISTS aipq.schema_migrations (
        filename text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const { rows } = await client.query(
      "SELECT filename FROM aipq.schema_migrations",
    );
    const applied = new Set(rows.map(({ filename }) => filename));
    const pending = migrations.filter((file) => !applied.has(file));

    for (const file of pending) {
      currentMigration = file;
      const sql = await readFile(new URL(file, migrationsDirectory), "utf8");
      await client.query(sql);
      await client.query(
        "INSERT INTO aipq.schema_migrations (filename) VALUES ($1)",
        [file],
      );
    }

    await client.query("COMMIT");
    console.log(
      pending.length ? `Applied ${pending.join(", ")}.` : "No pending migrations.",
    );
  } catch (error) {
    // Closing the connection rolls back any unfinished transaction.
    const code = typeof error?.code === "string" && /^[A-Z0-9_]{1,32}$/.test(error.code)
      ? ` (${error.code})`
      : "";
    const migration = currentMigration ? ` in ${currentMigration}` : "";
    throw new Error(`Database migration failed${migration}${code}.`);
  } finally {
    await client.end();
  }
}

try {
  if (!process.env.DATABASE_URL) {
    throw new Error("Set DATABASE_URL before running migrations.");
  }
  await migrate(process.env.DATABASE_URL);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
