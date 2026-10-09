# Bruv Review Desk v0.6

**Sauce Before Source. Ledger Above Bruv.**

## What it does

The Bruv Review Desk adds a structured, contributor-attributed **check of a specific public evidence receipt** in a Bubble Room. It is a place to document challenges, corroborating attempts, methodological critique, and unresolved questions. It is **not a scientific-verification certification process**.

Open an existing Bubble Room, choose **Evidence**, select **Bruv Review** on a particular receipt, or open the **Bruv Review** tab to browse existing reviews.

A review always refers to a particular valid evidence Issue from the *same* public Bubble Nest room. A review whose target evidence receipt cannot be found in the site's bounded public GitHub feed is not displayed or counted. This guards against attaching arbitrary URLs, but **does not authenticate the scientific validity** of the targeted source.

## Required review information

- **Check type:** Source inspection, Method audit, Reproduction attempt, Critical assessment
- **Contributor's finding:** Corroborates, Challenges, Inconclusive, More work needed
- **Relationship disclosure:** No known relationship (self-declared), Collaborator or contributor, Unknown / not disclosed
- **Conflicts/relationships:** Required free-text disclosure of funding, authorship, prior collaboration, and relevant incentives
- **Review summary, method and public checks, limitations/uncertainty:** All required
- **Next check:** Optional proposed follow-up

The site only records what the contributor reported. Relationship declarations and conflict disclosures are **not authenticated**. A review by the same GitHub account as the evidence receipt's author receives a visible warning, not automatic removal or a false label of independence.

## Submission and storage

Submissions use GitHub's prefilled Issue workflow, with the title prefix `[Bruv Review]` and the body marker `<!-- bubblenest:review:v1 -->`. The website never submits on anyone's behalf, requests an access token, or creates a backend record. GitHub sign-in and explicit posting are required.

Example issue body:

~~~md
<!-- bubblenest:review:v1 -->

# Bruv Review Desk · review receipt

## Parent bubble
https://github.com/MichaelWave369/bubblenest/issues/12

## Reviewed evidence receipt
https://github.com/MichaelWave369/bubblenest/issues/42

## Check type
Method audit

## Finding
Inconclusive

## Relationship declaration
Unknown / not disclosed

## Potential conflicts
No known funding or collaboration conflicts.

## Review summary
Documentation is insufficient for a causal claim.

## Method and public checks
Examined the publicly linked protocol and original source.

## Limitations and uncertainty
No independent reproduction was attempted.

## Next check
Request a frozen version of the protocol.
~~~

## Attribution and limitations

The reviewer's GitHub handle and creation timestamp are displayed with a link back to the public review Issue. A room's public activity history and participant list include those attributable review Issues. This is not a full, immutable provenance ledger: GitHub Issue bodies can be edited, usernames are accounts rather than verified real-world identities, and creation timestamps do not establish intellectual priority.

The current static front end fetches at most 300 GitHub Issues, including closed ones, and may encounter rate limits or incomplete listings. A missing review or evidence Issue does not mean it never existed. The filter deliberately excludes reviews whose associated evidence receipt is absent from the current feed.

**No automated truth labels, consensus grades, certification, editorial moderation or institutional peer review are offered in v0.6.** Disagreement and negative findings are displayed without algorithmic adjudication. Future versions could support reproducible artifacts, explicit reviewer permissions and stronger provenance checks, but those are not claims about the present implementation.

**No Citation, No Coronation.**
