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
  verificationQueryLimit,
  verificationUnavailable,
  type VerificationResponse,
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
    note: "The transcript displays a masked identity document number.",
  },
  centre: {
    tab: "Learning Centre",
    icon: "building",
    title: "Verify a learning centre",
    description:
      "Find a learning centre’s approval status and scope of delivery.",
    label: "Centre approval ID or name",
    placeholder: "e.g. AIPQ-CTR-US-0043",
    action: "Verify centre",
    note: "An approved centre can deliver the AIPQ qualifications listed in its record. Government endorsement and accreditation are determined separately.",
  },
  member: {
    tab: "Membership",
    icon: "member",
    title: "Verify a membership",
    description: "Enter the membership number to see its grade and status.",
    label: "Membership number",
    placeholder: "AIPQ-M-004812",
    action: "Verify membership",
    note: "A membership result shows the grade and standing recorded by AIPQ. Licensing decisions are made by the relevant authorities.",
  },
};

export function VerificationPortal() {
  const [type, setType] = useState<VerificationType>("cert");
  const [values, setValues] = useState({ cert: "", centre: "", member: "" });
  const [error, setError] = useState<{ message: string; invalid?: boolean } | null>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const focusMenuLink = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pendingSection = useRef<string | null>(null);
  const option = lookupOptions[type];

  useEffect(() => {
    return () => activeRequest.current?.abort();
  }, []);

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

  function cancelLookup() {
    activeRequest.current?.abort();
    activeRequest.current = null;
    setChecking(false);
  }

  function selectType(nextType: VerificationType) {
    if (nextType !== type) cancelLookup();
    setType(nextType);
    setError(null);
  }

  function updateValue(value: string) {
    cancelLookup();
    setValues((current) => ({ ...current, [type]: value }));
    setError(null);
  }

  function navigate(section: string, nextType?: VerificationType) {
    cancelLookup();
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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeRequest.current) return;

    const request = new AbortController();
    activeRequest.current = request;
    setError(null);
    setChecking(true);

    try {
      const response = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, query: values[type] }),
        signal: request.signal,
      });
      if (!response.ok && response.status !== 400) throw new Error();

      const outcome: VerificationResponse = await response.json();
      if (request.signal.aborted) return;

      if ("error" in outcome) {
        setError({ message: outcome.error, invalid: true });
        inputRef.current?.focus();
      } else {
        setResult(outcome.result);
      }
    } catch {
      if (!request.signal.aborted) setError({ message: verificationUnavailable });
    } finally {
      if (activeRequest.current === request) {
        activeRequest.current = null;
        setChecking(false);
      }
    }
  }

  return (
    <div id="top">
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
                  centre or membership in the AIPQ register.
                </p>
                <div className="hero__trust">
                  <span>
                    <Icon name="shield" />
                    Checks the AIPQ register
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
                          maxLength={verificationQueryLimit}
                          aria-invalid={error?.invalid}
                          aria-describedby={
                            error ? "verification-error" : undefined
                          }
                        />
                      </div>
                      <button
                        className={`btn btn--block ${type === "cert" ? "btn--gold" : "btn--navy"}`}
                        type="submit"
                        disabled={checking}
                      >
                        <Icon name="search" />
                        {checking ? "Checking…" : option.action}
                      </button>
                    </div>
                    <span className="sr-only" role="status">
                      {checking ? "Checking the register." : ""}
                    </span>
                    {error && (
                      <p
                        className="inlineerr show"
                        id="verification-error"
                        role="alert"
                      >
                        {error.message}
                      </p>
                    )}
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
