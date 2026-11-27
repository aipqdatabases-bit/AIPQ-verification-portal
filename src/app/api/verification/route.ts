import { randomBytes } from "node:crypto";
import {
  verificationQueryLimit,
  verificationUnavailable,
  type VerificationResponse,
  type VerificationType,
} from "../../verification";
import { findRecord } from "./register";

export const runtime = "nodejs";

const certificateFormat = /^AIPQ-[A-Z]{2,4}-\d{4}-\d{4,6}$/;
const entryLabels: Record<VerificationType, string> = {
  cert: "a certificate reference number",
  centre: "a centre approval ID or name",
  member: "a membership number",
};

function verificationReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const code = Array.from(
    randomBytes(8),
    (byte) => alphabet[byte % alphabet.length],
  ).join("");
  return `VR-${code.slice(0, 4)}-${code.slice(4)}`;
}

function reply(body: VerificationResponse, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("type" in body) || !("query" in body)) {
    return reply({ error: "Enter a verification type and search entry." }, 400);
  }

  const { type, query } = body;
  if (type !== "cert" && type !== "centre" && type !== "member") {
    return reply({ error: "Choose a valid verification type." }, 400);
  }
  if (typeof query !== "string" || !query.trim()) {
    return reply({ error: `Please enter ${entryLabels[type]}.` }, 400);
  }
  if (query.length > verificationQueryLimit || query.includes("\0")) {
    return reply({ error: "Enter a valid reference or name as printed." }, 400);
  }

  const value = query.trim();
  const id = value.toUpperCase().replace(/\s+/g, "").replace(/[‐‑‒–—−]/g, "-");
  if (type === "cert" && !certificateFormat.test(id)) {
    return reply({
      error: "Use the format AIPQ-[CODE]-[YEAR]-[SEQUENCE], for example AIPQ-BUS-2024-000481.",
    }, 400);
  }

  try {
    const found = await findRecord(type, id, value);
    return reply({
      result: {
        ...found,
        reference: verificationReference(),
        checkedAt: new Date().toISOString(),
      },
    }, 200);
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : "";
    const detail = typeof code === "string" && /^[A-Z0-9_]{1,32}$/.test(code)
      ? ` (${code})`
      : "";
    console.error(`Verification database lookup failed${detail}.`);
    return reply({ error: verificationUnavailable }, 503);
  }
}
