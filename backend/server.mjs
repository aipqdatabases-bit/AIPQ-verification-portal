import { createServer } from "node:http";
import "./env.mjs";
import { closeRegisterPool } from "./register.mjs";
import { verify } from "./verification.mjs";

const maxBodyBytes = 4_096;

async function readBody(request) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    bytes += chunk.length;
    if (bytes > maxBodyBytes) return undefined;
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

function send(response, status, body) {
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

const server = createServer({ requestTimeout: 15_000 }, async (request, response) => {
  if (request.url !== "/api/verification") {
    return send(response, 404, { error: "Unknown endpoint." });
  }
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return send(response, 405, { error: "Use POST to verify a record." });
  }

  let body;
  try {
    body = await readBody(request);
  } catch {
    if (!response.destroyed) send(response, 400, { error: "Enter a valid search request." });
    return;
  }

  if (body === undefined) {
    response.setHeader("Connection", "close");
    return send(response, 413, { error: "Search request is too large." });
  }

  const result = await verify(body);
  if (!response.destroyed) send(response, result.status, result.body);
});

const host = process.env.HOST ?? (process.env.RAILWAY_ENVIRONMENT_ID ? "::" : "127.0.0.1");
const port = Number(process.env.PORT ?? 4000);
server.listen(port, host, () => {
  console.log(`Verification backend listening on port ${server.address().port}.`);
});

function stop() {
  server.close(() => {
    closeRegisterPool().catch(() => {
      console.error("Could not close the verification database pool.");
      process.exitCode = 1;
    });
  });
}

process.once("SIGTERM", stop);
process.once("SIGINT", stop);
