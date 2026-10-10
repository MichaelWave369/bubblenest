# Reproduction Receipts v1.6 · Repeated observations, not scientific certification

**Ledger Above Bruv. Sauce Before Source. No silence-as-consent.**

A Reproduction Receipt records what a contributor says happened when they attempted to repeat an existing, *public* Fusion Trial's procedure. It is linked to the **original Attempt Report**, its Charter, Fusion invitation and both source Bubbles. It can optionally pin an existing Artifact Issue's declared version and SHA-256. **Nothing in this feature runs an experiment, accesses private files or grants the proposer execution rights.**

## Recording an attempt

In the Bubble Fusion Studio, expand a published invitation → public Charter → Trial Receipt Ledger. **Reproduction Attempts** appears under each **Attempt report** Trial, not under unexecuted plans or stopped-only reports. Open the desk to inspect attributed reports and select **Document a reproduction attempt**.

The form requires:

- A reported outcome, chosen from the five documented categories below.
- The original trial result, value or endpoint being compared.
- The repeat procedure, runtime and environment.
- Controls and baselines.
- Observed results, or a clear statement that no run was possible.
- Deviations from the original protocol, including an explicit declaration if none were knowingly made.
- Alternative explanations and limitations.
- A stopping or blocking reason if the run was blocked or stopped.
- A statement that the contributor had authorization to perform any work independently of Bubble Nest, and that the receipt is **not independent verification**.

For **matching** and **different** outcomes, the contributor **must select a published Artifact Receipt from that same Trial** that declares a SHA-256 digest and a version. The generated report pins the Artifact Issue number, the declared digest and version. This does **not** claim the contributor's local bytes were independently checked. The existing Byte Check Desk is the separate place to report checksum comparisons.

For inconclusive, blocked or stopped outcomes, an Artifact Receipt may be absent. Missing artifacts and methods should be reported, never quietly upgraded to a successful repetition.

## Five explicit outcomes

| Outcome | Meaning |
|---|---|
| `REPORTED_MATCH` | Contributor claims the repeat produced a comparable outcome, with a declared versioned source artifact |
| `REPORTED_DIFFERENCE` | Contributor claims the repeat differed, using a declared versioned source artifact |
| `INCONCLUSIVE` | A repeat was attempted or examined but did not establish whether results agree |
| `NOT_RUN_BLOCKED` | No run completed; why it was blocked must be reported |
| `STOPPED` | A run was halted; the stop reason is mandatory |

Outcomes are **self-reported labels**, not results of platform-run calculations, proof of a valid protocol, statistical equivalence, or a determination of scientific truth. The site preserves contradicting and negative outcomes together without ranking their authors or forcing agreement.

## Issue protocol

A contributor explicitly reviews and submits a **GitHub Issue**, prefixed `[Reproduction]`, with the marker `<!-- bubblenest:reproduction:v1 -->` and fixed policy `SELF_REPORTED_REPRODUCTION_NOT_INDEPENDENTLY_VERIFIED`.

Example:

```md
<!-- bubblenest:reproduction:v1 -->

# Bubble Nest · contributor reproduction report

## Fusion invitation
https://github.com/MichaelWave369/bubblenest/issues/40

## Charter
https://github.com/MichaelWave369/bubblenest/issues/45

## Original trial
https://github.com/MichaelWave369/bubblenest/issues/80

## Origin A
https://github.com/MichaelWave369/bubblenest/issues/10

## Origin B
https://github.com/MichaelWave369/bubblenest/issues/12

## Pinned artifact receipt
https://github.com/MichaelWave369/bubblenest/issues/100

## Declared artifact SHA-256
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

## Declared artifact version
v1.0

## Reported attempt outcome
REPORTED_DIFFERENCE

## Original trial endpoint under comparison
The original Trial claims an output of 1.8 ± 0.2.

## Repeat method and procedure
Run the frozen public script against the declared fixture.

## Execution environment
Linux x86-64, pinned Python and package versions.

## Controls and baselines
Include a negative baseline and original input controls.

## Observations or reason no run completed
The reporter measured 2.4 ± 0.3.

## Deviations and differences from source
Some dependency revisions may differ.

## Limitations and alternative explanations
The dataset versions were not independently authenticated.

## Stop or blocked reason
Not supplied.

## Record policy
SELF_REPORTED_REPRODUCTION_NOT_INDEPENDENTLY_VERIFIED
```

## Trust rules

- Parsing rejects forged status labels, invalid source Issue URLs, missing mandatory methods and uncertainty, unsupported outcomes, malformed SHA-256, artificial success for unpinned outcomes, missing stop reasons and contributor-text section injection.
- At display time, the complete source chain must still resolve: the original Trial, Charter, Fusion, both Bubbles, and the specifically pinned Artifact with unchanged declared version and SHA-256.
- A result using the **same GitHub account** as the original Trial is plainly flagged. A different account is **not authenticated independence**, proof of separate execution or proof of researchers' identities.
- GitHub Issue authorship and timestamps are not legal or scientific priority, signed permission, proof of file creation or uneditable provenance. Issue bodies may be edited.
- The app reads a bounded **300-Issue GitHub feed**, including closed Issues, so records may be missing due to pagination or network limits.
- **No automatic posting or execution.** The interface constructs a prefilled Issue; publication happens only after the visitor explicitly submits it on GitHub.
- **No byte verification is implied.** A pinned hash is contributor-declared metadata; the Byte Check Desk handles separately reported local byte comparisons.
- **No approval, license, contract, copyright ownership, safety clearance, access authorization or scientific certification** can be inferred from Charters, Trials, Artifacts, Byte Checks or Reproduction Receipts.

Future development may help package these linked records into portable snapshots, with explicit missing-record warnings and without turning contributor assessments into authority labels.

**No Citation, No Coronation.**
