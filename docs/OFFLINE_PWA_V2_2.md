# Bubble Nest Offline PWA v2.2 · Installable, controlled updates and static-shell precaching

**Ledger Above Bruv · Sauce Before Source**

The v2.1 Offline Capsule Lab can compare two previously downloaded Evidence Capsules without GitHub API access. v2.2 now makes the **Bubble Nest application itself** installable and available for subsequent offline loads, once its production shell has been cached by a supported browser.

## How to set up

1. Visit **https://michaelwave369.github.io/bubblenest/** using a browser with Service Worker and Web Crypto support, **while online**.
2. The production app registers the worker at **/bubblenest/sw.js** under **/bubblenest/** and precaches its HTML, hashed JavaScript/CSS bundles, static icon files, manifest and other build assets.
3. Wait for the footer status to show **Offline app shell ready**. This indicates that an installed service worker is controlling this page. A browser restart or reload may be needed depending on first-install timing.
4. Install via a browser's app installation option if available. Browsers that supply the `beforeinstallprompt` event also expose an **Install Bubble Nest** button in the footer. Some mobile browsers instead require their own **Add to Home Screen** menu.
5. Download v2.0 Evidence Capsules while you have access to them. **The PWA does not copy, sync, persist or preload any capsules for you.**
6. Later, disconnect from the network and reopen the cached website/app. Navigate to **Capsule Lab** and select two local capsule JSON files. SHA-256 verification, source-chain matching, evidence differences, local exports and copying are browser-side and require no GitHub API.

Note: Web Crypto normally works in secure contexts, and GitHub Pages serves over HTTPS.

## Production build contract

The ordinary `npm run build` is now **Vite build → node scripts/generate-pwa.mjs**. No new runtime library or cloud component is required.

The script draws deterministic 192px and 512px PNG app icons using Node built-ins, walks `dist` for static files, calculates a SHA-256 revision from filenames **and file bytes**, and emits `dist/sw.js` with a list of same-origin files to precache.

The cache uses a build-revisioned name starting with `bubble-nest-shell-`. Updating a script, stylesheet or static asset changes its revision; the new service worker precaches the new shell in its own cache before it can replace the old worker. On activation, stale **Bubble Nest** cache versions are cleaned up. No other application's caches are deleted.

The PWA manifest uses `/bubblenest/` as its scope and launches at `/bubblenest/#/capsules`. Icons are bundled in `dist/icons/`. All paths are prefixed with the GitHub Pages project base so unrelated GitHub Pages repositories are not intercepted.

## Network and cache policy

- **Only same-origin static Bubble Nest build files** listed in that exact worker's precache manifest are served cache-first.
- **Application-shell navigation** within the Bubble Nest scope tries the network first. If unavailable, it falls back to the precached `index.html` to keep React hash routes usable.
- Requests to **api.github.com**, GitHub Issues, other websites, and other GitHub Pages repositories are **never intercepted or cached by this worker**.
- The service worker never stores contributor-entered files, private local drafts, downloaded capsules, GitHub JSON responses or third-party content.
- PWA cache availability does **not** mean public Bubble Room, Trial, Charter or collaborator feeds are live or available offline. Those views may show unavailable/empty public data when disconnected. **The local Capsule Lab** remains functional with selected files.
- Users can clear website data through browser settings to remove the cache and local drafts; browsers can also evict stored data under storage pressure.

## Update and installation behavior

On supported production browsers, a compact footer bar separately reports **browser network status** (which is an approximate signal, not proof the GitHub API works) and **whether an offline app-shell service worker controls the page**.

The worker does **not** call `skipWaiting()` during installation. If an update is ready, the footer displays **Apply ready update and reload**. Only an explicit click sends `SKIP_WAITING` to the waiting worker. A reload follows when control changes. The user can also choose **Check app update**, which asks the browser to check the worker source, without granting a permission to auto-activate it.

An uncontrolled first page load may become controlled as soon as installation and activation complete. If the browser does not support service workers or installation prompts, the site remains usable online and does not falsely claim offline readiness.

## Tests and limitations

The Node suite checks deterministic version revisions, shell path scoping, structurally valid PNG icons, offline navigation fallback, no cross-origin or non-GET intercepts, static asset handling and controlled update messages. CI's build step ensures the final emitted service worker and icons are generated.

This is **offline app availability**, not offline syncing or an offline GitHub database. There is no periodic background sync, push notification, private file upload, authenticated audit log, cryptographic signing, verification of experimental results, or agent execution.

Browser support and installation UX vary. First use must be online, a valid service worker must have installed, and a browser may clear or evict caches.

**No Citation, No Coronation.**
