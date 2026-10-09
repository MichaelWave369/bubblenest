# Passport Exchange v0.9 · Compare ideas without losing provenance

**Ledger Above Bruv. Sauce Before Source.**

Passport Exchange is a local-only comparison tool built into every Bubble Passport tab. A visitor may deliberately choose a **JSON Passport file** (from this or another browser) and examine its declared metadata alongside the current Bubble Room's locally generated Passport. Bubble Nest does not upload the file, post GitHub content, merge research records, certify sources or persist the imported file in a database.

## Workflow

1. Open any Bubble Room → **Passport**.
2. Scroll to **Passport Exchange** and select a `.json` file (maximum 1 MiB).
3. The browser reads and validates the file locally; incompatible or malformed files are rejected with diagnostic messages.
4. Compare the two idea titles and summaries, overlapping topic words and the five kinds of **submitted record counts**.
5. Choose **Copy comparison note** to copy a textual summary with explicit warning labels. A local or example Passport cannot be magically promoted into verified public history.
6. **Clear imported file** discards the imported object from the page. Navigating away/remounting does not preserve the import.

## Format and trust boundaries

Accepts Bubble Passport versions **0.8.0 and 0.9.0** with `kind: bubblenest.bubble-passport`. A declared public origin must use a canonical `https://github.com/MichaelWave369/bubblenest/issues/N` URL. All five record collections must exist, contain plain objects with repository Issue links, and have matching counts. Declared coverage must remain `PARTIAL_OR_UNKNOWN`, `snapshot_signed: false`, `independent_verification: false`. Local, illustrative and unconfirmed exports cannot contain public issue records.

These checks validate structural consistency, **not authenticity**. JSON text and GitHub URLs can be forged, edited, or stale, and the Exchange does **not** query GitHub to independently confirm imported claims. The comparison explicitly labels the imported content **UNVERIFIED** even when the file declares `PUBLIC_GITHUB_ISSUE_RECORD`.

File content is rendered as React text, not executable HTML. A maximum size and bounded array/text checks limit misuse. The Exchange does not execute downloaded or imported code, fetch arbitrary file-linked URLs, forward imported data to a service, or authorize an AI agent.

## How comparisons work

The comparison uses simple overlapping words from each proposal title and summary, with a weak broad-category fallback. It is **not an AI similarity judgment**, a plagiarism detector, evidence of shared intellectual origin, or a finding that two researchers agree. Record counts are displayed side-by-side without an evidence quality score.

## Agent workflows

An authorized human may export a Passport and share it with Vessie, Field Liaison, or another agent explicitly. The agent must treat the file's content as untrusted data, preserve original attribution and uncertainty, and **request authorization** before posting any proposal to GitHub. No connector credentials, automatic posting or privacy bypass are provided by this feature.

## Known limits

- No cross-repo Passport federation, multi-file comparison, remote provenance verification, immutable source hashes, signature checks, or conflict resolution.
- No JSON persistence outside of the current page after import; user's file remains on their device.
- Existing public Bubble Room data may itself be incomplete due to GitHub API pagination/rate limits.
- `schema_version: 0.8.0` remains the current emitted Passport format; Exchange is a backward-compatible application feature (v0.9).

**No Citation, No Coronation.**
