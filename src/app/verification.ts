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
  checkedAt: string;
} & (
  | { type: "cert"; record?: Certificate }
  | { type: "centre"; record?: Centre }
  | { type: "member"; record?: Member }
);

export type VerificationResponse =
  | { result: VerificationResult }
  | { error: string };

export const verificationQueryLimit = 120;
export const verificationUnavailable =
  "Verification is temporarily unavailable. Please try again shortly.";

export function formatRecordDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
