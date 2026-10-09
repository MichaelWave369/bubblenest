# Bubble Fusion v1.0 · Invite collaboration without erasing origins

**Ledger Above Bruv. Sauce Before Source.**

Bubble Fusion is an optional public invitation workflow for exactly two independently published Bubble Nest ideas. It does **not** automatically merge research, transfer permissions, license third-party work, certify a result, or imply that either original contributor agrees.

## Using the Fusion Studio

Open **Bubble Fusion** from the site navigation, from two public ideas selected in the **Bubbleverse** side-by-side comparison, or from a Bubble Room's Fusion shortcut. The Passport Exchange also offers a route into the Fusion Lab, but an imported JSON file is **never** treated as an authenticated GitHub bubble.

1. Pick two **distinct, published** Bubble Nest Issues. Source attribution remains attached to the original Issue URLs; example items and private browser drafts are not eligible.
2. Choose a collaboration mode: Joint experiment, Compare methods, Complementary prototypes, Creative collaboration, or Open discussion.
3. Write a precise objective; proposed test or deliverable; **independent credit plan**; ownership/permissions/consent boundaries; and uncertainty.
4. Acknowledge that this is an invitation, not evidence of contributor agreement.
5. Click **Review invitation on GitHub**. The site constructs a prefilled Issue, but the visitor must sign into GitHub, inspect it and explicitly submit. No background action posts, invites or changes the original issues.
6. Existing submitted Fusion issues for the pair appear on the Fusion Studio. They remain **invitation records**, not proof that contributors accepted.

## Public Issue schema

```md
<!-- bubblenest:fusion:v1 -->

# Bubble Fusion · invitation for collaboration

## Bubble A
https://github.com/MichaelWave369/bubblenest/issues/10

## Bubble B
https://github.com/MichaelWave369/bubblenest/issues/12

## Collaboration mode
Joint experiment

## Proposed shared question
What comparison would distinguish the two explanations?

## Suggested joint experiment or work
Preregister controls and outcome measures, then produce independent runs.

## Independent attribution and credit plan
Attribute both original issues separately; request clear acknowledgment for later collaborators.

## Ownership, consent and scope boundaries
No license changes or sharing of private files without prior written permission.

## Limitations and uncertainty
The approaches may not measure the same phenomenon.

## Consent status
PROPOSAL_AWAITING_CONTRIBUTOR_RESPONSES
```

The issue parser requires exact public Bubble Nest Issue URLs, distinct Issue numbers, required text fields and the *fixed* pending-consent state. This is a deliberate constraint. A self-reported `CONSENT_GRANTED` claim in a body is rejected as a different protocol, not promoted to a verified state.

**No silence-as-consent.** If actual collaboration starts, both originating contributors should explicitly respond through independently attributable means and agree on scope, citation, privacy, permissions and licensing. A single proposer cannot consent on their behalf.

## What appears on screen

- A pair selector shows the public GitHub ideas and their separate authors/issue links.
- The form generates a human-reviewed proposal with stated credit and boundaries.
- A history card displays visible Fusion invitation Issues, sourced from the site's existing GitHub API reader.
- The Bubbleverse comparison links to Fusion for the selected public pair.
- Bubble Rooms link to Fusion and indicate how many invitation Issues visibly include the original.
- The Passport Exchange can open Fusion, but it does not assume the imported file is a valid public source.

## Important limitations

- This is **not** an authenticated contributor acceptance flow. GitHub account authorship is not real-world identity verification. No acceptance state can be inferred automatically, and none is rendered.
- Issue creation timestamps and Issue bodies can change. This is not a tamper-proof governance ledger.
- The current static client reads up to **300 recent GitHub Issues**, including closed issues. Missing older or unavailable issues can result in incomplete history or inability to confirm a public bubble.
- Publishing a Fusion invitation does not publish private browser drafts, exchange imported research files, or grant authorized AI-agent writes.
- Topic overlap and apparent methodological similarity are useful leads, not proof of shared origin, plagiarism, agreement or priority.
- There is no scientific consensus score or automated arbitration.

## Further work

A later version could add opt-in, separate **participant acceptance receipts**, scoped permission terms and authenticated roles, while keeping disagreements and rejections visible. Do not call those available in v1.0.

**No Citation, No Coronation.**
