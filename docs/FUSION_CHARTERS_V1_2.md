# Fusion Charters v1.2 · Governed proposals, not approved projects

**Ledger Above Bruv · Sauce Before Source · No silence-as-consent.**

A Fusion Charter is a **structured, human-reviewed proposal** for a possible pilot project between **two independently published Bubble Nest ideas**. It is attached to a valid, public Fusion invitation that references both distinct original idea Issues.

A Charter is **not a legal agreement, license, signature, grant of permissions, scientific certificate, financial approval or authorization to run an experiment**. The Charter desk deliberately displays the protocol status `DRAFT_FOR_PUBLIC_REVIEW_NOT_AUTHORIZED` and cannot transition it to active. Original contributors must separately agree to specific permissions and scope, and any applicable law and rights remain outside the site's automatic powers.

## Using the Charter Desk

1. Open the site → **Bubble Fusion**.
2. Locate or create a publicly submitted Fusion invitation. The current feature works only for invitations referencing two public, distinct source Issues in the existing GitHub public feed.
3. Open **Charter Desk** underneath that invitation. The side-by-side response signals from v1.1 are shown for context, including declines, withdrawals and missing replies. An interest signal is not an authorization.
4. Select **Draft a proposed charter**. Describe the actual work in bounded, reviewable fields:
   - Collaboration mode and shared objective.
   - Deliverable and observable acceptance criteria.
   - Method, roles and responsibilities, each conditional on approval.
   - Evidence and evaluation plan, including negative/inconclusive outcomes.
   - Independent attribution of both original ideas and any later contributors.
   - Permissions, intellectual property and license boundaries.
   - Privacy and safety controls.
   - Stop conditions and withdrawal procedure.
   - Review checkpoint before spending resources or running work.
   - Uncertainty and risks.
5. Explicitly acknowledge that the document is **not binding or approved**. The site opens a **prefilled GitHub Issue** only after you choose **Review charter on GitHub**. Users must sign in and explicitly submit the Issue themselves.
6. Existing visible Charter Issues display under their invitation with a conspicuous **DRAFT ONLY · NOT AUTHORIZED** label and a link to inspect the source. Older or missing entries may be hidden by GitHub API pagination and rate limits.

## Protocol fields

The charter parser requires the title prefix `[Fusion Charter] `, the marker `<!-- bubblenest:fusion-charter:v1 -->`, and exact original source Issue URLs. It also requires these sections, in this order at generation:

```md
<!-- bubblenest:fusion-charter:v1 -->

# Bubble Fusion · proposed collaboration charter

## Fusion invitation
https://github.com/MichaelWave369/bubblenest/issues/40

## Origin bubble A
https://github.com/MichaelWave369/bubblenest/issues/10

## Origin bubble B
https://github.com/MichaelWave369/bubblenest/issues/12

## Charter mode
Experiment protocol

## Shared objective
Evaluate whether two independent approaches predict the same endpoint.

## Deliverable and acceptance criteria
Publish protocols and a results table including null and negative results.

## Method and responsibilities
Contributors separately propose reproducible controlled experiments.

## Evidence and evaluation plan
Publish baselines, controls, uncertainty, test inputs and version hashes.

## Separate origins and attribution
Credit each original Issue and new work without assuming shared authorship.

## Permissions and license boundaries
No copying private datasets or changing software licenses without permission.

## Privacy and safety controls
Exclude identifying participant data. Use synthetic datasets by default.

## Stop conditions and withdrawal
Stop if participants withdraw, permissions lapse or safety limits are breached.

## Review checkpoint
No work begins before both authorized parties separately agree to the detailed scope.

## Risks and uncertainty
Confounds, dependencies and interpretability limitations remain.

## Charter status
DRAFT_FOR_PUBLIC_REVIEW_NOT_AUTHORIZED
```

The parser ignores malformed or out-of-repository URLs, duplicated original source issue numbers, missing governance fields, unsupported modes, and any altered status that claims approval. User-submitted field values are escaped against heading and horizontal-rule injection.

## Interaction with v1.1 response receipts

The current responses shown beside a Charter are **GitHub account-matched signals**, not independently verified legal consent. A matched **Interested in discussing** from both original source accounts remains **nonbinding interest**. A decline or withdrawn interest must not be overridden merely because a Charter already exists. Nothing in v1.2 creates an activation action.

No agent, bot or human may infer authorization to execute, publish assets or spend funds from the existence of a Charter. Any later acceptance, rights license or execution workflow requires a distinct, explicit, authorization mechanism outside this version.

## Limits

- The site is a static GitHub Pages React application; public records are human-created GitHub Issues, not an audited or immutable backend.
- The public feed currently reads at most 300 Issues, including closed issues. An unavailable or missing Charter or response does not imply it never existed.
- GitHub account handles are not guarantees of identity, legal authority or ownership. Issue bodies may be edited and do not represent signed legal agreements.
- Charter fields are **plans**, not evidence that experiments were performed or deliverables completed.
- No file hosting, automated agent posting, private collaboration database, cryptographic attestations, signed consent, grant payments or contract execution is included.

**No Citation, No Coronation.**
