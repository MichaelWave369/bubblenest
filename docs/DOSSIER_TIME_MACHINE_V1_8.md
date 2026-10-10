# Dossier Time Machine v1.8 · Compare research snapshots without inventing provenance

**Ledger Above Bruv. Sauce Before Source.**

The Dossier Time Machine compares an **older locally exported Reproduction Audit Dossier (v1.7 JSON)** against the **currently visible v1.7 dossier from the same original Trial**. The feature does not make any claims about which file was truly created first: timestamps and content in imported JSON are untrusted.

Open **Bubble Fusion → Charter → Trial → Reproduction Attempts → Reproduction Audit Dossier → Compare snapshots**.

## Workflow

1. Previously, use **Download JSON** to capture the public research receipts visible under an original Trial. Keep the file locally.
2. Return to the same Trial's Audit Dossier, expand the Time Machine and select that JSON export (maximum **2 MiB**).
3. The browser parses and validates the file. It must be a Bubble Nest `bubblenest.reproduction-dossier` **v1.7.0** export with the original non-certification caveats and source chain.
4. The old and current snapshot must reference **the exact same Bubble A, Bubble B, Fusion, Charter and original Trial Issue URLs**. Cross-project comparisons are rejected.
5. Review changes in three categories: Artifact receipts, Byte Check receipts, Reproduction reports. Each category identifies:
   - **Newly visible in current snapshot:** a canonical Issue number absent from the import but visible now.
   - **No longer visible in current snapshot:** an Issue present in the imported export but not in the currently loaded feed.
   - **Changed:** same canonical Issue number, but one or more tracked contributor-reported fields changed.
   - **Unchanged:** same number, no differences among tracked fields.
6. Review original source metadata differences (e.g., revised original Trial observations) and newly appearing/disappearing rule-based evidence-gap flags.
7. Download a local **diff JSON** or **diff Markdown**, or copy a reviewer-friendly summary. No file is uploaded, no GitHub Issue is published, and no agent is invoked automatically.

## Important interpretation

**No longer visible is not deleted, disproven or retracted.** A missing record may reflect GitHub pagination, an outage, edits to an Issue causing the parser to exclude it, changed parent links, or different feed snapshots.

**Changed is not falsified.** A checksum declaration can be edited or corrected, and that can cause downstream Byte Checks and reproduction reports to cease matching the *current* declaration. This is a meaningful provenance discrepancy, not a cryptographic proof of tampering or bad science.

**Unchanged is not verified.** Two snapshots may contain identical fabricated or erroneous claims.

An imported JSON file is **untrusted data**, never an instruction or scientific authority. Even a structurally valid imported file is not authenticated. The comparison does not assert integrity, signing, real-world identities, permissions, genuine trial execution or completeness.

## Data contract and defensive checks

The import reader accepts at most 2 MiB and requires:

- Exact `kind: bubblenest.reproduction-dossier` and `schema_version: 1.7.0`.
- A parsable generation timestamp.
- Source repository `https://github.com/MichaelWave369/bubblenest`, `coverage: PARTIAL_OR_UNKNOWN`, `signed: false`, `independent_verification: false`, `execution_authorized: false`.
- `caveat: INVENTORY_ONLY_NOT_A_VERIFICATION_SCORE_OR_AUTHORIZATION`.
- Canonical GitHub Issue URLs and distinct original source Bubbles.
- Bounded records (up to 300 Artifacts, 300 Reproductions and 600 nested Byte Check records), valid, unique positive Issue numbers and canonical URLs.

The diff output uses `kind: bubblenest.reproduction-dossier-diff` and `schema_version: 1.8.0`, carries two stated export timestamps and feed statuses, precise source Issue anchors, counts and structured change sets. The fields `import_trusted`, `signed` and `scientific_verdict` are all **false**; coverage is always `PARTIAL_OR_UNKNOWN`.

The Markdown output escapes contributor-controlled punctuation and does not blindly use uploaded text as document headings. The UI renders text safely through React. Imported bytes remain in the local browser session and are not persisted by Bubble Nest.

## Future work

A future release could expose cryptographically anchored snapshot receipts or a canonical ingestion history and allow comparing any two explicitly selected file exports. **v1.8 does not provide any authenticated change log, remote import, signed proof, file retention, or server-side provenance.**

**No Citation, No Coronation.**
