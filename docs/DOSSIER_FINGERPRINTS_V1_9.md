# Dossier Fingerprints v1.9 · Canonical SHA-256 and voluntary public receipt anchors

**Ledger Above Bruv. Sauce Before Source. No Citation, No Coronation.**

A **Dossier Fingerprint** is a SHA-256 checksum of the **canonicalized JSON content** of one v1.7 Reproduction Audit Dossier. The v1.9 Fingerprint Desk sits under the same Trial's Audit Dossier and the v1.8 Time Machine, and it can optionally reference human-submitted public GitHub Issue receipts.

## Why canonicalization matters

Research dossiers may be saved with different whitespace, indentation, or JSON object property ordering. Hashing the raw file bytes would produce different checksums for the same logical record. This v1.9 method:

1. Validates the input is a supported `bubblenest.reproduction-dossier` JSON schema version `1.7.0`, including its original source Issue links, explicit partial coverage, unsigned state and nonauthorization caveats.
2. Recursively sorts object keys in JavaScript code-point order. The order of array elements is preserved.
3. Serializes the normalized object using `JSON.stringify` and hashes the UTF-8 encoded result with Web Crypto SHA-256.
4. Reports the resulting 64-character lowercase hex digest, the canonical UTF-8 byte count, and the exact method identifier `BUBBLENEST_JSON_RECURSIVE_SORTED_KEYS_V1`.

This is *canonical content hashing*, not a claim of a byte-for-byte match to the original pretty-printed export file. Any actual change to a field, including `generated_at`, affects the digest. There is a **2 MiB maximum** canonical JSON size, and the same bound for importing a saved dossier.

No file is uploaded or persisted by Bubble Nest. No remote file URL is fetched or verified.

## Current dossier and saved file check

In **Bubble Fusion → Charter → Trial → Reproduction Attempts → Reproduction Audit Dossier**, choose **Inspect fingerprints**. The desk computes the current dossier fingerprint, then optionally lets you select a previous v1.7 JSON file for the **same original source chain**. The browser computes its fingerprint locally.

Outcomes are **SAME_CANONICAL_CONTENT**, **DIFFERENT_CANONICAL_CONTENT**, **DIFFERENT_METHOD**, or **UNAVAILABLE**. These mean what they say about canonical JSON bytes and method labels; they do not prove scientific truth, human independence, file provenance, authorship, permission, or authenticated history.

A saved file can also be compared against the publicly visible **Dossier Anchor** GitHub Issues for that Trial. The observed account and timestamp are GitHub metadata, not independently authenticated identity or an external timestamp authority.

## Optional voluntary public Issue receipt

After calculating the current fingerprint, a person can explicitly acknowledge the limits and choose **Review fingerprint Issue on GitHub**. This opens a **prefilled GitHub Issue** draft; it is posted only if the person signs in and submits it.

The Issue title begins `[Dossier Anchor]`. Its body contains:

```md
<!-- bubblenest:dossier-anchor:v1 -->

# Bubble Nest · declared dossier snapshot fingerprint

## Original Trial
https://github.com/MichaelWave369/bubblenest/issues/80

## Fusion invitation
https://github.com/MichaelWave369/bubblenest/issues/40

## Charter
https://github.com/MichaelWave369/bubblenest/issues/45

## Origin A
https://github.com/MichaelWave369/bubblenest/issues/10

## Origin B
https://github.com/MichaelWave369/bubblenest/issues/12

## Dossier schema
1.7.0

## Snapshot generated at
2026-10-09T22:00:00.000Z

## Fingerprint algorithm
SHA-256

## Canonicalization
BUBBLENEST_JSON_RECURSIVE_SORTED_KEYS_V1

## Canonical UTF-8 byte length
1240

## SHA-256 fingerprint
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

## Context and limitations
Research is contributor-reported, the source feed is incomplete, no binary artifacts were authenticated.

## Receipt state
USER_DECLARED_UNSIGNATURED_FINGERPRINT

## Receipt policy
DECLARED_SHA256_NOT_SIGNED_NOT_SCIENCE
```

**Important:** The sample hash and byte count above are illustrative, not a fingerprint of the sample Issue text. The **full dossier JSON is not attached** to the anchor Issue. Another reviewer needs access to a copy of the dossier if they want to recompute and compare its fingerprint.

Public receipts are parsed only if their markers, status, method, SHA-256 syntax, declared size, source Issue links and policy match the defined protocol. Each receipt is displayed only beneath the exact original Trial, Charter, Fusion and original Bubble pair. A user-supplied Issue that says `SIGNED`, `VERIFIED` or `CERTIFIED` is rejected by the structured parser; that does not make all real-world forged text impossible.

## Nonclaims and limits

- **Not an immutable notary or timestamp authority.** GitHub Issue bodies can be edited, GitHub accounts are not cryptographic identities, and a historical public Issue is not a cryptographically signed time attestation.
- **Not scientific verification.** Hash equality shows only matching canonical JSON. The JSON may contain inaccurate, incomplete, fabricated or misunderstood contributor-reported research.
- **Not a proof of original authorship, copyright, licensing or consent.** A GitHub handle does not establish real-world legal identity, and a published Charter or Trial does not authorize other people to execute work.
- **Not a guarantee of data availability.** The Issue declares a digest and metadata but does not upload the dossier itself. The public reader may miss records because it scans at most 300 GitHub Issues, including closed Issues.
- **Not a signing scheme.** There are no private signing keys, digital signatures, timestamp authority, Merkle proof, offsite archive, or autonomous agent write access.
- **Not raw-file hashing.** The canonicalization method is necessary to reproduce a digest across JSON whitespace and key-order differences, but it must not be confused with SHA-256 of the downloaded JSON file's literal bytes.
- **Not an automatic publisher.** GitHub publication is a separate human action.

The v1.8 Dossier Time Machine remains the correct place to identify *which visible fields changed*. The v1.9 Fingerprint Desk answers the narrower question: *Do these two supported JSON snapshots contain the same canonical data?*

**Ledger Above Bruv.**
