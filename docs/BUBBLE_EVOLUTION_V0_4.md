# Bubble Evolution v0.4 · Document the path, not a progress score

Bubble Evolution turns a Bubble Room into a visible, contributor-attributed history of how its central idea is explored and revised. The five stages are **Spark, Hypothesis, Experiment, Evidence, Revision**. They are an organizational framework, **not scientific grades, automatic validation or a required linear sequence**.

## Workflow

1. Open any Bubble Room from the commons or Bubbleverse.
2. View the five-stage rail below the room statistics, then select **View evolution ledger**, or choose the **Evolution** tab.
3. For a published public bubble, click **Add stage record** and choose a stage and classification: *Proposal*, *Work in progress*, or *Reported result*.
4. Write a specific claim or change, uncertainty, and (for Experiment/Evidence) a method, dataset link or other actionable record.
5. Click **Review on GitHub**. This opens a prefilled public GitHub Issue for **manual review and submission**. Nothing is posted by the website itself.
6. When GitHub publicly serves that Issue in the site's bounded feed, it appears in the ledger under the originating bubble.

## Interpretation

- **Spark** is a display-only baseline for an idea with no recorded evolution entries. It is not a GitHub event unless a contributor explicitly creates one.
- The rail marks which stages have *at least one submitted record*, not that any stage has passed scientific review.
- **Latest reported stage** means the most recent public evolution Issue by `created_at` (with issue number as a deterministic tie break), not the most advanced or confirmed stage.
- A theory may go from Evidence back to Hypothesis. This is intended behavior: science and creative work are iterative.
- **Evidence** means a contributor supplied documentation; it does not prove the claim true. **Reported result** means the contributor characterized it as a result, not that other people confirmed it.
- Timeline entries are timestamped issue creations, **not** complete edit histories, proof of invention, IP ownership, endorsement, peer review or authorship certification.

## Issue schema

Issues use the title prefix `[Evolution] ` and HTML marker `<!-- bubblenest:evolution:v1 -->`.

```md
<!-- bubblenest:evolution:v1 -->

# Bubble Evolution · contributor-reported stage

## Parent bubble
https://github.com/MichaelWave369/bubblenest/issues/42

## Stage
Hypothesis

## Entry classification
Proposal

## Claim or change
A testable conjecture with a stated failure condition.

## Method and receipts
Describe the planned measurement, observations or link to sources.

## Limitations or uncertainty
Unknown parameters, confounds, or counterexamples.

## Next question
What independent test would discriminate the alternatives?
```

The parser accepts only enumerated stages, classifications, the exact parent issue URL for this repository, a nonempty claim and uncertainty, and a nonempty method for an Experiment or Evidence record. Example bubbles and locally saved drafts cannot publish evolution records.

## Operating boundaries

- Current GitHub Issue data is fetched without credentials, at most 300 recent entries, including closed issues. Older entries, rate limiting, or offline conditions may produce incomplete displays.
- No backend writes, automated agent authorization, invitations, consensus voting, private history, or real-time presence in this version.
- Users can edit records on GitHub. Displayed summaries come from the current issue body, while the displayed initial creation time is the issue metadata.
- The site does not distinguish verified source legitimacy or assess ethical approval, claims ownership, scientific robustness, or source truth.
- Contributors should never include secrets, sensitive personal details, or unpublished third-party materials without appropriate permission.

## Ideas for v0.5

- Human-reviewed evidence receipts and status transitions separate from contributor self-reports
- Citation-specific verification and robust provenance / corrections
- Explicit experiments tied to hypotheses and their outcome traces
- Agent-readable export with guardrails and attribution

**Ledger Above Bruv. Sauce Before Source.**
