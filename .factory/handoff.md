# Installer Release Doctor repair handoff — PASS

## Independent verifier outcome (verification 9) — PASS

Independent QA on 2026-08-29 accepted candidate `0e750a43058e255e27bbe0b7c510a4fe6d1d2b05` at <https://installer-release-doctor.sociobot.in>. All 24 required claim commands passed from a clean checkout; `npm test`, typecheck, lint, production build, live Playwright suite, release build, package/install consumer test, direct demo/privacy/accessibility checks, response-header checks, and public Linux checksum check passed. The live static assets exactly match the candidate build. No defects were found. Full evidence: [`.factory/verification-9.md`](verification-9.md).

- **Work order:** `installer-release-doctor-repair-7`
- **Failed candidate:** `715f73f67370906f07cacea6115df884520256ac`
- **Verifier report:** `010999723c93449a1e3194ab98f28d3a583df9ae` (`.factory/verification-8.md`)
- **Repair commits:** `0e576a6` and `9fad097`
- **Version:** `0.1.4`
- **Live URL:** <https://installer-release-doctor.sociobot.in>
- **Completed:** 2026-08-29 UTC

## Release blocker repaired

The verifier's only release blocker was reproduced before editing. The release build reported `release-doctor 0.1.4`, while `tests/windows/installer.integration.ps1` required `release-doctor 0.1.3`; the equivalent assertion exited 1. GitHub Actions run [33242913513](https://github.com/B-Divyesh/sf-installer-release-doctor/actions/runs/33242913513), job `99075198060`, showed the same line-27 exception.

The Windows integration now:

- reads the current version from `cargo metadata`;
- requires the built executable to report the same version;
- names the fixture archive from that version;
- serves matching release metadata instead of a hard-coded tag;
- installs through the shipped `site/public/install.ps1`;
- checks the user PATH, current-process PATH, and executed version;
- corrupts `SHA256SUMS`, retries against the successful destination, and proves the installed executable remains byte-for-byte unchanged and runnable;
- restores both PATH scopes and removes its fixture; and
- emits the verified version and rollback result in the Actions log.

The release workflow now runs this same PowerShell success and rollback integration before inspecting or packaging the Windows executable. The claim regression also rejects a hard-coded semantic version and requires the integration in both CI and release workflows.

## Windows platform evidence

GitHub Actions run [33245057493](https://github.com/B-Divyesh/sf-installer-release-doctor/actions/runs/33245057493) passed on repair commit `9fad097`:

- Linux `test`: PASS, job [99080988050](https://github.com/B-Divyesh/sf-installer-release-doctor/actions/runs/33245057493/job/99080988050).
- macOS `macos-signatures`: PASS, job [99080988127](https://github.com/B-Divyesh/sf-installer-release-doctor/actions/runs/33245057493/job/99080988127).
- Windows `windows-installer`: PASS, job [99080988144](https://github.com/B-Divyesh/sf-installer-release-doctor/actions/runs/33245057493/job/99080988144).
- The Windows log records: `Verified PowerShell installer success for release-doctor 0.1.4 with user and current-process PATH updates.`
- It also records: `Verified checksum rejection preserved the installed release-doctor 0.1.4 binary.`
- The following public executable Authenticode inspection passed in the same job, preserving the unsigned-installer claim coverage.

## Local verification

The repair used a clean `npm ci`: 59 packages installed, 0 audit vulnerabilities.

- `npm run typecheck`: PASS.
- `npm run lint`: PASS (`cargo fmt --check`; locked Clippy with warnings denied).
- `npm test`: PASS — 11 Rust unit tests, 4 public CLI integration tests, 4 Vitest tests, and 80 Playwright executions across desktop and 390px projects.
- All 24 claim-tagged regressions ran in the complete Playwright suite. The repaired `@claim:powershell-installer` test passed in both browser projects.
- `npm run build`: PASS; production output is `dist/site`.
- Production sizes: JavaScript 15,164 bytes raw / 5.60 kB gzip; CSS 10,902 bytes raw / 3.04 kB gzip; mobile hero 27,532 bytes.
- `cargo build --release --locked`: PASS; executable reports `release-doctor 0.1.4`.
- `cargo package --locked --allow-dirty`: PASS; 16 intended files, 81.9 KiB unpacked / 22.2 KiB compressed.
- Clean extracted-crate consumer install: PASS; installed executable reports v0.1.4. Its bundled demo returned the documented blocker status 1 and one failure.
- `npm run test:live`: PASS, 6/6 across desktop and 390px.

The full browser suite covers the one-click demo, blocker and repair output, reset and exit isolation, no demo persistence, same-origin demo requests, release-cache-only landing storage, offline demo reload, service-worker install/update, keyboard entry/reset and focus restoration, reduced motion, route metadata, internal links, responsive layout, target sizes, and Axe scans for every route.

## Deployment and live verification

`npm run build:site` was deployed with the static work-order path:

```sh
/opt/fleet/lib/deploy-static.sh installer-release-doctor /work/repo/dist/site
```

Azure Static Web Apps deployment `b105662f-6cc8-402e-8166-15fc04c7bceb` completed successfully. The custom domain returned HTTPS 200.

- `/opt/fleet/lib/verify-url.sh`: PASS — title, `lang=en`, one h1, main landmark, complete alt text, labelled buttons, desktop and 390px screenshots, and zero console/page errors. Evidence: `.factory/qa-artifacts/repair-7-live/verify-url`.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.88 s, LCP 1.45 s, TBT 29 ms, CLS 0, transfer 113,183 bytes. Evidence: `.factory/qa-artifacts/repair-7-live/lighthouse-mobile.json`.
- Live response policy: HTTPS 200; CSP, HSTS, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation denial present. A deliberate missing route returned HTTP 404 with the designed recovery document.
- Local and live SHA-256 values match for `index.html`, hashed JS/CSS, `sw.js`, `install.sh`, `install.ps1`, and `404.html`.
- The live POSIX installer downloaded the public v0.1.4 release, verified its checksum, installed into an isolated directory, and executed `release-doctor 0.1.4`.
- The latest public release remains v0.1.4 with Linux, Windows, both macOS architectures, `.deb`, `.rpm`, unsigned `.pkg`, formula, `SHA256SUMS`, and `latest.json` assets.

The existing v0.1.4 binaries were not republished: they were already correct and independently verified. Republishing from an untagged repair commit would break the tested tag/source identity. The repaired current-version Windows flow instead ran against the newly built v0.1.4 executable in the passing CI job, and the release workflow now gates future packaging with the same test.

## Privacy, accessibility, and scope

- No product runtime behavior, stored-data behavior, visual design, brief, CLI policy logic, or published executable changed.
- No analytics, third-party script/font, billing request, AI request, sign-in, or backend was added.
- Keyboard, screen-reader semantics, contrast, touch targets, reduced motion, and 200% responsive foundations remain covered by the passing browser suite.
- The product remains a Rust single-binary CLI with a static Vite site and the original `cli-installers` deployment class.

## Known gaps and operator action

No release-blocking gaps remain. Windows and macOS artifacts remain intentionally unsigned, as disclosed. No operator action is required for this repair.
