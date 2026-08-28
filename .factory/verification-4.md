# Independent verification 4 — FAIL

- **Candidate commit:** `c5e0ecd83dea8bd49f89adfad6918aa11b81e3da`
- **Branch / URL:** `main` / <https://installer-release-doctor.sociobot.in>
- **Verifier date:** 2026-08-28 UTC
- **Verdict:** **FAIL**

The free CLI, web demo, release assets, and the repaired production 404 behavior are working. The candidate is nevertheless not releasable because it advertises a $49 policy pack with a **Buy the policy pack** action whose live checkout endpoint returns HTTP 404. This is a dead paid-product link and does not meet the paid-unlock or no-dead-links contract.

## Mandatory claims gate — PASS

`.factory/claims.json` exists and lists 12 claims. From this clean checkout, after `npm ci` (59 packages; audit: 0 vulnerabilities), I ran every recorded `npm test -- --grep @claim:<id>` command sequentially against the shipped demo entry point. All completed successfully. A subsequent complete `npm test` also passed all 42 Playwright runs, including every tag below.

| Claim ID | Result | Observable evidence |
| --- | --- | --- |
| `sample-blocker` | PASS | `/demo` names missing provenance and exposes its repair. |
| `demo-private` | PASS | Demo flow has no off-site request. |
| `offline-demo` | PASS | Demo reloads after service-worker caching while offline. |
| `cli-local` | PASS | CLI demo runs with HTTP/HTTPS proxies blocked. |
| `json-output` | PASS | Demo JSON has report summary and policy version. |
| `archive-safe` | PASS | Parent-directory archive fixture is rejected. |
| `evidence-validation` | PASS | Valid evidence passes; empty/digest-mismatched evidence blocks. |
| `public-key-only` | PASS | Public-key-only signature fixture verifies. |
| `read-only-check` | PASS | Input snapshots remain byte-identical. |
| `homebrew-tap` | PASS | Public tap formula and both macOS archive checksums resolve. |
| `matrix-annotations` | PASS | CLI emits GitHub annotation and Markdown matrix. |
| `free-core` | PASS | Demo displays free core and repository is MIT licensed. |

## First-read test — PASS

Cold load of the live home page answered all three required questions in its first screen:

- **What it does:** “Check installer releases before upload.”
- **For whom:** “For CLI authors shipping signed releases across package channels …”
- **What to click first:** the visible one-click **Try it with sample data** link, with the adjacent explanation “See one blocked release and its repair.”

That link opens `/demo`, shows the persistent “Demo — sample data, nothing is saved” banner, Reset demo, Start for real, the Acme CLI sample, its missing `*.intoto.jsonl` provenance companion, and the specific repair.

## Clean-checkout and CLI verification — PASS

- `npm run typecheck`: passed.
- `npm run lint`: passed (`cargo fmt --check`; Clippy with warnings denied).
- `npm test`: passed — 7 Rust tests, 2 Vitest tests, and 42 Playwright tests. `test-results/.last-run.json` recorded `{"status":"passed","failedTests":[]}`.
- `npm run build`: passed. `dist/site` contains 15.31 kB JS (5.75 kB gzip) and 9.85 kB CSS (2.79 kB gzip).
- `cargo build --release --locked`: passed.
- `cargo package --locked --allow-dirty --no-verify`: passed; `target/package/installer-release-doctor-0.1.1.crate` is 137 KiB.
- Clean consumer: unpacked the crate, `cargo install --path … --root … --locked` succeeded, and installed `release-doctor --version` returned `0.1.1`. `release-doctor demo --json` exited 1 as designed and reported one provenance failure; `check --manifest <missing>` exited 2 with the actionable manifest-not-found message.
- Boundary/recovery checks: the sample’s intended blocker is actionable; blank license submission says “Paste a license token first”; an invalid token says “License no longer active. Check the token or buy a new license.” with no page or console error.

## Live deployment, artifacts, and policy checks — PASS except checkout

- Local candidate and deployed `assets/index-C5oynRwy.js` SHA-256 both equal `8d05987182487e22970f02f9cb595d5e43a0deb3b1eaa04b8b99fd93ab013905`; local and live CSS SHA-256 both equal `33c2c544ad2c92cee1a6cb707d0c38b92d67e5f1cce961fddeaefc662ae023ba`. The live UI therefore matches this candidate’s built client.
- `npm run test:live`: 4/4 passed, covering deployed HTTP 404 behavior plus desktop and 390 px browser/Axe/keyboard checks.
- `GET /definitely-missing-qa-path` returns `404 text/html` and the designed recovery page; the old SPA-200 deployment defect is not present.
- Latest release is `v0.1.1` and has Linux tarball, `.deb`, `.rpm`, macOS arm64/x86_64 archives plus pkg, Windows portable ZIP, `SHA256SUMS`, and `latest.json`. Downloaded `release-doctor-v0.1.1-linux-x86_64.tar.gz`; `sha256sum -c SHA256SUMS --ignore-missing` returned `OK`; extracted binary reports `release-doctor 0.1.1`.
- Live `install.sh`, run with an isolated `INSTALL_DIR`, downloaded the release, verified checksum before install, and installed a working v0.1.1 binary.
- `latest.json` is valid versioned JSON with per-asset release URLs and SHA-256 values. The detected Linux button points to the live Linux tarball.
- The release API uses `https://api.github.com` (not the GitHub redirect endpoint) and browser observation on the normal landing flow found only same-origin plus `https://api.github.com`; the demo flow itself made no off-site request. No analytics/tracking requests were observed.
- Response policy: HSTS, `nosniff`, strict referrer policy, camera/microphone/geolocation Permissions-Policy, and a CSP permitting only self plus the declared GitHub and Sociobot APIs are present. Shell is `no-cache`, hashed assets are `public, max-age=31536000, immutable`, and `/sw.js` is `no-cache`.
- Rate limiting: a 40-request parallel burst to `GET https://api.sociobot.in/api/v1/products/installer-release-doctor/verify?license=qa-verification-invalid-token` resulted in **30×200 then 10×429**. Every 429 included `Retry-After: 3`.

## Accessibility, mobile, and performance — PASS

- `/opt/fleet/lib/verify-url.sh` passed: root 200; title; `lang=en`; exactly one h1; main landmark; image alt text; named controls; zero console/page errors.
- Fresh live browser checks of `/`, `/demo`, `/privacy`, and `/terms` at 1366×900 and 390×844 had no horizontal overflow, no console/page errors, and no Axe serious/critical violations. Keyboard Tab reaches the skip link; Enter reaches the sample demo; Reset demo works. Reduced motion produced the final check state in 172 ms.
- Manual visual review of desktop and 390 px screenshots found readable stacking, no clipping, designed focus/controls, and persistent demo controls. Mobile touch-target assertions are part of the passing suite.
- Lighthouse mobile (live): **99 performance / 100 accessibility**, LCP 1.7 s, CLS 0, total transferred 111 KiB, max potential FID 120 ms.

## Defects

### High — release blocking

1. **The paid policy-pack checkout is dead.** The live `$49` section advertises “Versioned compliance policy pack”, “Custom rule templates”, and “Priority setup support”, but `GET https://api.sociobot.in/api/v1/products/installer-release-doctor/checkout` returns **HTTP 404** with `{"error":"enabled factory product","status":404}`. The visible **Buy the policy pack** link points directly to this endpoint. This violates the paid-unlock requirement and the no-dead-links requirement. Either enable/register the Sociobot product before release or remove the paid offer and its claims until it exists.

### Medium

2. **The one-line installers do not ensure the installed directory is on PATH.** `install.sh` copies to `$HOME/.local/bin` and `install.ps1` copies to `$env:LOCALAPPDATA\\Programs\\release-doctor`, then only print “Add … to PATH if the command is not found.” On a fresh Windows profile in particular, that target is not normally on PATH. The installer contract requires a one-step installer that verifies before placing the binary on PATH. Add an explicit, safe PATH update or choose/document a guaranteed PATH destination with a tested post-install invocation.

## Non-blocking known release facts

- macOS and Windows artifacts are explicitly labelled unsigned; this is disclosed on the landing page and permitted pending owner signing certificates.
- The local checker remains useful without the paid offer; this does not cure a visible paid CTA that returns 404.
