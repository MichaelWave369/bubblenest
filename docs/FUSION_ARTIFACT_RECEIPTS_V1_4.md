# Fusion Artifact Receipts v1.4 · Byte-level reproducibility without invented verification

**Ledger Above Bruv · Sauce Before Source · No silence-as-consent.**

This version adds an **Artifact Receipt panel** beneath each public Fusion Trial. Contributors may document the metadata needed to retrieve, reproduce and compare a dataset, source snapshot, test log, result file, model checkpoint or other research artifact. The record is a **public GitHub Issue containing self-declared metadata**. It is not an attestation of authorship, rights, file availability, verified results or Charter execution authorization.

## Fields and required information

Each Artifact Receipt names exactly one existing Trial Issue, its Charter, Fusion invitation, and both independently published source Bubbles. The form requires:

- **Artifact category:** Dataset, Source code, Test log, Results, Model or weights, Other.
- **Filename or artifact name** and a **version, commit, or immutable release tag**.
- **Origin and acquisition method:** how the artifact was produced or obtained, with attributable context.
- **Runtime and environment:** OS, software/dependency versions, hardware, seed or other reproducibility details.
- **Reproduction instructions:** inputs, steps, controls and expected observations or their uncertainty.
- **License and permission declaration:** contributor-reported rights and restrictions (not legally verified).
- **Limitations and uncertainty**, including shortcomings in reproducibility.

Optional fields include declared byte length, public HTTPS URL (which the website never fetches), and a 64-hex-character **SHA-256 digest**. If the digest is absent, the record must be labeled `NO_SHA256_DECLARED`; if present, `SHA256_DECLARED_NOT_VERIFIED`. These status values are derived from the checksum's presence and **cannot be upgraded to VERIFIED** through the Issue's body.

## Local hash calculation

The form includes an optional local file picker using the browser's **Web Crypto SHA-256**. For files up to **25 MiB**, the browser reads local bytes, computes the digest, and fills the filename and byte count. **No file bytes are uploaded or persisted by Bubble Nest.** The selected file is not attached to the GitHub Issue automatically. The calculator operates only when Web Crypto is available in a secure browser context.

For larger files, run a trusted local SHA-256 command (for example, `Get-FileHash .\file.dat -Algorithm SHA256` in PowerShell or `sha256sum file.dat` on Linux) and paste the result. The form accepts a manually supplied 64-digit hexadecimal digest as a **declaration**, not as externally verified evidence.

Even a correctly calculated SHA-256 digest proves only that a **particular byte sequence** hashes to that value (subject to the security properties of SHA-256). It does not prove that the version hosted at a public URL is the same file, that its contents are truthful, that a model was trained with that data, that any researcher has rights over the file, or that the experiment was independently replicated. To check identity, another researcher must independently obtain the artifact and compute/compare the hash from the bytes.

## Workflow

1. Open Bubble Fusion → an invitation → a public Charter → its Trial Receipt Ledger.
2. Expand **Artifact Receipts** under a specific public Trial Issue.
3. Read existing records (including un-hashed or no-URL warnings) with direct public GitHub links.
4. Choose **Add artifact metadata** and provide version, environment, procedure, permissions and limitations. Optionally calculate a local SHA-256 from a selected file.
5. Explicitly acknowledge this is **not** verification or execution permission.
6. Select **Review artifact on GitHub**. The browser opens a prefilled public Issue. The user must sign into GitHub and choose to publish. The website never silently posts.
7. Published records may be visible under the same Trial after the bounded public GitHub API feed returns them.

## Public Issue protocol

The title starts with `[Artifact] `; the body contains `<!-- bubblenest:artifact:v1 -->`. For example:

```md
<!-- bubblenest:artifact:v1 -->

# Bubble Fusion · versioned artifact receipt

## Fusion invitation
https://github.com/MichaelWave369/bubblenest/issues/40

## Charter
https://github.com/MichaelWave369/bubblenest/issues/45

## Trial receipt
https://github.com/MichaelWave369/bubblenest/issues/80

## Origin A
https://github.com/MichaelWave369/bubblenest/issues/10

## Origin B
https://github.com/MichaelWave369/bubblenest/issues/12

## Artifact kind
Dataset

## Filename or artifact name
results.csv

## Version or immutable tag
v1.0.1

## File size bytes
128

## SHA-256 digest
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

## Digest status
SHA256_DECLARED_NOT_VERIFIED

## Public HTTPS artifact URL
https://example.org/release/results.csv

## Origin and acquisition method
Exported from a contributor-run script with pinned revision.

## Runtime and environment
Linux, Python 3.12, pinned dependency lock.

## Reproduction instructions
Run the pinned script with the published synthetic fixture.

## License and permission declaration
Contributor reports permission for public distribution under CC BY 4.0.

## Limitations and uncertainty
Small synthetic fixture; exact linked bytes not checked by this website.

## Record policy
DECLARED_ARTIFACT_METADATA_NOT_REMOTE_VERIFICATION
```

The parser checks strict repository-local parent Issue URLs and exact source chain, allowed artifact kinds, HTTPS-only URL grammar, safe byte lengths, SHA-256 syntax, record status and required fields. The web app renders contributor text as text, not executable HTML. Injected heading and horizontal-rule separators are escaped by the form. The underlying GitHub Issues remain editable, not signed or immutable.

## Limits and governance

- Artifact receipts are **declarations of metadata**, not immutable signed manifests, independent reviews, or content-hosting services.
- SHA-256 presence is a **data-integrity aid**, not a proof-of-truth or ownership indicator. Missing hash is disclosed, never silently represented as verified.
- Source URLs are user-entered and not checked for factual accuracy, file identity, malware, safety, scientific quality or legal licensing.
- No agent execution, software installation, automatic re-running of experiments, downloading public artifacts, file upload, publishing private data or permission granting is part of the workflow.
- GitHub REST API discovery is bounded to **300 recent Issues including closed**; rate limits, outages and pagination may produce incomplete histories.
- Original consent rules continue unchanged: v1.2 Charters are draft plans, v1.3 Trials are contributor reports; neither grants authority to use other people's data or conduct joint work.
- Future versions may add **explicit byte comparison and reproduction receipts** that separately record what was independently checked and by whom. Such a feature would still need to separate verification of file identity from verification of scientific claims.

**No Citation, No Coronation.**
