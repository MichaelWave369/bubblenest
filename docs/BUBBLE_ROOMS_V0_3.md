# Bubble Rooms v0.3 · Public research collaboration

Bubble Rooms add dedicated spaces to Bubble Nest ideas. Each bubble now has a shareable room path, a dossier, experiments, sources, visible contributor records and a public activity timeline. No hosted database, accounts or hidden publishing are introduced.

## Opening a room

From the **Explore** idea cards, homepage cards or the **Bubbleverse** inspector, choose the bubble's room. The link follows `#/room/issue-42` for a real public GitHub Issue. Example and locally saved draft rooms have analogous IDs, but their contents are illustrative or private to the local browser.

For room deep links not included in the bounded Issues feed, the client tries a direct public GitHub issue lookup. Only issues accepted by the Bubble Nest bubble schema are shown; if unavailable the page clearly says so.

## Room features

- **Overview:** Original proposal, collaboration request, evidence/limitations, recent recorded contributions
- **Experiments:** Contributor-submitted test plans and self-reported progress
- **References:** Submitted sources and context; no automatic authenticity or accuracy certification
- **Activity:** Public issue-created timestamps and attributable contributions; not a full GitHub audit/event history
- **Contributor list:** Unique GitHub account handles appearing on the bubble and its linked room records, not a formal authorship or membership registry

Only published public bubbles can accept new public room contributions. Each proposed entry opens an **explicitly prefilled GitHub Issue** after the user clicks a link. The visitor reviews and submits with their own GitHub account. The website **does not** silently post or request access tokens.

## Contribution schema

A public entry is a separate issue with a title beginning `[Room] `, and a body marker:

```md
<!-- bubblenest:room:v1 -->
# Bubble Room contribution
## Parent bubble
https://github.com/MichaelWave369/bubblenest/issues/42
## Entry kind
Experiment
## Status
Proposed
## Summary
Test whether two trajectories share a final state.
## Method or context
Create controlled runs and preregister the measured outcome.
## Evidence and limitations
Unverified hypothesis; controls still needed.
## Next question
What would falsify the proposed effect?
```

Allowed kinds: **Experiment**, **Reference**, **Update**. Self-declared statuses: **Proposed**, **In progress**, **Reported outcome**. These statuses are *never* independent scientific judgments. A source or reported result might be wrong. Users should make uncertainty explicit.

Published room records are linked only when their parent URL exactly matches this repository's public issue path, and the linked issue is a recognized Bubble Nest bubble. The app neither endorses nor executes user-submitted content.

## Limits / next milestones

- GitHub's public REST API is used without credentials. The current client fetches at most **3 pages of 100 issues**, including closed issues and contribution records. Records beyond that window may be absent. API rate limits or outages can temporarily hide public entries.
- Editing a contribution is done via its GitHub issue, not inside Bubble Nest. The activity tab is based on initial issue timestamps and cannot prove complete provenance, edit history or who invented an idea first.
- A local draft lives only in that browser, can disappear on storage clearing, and cannot receive public entries.
- The site does not support private teams, file hosting, real-time chat, live notifications or automatic agent posting.
- Future work may include explicitly accepted contributor roles, evidence receipts, structured release and replication checks, and human-reviewed agent workflows.

**Ledger Above Bruv. Sauce Before Source.**
