import Image from "next/image";
import { useId, useRef, type ReactNode } from "react";
import { Icon, type IconName } from "./portal-icon";
import type { VerificationType } from "./verification";

const email = "verify@aipqusa.com";
const institute = "American Institute of Professional Qualification";

type Navigate = (section: string, type?: VerificationType) => void;

export const navigationLinks = [
  ["top", "Verify"],
  ["how", "How it works"],
  ["states", "Result states"],
  ["faq", "Help & FAQ"],
  ["report", "Report a forgery"],
] as const;

const steps = [
  [
    "Enter the reference",
    "Type the certificate reference, centre ID or membership number as printed. You can also look up a learning centre by name.",
  ],
  [
    "Check the sample register",
    "Your request is matched against the demo records. A correctly formatted number needs a matching record to return award details.",
  ],
  [
    "See the current status",
    "Results include the sample record’s status, a verification reference and a timestamp. You can print or save the result for your records.",
  ],
];

const states: {
  name: string;
  style: string;
  icon: IconName;
  description: string;
}[] = [
  {
    name: "Valid",
    style: "ok",
    icon: "check",
    description:
      "The certificate is in good standing. The result displays the award details and transcript.",
  },
  {
    name: "Superseded",
    style: "warn",
    icon: "warning",
    description:
      "A newer certificate has replaced this one. The result identifies the certificate that now carries the award.",
  },
  {
    name: "Revoked",
    style: "bad",
    icon: "cross",
    description:
      "AIPQ withdrew the certificate. The result gives the date and reason for the withdrawal.",
  },
  {
    name: "Not found",
    style: "none",
    icon: "search",
    description:
      "No record matches the details entered. Check the reference against the number printed on the certificate.",
  },
];

const questions = [
  [
    "What does a verification result show?",
    "A certificate result shows its status, qualification, level, credits, issue date, and transcript of subjects and grades. The sample transcript displays a masked identity document number.",
  ],
  [
    "Is a certificate with a valid-looking number automatically genuine?",
    "A certificate’s authenticity depends on a matching entry in AIPQ’s official register. This demo checks a set of sample records.",
  ],
  [
    "What does the QR code on a certificate do?",
    "A certificate QR code can link to its record so a verifier can check the certificate’s status. For help with a printed certificate, contact AIPQ.",
  ],
  [
    "Does an AIPQ award mean government recognition?",
    "Employers, institutions and government authorities make their own decisions about recognition, accreditation and equivalency.",
  ],
];

export function BrandLogo({ onDark = false }: { onDark?: boolean }) {
  return (
    <Image
      className="brand-logo"
      src={onDark ? "/assets/aipq-footer.svg" : "/assets/aipq.svg"}
      alt={institute}
      width={1824}
      height={500}
      unoptimized
    />
  );
}

export function PortalInformation() {
  return (
    <>
      <section className="block" id="how">
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">How verification works</span>
            <h2>One register. One honest answer.</h2>
            <p>
              Try a sample to see how the portal displays the status of a
              certificate, learning centre or membership.
            </p>
          </div>
          <ol className="steps">
            {steps.map(([title, description], index) => (
              <li className="step" key={title}>
                <div className="n" aria-hidden="true">
                  {index + 1}
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="block border-y border-[var(--line)] bg-white"
        id="states"
      >
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">What a result can say</span>
            <h2>Four clear outcomes</h2>
            <p>Each certificate lookup returns one of these states.</p>
          </div>
          <div className="states">
            {states.map(({ name, style, icon, description }) => (
              <div className="statecard" key={name}>
                <span className={`pill pill--${style}`}>
                  <Icon name={icon} />
                  {name}
                </span>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block" id="faq">
        <div className="wrap">
          <div className="faqgrid">
            <div className="section-head !mb-0">
              <span className="kicker">Help &amp; FAQ</span>
              <h2>Common questions</h2>
              <p>
                Find out what a verification result shows and what an AIPQ award
                means.
              </p>
              <p>
                For help, email{" "}
                <a className="font-bold" href={`mailto:${email}`}>
                  {email}
                </a>
                .
              </p>
            </div>
            <div className="faq">
              {questions.map(([question, answer]) => (
                <details className="acc" key={question}>
                  <summary>
                    {question}
                    <span className="ic">
                      <Icon name="plus" />
                    </span>
                  </summary>
                  <p className="body">{answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div id="report" className="govbox report-box">
            <div>
              <span className="kicker">Report a suspected forgery</span>
              <p>
                Seen an altered certificate or a centre claiming AIPQ approval?
                Email the verification team with your concern.
              </p>
            </div>
            <a
              className="btn btn--gold"
              href={`mailto:${email}?subject=AIPQ%20verification%20enquiry`}
            >
              <Icon name="mail" /> Email {email}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function FooterNotice({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <li>
      <button
        className="footer-notice-trigger cursor-pointer text-left"
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        {title}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        className="m-auto w-11/12 max-w-md rounded-2xl border border-[var(--line)] bg-white p-6 text-[var(--body)] shadow-xl backdrop:bg-slate-950/60"
      >
        <h2 id={titleId} className="text-2xl">
          {title}
        </h2>
        <p className="mt-3">{children}</p>
        <form method="dialog" className="mt-5 flex justify-end">
          <button className="btn btn--navy" type="submit">
            Close
          </button>
        </form>
      </dialog>
    </li>
  );
}

export function PortalFooter({ navigate }: { navigate: Navigate }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <div className="max-[981px]:col-span-full">
            <BrandLogo onDark />
            <p className="about">
              This preview shows how credential holders, employers and
              institutions can check AIPQ certificates, transcripts, learning
              centre approvals and memberships using sample records.
            </p>
          </div>
          <div>
            <h4>Verify</h4>
            <ul>
              <li>
                <a
                  href="#search"
                  onClick={(event) => {
                    event.preventDefault();
                    navigate("search", "cert");
                  }}
                >
                  Certificate &amp; transcript
                </a>
              </li>
              <li>
                <a
                  href="#search"
                  onClick={(event) => {
                    event.preventDefault();
                    navigate("search", "centre");
                  }}
                >
                  Learning centre
                </a>
              </li>
              <li>
                <a
                  href="#how"
                  onClick={(event) => {
                    event.preventDefault();
                    navigate("how");
                  }}
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#states"
                  onClick={(event) => {
                    event.preventDefault();
                    navigate("states");
                  }}
                >
                  Result states
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li>
                <a href={`mailto:${email}`}>{email}</a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={(event) => {
                    event.preventDefault();
                    navigate("faq");
                  }}
                >
                  Help &amp; FAQ
                </a>
              </li>
              <li>
                <a
                  href="#report"
                  onClick={(event) => {
                    event.preventDefault();
                    navigate("report");
                  }}
                >
                  Report a forgery
                </a>
              </li>
              <FooterNotice title="Privacy notice">
                This demo compares each lookup with sample records in your
                browser. Use the example references for testing. Contact AIPQ
                with privacy questions about its verification service.
              </FooterNotice>
              <FooterNotice title="Terms of use">
                Use this preview to explore the sample records. Contact AIPQ for
                official confirmation of a credential’s authenticity or status.
                The relevant employer, institution or authority decides whether
                to recognise a credential.
              </FooterNotice>
            </ul>
          </div>
        </div>
        <p className="footer__gov">
          <strong>Governance notice.</strong> Results in this preview come from
          sample records. Official verification confirms a credential’s
          authenticity and status in AIPQ’s records at the time of the search.
          Decisions about recognition, accreditation or equivalency rest with
          the relevant employer, institution or authority.
        </p>
        <div className="footer__bot">
          © 2026 {institute}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
