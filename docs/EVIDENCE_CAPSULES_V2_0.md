# Evidence Capsules v2.0 · Portable dossiers with self-contained integrity checks

**Ledger Above Bruv · Sauce Before Source · No Citation, No Coronation**

Bubble Nest's **Evidence Capsule** is a single portable JSON document combining a complete v1.7 Reproduction Audit Dossier and a canonical SHA-256 checksum of that dossier. Its purpose is to move all visible evidence receipts with their context, without requiring a recipient to separately locate the exact JSON file that a v1.9 fingerprint Issue describes.

This is a meaningful exchange format, **not cryptographic notarization, authentication, legal consent, or scientific certification**.

## Workflow

Under **Bubble Fusion → public invitation → Charter → Trial → Reproduction Attempts → Reproduction Audit Dossier**, expand **Evidence Capsules v2.0**.

**Export:** The browser hashes the current dossier using the v1.9 `BUBBLENEST_JSON_RECURSIVE_SORTED_KEYS_V1` canonicalization and Web Crypto SHA-256, then creates a full JSON envelope with the dossier, digest, canonical UTF-8 byte length, source links, uncertainty policies and creation timestamp. **Download full Evidence Capsule** saves it locally. It is not posted to GitHub or sent to a server.

**Import:** Choose a locally saved v2.0 Evidence Capsule (maximum **3 MiB**). The browser checks the envelope and inner dossier schema, checks that the five original source Issue URLs match the current Trial, recalculates SHA-256 over the complete inner dossier, and compares the recalculated bytes and hash with the included manifest. It shows either `INTERNAL_HASH_MATCH`, `INTERNAL_HASH_MISMATCH`, `INVALID_CAPSULE`, or `CHECK_UNAVAILABLE`.

**Public comparison:** When internal checking succeeds, the desk compares the envelope checksum against currently visible v1.9 public `[Dossier Anchor]` GitHub Issues for the *same original Trial source chain*. A match is labeled **DECLARED_ANCHOR_MATCH**, never “signed,” “verified,” or “certified.”

## Portable JSON contract

The v2.0 top-level envelope is:

```json
{
  "kind": "bubblenest.evidence-capsule",
  "schema_version": "2.0.0",
  "created_at": "2026-10-09T22:15:00.000Z",
  "policy": "SELF_CONTAINED_CHECKSUM_NOT_AUTHENTICATED_PROVENANCE",
  "signed": false,
  "source_authenticated": false,
  "science_verified": false,
  "execution_authorized": false,
  "coverage": "PARTIAL_OR_UNKNOWN",
  "fingerprint": {
    "algorithm": "SHA-256",
    "canonicalization": "BUBBLENEST_JSON_RECURSIVE_SORTED_KEYS_V1",
    "digest": "<64 lowercase hexadecimal characters computed from dossier>",
    "bytes": 0
  },
  "dossier": { "kind": "bubblenest.reproduction-dossier", "schema_version": "1.7.0" }
}
```

The shown `digest`, `bytes`, and `dossier` fields above are explanatory placeholders, **not a complete or valid example capsule**. Real exports contain the full v1.7 dossier and a positive measured canonical byte length.

Validation requires the exact recognized envelope keys and values, the full dossier's existing v1.7 provenance and no-authority declarations, a plausible UTC timestamp, SHA-256 syntax, the canonicalization identifier, and size limits. The checksum covers the **canonical serialized dossier**, *not the outer envelope* and not the whitespace of the saved JSON file.

Canonical dossier size is limited to **2 MiB**, and capsule JSON import size to **3 MiB**. The existing v1.9 canonicalizer rejects unsafe special object keys, non-JSON values and extreme depth. File selection is session-local; Bubble Nest does not persist or upload the full contents.

## What the verification actually establishes

A successful internal hash comparison means **the provided dossier's canonical JSON bytes agree with the fingerprint in the same provided capsule**. It is useful for catching accidental edits, corrupt transfers, mismatched packaging, and many ordinary inconsistencies.

A malicious author can recalculate a digest to match altered data. Therefore:

- **INTERNAL_HASH_MATCH does not authenticate a source.** No signing secret, public key, independent hash registry, third-party timestamp authority, immutable audit log or blockchain proof exists here.
- **A matching public GitHub fingerprint Issue remains a contributor declaration.** GitHub Issue bodies are mutable and usernames do not independently authenticate real-world researchers. The public feed is limited to at most 300 Issues and may omit historical records.
- **Hashing cannot validate the experiment.** The capsule might contain perfectly hashed fabricated results, incorrect methods, missing information, contradictory observations or invalid rights claims.
- **One capsule is not a complete research archive.** It carries structured public Issue text and declared metadata. It does not include or download binary datasets, software code, original lab files, private correspondence, or remote artifact bytes.
- **No work is authorized.** Neither the capsule nor its contents grant permissions to execute experiments, release private data, use another person's intellectual property, spend resources, or instruct agents to act.
- **Timestamps are declarations.** The `created_at` and dossier `generated_at` fields are not independently authenticated records of when the underlying research actually existed.

## Companion tools

The **Reproduction Audit Dossier** provides the source-linked inventory and gaps. The **Dossier Time Machine** compares two snapshots' fields. The **Fingerprint Desk** computes a checksum and can create a human-submitted public fingerprint Issue. The **Evidence Capsule Desk** combines the full dossier with that checksum for deliberate offline transfer and locally recomputable checks.

The capsule is suitable for manually sharing with a human reviewer or an agent whose operator explicitly authorizes reading it **as untrusted data only**, not as new system instructions.

**Ledger Above Bruv.**
