import { centres, certificates, members } from "./sample-register.mjs";

export async function seedRegister(client) {
  for (const [reference, certificate] of Object.entries(certificates)) {
    await client.query(
      `INSERT INTO aipq.certificates (
        reference_number, status, qualification_name, qualification_code,
        qualification_level, total_credits, issue_date, learner_reference, learner_name,
        masked_identity_document_number, delivery_centre, replacement_reference,
        supersede_reason, revocation_date, revocation_reason
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        reference, certificate.status, certificate.progName, certificate.progCode,
        certificate.level, certificate.credits, certificate.issued, certificate.learnerRef,
        certificate.name, certificate.passport, certificate.centre, certificate.supersededBy,
        certificate.supersedeReason, certificate.revokedOn, certificate.revokeReason,
      ],
    );

    // Insert in reverse order so the result must use display_order.
    for (const [index, subject] of [...certificate.subjects.entries()].reverse()) {
      await client.query(
        `INSERT INTO aipq.transcript_subjects (
          certificate_reference, display_order, subject_code, subject_name, grade, credits
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [reference, index + 1, subject.code, subject.name, subject.grade, subject.credits],
      );
    }
  }

  for (const [id, centre] of Object.entries(centres)) {
    await client.query(
      `INSERT INTO aipq.learning_centres (
        approval_id, status, name, location, approved_since, approval_valid_through,
        delivery_scope, suspension_note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, centre.status, centre.name, centre.loc, centre.since, centre.through, centre.scope, centre.suspendNote],
    );
  }

  for (const [number, member] of Object.entries(members)) {
    await client.query(
      `INSERT INTO aipq.memberships (
        membership_number, status, name, membership_level, title, designatory_letters,
        member_since, inactive_note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [number, member.status, member.name, member.tier, member.title, member.post, member.since, member.inactiveNote],
    );
  }
}
