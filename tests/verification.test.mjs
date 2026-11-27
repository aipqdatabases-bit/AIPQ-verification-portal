import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { test } from "node:test";
import { promisify } from "node:util";
import pg from "pg";
import { centres, certificates, members } from "./fixtures/sample-register.mjs";
import { seedRegister } from "./fixtures/seed-register.mjs";

const run = promisify(execFile);
const certificateReference = "AIPQ-BUS-2024-000481";

async function verificationEndpoint(server) {
  let output = "";
  const exited = once(server, "exit").then(() => {
    throw new Error("The Next.js test server exited before starting.");
  });
  const listening = (async () => {
    for await (const chunk of server.stdout.iterator({ destroyOnReturn: false })) {
      output += chunk.toString();
      const address = output.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
      if (address) return address;
    }
    throw new Error("The Next.js test server did not report its address.");
  })();
  const origin = await Promise.race([listening, exited]);
  server.stdout.resume();
  return `${origin}/api/verification`;
}

async function verify(endpoint, type, query, expectedStatus = 200) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, query }),
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(response.status, expectedStatus);
  assert.equal(response.headers.get("cache-control"), "no-store");
  return response.json();
}

test("the verification API reads the migrated PostgreSQL register", { timeout: 45_000 }, async (t) => {
  assert.ok(process.env.TEST_DATABASE_URL, "Set TEST_DATABASE_URL to a local PostgreSQL server with CREATE DATABASE access.");
  const admin = new pg.Client({ connectionString: process.env.TEST_DATABASE_URL });
  await admin.connect();

  const databaseName = `aipq_test_${randomUUID().replaceAll("-", "")}`;
  const testUrl = new URL(process.env.TEST_DATABASE_URL);
  testUrl.pathname = `/${databaseName}`;
  const env = { ...process.env, DATABASE_URL: testUrl.href };
  let server;
  let databaseCreated = false;
  t.after(async () => {
    try {
      if (server && server.exitCode === null && server.signalCode === null) {
        const closed = once(server, "close");
        server.kill();
        await closed;
      }
      if (databaseCreated) await admin.query(`DROP DATABASE "${databaseName}" WITH (FORCE)`);
    } finally {
      await admin.end();
    }
  });

  await admin.query(`CREATE DATABASE "${databaseName}"`);
  databaseCreated = true;
  const migrate = () => run(process.execPath, ["db/migrate.mjs"], { env, timeout: 20_000 });
  assert.match((await migrate()).stdout, /Applied 001_create_register\.sql/);

  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "0"],
    { env, stdio: ["ignore", "pipe", "inherit"], windowsHide: true },
  );
  const endpoint = await verificationEndpoint(server);

  await t.test("returns a normal no-match result against the empty database", async () => {
    for (const [type, query] of [
      ["cert", certificateReference], ["centre", "Missing Centre"], ["member", "AIPQ-M-000001"],
    ]) {
      const { result } = await verify(endpoint, type, query);
      assert.equal(result.id, query);
      assert.equal(result.type, type);
      assert.equal(result.record, undefined);
      assert.match(result.reference, /^VR-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
      assert.equal(new Date(result.checkedAt).toISOString(), result.checkedAt);
    }
  });

  const client = new pg.Client({ connectionString: testUrl.href });
  await client.connect();
  try {
    await seedRegister(client);
  } finally {
    await client.end();
  }
  assert.match((await migrate()).stdout, /No pending migrations/);

  await t.test("returns every fixture intact after the second migration", async () => {
    for (const [type, records] of [
      ["cert", certificates], ["centre", centres], ["member", members],
    ]) {
      for (const [id, record] of Object.entries(records)) {
        const { result } = await verify(endpoint, type, id);
        assert.equal(result.id, id);
        assert.equal(result.type, type);
        assert.deepEqual(result.record, record);
      }
    }
  });

  await t.test("normalizes references and resolves centre names consistently", async () => {
    const cert = await verify(endpoint, "cert", "  aipq ‑ bus – 2024 - 000481 ");
    assert.equal(cert.result.id, certificateReference);
    const member = await verify(endpoint, "member", " aipq-m - 015907 ");
    assert.equal(member.result.id, "AIPQ-M-015907");
    assert.equal(member.result.record.title, "");
    assert.equal(member.result.record.post, "");
    const centre = await verify(endpoint, "centre", "  pACifiC   inSTitute ");
    assert.equal(centre.result.id, "AIPQ-CTR-US-0117");
    const ambiguousCentre = await verify(endpoint, "centre", "a");
    assert.equal(ambiguousCentre.result.id, "AIPQ-CTR-US-0043");
    const wildcard = await verify(endpoint, "centre", "%");
    assert.equal(wildcard.result.record, undefined);
  });

  await t.test("distinguishes invalid input from a database outage", async () => {
    assert.match((await verify(endpoint, "cert", "invalid", 400)).error, /Use the format/);
    assert.match((await verify(endpoint, "member", "  ", 400)).error, /Please enter a membership number/);
    assert.match((await verify(endpoint, "invalid", "query", 400)).error, /valid verification type/);
    assert.match((await verify(endpoint, "centre", "a".repeat(121), 400)).error, /valid reference or name/);

    await admin.query(`ALTER DATABASE "${databaseName}" ALLOW_CONNECTIONS false`);
    await admin.query(
      "SELECT pg_terminate_backend(pid, 5000) FROM pg_stat_activity WHERE datname = $1",
      [databaseName],
    );
    const response = await verify(endpoint, "cert", certificateReference, 503);
    assert.deepEqual(response, { error: "Verification is temporarily unavailable. Please try again shortly." });
  });
});
