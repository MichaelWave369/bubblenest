# Bubbleverse v0.2 · The Living Idea Atlas

## Purpose

Bubbleverse is a navigable, visually expressive discovery map for Bubble Nest. It helps people **find possible thematic overlap** between proposals, not prove relationships of origin, influence, shared authorship or scientific agreement.

## Data

- The graph displays real Bubble Nest submissions ingested through the public GitHub Issues API (maximum 80 issues in the current static front end).
- A visitor's private browser drafts appear locally, **never posted** to GitHub by graph actions.
- Built-in demo data always carries an *illustrative example* label.
- The browser determines suggested edges from overlapping terms and, weakly, the same broad category. No AI adjudication, backend tracking or implication of authorship.
- A node is a proposal, not a peer-reviewed research record. Suggested connections cannot be used as evidence of plagiarism, intellectual debt or collaboration.

## Interaction

1. Open **Bubbleverse** in the navbar or **Explore the map** on the homepage.
2. Filter by topic or search; optionally toggle **Public only**.
3. Select any bubble; the inspector displays the request and evidence status.
4. Click **Compare side by side** on a suggested connection to inspect both ideas.
5. Only when **both bubbles are verified as public issues belonging to this repository** can the user open a prefilled connection-review issue. All proposed issues require GitHub authentication and explicit user submission. No background publish occurs.
6. **Share selection** copies a deep link of the form `#/bubbleverse?focus=issue-42`. Private draft links work only in the browser that holds the draft.

## Safety and scale limitations

- The client renders the first 30 matching bubbles; users can refine filters to inspect more. It does not present the visible set as an exhaustive catalog.
- The keyword model is a deterministic discovery heuristic. Vocabulary overlap is **not** an assertion of intellectual connection.
- Edge counts and node groupings change with the filters, and no edges are stored as verified knowledge.
- GitHub's unauthenticated API can be rate limited. If unavailable, the page still shows examples and local drafts.
- There is no presence indicator, direct messaging, real-time multi-user canvas, persistence of review verdicts, or automatic agent authorization.
- Users must not post sensitive personal data or private research without permission.

## Suggested follow-up milestones

- Explicit evidence-backed relationship types (e.g. *inspired by*, *extension of*, *independently similar*) with confirmation from each contributor.
- Issue/PR references for experiments, corrections, replicated findings and contribution receipts.
- Agent-friendly JSON exports and human-governed review workflows.
- Virtual rooms and optional richer backend once the simple public Issues workflow has actual community use.

**Ledger Above Bruv. Sauce Before Source.**
