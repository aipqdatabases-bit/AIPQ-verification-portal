import { centres, certificates, members } from "./sample-register";

export type VerificationType = "cert" | "centre" | "member";

export type Certificate = {
  progName: string;
  progCode: string;
  level: string;
  credits: number;
  issued: string;
  learnerRef: string;
  name: string;
  passport: string;
  centre: string;
  subjects: { code: string; name: string; grade: string; credits: number }[];
} & (
  | { status: "valid" }
  | { status: "superseded"; supersededBy: string; supersedeReason: string }
  | { status: "revoked"; revokedOn: string; revokeReason: string }
);

export type Centre = {
  name: string;
  loc: string;
  since: string;
  through: string;
  scope: string[];
} & ({ status: "approved" } | { status: "suspended"; suspendNote: string });

export type Member = {
  name: string;
  tier: string;
  title: string;
  post: string;
  since: string;
} & ({ status: "active" } | { status: "inactive"; inactiveNote: string });

export type VerificationResult = {
  id: string;
  reference: string;
  checkedAt: Date;
} & (
  | { type: "cert"; record?: Certificate }
  | { type: "centre"; record?: Centre }
  | { type: "member"; record?: Member }
);

const certificateFormat = /^AIPQ-[A-Z]{2,4}-\d{4}-\d{4,6}$/;

const entryLabels: Record<VerificationType, string> = {
  cert: "a certificate reference number",
  centre: "a centre approval ID or name",
  member: "a membership number",
};

function normalizeReference(value: string) {
  return value
    .toUpperCase()
    .replace(/[\s]+/g, "")
    .replace(/[‐‑‒–—−]/g, "-");
}

function verificationReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const code = Array.from(
    crypto.getRandomValues(new Uint8Array(8)),
    (byte) => alphabet[byte % alphabet.length],
  ).join("");
  return `VR-${code.slice(0, 4)}-${code.slice(4)}`;
}

export function verify(
  type: VerificationType,
  input: string,
): { error: string } | { result: VerificationResult } {
  const value = input.trim();
  if (!value) return { error: `Please enter ${entryLabels[type]}.` };

  const id = normalizeReference(value);
  if (type === "cert" && !certificateFormat.test(id)) {
    return {
      error:
        "Use the format AIPQ-[CODE]-[YEAR]-[SEQUENCE], for example AIPQ-BUS-2024-000481.",
    };
  }

  const details = {
    id,
    reference: verificationReference(),
    checkedAt: new Date(),
  };

  switch (type) {
    case "cert":
      return { result: { ...details, type, record: certificates[id] } };
    case "centre": {
      const name = value.toLowerCase().replace(/\s+/g, " ");
      const match = Object.hasOwn(centres, id)
        ? id
        : Object.keys(centres).find((key) =>
            centres[key].name.toLowerCase().includes(name),
          );
      return {
        result: {
          ...details,
          type,
          id: match ?? value,
          record: match ? centres[match] : undefined,
        },
      };
    }
    case "member":
      return {
        result: {
          ...details,
          type,
          record: Object.hasOwn(members, id) ? members[id] : undefined,
        },
      };
  }
}

export function formatRecordDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
