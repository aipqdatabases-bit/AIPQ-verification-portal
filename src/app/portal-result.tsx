import type { ReactNode, Ref } from "react";
import { Icon, type IconName } from "./portal-icon";
import {
  formatRecordDate,
  type Certificate,
  type VerificationResult,
} from "./verification";

const statusText = {
  valid: [
    "Valid certificate",
    "This sample certificate is in good standing.",
    "ok",
    "check",
  ],
  superseded: [
    "Superseded certificate",
    "A newer record replaced this certificate.",
    "warn",
    "warning",
  ],
  revoked: [
    "Revoked certificate",
    "AIPQ withdrew this sample certificate.",
    "bad",
    "cross",
  ],
  approved: [
    "Approved learning centre",
    "The sample register lists this centre as an approved AIPQ delivery partner.",
    "ok",
    "check",
  ],
  suspended: [
    "Approval suspended",
    "This centre’s approval is suspended in the sample register.",
    "warn",
    "warning",
  ],
  active: [
    "Active membership",
    "The sample register lists this member as active.",
    "ok",
    "check",
  ],
  inactive: [
    "Membership inactive",
    "This membership is inactive in the sample register.",
    "warn",
    "warning",
  ],
  missingCert: [
    "No matching record found",
    "No sample certificate matches the reference you entered.",
    "bad",
    "search",
  ],
  missingCentre: [
    "No matching centre found",
    "No sample centre matches the details you entered.",
    "bad",
    "search",
  ],
  missingMember: [
    "No matching membership found",
    "No sample membership matches the details you entered.",
    "bad",
    "search",
  ],
} as const;

const recordCards = {
  cert: {
    title: "Award record",
    icon: "shield",
    missing: "missingCert",
    issuer: "Issued by",
  },
  centre: {
    title: "Centre record",
    icon: "building",
    missing: "missingCentre",
    issuer: "Approved by",
  },
  member: {
    title: "Membership record",
    icon: "member",
    missing: "missingMember",
    issuer: "Issued by",
  },
} as const;

type RecordField = [label: string, value: ReactNode, fullWidth?: boolean];

function RecordFields({ fields }: { fields: RecordField[] }) {
  return (
    <dl className="dl">
      {fields.map(([label, value, fullWidth]) => (
        <div className={fullWidth ? "row full" : "row"} key={label}>
          <dt className="k">{label}</dt>
          <dd className="v">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Card({
  icon,
  title,
  tag,
  children,
}: {
  icon: IconName;
  title: string;
  tag?: string;
  children: ReactNode;
}) {
  return (
    <section className="card">
      <div className="card__h">
        <Icon name={icon} />
        <h3>{title}</h3>
        {tag && <span className="tagright">{tag}</span>}
      </div>
      <div className="card__b">{children}</div>
    </section>
  );
}

function Transcript({ record }: { record: Certificate }) {
  const fields: RecordField[] = [
    ["Student name", record.name],
    ["Learner reference no", record.learnerRef],
    [
      "Identity document",
      <>
        {record.passport}
        <small>Masked identity document number</small>
      </>,
    ],
  ];

  return (
    <Card icon="document" title="Verified transcript" tag="Sample record">
      <div className="mb-[18px]">
        <RecordFields fields={fields} />
      </div>
      <div className="transcript-entries">
        <ul
          aria-label="Transcript subjects"
          role="list"
          className="divide-y divide-[var(--line)]"
        >
          {record.subjects.map((subject) => (
            <li key={subject.code} className="grid gap-1 py-2.5">
              <span className="text-sm tabular-nums text-[var(--muted)]">
                {subject.code}
              </span>
              <p className="font-semibold leading-snug text-[var(--ink)]">
                {subject.name}
              </p>
              <div className="flex flex-wrap items-baseline gap-x-4 text-sm">
                <span className="font-semibold text-[var(--navy-800)]">
                  {subject.grade}
                </span>
                <span className="text-[var(--muted)]">
                  {subject.credits} credits
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className="flex justify-between gap-3 border-t border-[var(--line-2)] pt-3 text-sm font-bold text-[var(--ink)]">
          <span>Total credits awarded</span>
          <span>{record.credits}</span>
        </p>
      </div>
      <table className="tx" aria-label="Transcript subjects">
        <thead>
          <tr>
            <th scope="col">Code</th>
            <th scope="col">Subject studied</th>
            <th scope="col" className="num">
              Grade<span className="max-[760px]:hidden"> obtained</span>
            </th>
            <th scope="col" className="num">
              Credits
            </th>
          </tr>
        </thead>
        <tbody>
          {record.subjects.map((subject) => (
            <tr key={subject.code}>
              <td className="code">{subject.code}</td>
              <td className="subj">{subject.name}</td>
              <td className="num">
                <span className="gradetext">{subject.grade}</span>
              </td>
              <td className="num">{subject.credits}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="text-right">
              Total credits awarded
            </td>
            <td className="num">{record.credits}</td>
          </tr>
        </tfoot>
      </table>
    </Card>
  );
}

function recordDetails(result: VerificationResult): {
  fields: RecordField[];
  extra?: ReactNode;
  note?: ReactNode;
} {
  if (!result.record) {
    return {
      fields: [["Search entry", result.id, true]],
      note: "Check the reference or name as printed and try again.",
    };
  }

  switch (result.type) {
    case "cert": {
      const { record } = result;
      let note: ReactNode;
      if (record.status === "superseded") {
        note = (
          <>
            {record.supersedeReason} The replacement reference is{" "}
            <strong>{record.supersededBy}</strong>.
          </>
        );
      }
      if (record.status === "revoked") {
        note = (
          <>
            {record.revokeReason} Revoked on{" "}
            <strong>{formatRecordDate(record.revokedOn)}</strong>.
          </>
        );
      }
      return {
        fields: [
          ["Qualification / program name", record.progName, true],
          ["Certificate reference no", result.id],
          ["Qualification / program code", record.progCode],
          ["Qualification level", record.level],
          ["Total credits", `${record.credits} credits`],
          ["Date of issue", formatRecordDate(record.issued)],
          ["Learner reference no", record.learnerRef],
          ["Awarded to", record.name, true],
          ["Delivered at", record.centre, true],
        ],
        extra: <Transcript record={record} />,
        note,
      };
    }
    case "centre": {
      const { record } = result;
      return {
        fields: [
          ["Centre name", record.name, true],
          ["Centre approval ID", result.id],
          ["Location", record.loc],
          ["Approved since", record.since],
          ["Approval valid through", record.through],
        ],
        extra: (
          <Card icon="list" title="Approved scope of delivery">
            <ul className="scope">
              {record.scope.map((entry) => (
                <li key={entry}>
                  <Icon name="check" />
                  {entry}
                </li>
              ))}
            </ul>
          </Card>
        ),
        note: record.status === "suspended" ? record.suspendNote : undefined,
      };
    }
    case "member": {
      const { record } = result;
      return {
        fields: [
          ["Full name", record.name, true],
          ["Membership number", result.id],
          ["Record status", record.status === "active" ? "Active" : "Inactive"],
          ["Membership level", record.tier],
          ["Membership title", record.title || "—", true],
          ["Designatory letters", record.post || "—"],
          ["Member since", record.since],
        ],
        note: record.status === "inactive" ? record.inactiveNote : undefined,
      };
    }
  }
}

export function PortalResult({
  result,
  onBack,
  headingRef,
}: {
  result: VerificationResult;
  onBack: () => void;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  const card = recordCards[result.type];
  const [title, message, tone, icon] =
    statusText[result.record?.status ?? card.missing];
  const { fields, extra, note } = recordDetails(result);
  const timestamp = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(result.checkedAt);

  function printResult() {
    window.print();
  }

  return (
    <main>
      <section className="result-top">
        <div className="wrap">
          <div className="result-actions">
            <button className="backlink" type="button" onClick={onBack}>
              <Icon name="back" />
              New verification
            </button>
            <button
              className="result-print-mobile"
              type="button"
              aria-label="Print / save result"
              onClick={printResult}
            >
              <Icon name="print" />
              Print / save
            </button>
          </div>
          <div className="statusbanner">
            <div className={`mark mark--${tone}`}>
              <Icon name={icon} />
            </div>
            <div className="st">
              <h1 ref={headingRef} tabIndex={-1}>
                {title}
              </h1>
              <p>{message}</p>
            </div>
            <div className="meta">
              <div className="vref">Demo verification reference</div>
              <div className="vval">{result.reference}</div>
              <div className="vtime">Checked {timestamp}</div>
            </div>
          </div>
          {note && (
            <div className={`alertline alertline--${tone}`}>
              <Icon name={tone === "warn" ? "warning" : "info"} />
              <p>{note}</p>
            </div>
          )}
        </div>
      </section>

      <div className="result-body">
        <div className="wrap result-grid">
          <div>
            <Card
              icon={card.icon}
              title={card.title}
              tag={result.record ? "Sample register" : "No match"}
            >
              <RecordFields fields={fields} />
            </Card>
            {extra}
          </div>
          <aside className="side" aria-label="Result options">
            {result.record && (
              <div className="card">
                <div className="issuer-badge">
                  <div>
                    <div className="t">{card.issuer}</div>
                    <div className="n">
                      American Institute of Professional Qualification
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="sideactions">
              <button
                className="btn btn--navy"
                type="button"
                onClick={printResult}
              >
                <Icon name="print" />
                Print / save result
              </button>
            </div>
            <div className="govbox">
              <span className="kicker">Scope of this result</span>
              <p>
                This result uses sample data. Contact AIPQ to confirm a
                credential’s real status.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
