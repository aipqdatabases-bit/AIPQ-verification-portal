CREATE TABLE aipq.certificates (
  reference_number text PRIMARY KEY CHECK (
    reference_number ~ '^AIPQ-[A-Z]{2,4}-[0-9]{4}-[0-9]{4,6}$'
  ),
  status text NOT NULL CHECK (status IN ('valid', 'superseded', 'revoked')),
  qualification_name text NOT NULL,
  qualification_code text NOT NULL,
  qualification_level text NOT NULL,
  total_credits integer NOT NULL CHECK (total_credits >= 0),
  issue_date date NOT NULL,
  learner_reference text NOT NULL,
  learner_name text NOT NULL,
  masked_identity_document_number text NOT NULL CHECK (
    masked_identity_document_number ~ '[•*]'
  ),
  delivery_centre text NOT NULL,
  replacement_reference text,
  supersede_reason text,
  revocation_date date,
  revocation_reason text,
  CHECK ((status = 'superseded') = (replacement_reference IS NOT NULL)),
  CHECK ((status = 'superseded') = (supersede_reason IS NOT NULL)),
  CHECK ((status = 'revoked') = (revocation_date IS NOT NULL)),
  CHECK ((status = 'revoked') = (revocation_reason IS NOT NULL))
);

CREATE TABLE aipq.transcript_subjects (
  certificate_reference text NOT NULL REFERENCES aipq.certificates (reference_number),
  display_order integer NOT NULL CHECK (display_order > 0),
  subject_code text NOT NULL,
  subject_name text NOT NULL,
  grade text NOT NULL,
  credits integer NOT NULL CHECK (credits >= 0),
  PRIMARY KEY (certificate_reference, display_order),
  UNIQUE (certificate_reference, subject_code)
);

CREATE TABLE aipq.learning_centres (
  approval_id text PRIMARY KEY,
  name text NOT NULL,
  location text NOT NULL,
  status text NOT NULL CHECK (status IN ('approved', 'suspended')),
  approved_since text NOT NULL,
  approval_valid_through text NOT NULL,
  delivery_scope text[] NOT NULL DEFAULT '{}',
  suspension_note text,
  CHECK ((status = 'suspended') = (suspension_note IS NOT NULL))
);

CREATE TABLE aipq.memberships (
  membership_number text PRIMARY KEY,
  name text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'inactive')),
  membership_level text NOT NULL,
  title text NOT NULL DEFAULT '',
  designatory_letters text NOT NULL DEFAULT '',
  member_since text NOT NULL,
  inactive_note text,
  CHECK ((status = 'inactive') = (inactive_note IS NOT NULL))
);
