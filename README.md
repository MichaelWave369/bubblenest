# Bubble Nest 🫧

**Where ideas find each other.** A human-and-agent-friendly commons for experiments, theories, inventions, art and open collaboration.

**Claim to Flame** lives in Bubble Nest. **Sauce Before Source.** The Royal Society of Nested Bubble Bruvology is a playful, unofficial educational framing for good sourcing and repeatable testing.

## Live GitHub Page

After GitHub Pages is configured with **Source: GitHub Actions**, deployment on the `main` branch publishes to **https://michaelwave369.github.io/bubblenest/**.

## What works

- Responsive React + Vite interface with animated nested bubbles and cosmic visual styling.
- Category and text filtering, clear illustrative example badges and real public GitHub Issue submissions.
- Idea composer with a specific collaboration request and evidence/limitations field.
- Local private drafts stored in the current browser. This storage can be lost if cleared; don't treat it as cloud backup.
- Public publishing via a **prefilled GitHub Issue**: a real GitHub account is required to submit. Discussions and attribution stay in GitHub, not a fictional database.
- Claim to Flame: six sauce stages, evidence self-check, and exportable text report.
- MIT license, automated tests and a GitHub Pages build/deploy workflow.


## Bubbleverse · Living Idea Atlas (v0.2)

The **Bubbleverse** is an interactive map of example ideas, private local drafts and published GitHub issue bubbles. Select a bubble to inspect its evidence status, use search and topic filters, see unverified thematic suggestions, or compare two proposals side-by-side. Copyable selection links support focused discussion. Only public issue-to-issue pairs may generate a *draft* connection-review issue, which must be explicitly submitted through GitHub.

**Important:** Its lines are keyword/category-based suggestions, never verified scientific relationships or evidence of who inspired whom. The map caps results at 30 visible bubbles and discloses omitted results. See [Bubbleverse technical/ethics specification](docs/BUBBLEVERSE_V0_2.md).

## Bubble Rooms · Individual research spaces (v0.3)

Every public Bubble Nest idea now has a dedicated **Bubble Room**, accessible from idea cards and the Bubbleverse map. Inside, visitors can view the original idea dossier, proposed experiments, shared references, publicly attributed participation and a timestamped activity list.

**Publish without hidden infrastructure:** A contributor fills out a form and explicitly opens a prefilled public GitHub Issue linked to the original bubble. Only actual GitHub issues are public records. Example and locally saved draft rooms never impersonate real community participation.

GitHub Issues are fetched in up to three pages of 100 (including closed items). The site may not have a complete feed or full edit history, and submitted evidence remains **self-reported** until independently checked. See the [Bubble Rooms v0.3 specification](docs/BUBBLE_ROOMS_V0_3.md).

## Bubble Evolution · Five-stage journey (v0.4)

Each **Bubble Room** now offers an **Evolution** tab and five-stage visual journey: Spark → Hypothesis → Experiment → Evidence → Revision. The stages are **not linear grades or verified scientific milestones**. Ideas can move backward, revisit earlier hypotheses and change course when new information arrives.

Published public bubbles can accept contributor-reported evolution notes through an explicit prefilled GitHub Issue. Each record includes a claim/change, required uncertainty, and methods or receipts for experimental or evidence stages. The latest public contribution is labeled **most recently reported**, never automatically certified. Evolution notes also join the room's timestamped activity feed and attributed participant list.

The site preserves its static GitHub Pages architecture. All public records are limited by the currently fetched GitHub Issues window, and event timestamps do not prove invention or priority. See [Bubble Evolution protocol and safeguards](docs/BUBBLE_EVOLUTION_V0_4.md).

## Evidence Ledger · Research receipts (v0.5)

Every Bubble Room includes an **Evidence** tab to collect public source references, reproducible test reports, replication attempts and critiques. You can browse and filter records, inspect supplied methods and limitations, follow source links, and see who submitted each GitHub receipt. The activity history and contributor list include evidence issues alongside room and evolution notes.

To contribute, fill out a structured form and choose **Review draft on GitHub**. You must then inspect and submit the public Issue yourself. A Source entry requires a public URL; Test and Replication entries require methods; every entry requires explicit uncertainty. **Supports, Challenges, Mixed and Undetermined are self-reported perspectives, not verified truth labels.** No automated certification is implied.

Data comes from the same bounded GitHub Issues API feed (at most 300 entries); missing results do not imply no evidence exists. See [Evidence Ledger v0.5 protocol](docs/EVIDENCE_LEDGER_V0_5.md) for requirements and limitations.

## Run locally

Use Node.js 22+.

```bash
npm install
npm run dev
npm test
npm run build
```

## Deploy

1. Merge the first PR into `main`.
2. Open **Settings → Pages → Build and deployment** and set **Source: GitHub Actions**.
3. Watch **Actions → Build and deploy Bubble Nest**. Verify the `verify` and `deploy` jobs finish successfully; manually run the workflow if needed.
4. Visit **https://michaelwave369.github.io/bubblenest/** when the deployment is complete.

**Important:** GitHub Pages is static. Browsing is public, while publishing and commenting happen through GitHub. The public GitHub API can occasionally be rate-limited; in that case, the site displays only examples and browser-local drafts. Example cards are clearly labeled and not presented as real users.

## Governance

Bubbles are proposals, not automatically validated research. Evidence checklist scores measure self-reported **completeness**, not truth, originality or scientific certainty. Attribution is explicit; a discussion does not automatically confer shared authorship.

See [CONTRIBUTING.md](CONTRIBUTING.md) for participation guidelines.

**Ledger Above Bruv. Sauce Before Source. No Citation, No Coronation.**
