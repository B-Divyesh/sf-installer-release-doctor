# Installer Release Doctor polish 1 handoff — COMPLETE

- Work order: `installer-release-doctor-polish-1`
- Candidate repaired: `ad24207668641c3abdd70e83fac64a9e7ce75d30`
- Review report: `db942c354422addd8f230a372e73a37a5c39f47e`
- Repair implementation: `8f420dec8e231fe27347b2a03229417a6598cdca`
- Live URL: <https://installer-release-doctor.sociobot.in>
- Deployment: Azure Static Web Apps production, `a5159f5a-c6f3-4bba-88ef-aa0a594cef4c`

## What changed

Closed all 34 findings in `.factory/review-1.md`. The first screen now fits at 1366 × 768 and 390 × 844, public copy is literal and consistently uses “artifact” and “blocker,” and `/?demo=1` opens the isolated sample without loading the release API. The demo has a persistent banner, reset, and clear exit.

Every route now sets its own title, description, canonical, Open Graph, and Twitter metadata. The designed 404 has the standard header, complete metadata, a literal heading, and no dead fragment. Route changes preserve the existing focus announcement behavior. The nested demo landmark was corrected and the Axe gate now rejects moderate findings.

Claim regressions now exercise malicious and valid ZIP, tar, and tar.gz files through the public CLI; valid, malformed, and mismatched SPDX; demo storage before and after reset and exit; all public package checksums; and actual public PE/Mach-O signature structures. Windows CI runs the PowerShell installer success and rollback paths. Windows and macOS CI inspect public signatures with native tools.

The original neo-brutalist inspection-bench identity, static deployment class, CLI package, and v0.1.3 public release remain intact.

## Verification

- `npm test`: PASS — 12 Rust tests, 4 Vitest tests, 78 Playwright executions.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; output in `dist/site`.
- `cargo build --release --locked`: PASS.
- `cargo package --locked --allow-dirty --no-verify`: PASS; 137.0 KiB crate.
- Clean-clone claims: all 24 exact commands from `.factory/claims.json` passed independently at implementation commit `8f420dec8e231fe27347b2a03229417a6598cdca`.
- GitHub Actions run [33238729066](https://github.com/B-Divyesh/sf-installer-release-doctor/actions/runs/33238729066): PASS for `test`, `windows-installer`, and `macos-signatures`.
- `/opt/fleet/lib/verify-url.sh`: PASS on the live root; HTTP 200, `lang=en`, one h1, main landmark, complete alt text, named controls, zero console errors.
- `npm run test:live`: PASS, 6/6.
- Live cold first screen: required content bottom is 687.2 px at 1366 × 768 and 611.3 px at 390 × 844.
- Live demo: only same-origin requests, empty cookies/localStorage/sessionStorage/IndexedDB before and after reset, and successful offline reload.
- Live route audit: correct titles/descriptions/canonicals, one h1, one main, no horizontal overflow, and zero Axe violations.
- Live Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; FCP 0.80 s, LCP 1.35 s, CLS 0, TBT 0 ms, 113,210 bytes.
- Deployment hashes: live HTML, JavaScript, and CSS exactly match `dist/site`.

Evidence is under `.factory/qa-artifacts/polish-1/`; the finding-by-finding map is `.factory/polish-1.md`.

## Run and verify

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
cargo build --release --locked
cargo package --locked --allow-dirty --no-verify
npm run test:live
```

## Known gaps and operator action

No review finding remains open. Publisher signing still requires owner certificates, and the checked-in winget 0.1.3 manifest still requires owner submission to `microsoft/winget-pkgs`; both are disclosed product boundaries.
