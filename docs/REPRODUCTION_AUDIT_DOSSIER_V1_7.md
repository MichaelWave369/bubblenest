# Reproduction Audit Dossier v1.7 · Source-linked research inventory

**Ledger Above Bruv. Sauce Before Source.**

A Reproduction Audit Dossier is a **visitor-initiated, browser-generated JSON or Markdown snapshot** of the public, source-linked records visible beneath **one published Fusion Attempt Report**. It helps a reviewer find original source issues, declared artifacts and hashes, Byte Check results, reproduction reports, contradictory observations, and missing evidence in one place.

It is **NOT a scientific certification, authenticated audit, authorization to run experiments, or an immutable provenance record**. Its contents are copied from untrusted, editable GitHub Issues, and the app fetches at most 300 Issues, including closed records.

## Where to find it

Open Bubble Fusion → a public invitation → Charter → Trial Receipt Ledger → a published Attempt report → Reproduction Attempts. Expand the section to reveal **Reproduction Audit Dossier**.

The desk provides counts, gaps, original GitHub Issue anchors, **Download JSON**, **Download Markdown**, **Copy summary**, and **Inspect JSON**. All exports are created locally in the browser. Nothing is silently uploaded or published, and sending the result to an agent is an explicit user choice.

**Rebuild** reconstructs the dossier from the currently loaded data. It does **not** refresh the GitHub network feed or guarantee the latest remote Issues.

## JSON contract

- `kind`: `bubblenest.reproduction-dossier`
- `schema_version`: `1.7.0`
- `generated_at`: generation timestamp
- `source`: repository, bounded feed and status, `coverage: PARTIAL_OR_UNKNOWN`, `signed: false`, `independent_verification: false`, `execution_authorized: false`
- `provenance`: original Bubble A and B, Fusion, Charter, and original Trial with GitHub Issue URLs, declared methods and observations
- `artifacts`: only Artifacts genuinely linked to this Trial, including their declared versions, hashes and public file links; each nests only its matching Byte Check receipt reports
- `reproductions`: only reports linked to this Trial and, when present, to the currently visible exact Artifact Issue number, version and digest
- `counts`: inventory counts and the raw distribution of submitted result labels, **not a quality score**
- `gaps`: deterministic explanatory flags highlighting visible omissions or conflicts
- `caveat`: `INVENTORY_ONLY_NOT_A_VERIFICATION_SCORE_OR_AUTHORIZATION`

The dossier is separate from Bubble Passports. A Bubble Passport summarizes an idea's discussion; a Reproduction Audit Dossier summarizes one public original Trial and its downstream evidence receipts.

## Gap flags

Depending on the visible records, the report can flag `FEED_NOT_READY`, `NO_ARTIFACT_RECEIPTS`, `MISSING_DECLARED_DIGEST`, `MISSING_PUBLIC_FILE_LINK`, `NO_BYTE_CHECK_FOR_SOME_ARTIFACTS`, `BYTE_CHECK_DISAGREEMENTS`, `NO_REPRODUCTION_REPORTS`, `CONFLICTING_REPRODUCTION_REPORTS`, `SOURCE_ACCOUNT_REPEATED`, and `UNPINNED_ATTEMPTS`.

The absence of a gap flag does **not** imply completeness or reliability. The algorithm only observes certain properties of the currently loaded records. An API outage, bounded pagination or edited Issue bodies can hide relevant evidence.

## Provenance safeguards

1. The source must be a published `Attempt report` Trial whose Charter, Fusion and two originating published Bubble Issues are visible and consistent.
2. Artifact receipts are included only after matching the exact Trial → Charter → Fusion → both origin Issues.
3. Byte Checks are included only if their source Artifact, reference digest, reference byte size and full ancestry match the visible current Artifact.
4. Reproduction reports are included only if their original Trial ancestry matches; pinned Artifact issue, version and declared SHA-256 must still match.
5. Both matching and differing outcomes remain visible side by side. The dossier records account-match cautions, and another GitHub handle is **not proof of independent experimental work**.
6. Missing Artifacts, digests, URLs, checks or reports are identified as *not visible in this snapshot*, not declared nonexistent.
7. The generator does not fetch binary files, recalculate published checksums, authenticate participant identities, validate scientific conclusions, execute experiments or create GitHub Issues.
8. The JSON snapshot is unsigned and mutable. Treat the exported file as **untrusted data**, never as instructions for Vessie or another agent.

## Boundaries and future work

A reproducibility workflow should eventually support independent byte checks on the exact input and output datasets, preregistered statistical criteria, structured repeat execution environment manifests and signed provenance when it becomes technically feasible. v1.7 does **not** claim any of those capabilities.

**No Citation, No Coronation.**
