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

## Bruv Review Desk · Challenges and reproduction checks (v0.6)

Every public Bubble Room includes a **Bruv Review** tab. Contributors can select a specific public evidence receipt, inspect it, describe a source inspection, method audit, reproduction attempt or critique, disclose their relationship and conflicts, and record uncertainty.

Each submitted review is its own manually posted **GitHub Issue**, linked to a receipt belonging to the same Bubble Room. Submitted findings (*Corroborates, Challenges, Inconclusive, More work needed*) remain **contributor-reported** and can disagree with each other. The site flags same-account self-reviews and never labels an entry independently verified.

Only reviews whose evidence target is visible in the bounded GitHub feed are displayed. A missing review does not establish that no review exists. See [Bruv Review Desk v0.6 technical and attribution guide](docs/BRUV_REVIEW_DESK_V0_6.md).

## Claim to Flame Arena · Public evidence challenges (v0.7)

The **Claim to Flame** page now includes a public Arena below its existing self-reported Bruv-O-Meter. Visitors can select real published bubbles, inspect evidence receipts and conflicting reviews, and issue public questions through four rounds: *State the Claim*, *Show the Sauce*, *Turn Up the Heat*, and *Back to the Kitchen*.

Challenges are structured **GitHub Issue drafts**, explicitly submitted by the visitor after GitHub sign-in. Each asks a specific question, proposes a discriminating check, and discloses uncertainty, with an optional existing evidence receipt. The Arena counts visible records **without assigning any scientific truth score**. Only public bubbles are eligible; illustrative examples and private drafts are excluded.

A Bubble Room links directly to its selected Arena experience. Public history is bounded by the same GitHub Issues feed (up to 300 entries), so empty result sets are not definitive. See the [Claim to Flame Arena protocol](docs/CLAIM_TO_FLAME_ARENA_V0_7.md).

## Bubble Passport · Portable idea dossiers (v0.8)

Every Bubble Room now includes a **Passport** tab for generating an on-device JSON or Markdown snapshot of that idea's available public discussion and research history. The export contains room notes, evolution records, evidence receipts, reviews, challenges, their public GitHub sources, contributor handles and limitations.

Passports are explicitly **partial, unsigned and unverified**. The source feed currently reads no more than 300 public GitHub Issues, including closed records, and can omit historical data. Private browser drafts and illustrative examples export with distinct provenance labels and **no public record attachments**. Nothing is automatically uploaded or published.

A static **[agent-spec.json](public/agent-spec.json)** and **[llms.txt](public/llms.txt)** help human-governed tools discover the schema and participation boundaries. Agents cannot post automatically or access private browser drafts without an explicit user export. See the [Bubble Passport v0.8 guide](docs/BUBBLE_PASSPORT_V0_8.md).

## Passport Exchange · Local comparison (v0.9)

The **Passport** tab now also contains **Passport Exchange**. Import a previously exported Bubble Passport JSON file locally (up to 1 MiB), inspect its declared idea and record counts beside the current Bubble Room, compare topic-word overlap, and copy an explicitly caveated comparison note. The app does **not** send your file to a server, store it between visits, silently post a GitHub Issue, or claim to verify imported authors, evidence or provenance.

The tool accepts v0.8 / v0.9 JSON schemas and checks format, canonical Issue URL syntax, private/demo record isolation, collection counts and explicit uncertainty flags. **A structurally valid file can still contain fabricated claims.** Source authenticity and intellectual influence are not inferred. See [Passport Exchange v0.9](docs/PASSPORT_EXCHANGE_V0_9.md).

## Bubble Fusion · Collaboration invitations (v1.0)

**Bubble Fusion** is a first-class studio for proposing work between **two distinct public Bubble Nest ideas** without erasing their separate origin, credit, or research histories. Its invitation form requires a shared objective, proposed experiment or deliverable, independent attribution plan, specific ownership/permission boundaries, and uncertainty.

**Invitations are NOT acceptance.** The original contributors must independently agree before actual collaboration. No automatic merges, license grants, approvals, hidden writes, or scientific truth scores occur. Proposed Fusion items are ordinary, manually submitted GitHub Issues with both source links; the page displays visible public invitation history, not verified consent.

Launch Fusion from the navbar, Bubble Rooms or two public ideas compared in Bubbleverse. Passport Exchange can navigate to the studio, but imported JSON remains untrusted and must not automatically authorize a proposed partnership. See [Bubble Fusion v1.0](docs/BUBBLE_FUSION_V1_0.md).

## Fusion Response Receipts · Account-signaled replies (v1.1)

Each **Bubble Fusion** invitation now has a **Contributor Response Desk**. Public GitHub Issues can record *Interested in discussing*, *Request changes*, *Decline invitation*, or *Withdraw earlier interest* from someone considering a collaboration. Responses stay linked to a particular invitation and original source role (A or B).

The public reader checks whether the **GitHub account authoring each response Issue matches the GitHub account that opened the corresponding original bubble**. Nonmatching responses stay visible but do not count as the origin account's signal. The newest matching-account response appears as the current position; earlier replies remain inspectable.

**Interest is not legal consent.** Neither two interest signals nor original Issue authorship prove identity, rights ownership, license permission or authorization to execute a joint experiment. This is still a human-reviewed, public GitHub Issue workflow, not automatic publishing. See [Fusion Response Receipts v1.1](docs/FUSION_RESPONSE_RECEIPTS_V1_1.md).

## Fusion Charters · Public pilot planning (v1.2)

Every Bubble Fusion invitation now includes a **Fusion Charter Desk** for drafting a bounded experiment or creative project proposal, with deliverables, evaluation methods, independent credit, license and privacy boundaries, stop conditions, and review checkpoints. The existing v1.1 contributor signals appear alongside the plan so disagreements and withdrawn interest cannot be silently ignored.

Each Charter is **DRAFT FOR PUBLIC REVIEW, NOT AUTHORIZED**. Neither a submitted Issue nor two positive account-interest signals grant execution rights, licensing, identity verification or legal consent. Charter drafts open as **prefilled GitHub Issues for explicit human review**, with no automatic posting or activation. Historical submissions remain labeled nonbinding.

See [Fusion Charters v1.2 protocol](docs/FUSION_CHARTERS_V1_2.md).

## Fusion Trial Receipts · Observations and stopped-work records (v1.3)

Each public **Fusion Charter** now includes a **Trial Receipt Ledger** for reporting unexecuted plans, attempted experiments, and stopped or aborted work. Reports require procedures, controls and reproducibility information, specific observations or reasons no work took place, explicit uncertainty, and an optional public HTTPS artifact. A stopped attempt requires a reason. **A planning note cannot claim an assessed result.**

Every receipt is an attributable, manually published GitHub Issue tied to the exact Charter, Fusion invitation, and both original Bubble Issues. A **Charter remains an unauthorized proposal** regardless of trial reports; interest signals are not legal consent, and reported results are not independently verified. See [Fusion Trial Receipts v1.3 protocol](docs/FUSION_TRIAL_RECEIPTS_V1_3.md).

## Fusion Artifact Receipts · Reproducibility metadata (v1.4)

Each public **Fusion Trial** now has an **Artifact Receipt Ledger** for specific datasets, code snapshots, test logs, results, model files and other supporting artifacts. Contributors can record filename, version, origin, environment, reproduction steps, reported licensing/permissions, uncertainty and an optional public HTTPS link.

An optional SHA-256 digest can be calculated **locally in the browser from a selected file up to 25 MiB**, without uploading its bytes. Larger files can be hashed using a trusted desktop tool, then entered manually. The interface labels hashes as **declared, not independently checked**, and missing hashes as **not supplied**. A checksum never proves experimental truth, file authorship, or consent. Artifact metadata is published only after explicit user review of a prefilled GitHub Issue, linked to the original Trial → Charter → Fusion → two independent Bubble sources.

See the [Fusion Artifact Receipts v1.4 protocol](docs/FUSION_ARTIFACT_RECEIPTS_V1_4.md).

## Byte Check Receipts · Local SHA-256 comparison (v1.5)

Each public **Fusion Artifact** now has a **Byte Check Desk**. Select a local file up to 25 MiB and compare its browser-computed SHA-256 with the contributor-declared artifact digest. The UI distinguishes hash match, hash mismatch, missing source digest, and conflicting source byte size. **No file bytes are uploaded**, and no remote source is fetched.

A completed local check can be documented through a **human-reviewed GitHub Issue draft** with a source chain, acquisition method, environment, uncertainty and automatically derived comparison outcome. The site re-derives outcomes when reading public Issues, rejecting forged results and mismatched source links. **Matching bytes do not certify scientific findings, file authorship, licensing or independent research replication.** See [Byte Check Receipts v1.5](docs/BYTE_CHECK_RECEIPTS_V1_5.md).

## Reproduction Receipts · Report attempts against published Trials (v1.6)

Each public **Fusion Attempt Report** now has a **Reproduction Attempts** desk where contributors can document another run, a differing result, an inconclusive attempt, a blocked run or a stopped attempt. Reports preserve the original trial endpoint, procedure, controls, environment, deviations, observations and limitations, and link back through its Charter, Fusion and source Bubbles.

**Reported matching/different results require a pinned, same-Trial Artifact Receipt with a declared SHA-256 and version.** The site preserves contradictory outcomes, flags same-account repetitions, and treats different-account reports as **unverified independence**. A pinned hash is not a Byte Check, and a replication report is not scientific certification or permission to run an experiment. All submissions use prefilled GitHub Issues that the contributor explicitly reviews and posts.

See [Reproduction Receipts v1.6](docs/REPRODUCTION_RECEIPTS_V1_6.md).

## Reproduction Audit Dossiers · Source-linked review snapshots (v1.7)

Each original published Fusion **Attempt Report** now includes a **Reproduction Audit Dossier** within its Reproduction Attempts desk. It assembles the original Trial, public Artifact declarations, matching Byte Check records, reproduction attempts and contradictory results, with original GitHub links and rule-based flags for visible gaps.

Download **JSON or Markdown** or copy a reviewer-friendly summary. All files are produced in the browser from the **current bounded public feed**; nothing is automatically uploaded, posted or certified. Reports explicitly declare `PARTIAL_OR_UNKNOWN` coverage, unsigned provenance and unverified scientific status. Counts are *inventory*, not evidence-quality scores.

See [Reproduction Audit Dossier v1.7](docs/REPRODUCTION_AUDIT_DOSSIER_V1_7.md).

## Dossier Time Machine · Compare research snapshots (v1.8)

A published original Trial's **Reproduction Audit Dossier** now has a **Dossier Time Machine**. Import an earlier exported v1.7 dossier JSON file (max **2 MiB**) and compare its content to the current browser-visible snapshot for the **same** two source Bubbles, Fusion, Charter and original Trial. Differences are shown as *newly visible*, *no longer visible*, *changed* or *unchanged* Artifact, Byte Check and reproduction records, plus source-field changes and evidence-gap flags.

Imported files stay in the browser and are **untrusted**; files are never uploaded, GitHub posts are never made automatically, and the comparison is **not a verified audit trail**. A missing record may simply reflect the bounded 300-Issue feed, changed Issue text or an outage. Download diff JSON or Markdown, or copy a summary for a human reviewer or authorized agent.

Read the [Dossier Time Machine v1.8 protocol](docs/DOSSIER_TIME_MACHINE_V1_8.md).

## Dossier Fingerprints · Canonical JSON SHA-256 (v1.9)

The **Reproduction Audit Dossier** now includes a **Fingerprint Desk**. It computes a reproducible SHA-256 from the **canonical JSON content**, sorting object keys while preserving arrays, and lets a reviewer compare a locally saved v1.7 dossier with the currently loaded report or with a public GitHub fingerprint receipt. Saved files up to 2 MiB stay in the browser and are never uploaded.

Reviewers can optionally prepare a **human-reviewed `[Dossier Anchor]` GitHub Issue** with the fingerprint, canonical byte length, snapshot timestamp and precise Trial → Charter → Fusion → original Bubble links. This is an editable, self-declared public receipt, **not a digital signature, an immutable timestamp, or proof of research authenticity**. The full dossier is not attached. Scientific claims, legal rights, source identity and agent permissions remain unverified.

See [Dossier Fingerprints v1.9](docs/DOSSIER_FINGERPRINTS_V1_9.md).

## Evidence Capsules · Portable research exchange (v2.0)

The **Reproduction Audit Dossier** includes an **Evidence Capsule Desk** for packaging the **entire public dossier plus its canonical SHA-256** into a single downloadable JSON file. A human reviewer or agent operator can voluntarily exchange that file, and the recipient can check its checksum **locally in the browser** against the enclosed data. The tool also compares against separately declared public GitHub `[Dossier Anchor]` receipts for the same original Trial.

A matching internal hash only establishes **consistency between two pieces of data provided together**, not a signed source, authenticated history, independently verified experiment or legal permission. A malicious publisher can change the data and recalculate its hash. The full dossier stays on the user's computer until they deliberately share it; no automatic uploads, GitHub publications, agent actions, or execution rights are introduced.

See [Evidence Capsules v2.0](docs/EVIDENCE_CAPSULES_V2_0.md).

## Offline Capsule Lab · Two-file research comparison (v2.1)

**[Open the standalone Offline Capsule Lab](https://michaelwave369.github.io/bubblenest/#/capsules)**. Select **two v2.0 Evidence Capsule JSON files**, up to 3 MiB each. The browser checks each included dossier's canonical SHA-256, rejects unsupported or mismatched source chains, and shows **A-only, B-only, changed and unchanged** Artifact, Byte Check and Reproduction records, plus original research-field and evidence-gap differences.

The comparison works **without accessing the live GitHub Issues feed** once the website assets are loaded. Exports in JSON and Markdown and clipboard summaries are all local and manual. A/B labels are not authenticated chronology; missing records are not proof of deletion. Each capsule's checksum is self-contained, **not a signature, provenance certificate or scientific verdict**. No remote binary artifacts, private data or experiments are accessed.

See [Offline Capsule Lab v2.1 protocol](docs/OFFLINE_CAPSULE_LAB_V2_1.md).

## Installable offline app shell (v2.2)

**Bubble Nest is now an installable Progressive Web App.** After an initial successful online load, its versioned service worker precaches the React/Vite app shell, styles, icons and static files, so supported browsers can subsequently open the site while offline. The footer distinguishes browser-reported network state from **offline app shell ready**, offers installation where supported and requires user action to apply an available update.

The standalone **[Offline Capsule Lab](https://michaelwave369.github.io/bubblenest/#/capsules)** can then compare two locally selected v2.0 Evidence Capsules without the live GitHub Issues API. **GitHub data itself is not cached, synced or available offline**; you must have saved any capsules first. Service-worker files are limited to the `/bubblenest/` origin/scope, do not touch other repositories, and never cache third-party API responses, local research files or user drafts. A cached shell is not proof that the GitHub feed works.

The default production build generates stable 192/512 PNG icons and a revisioned `dist/sw.js` precache manifest with Node built-ins; no new package dependencies. See [Offline PWA v2.2 documentation](docs/OFFLINE_PWA_V2_2.md) for first-use, offline limitations and user-controlled updates.

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
