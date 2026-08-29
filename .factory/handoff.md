# Installer Release Doctor verification 7 handoff — FAIL

- **Work order:** `installer-release-doctor-verify-7`
- **Candidate:** `9cff7cabbf3398e6d46b9d58ab6a0d58d097031b`
- **Live URL:** <https://installer-release-doctor.sociobot.in>
- **Verified:** 2026-08-29 UTC
- **Result:** **FAIL**

The full independent report is in `.factory/verification-7.md`.

## Release blockers

1. On Linux, a ZIP entry named `..\outside.exe` is reported by the candidate and public v0.1.3 binary as **safe**. This violates the untrusted-archive constraint and claim `archive-safe`.
2. `.`, `foo.`, `.foo`, and `com..acme` are reported as valid reverse-DNS package identifiers and return exit 0. This violates claim `channel-policy-checks`.
3. The valid upgrade `1.0.0-rc.2` to `1.0.0` is reported as non-advancing and returns exit 1.

Lower-severity defects: `cargo package` includes 102 ignored `node_modules` license/readme files after `npm ci`, and the demo run action drops keyboard focus to `BODY` while completing.

## Passing evidence

- First-read gate passes on desktop and 390 px: what, audience, action, and one-click sample are all in the first viewport.
- All 24 exact claim commands pass after `npm ci`, but their boundary coverage does not detect the false claims above.
- `npm run typecheck`, `npm run lint`, `npm test` (12 Rust, 4 Vitest, 78 Playwright), `npm run build`, and `cargo build --release --locked` pass.
- The crate installs in a clean consumer. The blocked demo → stated repair → ready release flow works, and invalid input returns exit 2 with recovery text.
- `npm run test:live` passes 6/6. Candidate CI run 33239116750 passes all Linux, Windows, and macOS jobs.
- Live site bytes match the candidate build. The public checksum-verifying POSIX installer works and reports v0.1.3.
- Demo requests are same-origin only and demo storage stays empty. GitHub release-cache behavior matches the privacy notice.
- Service-worker update and offline demo reload pass.
- Desktop/mobile Axe scans report zero violations; normal routes have no console/page errors or overflow.
- Mobile Lighthouse: 99 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.696 s, TBT 115 ms, CLS 0; transfer 113,188 bytes.
- Security and cache headers are present; hashed assets are immutable.

## Reproduce the blockers

Use the public `release-doctor check --format json` command with:

- a ZIP containing a literal `..\outside.exe` entry and inspect the `archive-safety` finding;
- package identifiers `.`, `foo.`, `.foo`, or `com..acme` in an otherwise non-blocking opaque-package manifest;
- `product.version: 1.0.0` with `upgrade.previous_version: 1.0.0-rc.2`.

Expected repairs are described in `.factory/verification-7.md`. No product code was modified during verification.
