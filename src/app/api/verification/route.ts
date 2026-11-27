import { verificationUnavailable } from "../../verification";

export const runtime = "nodejs";

const headers = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

function unavailable() {
  return Response.json({ error: verificationUnavailable }, { status: 503, headers });
}

export async function POST(request: Request) {
  const backendUrl = process.env.VERIFICATION_BACKEND_URL;
  if (!backendUrl) {
    console.error("VERIFICATION_BACKEND_URL is missing.");
    return unavailable();
  }

  try {
    const endpoint = new URL("/api/verification", backendUrl);
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: request.body,
      duplex: "half" as const,
      cache: "no-store" as const,
      redirect: "error" as const,
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(12_000)]),
    };
    const response = await fetch(endpoint, options);
    if (![200, 400, 413, 503].includes(response.status)) {
      await response.body?.cancel();
      return unavailable();
    }
    return new Response(response.body, { status: response.status, headers });
  } catch {
    if (!request.signal.aborted) console.error("Verification backend request failed.");
    return unavailable();
  }
}
