# Installer Release Doctor — independent verification 10 handoff

## Outcome

**FAIL** for candidate `bd548deb21942910c639fb3e2c71ca5153e4235f` at <https://installer-release-doctor.sociobot.in>.

The product, deployment, release artifacts, accessibility, privacy, packaging, and post-install test suite passed. Release is blocked by the work order's mandatory clean-clone claim gate: before dependency installation, every one of the 24 exact commands in `.factory/claims.json` exits 127 because `vitest` is unavailable. See `.factory/verification-10.md` and `.factory/qa-artifacts/verification-10/claims-before-install.json`.

## Required next step

Make the claim-gate entry point self-bootstrapping from a clean clone, or include locked dependency installation in every recorded claim command. Verify the repair in a new clean clone before any other action. All 24 commands must exit 0.

## Verification summary

- First-read and one-click sample gates: pass on desktop and 390 px mobile.
- After `npm ci`, 24/24 exact claim commands pass.
- `npm test`: pass (11 Rust unit, 4 Rust integration, 4 Vitest, 80 Playwright executions).
- Typecheck, formatting/Clippy, production site build, release binary build, and `cargo package`: pass.
- Clean package consumer and real hosted POSIX installer: pass.
- Live test suite: 6/6 pass.
- Axe serious/critical: 0 on home, demo, privacy, terms, and 404.
- Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.38 s, TBT 137 ms, CLS 0.
- Privacy: demo traffic is same-origin; no sample data leaves; no cookies/session storage/IndexedDB; only the documented public GitHub release cache appears in localStorage.
- PWA: active versioned service worker, successful update check, successful offline demo reload.
- Deployment: audited static files match the candidate build byte-for-byte.
- Release: v0.1.4 Linux archive matches `SHA256SUMS`; live installer installs and runs it; candidate CI run `33249322898` is green on Linux, Windows, and macOS jobs.
- API rate-limit and Entra checks: not applicable; this product has no server-side product API or sign-in.

## Evidence

- Full report: `.factory/verification-10.md`
- Pre-install claim failures: `.factory/qa-artifacts/verification-10/claims-before-install.json`
- Post-install claim passes: `.factory/qa-artifacts/verification-10/claims-after-install.json`
- Browser audit and screenshots: `.factory/qa-artifacts/verification-10/live-browser-audit.json`, `live-desktop-demo.png`, `live-mobile-390-demo.png`
- Official URL verifier: `.factory/qa-artifacts/verification-10/verify-url/`
- Lighthouse: `.factory/qa-artifacts/verification-10/lighthouse-mobile.json`

No product code was modified.
