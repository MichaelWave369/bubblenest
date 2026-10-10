# Offline Lab Self-Test v2.3 · Synthetic capsule exercise and honest PWA diagnostics

**Ledger Above Bruv · Sauce Before Source · No Citation, No Coronation**

Bubble Nest's **Offline Capsule Lab** (`#/capsules`) now includes a **Run synthetic self-test** button. A person can exercise the complete local evidence workflow immediately, without supplying their own research files, calling GitHub's API, publishing an Issue or claiming any scientific result.

## What the demonstration contains

Two **fictional** v2.0 Evidence Capsules are generated in the browser from a frozen, deterministic dataset.

- Capsule **A** has an invented trial observation, one invented artifact declaration, a deliberately fabricated byte-match report, and a pretend matching reproduction result.
- Capsule **B** uses the same invented research source chain but changes the observation, reports a simulated byte mismatch, changes the claimed reproduction outcome, and adds an invented blocked attempt.
- All data is labeled **SYNTHETIC**. The canonical Issue URLs required by the older dossier schema contain conspicuously large placeholder numbers that do **not** refer to published GitHub Issues, real users or actual experimental evidence.
- The dossier's `synthetic_demo` structure states `published_issues: false`, `real_measurements: false`, `authenticated: false`, and `license_or_execution_authority: false`; `source.system` and warnings also identify the fake data. The frozen timestamp of **2000-01-01** is a fixture value, not evidence that any such research existed then.
- The app will not allow a synthetic demo capsule to be compared with an ordinary research-labeled capsule.

The demo does not use real datasets or reproduce scientific results. Its fabricated artifact digest and byte-check results are **illustrative metadata only**, not hashes computed from actual instrument files.

## Local checks

One user click runs the same production canonicalization, capsule-integrity verification and two-capsule comparison logic used for ordinary files, then tests that a deliberately modified dossier **fails** its included SHA-256 check. The explicit self-test checks are:

1. The synthetic Capsule A checksums match internally.
2. The synthetic Capsule B checksums match internally.
3. Their difference report finds the two deliberately changed downstream records, one Capsule B-only reproduction and the original observation difference.
4. Tampering with Capsule B's dossier without updating its fingerprint produces `INTERNAL_HASH_MISMATCH`.

Each check displays PASS or FAIL. Both seeded capsules can be downloaded as **SYNTHETIC-NOT-REAL** JSON files; they can later be selected through the ordinary Capsule A/B file pickers, including after loading the offline app, to rehearse real file import. The comparison UI disables public Issue hyperlinks for the synthetic fixture and displays a warning for simulated outputs. JSON and Markdown comparisons carry an explicit synthetic declaration.

A PASS means the local algorithms behaved as expected **for these fixtures only**. It does not prove arbitrary capsule security, authenticated provenance, real research, legal rights, author identity, scientific truth or a full end-to-end browser test.

## Browser readiness versus verified offline reload

The demo station has a separate **browser readiness** display with:

- **Web Crypto available/unavailable**: whether local SHA-256 is exposed in the current secure browser context.
- **Service worker controlling/not controlling**: whether this tab has an active controlling service worker.
- **Browser online/offline**: the browser's own approximate connectivity report.

These conditions are not conclusive evidence that an actual offline cold load works. The synthetic self-test is not itself an offline network-disconnect test.

### Manual cold-reload verification

1. Open `https://michaelwave369.github.io/bubblenest/#/capsules` while online, after PR #22 has deployed, and wait for the existing **offline app shell ready** status.
2. Run the synthetic self-test while online. Download both synthetic capsules if you want to test file imports as well.
3. Disconnect Wi-Fi / network. Leave the browser running or reopen the installed Bubble Nest app. **Reload the Lab while actually disconnected**. If the static application shell loads, that is a real-world sign the app was available from cache.
4. Run the self-test again; all four checks should PASS without requiring a GitHub API connection. Optionally import the previously downloaded fictional capsules from your computer.
5. Reconnect and use the footer's explicit **Check app update** control when desired. Never interpret the absence of offline GitHub public records as absence of evidence.

Offline reloading can still fail if a browser evicts site storage or a first online installation never completed. PWA installation behavior differs by browser, and the app does not auto-cache local research files.

## Agent and research guardrails

- All fixture files are synthetic, untrusted **data**, never agent instructions, legal signatures, verified science, source citations or publication-ready experimental results.
- Original v2.0 research capsules retain the normal import, schema, source-chain and SHA-256 safeguards.
- A synthetic training capsule cannot silently attach to real source records in an offline comparison.
- The app performs no GitHub mutations, remote file downloads, experiment execution, private data access or automatic file persistence.
- The GitHub Issue URLs in the demonstration are **fake placeholders** required by earlier schema compatibility. They must not be cited as actual published Issues, and the demo UI does not present them as active GitHub links.

**Ledger Above Bruv.**
