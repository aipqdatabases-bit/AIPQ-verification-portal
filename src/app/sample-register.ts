import type { Certificate, Centre, Member } from "./verification";

export const certificates: Record<string, Certificate> = {
  "AIPQ-BUS-2024-000481": {
    status: "valid",
    progName: "Diploma in Business Administration",
    progCode: "AIPQ-DBA-7",
    level: "Level 7 — Postgraduate Diploma",
    credits: 120,
    issued: "2024-09-15",
    learnerRef: "AIPQ-L-0098142",
    name: "Marcus T. Delgado",
    passport: "N‑•••••‑4521",
    centre: "Atlantic Professional College — Boston, MA, USA",
    subjects: [
      {
        code: "DBA-701",
        name: "Strategic Management",
        grade: "Distinction",
        credits: 20,
      },
      {
        code: "DBA-702",
        name: "Financial Decision Making",
        grade: "Merit",
        credits: 20,
      },
      {
        code: "DBA-703",
        name: "Marketing in a Digital Age",
        grade: "Distinction",
        credits: 20,
      },
      {
        code: "DBA-704",
        name: "Leadership & People Management",
        grade: "Pass",
        credits: 20,
      },
      {
        code: "DBA-705",
        name: "Operations & Project Management",
        grade: "Merit",
        credits: 20,
      },
      {
        code: "DBA-706",
        name: "Applied Business Research Project",
        grade: "Distinction",
        credits: 20,
      },
    ],
  },
  "AIPQ-HC-2023-000127": {
    status: "superseded",
    supersededBy: "AIPQ-HC-2024-000596",
    supersedeReason:
      "Re-issued to correct the awarded qualification title. The superseding certificate carries the valid award.",
    progName: "Diploma in Healthcare Management",
    progCode: "AIPQ-DHM-5",
    level: "Level 5 — Diploma",
    credits: 120,
    issued: "2023-07-02",
    learnerRef: "AIPQ-L-0074410",
    name: "Priya R. Nair",
    passport: "P‑•••••‑7730",
    centre: "Midwest Skills Academy — Chicago, IL, USA",
    subjects: [
      {
        code: "DHM-501",
        name: "Health Systems & Policy",
        grade: "Merit",
        credits: 20,
      },
      {
        code: "DHM-502",
        name: "Managing Care Quality",
        grade: "Pass",
        credits: 20,
      },
      {
        code: "DHM-503",
        name: "Health Economics & Finance",
        grade: "Merit",
        credits: 20,
      },
      {
        code: "DHM-504",
        name: "Leadership in Healthcare",
        grade: "Distinction",
        credits: 20,
      },
      {
        code: "DHM-505",
        name: "Ethics, Law & Governance",
        grade: "Pass",
        credits: 20,
      },
      {
        code: "DHM-506",
        name: "Healthcare Improvement Project",
        grade: "Merit",
        credits: 20,
      },
    ],
  },
  "AIPQ-IT-2022-000098": {
    status: "revoked",
    revokedOn: "2023-11-02",
    revokeReason:
      "Certificate withdrawn following an academic integrity review. This award is no longer valid and must not be relied upon.",
    progName: "Diploma in Information Technology",
    progCode: "AIPQ-DIT-4",
    level: "Level 4 — Diploma",
    credits: 120,
    issued: "2022-05-18",
    learnerRef: "AIPQ-L-0051203",
    name: "Jordan A. Fields",
    passport: "N‑•••••‑1182",
    centre: "Pacific Institute of Management — Los Angeles, CA, USA",
    subjects: [
      {
        code: "DIT-401",
        name: "Computer Systems & Networks",
        grade: "Pass",
        credits: 20,
      },
      { code: "DIT-402", name: "Database Design", grade: "Merit", credits: 20 },
      {
        code: "DIT-403",
        name: "Web & Application Development",
        grade: "Pass",
        credits: 20,
      },
      {
        code: "DIT-404",
        name: "Cyber Security Fundamentals",
        grade: "Pass",
        credits: 20,
      },
      {
        code: "DIT-405",
        name: "Cloud & Infrastructure",
        grade: "Merit",
        credits: 20,
      },
      {
        code: "DIT-406",
        name: "Applied IT Capstone",
        grade: "Pass",
        credits: 20,
      },
    ],
  },
};

export const centres: Record<string, Centre> = {
  "AIPQ-CTR-US-0043": {
    status: "approved",
    name: "Atlantic Professional College",
    loc: "Boston, Massachusetts, USA",
    since: "March 2019",
    through: "March 2027",
    scope: [
      "Business & Management",
      "Healthcare Management",
      "Accounting & Finance",
      "Project Management",
      "Professional Leadership",
    ],
  },
  "AIPQ-CTR-US-0117": {
    status: "approved",
    name: "Pacific Institute of Management",
    loc: "Los Angeles, California, USA",
    since: "August 2020",
    through: "August 2026",
    scope: [
      "Information Technology",
      "Data & Analytics",
      "Digital Marketing",
      "Business & Management",
      "Cyber Security",
    ],
  },
  "AIPQ-CTR-US-0075": {
    status: "suspended",
    name: "Midwest Skills Academy",
    loc: "Chicago, Illinois, USA",
    since: "June 2018",
    through: "Under review",
    suspendNote:
      "This centre's approval is temporarily suspended pending a quality review. New enrolments against AIPQ qualifications are paused. Previously issued certificates remain verifiable on this portal.",
    scope: [
      "Healthcare Management",
      "Business & Management",
      "Early Years & Education",
    ],
  },
};

export const members: Record<string, Member> = {
  "AIPQ-M-004812": {
    status: "active",
    name: "Eleanor J. Whitfield",
    tier: "Fellow Member",
    title: "Fellow Certified Practitioner in Insurance and Risk Management",
    post: "FCPIRM",
    since: "March 2021",
  },
  "AIPQ-M-010233": {
    status: "active",
    name: "David Chen",
    tier: "Associate Member",
    title: "Associate Certified Practitioner in Accounting & Finance",
    post: "ACPAF",
    since: "July 2024",
  },
  "AIPQ-M-015907": {
    status: "active",
    name: "Aisha Rahman",
    tier: "Associate Member",
    title: "",
    post: "",
    since: "January 2024",
  },
  "AIPQ-M-002190": {
    status: "inactive",
    name: "Robert K. Mensah",
    tier: "Fellow Member",
    title: "Fellow Certified Practitioner in Business Leadership",
    post: "FCPBL",
    since: "May 2019",
    inactiveNote:
      "This membership has lapsed and is not currently active. The individual is not entitled to use the AIPQ membership level or designatory letters until the membership is renewed and reinstated on the register.",
  },
};
