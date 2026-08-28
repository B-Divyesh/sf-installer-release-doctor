# Independent verification 2 — FAIL

**Candidate:** `2e8fdf10bae5c95031bc5d44cc9a72aeb084f257` (`main`)

**Live URL:** https://installer-release-doctor.sociobot.in

**Verified:** 2026-08-28 UTC from a clean checkout. No product code was changed.

## Decision

**FAIL.** The product’s checker, demo, release assets, and deployment are otherwise in good shape, but the prominently documented Homebrew installation channel is unavailable: `B-Divyesh/homebrew-installer-release-doctor` returns GitHub 404. The installer contract requires the Homebrew tap for this CLI product, and the page/README invite users to run the broken command.

## Mandatory first checks

### Claims

`.factory/claims.json` exists and declares nine claims. Before broader QA, I ran every listed command verbatim from this clean clone. Each command exercised the configured local demo entry point and exited 0:

| Claim | Result | Evidence |
|---|---|---|
| `sample-blocker` | PASS | `npm test -- --grep @claim:sample-blocker` |
| `demo-private` | PASS | `npm test -- --grep @claim:demo-private` |
| `offline-demo` | PASS | `npm test -- --grep @claim:offline-demo` |
| `cli-local` | PASS | `npm test -- --grep @claim:cli-local` |
| `json-output` | PASS | `npm test -- --grep @claim:json-output` |
| `archive-safe` | PASS | `npm test -- --grep @claim:archive-safe` |
| `evidence-validation` | PASS | `npm test -- --grep @claim:evidence-validation` |
| `matrix-annotations` | PASS | `npm test -- --grep @claim:matrix-annotations` |
| `free-core` | PASS | `npm test -- --grep @claim:free-core` |

Captured rerun log: `/tmp/ird-claims-rerun.log` records `CLAIM_FAILURES=0`.

### Cold first-read

The live first screen says **“Check installer releases before upload.”** It says it is **“For CLI authors shipping signed releases across package channels without learning every policy.”** Its visible primary action is **“Try it with sample data”**, immediately followed by **“See one blocked release and its repair.”** The link opens `/demo` in one click. This passes the plain-words and demo-entry gates.

## What passed

- Clean install: `npm ci` completed; npm reported 0 vulnerabilities.
- Static checks: `npm run typecheck` and `npm run lint` passed.
- Full suite: `npm test` passed: 5 Rust tests, 2 Vitest tests, and 32 Playwright runs across desktop and 390 px mobile.
- Production build: `npm run build` passed. Output JS is 15.32 kB (5.76 kB gzip), CSS is 9.85 kB (2.79 kB gzip), both inside budget. The mobile hero source is 28 kB WebP.
- CLI package/consumer: `cargo build --release --locked` and `cargo package --allow-dirty --no-verify` passed (135.9 KiB compressed). A fresh extraction and `cargo install --path … --root … --locked` installed `release-doctor 0.1.1`. Its demo returned the expected exit 1 / one missing-provenance failure; a missing manifest returned actionable exit 2; matrix generation and GitHub annotation output worked.
- Live/browser QA, at 1366×900 and 390×844: `/`, `/demo`, `/privacy`, `/terms`, and the designed 404 each had one `h1`, one `main`, no horizontal overflow, no page/console errors, and no axe serious/critical violations using Playwright axe. All visible links/buttons/inputs were at least 44 px. First Tab reached the visible cobalt 3 px skip-link focus ring. The demo banner, reset, run, repair disclosure, blank-license recovery, invalid-license recovery, and reduced-motion result all worked.
- Privacy/offline: the tagged demo-private test passed from a fresh local context. A fresh live `/demo` context registered `/sw.js`, was controlled by it, used cache `release-doctor-v3`, and reloaded offline successfully. The cold landing makes only same-origin asset requests plus the documented GitHub release metadata request; the sample-demo flow itself does not send sample data off-site.
- Headers: live HTML and `sw.js` are `no-cache`; content-hashed JS/CSS are `public, max-age=31536000, immutable`. CSP restricts scripts/styles/images to self and connects to self, `api.github.com`, and the Sociobot API; HSTS, `nosniff`, strict-origin referrer policy, and disabled camera/microphone/geolocation are present. `/opt/fleet/lib/verify-url.sh` passed with title, `lang=en`, `main`, image-alt, console, and unnamed-button checks.
- Rate limiting: 40 rapid invalid `GET /api/v1/products/installer-release-doctor/verify` requests returned 200 for requests 1–30; request 31 and later returned 429 with `Retry-After` initially 3 seconds (then 2). The endpoint therefore has a functioning observed threshold of 30 in this run.
- Release/deployment identity: freshly built `index-D4htz8dT.js` SHA-256 was `85fb5e4d71c700bb59c6334792b23301953e56b018a5d4a4bd6787ca717d9fcb`, exactly matching the live asset; CSS likewise matched (`33c2c544ad2c92cee1a6cb707d0c38b92d67e5f1cce961fddeaefc662ae023ba`). Candidate `2e8fdf1` is documentation-only after tag `v0.1.1`; the deployed runtime matches its unchanged source/build output.
- Release assets: `v0.1.1` publishes Linux archive, `.deb`, `.rpm`, macOS arm64/x64 archives, unsigned macOS `.pkg`, Windows ZIP, `SHA256SUMS`, and valid `latest.json`. Downloaded Linux archive SHA-256 `e90c6b75d137667d6da7b672ff1aca953f8d318d082f9f5e63b9d1340ffeb6b6` matches `SHA256SUMS`; the live `install.sh` verified and installed it to an isolated directory as v0.1.1. Landing OS selection resolved to real Linux, macOS, and Windows assets.

`npx @axe-core/cli` could not launch a system Chrome in this container, and Lighthouse’s browser process crashed in the container after launch. Those tool-environment failures are not product errors; Playwright’s installed browser completed the axe and accessibility checks above. The prior handoff records the builder’s Lighthouse result, but no fresh Lighthouse score is claimed here.

## Defects

### High — advertised Homebrew installation is unusable

The landing page and README tell users to run:

```sh
brew install B-Divyesh/installer-release-doctor/installer-release-doctor
```

That syntax resolves to tap repository `B-Divyesh/homebrew-installer-release-doctor`. Fresh verification with:

```sh
git ls-remote https://github.com/B-Divyesh/homebrew-installer-release-doctor.git
```

exited 128 with `remote: Repository not found.` The release does contain a formula asset, but it is not in the public tap required for the advertised command. Create/populate that tap (and verify `brew install` in a clean macOS consumer) or remove the broken install channel before acceptance.

### Medium — several visitor-facing safety/privacy claims are not individually declared and sandbox-tested

The claims register covers archive-path containment and local/no-network CLI operation, but no claim entry/test directly proves the landing-page assertions **“It never reads a signing key”** and **“It does not host packages, store credentials, sign code, or replace native channel validation.”** The claims contract requires every reliance claim in landing copy/README to have an observable sandbox test or be removed. Add narrowly scoped claims/tests (for example, trace file/network access for the CLI) or revise the copy.

## Required next step

Create the Homebrew tap at `B-Divyesh/homebrew-installer-release-doctor`, publish the generated formula, and verify the documented `brew install` command from a clean macOS runner. Then register/test the remaining safety/privacy assertions or remove them, and repeat independent verification.
