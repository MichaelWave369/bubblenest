# Fusion Trial Receipts v1.3 · Reproducible reporting without execution authority

**Ledger Above Bruv. Sauce Before Source. No silence-as-consent.**

This release adds a **Trial Receipt Ledger** under each public **Fusion Charter**. Charters remain `DRAFT_FOR_PUBLIC_REVIEW_NOT_AUTHORIZED`, regardless of how many Trial receipts appear.

Each Trial receipt is a separate manually submitted GitHub Issue. It identifies the exact Fusion invitation, Charter Issue and both independently published source bubbles. Trial receipts document **plans, self-reported attempts, and stopped/aborted work**, with methods, controls, observations, limitations, and optional public artifacts. They cannot grant execution authority, contractual consent, data publication rights, scientific validation or claims of priority.

## Three kinds of records

- **Planning note:** Describe a proposed check, its procedure, expected observations and limitations. Its interpretation must remain `Not assessed`. Do not invent observations.
- **Attempt report:** Describe work you actually undertook with appropriate existing authorization outside Bubble Nest. Report the procedure, controls, observed outcomes and uncertainty. Interpretations may be `Supports`, `Challenges`, `Mixed`, `Inconclusive`, or `Not assessed`, but these are *contributor-selected labels*, never system judgments.
- **Stopped or aborted:** Document why work stopped, including safety limits or withdrawals. A stop note is mandatory. No resumption or other person's continued participation is presumed.

All records require a question, a procedure/environment description, observations (or why no work took place), controls and reproducibility details (including missing controls), and limitations or alternatives. Public HTTPS artifact URLs are optional; they are *not verified or fetched* by Bubble Nest. Do not upload secrets or third-party private assets.

## How it works

1. Open a public Bubble Fusion invitation and expand its **Charter Desk**.
2. For a public Charter, choose **Inspect receipts** under the **Trial Receipt Ledger**.
3. Review the attributable existing records with the actual GitHub source links.
4. Choose **Document a plan, attempt, or stopped test**. Fill out the relevant fields and acknowledge that the Charter and receipt do not authorize any work or certify a result.
5. Choose **Review receipt on GitHub**. This opens a prefilled GitHub Issue for an explicit user action. No background posting, execution, or license change occurs.
6. The receipt appears under its exact Charter if the bounded public GitHub Issues feed returns it.

### Versioned Issue protocol

The title starts `[Fusion Trial] ` and the body carries `<!-- bubblenest:fusion-trial:v1 -->` followed by:

```md
<!-- bubblenest:fusion-trial:v1 -->

# Bubble Fusion · trial observation receipt

## Fusion invitation
https://github.com/MichaelWave369/bubblenest/issues/40

## Charter
https://github.com/MichaelWave369/bubblenest/issues/45

## Origin A
https://github.com/MichaelWave369/bubblenest/issues/10

## Origin B
https://github.com/MichaelWave369/bubblenest/issues/12

## Record kind
Attempt report

## Contributor interpretation
Inconclusive

## Question
Do both independent methods predict the same result?

## Procedure and environment
A contributor reports executing public code with pinned versions.

## Observations or reason not tested
A null result was reported under the selected configuration.

## Controls and reproducibility
Compare both baselines; publish test inputs and versions.

## Public artifact URL
Not supplied.

## Limitations and alternatives
Sample may be too small; calibration not independently checked.

## Stop or withdrawal note
Not supplied.

## Next check
Seek a separate independently authorized re-run.

## Record policy
SELF_REPORTED_OBSERVATION_NOT_EXECUTION_AUTHORIZATION
```

The parser checks the precise issue URL grammar, enumerated record kinds and interpretations, required observations and controls, optional HTTPS artifact URL with no embedded credentials, fixed policy marker, and malformed field injection. The reader also requires the trial to match the Charter, Fusion and two source Issues exactly.

## Important distinctions

- **A Charter is a proposal, not authorization.** Trial Issues should only report work actually done with applicable independent permission or clearly label plans as unexecuted.
- **An attempt is not a replication certificate.** An attributed GitHub claim that somebody ran an experiment has not been checked independently by Bubble Nest.
- **A null result or abort is not an embarrassment.** The ledger records them alongside positive and negative findings without hiding uncertainty or rewarding favorable outcomes.
- **A link is not an attestation.** The website neither hashes nor downloads experimental artifacts and does not evaluate their scientific quality.
- Source Issue authorship is a GitHub handle, not verified real-world identity, proof of copyright ownership, or legal approval.
- The existing public client reads up to **300 GitHub Issues**, including closed items. Network errors, pagination or rate limits can hide historical records. Issue bodies can be edited.
- No experiment execution, agent authorization, private file exchange, automatic grant of permissions, signature validation or payment is introduced in v1.3.

## Next possible milestone

Structured human-reviewed experiment artifact manifests with hashes and comparison against independently reproduced results, while still keeping scientific judgments distinct from data completeness.

**No Citation, No Coronation.**
