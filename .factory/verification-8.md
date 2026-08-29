# Independent verification 8 — FAIL

- **Candidate:** `715f73f67370906f07cacea6115df884520256ac` (`main`)
- **Live URL:** <https://installer-release-doctor.sociobot.in>
- **Verified:** 2026-08-29 UTC from the supplied clean checkout
- **Result:** **FAIL**
- **Product code changed:** no

## Decision

The live product, v0.1.4 release artifacts, CLI behavior, accessibility, privacy, and performance all passed fresh checks. The candidate still fails acceptance because its available Windows installer integration gate is red. The test installs the current v0.1.4 binary but asserts that it prints v0.1.3. This also means the declared `powershell-installer` claim is not being demonstrated on its required platform.

## Release-blocking defect

### High — the current Windows installer integration gate fails

Candidate CI run [33242913513](https://github.com/B-Divyesh/sf-installer-release-doctor/actions/runs/33242913513) is complete with conclusion `failure`. Its Linux `test` and `macos-signatures` jobs pass. The `windows-installer` job fails specifically at **Run the PowerShell installer success and rollback flows** ([job 99075198060](https://github.com/B-Divyesh/sf-installer-release-doctor/actions/runs/33242913513/job/99075198060)). The same Windows step also fails on the v0.1.4 tag commit's CI run 33242629295.

The cause is deterministic in the candidate:

- `Cargo.toml` and `package.json` declare v0.1.4.
- `tests/windows/installer.integration.ps1:4` still names its fixture `release-doctor-v0.1.3-windows-x86_64.zip`.
- More importantly, line 27 requires output matching `release-doctor 0.1.3`, although it copies and executes the just-built v0.1.4 binary. It therefore throws `The installed binary was not executed.` after a successful current-version execution.
- The Linux command recorded for `@claim:powershell-installer` passes only because its Playwright test inspects strings in the PowerShell script and workflow. It does not run PowerShell. The actual Windows behavior test that the claim cites is red.
- Release run [33242632823](https://github.com/B-Divyesh/sf-installer-release-doctor/actions/runs/33242632823) passed its Windows build/signature job, but that workflow does not run `tests/windows/installer.integration.ps1`.

This violates the requirement that all available integration gates pass and leaves the current PowerShell install, persistent/current-process PATH, execution, bad-checksum rejection, and rollback claim without a passing v0.1.4 platform run.

**Repair:** derive the fixture version and expected `--version` output from `Cargo.toml` or the built binary, rerun CI on the repaired candidate, and require the actual Windows job for the `powershell-installer` claim.

Evidence: [`candidate-ci-runs.json`](qa-artifacts/verification-8/candidate-ci-runs.json), [`candidate-ci-jobs.json`](qa-artifacts/verification-8/candidate-ci-jobs.json).

## Mandatory gates

### First read — PASS

A cold desktop and 390 px visit answers all three questions in the first screen:

- What: **Check installer releases before upload**.
- Who: **For CLI authors checking archives and release evidence before publishing installers.**
- First action: **Try it with sample data**, beside **See one blocked release and its repair.**

The action opens the working isolated demo in one click. The demo banner says **Demo — sample data, nothing is saved** and offers **Reset demo** and **Leave demo**.

### Claims file and listed commands — PASS after clean install

`.factory/claims.json` exists with 24 unique entries. On the untouched checkout, invoking the commands before dependency installation reached and passed the Rust tests, then stopped at `vitest: not found`. After the required clean `npm ci` (59 packages; 0 audit vulnerabilities), I reran every listed command separately. All 24 exited 0:

`sample-blocker`, `demo-private`, `demo-ephemeral`, `offline-demo`, `cli-local`, `json-output`, `exit-codes`, `archive-safe`, `archive-layout`, `evidence-validation`, `channel-policy-checks`, `public-key-only`, `read-only-check`, `homebrew-tap`, `windows-manifests`, `posix-installer`, `powershell-installer`, `release-checksums`, `release-identity`, `unsigned-builds`, `no-checkout`, `matrix-annotations`, `website-storage`, and `free-core`.

The platform gap in `powershell-installer` is the release blocker described above; its listed Linux test is a source-inspection proxy rather than the promised observable Windows sandbox.

Evidence: [`claims-results.tsv`](qa-artifacts/verification-8/claims-results.tsv).

## Repository and CLI verification

- `npm run typecheck`: PASS.
- `npm run lint`: PASS (`cargo fmt --check` and locked Clippy with warnings denied).
- `npm test`: PASS — 11 Rust unit tests, 4 public CLI integration tests, 4 Vitest tests, and 80 Playwright executions.
- `npm run build`: PASS; exact production output exists at `dist/site`.
- `cargo build --release --locked`: PASS.
- `cargo package --locked --no-verify`: PASS; 16 intended files, 81.9 KiB unpacked / 22.2 KiB compressed, with no `node_modules` content.
- Clean consumer: the extracted `.crate` installed with `cargo install --locked --path ... --root ...` and reported `release-doctor 0.1.4`.
- Bundled consumer demo: exit 1 with one missing in-toto companion, valid Ed25519 signature, matching CycloneDX SBOM and checksum, and a specific repair.
- Recovery: adding matching in-toto evidence produced exit 0, one ready channel, zero warnings/failures, and a ready Markdown matrix. A missing manifest, missing artifact directory, malformed YAML, and empty channel list each returned exit 2 with an actionable message.
- Warning boundary: an opaque MSI returned exit 0 with warnings normally and exit 1 under `--strict`.
- Regression boundaries: the clean consumer and published v0.1.4 binary each rejected ZIP entries `..\outside.exe`, `C:\temp\tool.exe`, and `\\server\share\tool.exe` with `archive-safety: fail`. Identifiers `.`, `foo.`, `.foo`, `com..acme`, and `Com.Acme.Cli` failed. `1.0.0-rc.2` to `1.0.0` and the maximum `u64` SemVer major boundary passed.

Evidence: [`consumer-demo.json`](qa-artifacts/verification-8/consumer-demo.json), [`consumer-valid.json`](qa-artifacts/verification-8/consumer-valid.json), [`archive-boundaries.tsv`](qa-artifacts/verification-8/archive-boundaries.tsv), [`invalid-recovery.tsv`](qa-artifacts/verification-8/invalid-recovery.tsv).

## Live site, accessibility, privacy, and PWA

- `npm run test:live`: PASS, 6/6.
- `/opt/fleet/lib/verify-url.sh`: PASS — HTTP 200, title, `lang=en`, one h1, main landmark, complete alt text, labelled buttons, and zero load errors.
- Independent Axe scans found zero violations (not only zero serious/critical) on `/`, `/demo`, `/privacy`, `/terms`, and the designed 404, at 1366 px and 390 px.
- All tested routes have one h1, one main, ordered headings, no horizontal overflow, and no visible interactive target below 44 × 44 CSS px. The deliberate missing route returns HTTP 404.
- Keyboard: first Tab reaches the skip link; the focus ring is a 3 px cobalt outline with a 3 px offset. Navigation into demo focuses its h1. After Enter runs the demo, focus returns to **Run release check**. The repair disclosure is keyboard-native.
- Reduced motion: the result appeared in 68 ms with the reduced-motion media query active. Normal flow uses the one-shot inspection scan.
- Demo privacy: the complete `/demo` flow requested only same-origin HTML/JS/CSS, produced no console/page errors, and had no cookies, localStorage, sessionStorage, or IndexedDB before use or after reset.
- Landing privacy: the only off-origin request was the disclosed GitHub releases API call. Storage contained only `release-cache:v2`; reloading within the hour made no second GitHub request.
- Service worker: `registration.update()` completed, active/controller URLs were `/sw.js`, cache `release-doctor-v9` existed, and an offline `/demo` reload returned 200 with the banner and correct title.
- Normal routes had no console or page errors. Chromium reports the expected failed-document message when deliberately loading the HTTP 404 route.
- Every real landing/site link resolved successfully; the 404 page's fragment-only skip link remains on the intentionally 404 document and its home recovery link resolves 200.

Evidence: [`live-audit.json`](qa-artifacts/verification-8/live-audit.json), [`verify-url/verify.json`](qa-artifacts/verification-8/verify-url/verify.json), screenshots and audit script in [`qa-artifacts/verification-8`](qa-artifacts/verification-8).

## Headers, caching, and performance

- Browser and curl responses include CSP, HSTS, `nosniff`, strict-origin referrer policy, and disabled camera/microphone/geolocation.
- CSP allows only self-hosted resources plus `https://api.github.com`; there are no third-party fonts/scripts and no billing or model endpoint.
- `/` and `sw.js` use `Cache-Control: no-cache`; hashed JS/CSS and images use `public, max-age=31536000, immutable`.
- Production assets: JS 15,164 bytes raw / 5,620 bytes gzip; CSS 10,902 bytes raw / 3,054 bytes gzip; mobile image 27,532 bytes. These are comfortably inside the 200 KB JS, 50 KB CSS, and 300 KB image budgets.
- Fresh mobile Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.5 s, TBT 130 ms, CLS 0, total transfer 111 KiB.

Evidence: [`headers.txt`](qa-artifacts/verification-8/headers.txt), [`lighthouse-summary.json`](qa-artifacts/verification-8/lighthouse-summary.json), [`lighthouse-mobile.json`](qa-artifacts/verification-8/lighthouse-mobile.json).

## Release and deployment identity

- Latest release is v0.1.4 with Linux, Windows, macOS arm64/x64, `.deb`, `.rpm`, unsigned `.pkg`, Homebrew formula, `SHA256SUMS`, and `latest.json`.
- Downloaded Linux archive SHA-256 `70fc2de3fb3f3388845da1f7311f9f964776a86fef8e8e4b7b28bc69ef5e04f2` exactly matches `SHA256SUMS`; its binary reports v0.1.4.
- The live POSIX installer verified and installed that release to an isolated directory, then executed v0.1.4.
- `latest.json` identifies source commit `9fb117f543101d86f725c0f5fffaeabeaa33b834`, exactly the annotated v0.1.4 tag. Candidate changes after the tag are handoff text plus current Scoop/winget manifests, not CLI/site/installer source.
- Fresh local and live hashes match exactly for `index.html`, hashed JS/CSS, `sw.js`, both installers, and `404.html`.

Evidence: [`release-summary.txt`](qa-artifacts/verification-8/release-summary.txt), [`deployment-hashes.tsv`](qa-artifacts/verification-8/deployment-hashes.tsv).

## Not applicable

This is a static site plus local CLI. It exposes no product backend, paid unlock call, checkout, AI call, or sign-in. Server concurrency/persistence, API 429 allowance, and Microsoft Entra authority checks do not apply. The free policy-pack availability copy and CSP correctly expose no billing endpoint.

## Required next step

Fix the stale v0.1.3 expectation in the Windows installer integration, run that flow against v0.1.4 until the candidate CI is green, and then repeat independent verification. Do not accept the release based only on the passing Linux meta-test or the release workflow's Windows build job.
