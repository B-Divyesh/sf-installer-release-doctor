# Independent verification — FAIL

**Candidate:** `134e2c12c151d787344fa129d2d3a0e0a7675c72` (`main`)

**Live URL:** https://installer-release-doctor.sociobot.in

**Verified:** 2026-08-28 UTC, from a clean checkout. No product code was changed.

## Decision

**FAIL.** The local and deployed UX are largely sound, but the checker accepts
empty, unverified signature/SBOM/provenance companions as release-ready. That
does not meet the brief's job of verifying a signed release and its evidence.
It can produce a clean report for a release whose required evidence is merely
an empty file.

## Mandatory first checks

### Claims

`.factory/claims.json` exists and contains eight claims. I ran every listed
command, verbatim, before the broader checks:

| Claim | Result | Evidence |
|---|---|---|
| `sample-blocker` | PASS | `npm test -- --grep @claim:sample-blocker` |
| `demo-private` | PASS | `npm test -- --grep @claim:demo-private` |
| `offline-demo` | PASS | `npm test -- --grep @claim:offline-demo` |
| `cli-local` | PASS | `npm test -- --grep @claim:cli-local` |
| `json-output` | PASS | `npm test -- --grep @claim:json-output` |
| `archive-safe` | PASS | `npm test -- --grep @claim:archive-safe` |
| `matrix-annotations` | PASS | `npm test -- --grep @claim:matrix-annotations` |
| `free-core` | PASS | `npm test -- --grep @claim:free-core` |

A subsequent full `npm test` passed all 11 tests: 3 Rust tests, 2 Vitest
tests, all 8 claims, plus route axe, keyboard reset, and license-return tests.

### Cold first-read test

The live first screen plainly says: “Check installer releases before upload.”
It says it is “For CLI authors shipping signed releases across package channels
without learning every policy.” The first primary action is **Try it with
sample data**, with “See one blocked release and its repair.” It links directly
to `/demo`. This satisfies the first-read and one-click demo gates.

## What passed

- Clean install: `npm ci` completed with zero audit vulnerabilities.
- Exact production build: `npm run build` passed. Output is `dist/site`; JS is
  15.29 kB / 5.74 kB gzip and CSS is 9.66 kB / 2.75 kB gzip.
- Full suite: `npm test` passed (11/11 Playwright checks).
- Static checks: `cargo fmt --check` and
  `cargo clippy --all-targets --all-features -- -D warnings` passed. There is
  no separate npm lint/typecheck script.
- Release build/package: `cargo build --release --locked` and
  `cargo package --allow-dirty --no-verify` passed. I unpacked the crate into
  a fresh temp consumer, ran `cargo install --path ... --root ... --locked`,
  and exercised the installed `release-doctor` v0.1.0 binary. Its JSON demo
  correctly returned exit 1 and `{channels:1, failures:1}`.
- CLI behavioral checks: a complete sample with valid archive/checksum paths
  exited 0; a missing manifest exited 2 with an actionable error; a manifest
  artifact path of `../escape.zip` exited 1 and reported that the path leaves
  the release directory.
- Live demo: at 1366px and 390px, running the check produced “Finished:
  winget is blocked by 1 missing file.” Reset restored the ready state. The
  persistent banner says “Demo — sample data, nothing is saved,” and includes
  Reset demo and Start for real. No network request occurred during demo run.
  No console or page errors and no horizontal overflow were observed.
- Accessibility: live `/`, `/demo`, `/privacy`, `/terms`, and `/missing` each
  have one h1 and one main. Axe found zero serious/critical violations at both
  desktop and 390px. Reduced-motion demo completion is immediate.
- PWA: the live demo registered and controlled `/sw.js`; `registration.update()`
  completed with the active worker at that URL. The required offline-demo claim
  passed from a fresh context.
- Security/privacy: live CSP restricts scripts/styles/images to self and
  `connect-src` to self, `api.github.com`, and `api.sociobot.in`; HSTS,
  `nosniff`, referrer policy, and permissions policy are present. Cold landing
  requests were only the site origin and GitHub's release API. Demo requests
  were same-origin only.
- Rate limiting: 30 rapid sequential invalid license-verification requests
  initially returned 200; a 100-request/20-way burst returned 429 with
  `Retry-After` (0–4 seconds). After the burst, the next probe first returned
  429 at request 3 with `Retry-After: 1`. This is shared-window behavior, but
  it demonstrates a functioning 429/Retry-After limit.
- Live/build identity: the freshly built candidate references
  `index-DPn9jJhu.js` and `index-BtH3iScM.css`; live HTML references those same
  files. The local JS SHA-256 is
  `7f4154a9c159508598dfa4ae3f62edf62a2465984e68f5c670c159aa1c8283f3`.
- Published artifact: release `v0.1.0` Linux archive matched its published
  SHA256SUMS entry, contained `release-doctor`, and its demo behaved correctly.
  The live `install.sh`, run with an isolated `INSTALL_DIR`, verified and
  installed the same binary successfully.
- Mobile Lighthouse run recorded Performance 100 and Accessibility 100;
  LCP 1427 ms, CLS 0, TBT 58 ms, transfer 112,951 bytes. The Lighthouse browser
  emitted a final screenshot-target crash after collecting these metrics, so
  treat the score as indicative rather than a clean Lighthouse process exit.

## Defects

### High — required evidence is only checked for file presence

The candidate reports a fully passing release when the required `.sig`,
`.sbom.json`, and `.intoto.jsonl` files are zero-byte files. In the independent
normal-case run I copied the sample ZIP, checksum file, and manifest, then
created those three companions with `touch`; `release-doctor check --json`
exited **0** with `{channels:1, passed:1, failures:0, warnings:0}`.

`src/main.rs` uses `is_file()` for these companions and does no signature
cryptographic verification, SBOM parsing/schema validation, or provenance
statement validation. The brief requires local checks that verify signatures
and SBOM/provenance for a signed installable release. Presence alone cannot
establish that. This is release-blocking because it can approve invalid or
empty supply-chain evidence before upload.

### Medium — keyboard start bypasses the skip-link/header path

On a cold live load, bootstrap navigation programmatically focuses the h1.
The first Tab therefore focuses “Try it with sample data,” not “Skip to main
content”; header navigation and the skip link are only reachable by reverse
tabbing. The skip link exists and axe sees it as focusable, but the ordinary
keyboard entry path is wrong. Do not move focus to the h1 on the initial page
load; retain the route-change behavior for user navigation.

### Medium — immutable-asset caching policy is missing in deployment

`/assets/index-DPn9jJhu.js` and `/assets/index-BtH3iScM.css` are content-hashed
but live responses are `Cache-Control: public, must-revalidate, max-age=30`,
the same as HTML and service worker. The performance/site contract calls for
long-lived immutable caching for hashed assets. Configure the deployed static
headers to give hashed assets a long immutable lifetime while keeping HTML and
`sw.js` short-lived.

## Deployment/version note

The live site byte-for-byte asset names match a fresh candidate site build.
The published `v0.1.0` tag itself points to predecessor commit
`07aa6bf3d4cc2c65e2f564c93ccd90837f92ee8f`; candidate `134e2c1` only adds the
published Windows checksum to Scoop/winget manifests and updates handoff text,
not runtime source. The released Linux binary was therefore checked for
behavior and checksum rather than incorrectly attributed to the later tag.

## Required next step

Implement real verification appropriate to each declared evidence type (or do
not mark it pass), add fixtures/claim tests for invalid and empty companions,
then repair the initial keyboard focus and immutable-cache headers and repeat
this verification.
