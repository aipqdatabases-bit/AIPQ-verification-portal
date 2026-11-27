"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  BrandLogo,
  navigationLinks,
  PortalFooter,
  PortalInformation,
} from "./portal-content";
import { Icon, type IconName } from "./portal-icon";
import { PortalResult } from "./portal-result";
import {
  verify,
  type VerificationResult,
  type VerificationType,
} from "./verification";

const tabs: VerificationType[] = ["cert", "centre", "member"];

function revealSection(section: string) {
  const destination = document.getElementById(section);
  destination?.scrollIntoView();
  if (section === "search") destination?.focus({ preventScroll: true });
}

const lookupOptions: Record<
  VerificationType,
  {
    tab: string;
    icon: IconName;
    title: string;
    description: string;
    label: string;
    placeholder: string;
    action: string;
    note: string;
    samples: [label: string, reference: string][];
  }
> = {
  cert: {
    tab: "Certificate & Transcript",
    icon: "certificate",
    title: "Verify a certificate & transcript",
    description:
      "Enter the reference as printed to see the award details and transcript.",
    label: "Certificate reference no",
    placeholder: "AIPQ-BUS-2024-000481",
    action: "Verify certificate",
    note: "The lookup checks for a matching sample record. Try the examples above to see valid, superseded, revoked and missing certificate results.",
    samples: [
      ["Valid · AIPQ‑BUS‑2024‑000481", "AIPQ-BUS-2024-000481"],
      ["Superseded", "AIPQ-HC-2023-000127"],
      ["Revoked", "AIPQ-IT-2022-000098"],
      ["Not found", "AIPQ-BUS-2019-000003"],
    ],
  },
  centre: {
    tab: "Learning Centre",
    icon: "building",
    title: "Verify a learning centre",
    description:
      "Search for a learning centre to see its approval status and scope in the sample register.",
    label: "Centre approval ID or name",
    placeholder: "e.g. AIPQ-CTR-US-0043",
    action: "Verify centre",
    note: "An approved centre can deliver the AIPQ qualifications listed in its record. Government endorsement and accreditation are determined separately.",
    samples: [
      ["Approved · Boston, MA", "AIPQ-CTR-US-0043"],
      ["Approved · Los Angeles, CA", "Pacific Institute"],
      ["Suspended", "AIPQ-CTR-US-0075"],
    ],
  },
  member: {
    tab: "Membership",
    icon: "member",
    title: "Verify a membership",
    description: "Look up a sample membership to see its grade and status.",
    label: "Membership number",
    placeholder: "AIPQ-M-004812",
    action: "Verify membership",
    note: "A membership result shows the grade and standing recorded by AIPQ. Licensing decisions are made by the relevant authorities.",
    samples: [
      ["Fellow · Active", "AIPQ-M-004812"],
      ["Associate · Active", "AIPQ-M-010233"],
      ["Inactive", "AIPQ-M-002190"],
    ],
  },
};

export function VerificationPortal() {
  const [type, setType] = useState<VerificationType>("cert");
  const [values, setValues] = useState({ cert: "", centre: "", member: "" });
  const [error, setError] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const focusMenuLink = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pendingSection = useRef<string | null>(null);
  const option = lookupOptions[type];

  useEffect(() => {
    if (result) {
      window.scrollTo({ top: 0, behavior: "instant" });
      headingRef.current?.focus({ preventScroll: true });
      return;
    }

    if (pendingSection.current) {
      revealSection(pendingSection.current);
      pendingSection.current = null;
    }
  }, [result]);

  useEffect(() => {
    if (!menuOpen) return;

    if (focusMenuLink.current) {
      headerRef.current?.querySelector<HTMLAnchorElement>(".nav a")?.focus();
      focusMenuLink.current = false;
    }

    function dismissOnOutsidePress(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node))
        setMenuOpen(false);
    }

    function dismissOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }

    document.addEventListener("pointerdown", dismissOnOutsidePress);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOnOutsidePress);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [menuOpen]);

  function selectType(nextType: VerificationType) {
    setType(nextType);
    setError("");
  }

  function updateValue(value: string) {
    setValues((current) => ({ ...current, [type]: value }));
    setError("");
  }

  function navigate(section: string, nextType?: VerificationType) {
    setMenuOpen(false);
    if (nextType) selectType(nextType);
    if (window.location.hash !== `#${section}`)
      window.history.pushState(null, "", `#${section}`);

    if (result) {
      pendingSection.current = section;
      setResult(null);
      return;
    }

    revealSection(section);
  }

  function followLink(event: MouseEvent<HTMLAnchorElement>, section: string) {
    event.preventDefault();
    navigate(section);
  }

  function moveTab(event: KeyboardEvent<HTMLButtonElement>) {
    const index = tabs.indexOf(type);
    const destinations: Record<string, VerificationType> = {
      ArrowLeft: tabs[(index + tabs.length - 1) % tabs.length],
      ArrowRight: tabs[(index + 1) % tabs.length],
      Home: tabs[0],
      End: tabs[tabs.length - 1],
    };
    const nextType = destinations[event.key];
    if (!nextType) return;

    event.preventDefault();
    selectType(nextType);
    document.getElementById(`tab-${nextType}`)?.focus();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const outcome = verify(type, values[type]);
    if ("error" in outcome) {
      setError(outcome.error);
      inputRef.current?.focus();
      return;
    }
    setError("");
    setResult(outcome.result);
  }

  return (
    <div id="top">
      <div className="ribbon">
        <div className="wrap">
          <span className="rhs">
            <Icon name="lock" size={12} /> Demo · Sample records
          </span>
        </div>
      </div>

      <header ref={headerRef} className="header">
        <div className="wrap">
          <a
            className="brand"
            href="#top"
            aria-label="AIPQ Verification Portal home"
            onClick={(event) => followLink(event, "top")}
          >
            <BrandLogo />
            <span className="brand-sep" aria-hidden="true" />
            <span className="brand-portal">
              Verification
              <br />
              Portal
            </span>
          </a>
          <nav
            className={`nav${menuOpen ? " nav--open" : ""}`}
            id="primary-navigation"
            aria-label="Primary"
          >
            {navigationLinks.map(([section, label]) => (
              <a
                key={section}
                href={`#${section}`}
                onClick={(event) => followLink(event, section)}
              >
                {label}
              </a>
            ))}
          </nav>
          <a
            className="header-cta"
            href="#search"
            aria-label="Verify a credential"
            onClick={(event) => followLink(event, "search")}
          >
            <Icon name="search" />
            <span>
              Verify<span className="header-cta__long"> a credential</span>
            </span>
          </a>
          <button
            ref={menuButtonRef}
            className="menu-btn"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={(event) => {
              focusMenuLink.current = !menuOpen && event.detail === 0;
              setMenuOpen(!menuOpen);
            }}
          >
            <Icon name={menuOpen ? "close" : "menu"} size={20} />
            <span className="sr-only">Menu</span>
          </button>
        </div>
      </header>

      {result ? (
        <PortalResult
          result={result}
          onBack={() => navigate("search")}
          headingRef={headingRef}
        />
      ) : (
        <main id="view-home">
          <section className="hero">
            <Image
              className="hero__bg"
              src="/assets/hero.jpg"
              alt=""
              fill
              sizes="100vw"
              loading="eager"
            />
            <div className="hero__grad" aria-hidden="true" />
            <div className="wrap">
              <div className="hero__intro">
                <span className="kicker">
                  American Institute of Professional Qualification
                </span>
                <h1>
                  Confirm an AIPQ credential in <em>seconds</em>.
                </h1>
                <p className="lede">
                  Check the status of an AIPQ certificate, transcript, learning
                  centre or membership using sample records.
                </p>
                <div className="hero__trust">
                  <span>
                    <Icon name="shield" />
                    Uses sample register records
                  </span>
                  <span>
                    <Icon name="clock" />
                    Shows the status at a glance
                  </span>
                  <span>
                    <Icon name="lock" />
                    Masks identity document numbers
                  </span>
                </div>
              </div>

              <div className="searchcard" id="search" tabIndex={-1}>
                <div
                  className="tabs"
                  role="tablist"
                  aria-label="Verification type"
                >
                  {tabs.map((key) => (
                    <button
                      className="tab"
                      id={`tab-${key}`}
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={type === key}
                      aria-controls="verification-panel"
                      tabIndex={type === key ? 0 : -1}
                      onClick={() => selectType(key)}
                      onKeyDown={moveTab}
                    >
                      <Icon name={lookupOptions[key].icon} />
                      {lookupOptions[key].tab}
                    </button>
                  ))}
                </div>
                <div
                  className="panel"
                  id="verification-panel"
                  role="tabpanel"
                  aria-labelledby={`tab-${type}`}
                >
                  <div className="panel__head">
                    <div>
                      <h2>{option.title}</h2>
                      <p>{option.description}</p>
                    </div>
                  </div>
                  <form onSubmit={submit} noValidate>
                    <div className="formrow">
                      <div className="field">
                        <label htmlFor="verification-query">
                          {option.label}
                          {type === "cert" && (
                            <span className="hint">
                              {" "}
                              · format AIPQ-[CODE]-[YEAR]-[SEQUENCE]
                            </span>
                          )}
                        </label>
                        <input
                          ref={inputRef}
                          id="verification-query"
                          name="query"
                          className={`inp${type === "cert" ? " mono" : ""}`}
                          value={values[type]}
                          onChange={(event) => updateValue(event.target.value)}
                          placeholder={option.placeholder}
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize={
                            type === "centre" ? "none" : "characters"
                          }
                          enterKeyHint="search"
                          spellCheck={false}
                          maxLength={120}
                          aria-invalid={Boolean(error)}
                          aria-describedby={
                            error ? "verification-error" : undefined
                          }
                        />
                      </div>
                      <button
                        ref={submitRef}
                        className={`btn btn--block ${type === "cert" ? "btn--gold" : "btn--navy"}`}
                        type="submit"
                      >
                        <Icon name="search" />
                        {option.action}
                      </button>
                    </div>
                    {error && (
                      <p
                        className="inlineerr show"
                        id="verification-error"
                        role="alert"
                      >
                        {error}
                      </p>
                    )}
                    <div className="samples">
                      <span className="lbl">Try a sample:</span>
                      {option.samples.map(([label, reference]) => (
                        <button
                          className="chip"
                          type="button"
                          key={reference}
                          onClick={() => {
                            updateValue(reference);
                            submitRef.current?.focus();
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="form-note">
                      <Icon name="info" />
                      <span>{option.note}</span>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>
          <PortalInformation />
        </main>
      )}
      <PortalFooter navigate={navigate} />
    </div>
  );
}
