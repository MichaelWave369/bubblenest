# Claim to Flame Arena v0.7

**Sauce Before Source. Ledger Above Bruv.**

This release connects the original comedic Claim to Flame evidence-completeness self-check to the living *public* research trail in Bubble Nest. It does **not** convert research into a score, certify scientific findings or determine who first invented an idea.

## Two distinct experiences

The preexisting **Bruv-O-Meter** is a visitor-controlled self-check about whether someone has *assembled documentation*. Its 0–100 result is not a scientific validity score.

The new **public Arena**, on the same Claim to Flame page, reads actual GitHub-backed records:
- Published idea bubbles only; local drafts and illustrative demos are never silently upgraded into research.
- Evidence receipts (Source, Test, Replication, Review), grouped by contributor-selected Supports / Challenges / Mixed / Undetermined interpretation.
- Linked Bruv Review entries with corroborating, challenging, inconclusive or more-work-needed findings.
- A count of public evidence challenges and links to the underlying Issue records.
- A route from each Bubble Room to the Arena with that idea selected.

**An entry count is not a quality rating.** A zero count means no record is visible in the bounded feed, not that the claim lacks evidence in the world. The Arena intentionally has no computed truth score, leaderboard or winner.

## Four sauce challenge rounds

1. **State the Claim:** Request a precise claim and falsification criteria.
2. **Show the Sauce:** Ask for a source, observation or method and what it actually supports.
3. **Turn Up the Heat:** Suggest controls or a discriminating test against an alternative explanation.
4. **Back to the Kitchen:** Ask for revisions, limitations, corrections or overlooked possibilities.

A contributor can open a **public GitHub Issue draft** for a round. The form requires:
- A specific question.
- A proposed check that could distinguish alternatives.
- Limitations and uncertainty.
- An optional reference to an evidence receipt already associated with the same public bubble.

Submitting is an **explicit user action on GitHub**, not an API side effect. The front end never requests GitHub credentials or writes an Issue on behalf of the visitor.

## Issue protocol

Every public challenge has a title starting with `[Flame] `, a body marker `<!-- bubblenest:flame:v1 -->`, a strict parent URL pointing to a public Bubble Nest Issue, and the prescribed fields:

```md
<!-- bubblenest:flame:v1 -->

# Claim to Flame · open evidence challenge

## Parent bubble
https://github.com/MichaelWave369/bubblenest/issues/12

## Challenge round
Turn Up the Heat

## Question
What observable measurement would distinguish the claim from an alternative?

## Proposed discriminating check
Publish both protocols and run controlled trials with the same initial conditions.

## Limits and uncertainty
Small samples, confounding variables and inadequate controls may obscure the result.

## Referenced evidence receipt
Not supplied.
```

The reader ignores PRs, malformed or out-of-repository parent URLs, invalid rounds and missing required detail. When a challenge claims to reference a particular evidence Issue, it is only displayed alongside a bubble if that Issue is currently visible and accepted as belonging to that bubble.

## Safety and limitations

- The current GitHub Issues feed is capped at three pages of 100, including closed Issues. Historical results may be incomplete or affected by rate limits/outages.
- All statements come from self-identified public GitHub accounts. GitHub timestamps are not evidence of scientific priority or a tamper-proof provenance trail.
- Review links, receipt existence and submission volume do not establish factual accuracy, independence or misconduct.
- Submitted content is rendered as text, not executable markup. User-supplied section headings and horizontal-rule separators are escaped for the issue schema.
- No moderation engine, automated scientific judgment, anonymous public commenting or reward system is included.
- The format is an original evidence-education concept, not an officially affiliated production or scientific society.

## How to use it

Open Bubble Nest → **Claim to Flame**. Complete the optional self-check above the Arena, then select a published bubble under the Arena's public proposals list. Inspect the record counts and GitHub receipts, filter challenges by round, and open a challenge in a new GitHub tab for review and submission. The originating Bubble Room includes a direct link to its arena view.

**No Citation, No Coronation.**
