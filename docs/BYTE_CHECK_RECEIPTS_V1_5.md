# Byte Check Receipts v1.5 · Local SHA-256 comparison, not scientific verification

**Ledger Above Bruv. Sauce Before Source.**

This version adds a **Byte Check Desk** beneath every published Fusion Artifact Receipt. A contributor may select an existing local file, calculate its SHA-256 with browser Web Crypto, and compare it against the SHA-256 **declared** in that public Artifact Issue. The comparison runs locally and **no file bytes are uploaded or sent to GitHub**. A human may choose to submit only a text-based report via a prefilled public GitHub Issue.

## How to use it

1. Open Bubble Fusion → a public invitation → Charter → Trial → Artifact.
2. Expand **Byte Check Desk** under the exact Artifact Receipt you wish to examine.
3. Select **Compare a local file** and choose a file you are entitled to inspect (25 MiB maximum).
4. The browser calculates the SHA-256 of the bytes you selected, determines file size, and compares this metadata with the Artifact's **current contributor-declared reference**.
5. The UI shows **one of four distinct results**. Nothing is automatically certified:
   - `HASH_MATCH`: the local digest matches the original declared digest and the declared byte size, if present.
   - `HASH_MISMATCH`: the calculated local digest differs from the declared digest, with no prior size conflict.
   - `NO_REFERENCE_DIGEST`: no SHA-256 was declared in the source artifact record, so comparison isn't possible.
   - `DECLARED_SIZE_CONFLICT`: the source's declared byte length differs from the selected file's size. This takes precedence over the hash comparison.
6. To report the check, describe how you obtained the file, how you hashed it, and what the check **does not establish**. Tick the statement acknowledging its limited significance.
7. Select **Review byte-check Issue** to open a GitHub Issue draft. It is published only if you explicitly submit on GitHub. The file itself is never attached.

The UI only calculates and submits from locally selected bytes (max 25 MiB). For larger files, you can still compute SHA-256 with external local tooling and inspect the comparison manually; v1.5 doesn't claim to import external hash reports, stream large files or automatically fetch remote URLs.

## Public Issue schema

A submitted Issue starts with `[Byte Check] `, contains `<!-- bubblenest:byte-check:v1 -->`, and includes the exact **Fusion, Charter, Trial, Artifact and two original Bubble links**. It records a source-reference digest and size, local filename, local hash and size, the derived result, retrieval provenance, hashing environment, uncertainty and the immutable-in-protocol policy `CONTRIBUTOR_REPORTED_LOCAL_BYTE_COMPARISON_NOT_SCIENTIFIC_VERIFICATION`.

Example body:

```md
<!-- bubblenest:byte-check:v1 -->

# Bubble Nest · contributor-reported byte comparison

## Fusion invitation
https://github.com/MichaelWave369/bubblenest/issues/40

## Charter
https://github.com/MichaelWave369/bubblenest/issues/45

## Trial receipt
https://github.com/MichaelWave369/bubblenest/issues/80

## Artifact receipt
https://github.com/MichaelWave369/bubblenest/issues/100

## Origin A
https://github.com/MichaelWave369/bubblenest/issues/10

## Origin B
https://github.com/MichaelWave369/bubblenest/issues/12

## Artifact reference SHA-256
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

## Artifact reference byte size
3

## Local filename
sample.bin

## Observed local byte size
3

## Observed local SHA-256
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

## Byte comparison result
HASH_MATCH

## File acquisition and chain of custody
Retrieved from the source identified by the contributor.

## Hashing environment and method
Browser Web Crypto SHA-256.

## Limitations and uncertainty
Source authenticity and scientific validity were not checked.

## Record policy
CONTRIBUTOR_REPORTED_LOCAL_BYTE_COMPARISON_NOT_SCIENTIFIC_VERIFICATION
```

When reading public Issues, the parser **recomputes the result** from digests and sizes. It rejects changed result labels, malformed SHA-256 digests, fake Issue URLs, unknown result states, missing uncertainty, forged policy states, Pull Requests, invalid sizes, and contributor-text section spoofing. The reader also requires the entire reference chain to match an existing current Artifact receipt. If its original reference digest or declared size changes, the old check stops appearing attached to that current reference; the prior public GitHub Issue remains inspectable.

## Important limits

- **Matching bytes is not verification of science.** Even correct SHA-256 equality does not establish that a published dataset is complete, trustworthy, appropriately licensed, authored by a particular person, or relevant to a scientific result.
- **This is not authentication of source file identity.** The reference digest comes from editable contributor content. GitHub usernames do not prove real-world identity or independent reviewer status.
- **GitHub Issues remain editable.** A reported check is a public account statement, not a cryptographically signed attestation. Recomputing the schema result does not prove the author actually performed a file hash.
- **No remote inspection.** The site never downloads remote file bytes or confirms that a linked URL corresponds to the declared SHA-256.
- **No automatic publication.** Only explicit GitHub Issue submission creates public data. File bytes remain on the user's device, and browser-selected files are not uploaded.
- **No experiment execution authority.** Fusion invitations, response signals, Charters, Trials, Artifacts and Byte Checks cannot license or authorize research work, transfer copyright or grant access to private data.
- **Bounded public feed.** The site reads up to 300 GitHub Issues (including closed records); older or inaccessible checks may be absent without proving none were ever submitted.

The next possible step is a **separate reproducibility attempt receipt**, where a participant reports running a public protocol against pinned artifacts, with both successes and failures included. It must remain distinct from the limited byte-identity check.

**No Citation, No Coronation.**
