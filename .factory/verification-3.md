# Independent verification 3 — FAIL

- Candidate: `0e205e9063285b7750ef41771a3a454d522e8cdd`
- Repository / branch: `B-Divyesh/sf-installer-release-doctor`, `main`
- Live URL: <https://installer-release-doctor.sociobot.in>
- Verification date: 2026-08-28 UTC
- Result: **FAIL**

## Release-blocking finding

### P1 — Missing URLs return HTTP 200 instead of a real 404

`GET https://installer-release-doctor.sociobot.in/definitely-missing-qa-path`
returned `HTTP/2 200`, `content-type: text/html`, and the SPA then rendered its attractive “wrong path” screen. `site/public/staticwebapp.config.json` has a navigation fallback but no `responseOverrides` 404 mapping, and the deployment has no 404 document. This fails the required real 404 route/response policy and makes a nonexistent resource look successful to crawlers, monitors, and API clients.

Repair: add a deployed 404 document and Static Web Apps `responseOverrides` mapping that serves it with status 404; retain the in-app recovery link. Add a live-header regression asserting an unknown path is 404.

## Required claim gate

`.factory/claims.json` exists and declares 12 claims. The first literal attempt from the pristine checkout stopped at `vitest: not found`, which is expected before the repository’s declared `npm ci` install step. After that clean install (59 packages, 0 npm audit vulnerabilities), every recorded command was run verbatim and passed in both the desktop and `mobile-390` projects:

| Claim ID | Result |
|---|---|
| `sample-blocker` | pass |
| `demo-private` | pass |
| `offline-demo` | pass |
| `cli-local` | pass |
| `json-output` | pass |
| `archive-safe` | pass |
| `evidence-validation` | pass |
| `public-key-only` | pass |
| `read-only-check` | pass |
| `homebrew-tap` | pass |
| `matrix-annotations` | pass |
| `free-core` | pass |

## First-read and end-to-end evidence

A fresh desktop context loaded the live landing page cold. The first screen plainly says “Check installer releases before upload,” names “CLI authors shipping signed releases,” and exposes the one-click **Try it with sample data** action with the outcome “See one blocked release and its repair.” It passes the cold first-read/demo requirement.

On live `/demo`, the persistent “Demo — sample data, nothing is saved” banner, Reset demo, and Start for real controls were present. Running the check reported the missing provenance companion; expanding repair worked; Reset restored the initial state. After service-worker control, `/demo` reloaded offline with no console or page errors. Demo route requests were same-origin only.

The released shell installer downloaded the Linux archive, checked SHA-256, installed into an isolated directory, and the installed binary printed `release-doctor 0.1.1`. The expected and downloaded archive SHA-256 were both `e90c6b75d137667d6da7b672ff1aca953f8d318d082f9f5e63b9d1340ffeb6b6`.

## Local build, package, and CLI evidence

All passed from this candidate after `npm ci`:

- `npm run typecheck`
- `npm run lint` (format and Clippy with warnings denied)
- `npm test` — 7 Rust tests, 2 Vitest tests, 42 Playwright tests
- `npm run build` — `dist/site` produced; JS 15.31 kB (5.75 kB gzip), CSS 9.85 kB (2.79 kB gzip)
- `cargo build --release --locked`
- `cargo package --locked --allow-dirty --no-verify` — 136.3 KiB compressed crate

The packed crate was extracted into a fresh temporary consumer and installed with `cargo install --path … --root … --locked`. Its public binary reported v0.1.1; `demo --json` parsed with one expected provenance failure and exit 1; a nonexistent manifest returned the documented actionable error and exit 2.

## Deployment identity, security, privacy, and quality

- Local candidate `index-C5oynRwy.js` SHA-256 and live asset SHA-256 both equal `8d05987182487e22970f02f9cb595d5e43a0deb3b1eaa04b8b99fd93ab013905`. CSS also matched exactly. `origin/main` resolves to the tested candidate.
- Root uses `no-cache`; hashed JS uses `public, max-age=31536000, immutable`; service worker uses `no-cache`. Live responses include CSP, HSTS, `nosniff`, strict referrer policy, and a restrictive permissions policy.
- Independent Playwright + `@axe-core/playwright` checks of `/`, `/demo`, `/privacy`, `/terms`, and an unknown route at desktop and 390 px found no serious or critical violations, no horizontal overflow, one h1 and one main each, and no console/page errors. The first keyboard focus is the skip link. Reduced-motion demo completes without the scan delay.
- Cold landing requests were self assets plus the disclosed GitHub release metadata request; the demo made no off-origin request. No authentication flow is present. License verification is the only Sociobot request and is user initiated.
- A fresh burst to `https://api.sociobot.in/api/v1/products/installer-release-doctor/verify?license=qa-invalid-license` received 200 for requests 1–30 and `429 Retry-After: 4` at request 31.

## Other notes

- The page is visually product-specific and mobile responsive. The visual thesis, original-asset provenance, MIT license, README, privacy, terms, and demo contract are present.
- `npx @axe-core/cli` could not locate a system Chrome in this container. The independent Playwright axe run above uses the provisioned browser and completed successfully. Lighthouse likewise could not connect to that browser when invoked through the CLI; the build-size budgets and browser checks above were measured directly.
- The v0.1.1 release tag predates some candidate documentation/workflow commits, but the deployed static JS and CSS match this candidate byte-for-byte. The CLI runtime changes since the tag are test coverage and copy rather than a changed release version.
