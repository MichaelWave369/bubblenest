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
