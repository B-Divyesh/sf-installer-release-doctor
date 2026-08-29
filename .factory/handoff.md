# Installer Release Doctor verification handoff — FAIL

- **Work order:** `installer-release-doctor-verify-8`
- **Candidate:** `715f73f67370906f07cacea6115df884520256ac`
- **Live URL:** <https://installer-release-doctor.sociobot.in>
- **Verified:** 2026-08-29 UTC
- **Verdict:** **FAIL**

## Release blocker

The current candidate CI run [33242913513](https://github.com/B-Divyesh/sf-installer-release-doctor/actions/runs/33242913513) fails its `windows-installer` job at **Run the PowerShell installer success and rollback flows**. The test copies and runs the current v0.1.4 binary, but `tests/windows/installer.integration.ps1` still requires output matching `release-doctor 0.1.3` at line 27. The same Windows step failed on the v0.1.4 tag commit's CI run.

The listed Linux test for claim `powershell-installer` only inspects source strings and therefore passes without exercising PowerShell. The release workflow's successful Windows job builds and inspects the executable but does not run the installer integration. Acceptance requires the available integration gate and the platform claim to pass on Windows.

Fix the stale version expectation by deriving it from the source/binary, rerun CI until `windows-installer` is green, then request independent verification again.

## What was verified

- All 24 `.factory/claims.json` commands passed separately after clean `npm ci` (59 packages, 0 vulnerabilities). The untouched pre-install invocation predictably stopped at missing `vitest`; the installed clean-clone rerun is the recorded result.
- The cold first screen clearly states the job, audience, and one-click **Try it with sample data** action.
- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `cargo build --release --locked` passed. The full suite contained 15 Rust, 4 Vitest, and 80 Playwright executions.
- `cargo package --locked --no-verify` produced a clean 16-file crate. A fresh extracted consumer installed and ran v0.1.4.
- CLI demo/blocker, repaired success, JSON, matrix, exit 0/1/2, malformed/empty/missing input, opaque package strict mode, public-key evidence, and read-only behavior were exercised.
- Independent boundary probes against both the clean consumer and published v0.1.4 binary rejected Windows parent, drive-qualified, and UNC archive paths. Malformed reverse-DNS identifiers failed; prerelease-to-final and maximum-size SemVer upgrades passed.
- Live desktop and 390 px routes, keyboard focus, focus restoration, reset, repair disclosure, reduced motion, privacy/storage, error state, service-worker update, and offline reload passed.
- Axe reported zero violations on home, demo, privacy, terms, and 404 at desktop and mobile sizes. `verify-url.sh` and `npm run test:live` passed.
- Browser request logs showed same-origin-only demo traffic. The landing page contacted only the documented GitHub releases API and stored only its one-hour public release cache.
- Security/caching headers are correct. Fresh mobile Lighthouse scored 99/100/100/100 with LCP 1.5 s, TBT 130 ms, CLS 0, and 111 KiB transfer.
- Live HTML, JS, CSS, service worker, installers, and 404 bytes exactly match the candidate build.
- The v0.1.4 Linux archive matched `SHA256SUMS`; the isolated live POSIX installer installed and ran v0.1.4. The release publishes all required platform/native assets and metadata.

## Evidence and report

- Full report: [`.factory/verification-8.md`](verification-8.md)
- Persistent evidence: [`.factory/qa-artifacts/verification-8`](qa-artifacts/verification-8)
- Claim results: [`claims-results.tsv`](qa-artifacts/verification-8/claims-results.tsv)
- Live browser audit: [`live-audit.json`](qa-artifacts/verification-8/live-audit.json)
- Candidate CI evidence: [`candidate-ci-jobs.json`](qa-artifacts/verification-8/candidate-ci-jobs.json)
- Lighthouse: [`lighthouse-summary.json`](qa-artifacts/verification-8/lighthouse-summary.json)

## Scope and known gaps

- No product code was modified.
- This static site/local CLI has no backend, product-unlock call, checkout, sign-in, or AI endpoint; server rate limiting, persistence/concurrency, and Entra checks are not applicable.
- Native Windows execution was assessed through the repository's public GitHub Actions job because this Linux verifier has no PowerShell runtime. That job is the blocker above.
