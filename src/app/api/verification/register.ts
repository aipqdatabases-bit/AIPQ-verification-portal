import "server-only";
import { Pool } from "pg";
import type { Centre, Certificate, Member, VerificationType } from "../../verification";

const database = globalThis as typeof globalThis & {
  aipqRegisterPool?: Pool;
};

function registerPool() {
  if (database.aipqRegisterPool) return database.aipqRegisterPool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is missing.");

  const pool = new Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 5_000,
    statement_timeout: 5_000,
  });
  pool.on("error", () => {
    console.error("An idle verification database connection failed.");
  });
  database.aipqRegisterPool = pool;
  return pool;
}

export async function findRecord(type: VerificationType, id: string, value: string) {
  const pool = registerPool();
  switch (type) {
    case "cert": {
      const { rows } = await pool.query<{ record: Certificate }>(
        `SELECT jsonb_strip_nulls(jsonb_build_object(
          'status', certificate.status,
          'progName', certificate.qualification_name,
          'progCode', certificate.qualification_code,
          'level', certificate.qualification_level,
          'credits', certificate.total_credits,
          'issued', to_char(certificate.issue_date, 'YYYY-MM-DD'),
          'learnerRef', certificate.learner_reference,
          'name', certificate.learner_name,
          'passport', certificate.masked_identity_document_number,
          'centre', certificate.delivery_centre,
          'supersededBy', certificate.replacement_reference,
          'supersedeReason', certificate.supersede_reason,
          'revokedOn', to_char(certificate.revocation_date, 'YYYY-MM-DD'),
          'revokeReason', certificate.revocation_reason,
          'subjects', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
              'code', subject.subject_code,
              'name', subject.subject_name,
              'grade', subject.grade,
              'credits', subject.credits
            ) ORDER BY subject.display_order)
            FROM aipq.transcript_subjects AS subject
            WHERE subject.certificate_reference = certificate.reference_number
          ), '[]'::jsonb)
        )) AS record
        FROM aipq.certificates AS certificate
        WHERE certificate.reference_number = $1`,
        [id],
      );
      return { type, id, record: rows[0]?.record };
    }

    case "centre": {
      const name = value.replace(/\s+/g, " ");
      const { rows } = await pool.query<{ approval_id: string; record: Centre }>(
        `SELECT approval_id, jsonb_strip_nulls(jsonb_build_object(
          'status', status,
          'name', name,
          'loc', location,
          'since', approved_since,
          'through', approval_valid_through,
          'scope', delivery_scope,
          'suspendNote', suspension_note
        )) AS record
        FROM aipq.learning_centres
        WHERE approval_id = $1
          OR strpos(lower(regexp_replace(name, '[[:space:]]+', ' ', 'g')), lower($2)) > 0
        ORDER BY (approval_id = $1) DESC, approval_id
        LIMIT 1`,
        [id, name],
      );
      return { type, id: rows[0]?.approval_id ?? value, record: rows[0]?.record };
    }

    case "member": {
      const { rows } = await pool.query<{ record: Member }>(
        `SELECT jsonb_strip_nulls(jsonb_build_object(
          'status', status,
          'name', name,
          'tier', membership_level,
          'title', title,
          'post', designatory_letters,
          'since', member_since,
          'inactiveNote', inactive_note
        )) AS record
        FROM aipq.memberships
        WHERE membership_number = $1`,
        [id],
      );
      return { type, id, record: rows[0]?.record };
    }
  }
}
