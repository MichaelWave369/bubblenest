# Offline Capsule Lab v2.1 · Two full research snapshots, no live feed required

**Ledger Above Bruv · Sauce Before Source · No Citation, No Coronation**

The standalone **Offline Capsule Lab** lives at `#/capsules` on the Bubble Nest GitHub Page. It accepts **two local v2.0 Evidence Capsule JSON files**, checks each file's **internal canonical SHA-256**, and compares the enclosed dossiers without fetching GitHub Issues. This makes capsule-to-capsule research comparison possible even if the public Issues API is temporarily inaccessible.

The application itself must still load in the browser, from a reachable GitHub Page or previously cached copy. This feature does **not** yet install a full offline-service-worker application or guarantee that the static assets are available during a complete internet outage.

## How it works

1. Visit `https://michaelwave369.github.io/bubblenest/#/capsules` or choose **Capsule Lab** in the navigation.
2. Select a locally saved Evidence Capsule JSON as **A** and a second as **B**, each at most **3 MiB**. Both are processed entirely by the browser; nothing is uploaded, stored on Bubble Nest servers, or published to GitHub.
3. Each file is individually validated against the v2.0 envelope format, v1.7 enclosed dossier schema, fixed non-certification policies, safe JSON canonicalization rules, and Web Crypto SHA-256. An edited inner dossier without a matching new checksum is rejected.
4. Choose **Verify both and compare evidence**. The lab **rechecks both capsules** before any comparison, and requires exact agreement between the five canonical original source Issue URLs: **Bubble A, Bubble B, Fusion, Charter, and original Trial**.
5. Inspect differences in Artifact, Byte Check and Reproduction Issues, comparing their declared attributes and exact GitHub Issue numbers. The lab also compares original Trial fields and rule-based gap flags.
6. Optionally swap A/B, or download a local JSON or Markdown comparison report, or copy its summary. No agent action, GitHub Issue submission, binary file fetch or background write occurs.

### Result semantics

- **SAME_CANONICAL_DOSSIER_CONTENT:** Both dossier contents have equal canonical hash and byte count. They may still have false scientific claims.
- **DIFFERENT_CANONICAL_DOSSIER_CONTENT:** Two successfully checked capsules carry differing dossiers. The comparison explains where the selected attributes differ.
- **CAPSULE_INTEGRITY_NOT_CONFIRMED:** One or both capsules failed input validation, local hashing, or internal consistency. No evidence comparison is produced.
- **DIFFERENT_SOURCE_CHAINS:** The capsules refer to different underlying original public Issues. Cross-project comparison is blocked.
- **DIFF_UNAVAILABLE:** Structured dossier comparison could not be completed, despite independent capsule checks.

Records are labeled **only in A**, **only in B**, **changed**, or **unchanged**. A/B are reviewer-selected slots, **not authenticated earlier/later timestamps**. “Only in A” does not mean deleted, and “only in B” does not establish newness, precedence or scientific progress. An Issue can be missing from either original snapshot due to GitHub's **bounded 300-Issue public feed**, network errors, edits or other source limitations.

The compared fields include reported observations, methods, environments, claimed artifact versions/hashes, contributor account handles and limitations. Unchanged fields do not imply that source text was verified or that the complete underlying data agrees.

## Comparison export

The local comparison JSON has `kind: bubblenest.offline-capsule-comparison` and `schema_version: 2.1.0`. It contains the original Trial URL, each capsule's **self-declared** creation and dossier timestamps, declared SHA-256 and canonical byte length, checks performed, issue-record differences and gap flags.

The exported report explicitly declares:

```json
{
  "policy": "UNTRUSTED_OFFLINE_SNAPSHOTS_NOT_AUTHENTICATED_HISTORY",
  "source_authenticated": false,
  "claimed_times_authenticated": false,
  "scientific_verdict": false,
  "signed": false,
  "execution_authorized": false,
  "coverage": "PARTIAL_OR_UNKNOWN"
}
```

This excerpt documents the relevant fields and is **not a complete sample report**. The generated Markdown includes untrusted-source warnings and uses the existing v1.8 escaped report serializer for contributor-controlled fields.

## Security and scientific boundaries

- **The internal SHA-256 only checks consistency with a digest supplied in the same file.** A malicious publisher can modify both research contents and the hash. There are no cryptographic signatures, independently managed public keys or trusted timestamps.
- **Valid syntax does not prove a genuine GitHub record.** Canonical Issue links, names and timestamps in imported JSON are untrusted data. No live API lookups or source authentication are performed here.
- **No two-capsule scientific consensus.** Matching hashes do not establish reproducibility; differing reports are not automatically falsifications.
- **No authorization.** Neither capsule grants rights to run experiments, access private files, use copyrighted datasets, publish research or instruct agents to perform work.
- **Local data handling only.** File bytes remain in browser memory for the current page session and are not automatically uploaded, persisted to local storage or exposed in an API request. Comparison downloads only occur on user action.
- **No actual binary artifact comparison.** The contained dossiers describe and reference public GitHub Issues, artifact hashes and experiments. They do not contain or fetch original binary datasets, code snapshots or lab instrument data.

## Companion features

The v1.7 **Reproduction Audit Dossier** constructs a snapshot from the public feed. The v1.8 **Dossier Time Machine** compares a local JSON dossier with the current browser-visible one. The v1.9 **Fingerprint Desk** computes canonical hashes and can open manually reviewed public Anchor Issues. The v2.0 **Evidence Capsule Desk** exports full dossiers with checksums. **v2.1** enables comparing **two existing v2.0 capsules without relying on the current public feed at all**.

**Ledger Above Bruv.**
