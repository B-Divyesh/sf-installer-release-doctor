# Installer Release Doctor repair handoff — READY

- Work order: `installer-release-doctor-repair-5`
- Failed candidate reviewed: `ea5595502ea8cecf58f3e8c3e237286098808448`
- Verifier report: `.factory/verification-5.md` at report commit `1a865fd22e6f27606af6daeae1aa1846aeb625ff`
- Release: `v0.1.3` from source commit `78852b7fe04dc16a4361a0ceb284ae839ef952af`
- Live URL: <https://installer-release-doctor.sociobot.in>
- Deployment: Azure Static Web Apps production, deployment `d2d99744-a50c-480a-811b-430656a38d01`

## Repairs

1. nFPM now expands `${VERSION}` instead of packaging the literal `{VERSION}`. The release job rejects Debian or RPM packages unless native tools report the requested name, version, and architecture.
2. Version 0.1.3 is consistent across Cargo, npm, the site, service-worker cache, Scoop, and winget. `latest.json` records the exact release source commit.
3. The claims inventory now covers demo persistence, installer checksum and PATH behavior, release/source identity, distribution manifests, documented checks, privacy, unsigned builds, and checkout availability. Every claim has one tagged regression.
4. Long repair filenames wrap inside the result grid. The expanded demo remains 390 CSS px wide at a 390 px viewport.
5. macOS shows explicit Intel and Apple-silicon archives. An Intel user agent receives the x86_64 archive as the primary action; the incompatible ARM package is never selected.
6. `.factory/copy-audit.md` was regenerated from the current landing copy and includes success and recovery download states.

## Verification evidence

- Clean install: `npm ci` installed 59 packages with 0 vulnerabilities.
- Types and lint: `npm run typecheck` and `npm run lint` passed.
- Full test: `npm test` passed 9 Rust, 4 Vitest, and 74 Playwright tests across desktop and 390 px mobile.
- Claims: all 24 commands in `.factory/claims.json` passed independently; tag inventory is one-to-one.
- Build: `npm run build` produced `dist/site`; initial JS is 13.81 kB raw / 5.33 kB gzip and CSS is 10.00 kB raw / 2.83 kB gzip.
- Package/consumer: `cargo build --release --locked` and verified `cargo package --locked --allow-dirty` passed. The 137.1 KiB crate installed in a fresh temporary root and ran `release-doctor 0.1.3`; its demo returned status 1 and valid JSON.
- Native packages: public `dpkg-deb` metadata reports `release-doctor / 0.1.3 / amd64`; `rpm -qp` reports `release-doctor / 0.1.3 / x86_64`.
- Public release: GitHub Actions run `33235333225` passed verify, Linux, macOS, Windows, publish, and Homebrew consumer jobs. All seven downloads matched `SHA256SUMS`. `latest.json` records 0.1.3 and source commit `78852b7`; the Linux binary reports 0.1.3 and contains the repaired help text.
- Public manifests: Scoop and winget 0.1.3 use Windows SHA-256 `36dd8523530b4c424e1a7935bb9d21e80790f1073d1655295f991173b777bfed`, exactly matching `SHA256SUMS`.
- Browser: live routes `/`, `/demo`, `/privacy`, and `/terms` have one h1, no console errors, no serious/critical Axe findings, and no horizontal overflow at 1366 px or 390 px.
- Mobile repair path: after **Show repair**, document width is 390 CSS px in a 390 px viewport.
- Keyboard: the skip link is first, Enter opens the demo, route focus moves to its h1, and no trap was found.
- Privacy: the full live demo made no off-origin request, set no cookies, and wrote no local or session storage.
- Offline/update: the service-worker-controlled demo reloaded offline with HTTP 200; cache `release-doctor-v8` replaced the prior shell cache.
- Response policy: `npm run test:live` passed 6/6. Root and service worker revalidate; hashed assets are immutable; unknown paths return the designed HTTP 404; CSP and security headers are present.
- Deployment identity: deployed JS SHA-256 `a589189925dbb9f0bc4530f363351f71df556cb139349059f53ed56faf0c2cd8` and CSS SHA-256 `4759b531738856e3b93638b4078a52f923e9ba150e87e80218ec69665e2c67d7` match `dist/site` byte-for-byte.
- URL verifier: `/opt/fleet/lib/verify-url.sh` returned HTTP 200, no console errors, `lang=en`, one h1, a main landmark, complete alt text, and named controls in 727 ms.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; FCP 0.87 s, LCP 1.76 s, CLS 0, TBT 46 ms, 112.7 kB transferred.
- Evidence: `.factory/qa-artifacts/repair-5/` contains the first completed repair audit. `.factory/qa-artifacts/repair-5-final/` contains the final v0.1.3 URL, live interaction, accessibility, offline, and Lighthouse evidence.

## Run it

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

- macOS and Windows artifacts remain intentionally unsigned. Signing requires owner certificates.
- The checked-in winget 0.1.3 manifest is ready for owner submission to `microsoft/winget-pkgs`; this worker did not submit it.
- PowerShell was not available in the Linux repair container. The script has exact regression assertions, and the Windows release binary was built on GitHub's Windows runner.

## Independent verification 6 — PASS

**Candidate:** `ad24207668641c3abdd70e83fac64a9e7ce75d30`
**Live URL:** <https://installer-release-doctor.sociobot.in>
**Verified:** 2026-08-29 UTC
**Verdict:** **PASS — no release-blocking defects found.**

The cold first screen plainly says what the tool does, who it serves, and presents **Try it with sample data**; that action opens the isolated sample in one click. All 24 required claims passed from a clean candidate install (`npm test -- --grep @claim:`; 48 tagged Playwright executions). Full local quality gates passed: 9 Rust, 4 Vitest, 74 Playwright, typecheck, lint, production build, and optimized Rust build. A packed crate installed in a clean temporary consumer; valid, blocked, and unreadable CLI paths returned 0, 1, and 2 respectively.

The live HTML/JS/CSS exactly match a fresh candidate build by SHA-256. Desktop and 390 px demo checks found no horizontal overflow, browser errors, serious/critical axe findings, or keyboard trap. The demo sends no off-site request, saves no browser state, resets cleanly, and reloads offline under service-worker cache `release-doctor-v8`; the landing page only uses the disclosed GitHub public-release cache. Live headers, cache policy, CSP, 404, and all crawled links passed. The v0.1.3 Linux archive checksum matched `SHA256SUMS` and `latest.json`, and its binary reports 0.1.3. Detailed evidence is in `.factory/verification-6.md`.

Defects by severity: **none**. There are no server-side product APIs or sign-in, so rate-limit and Entra checks are not applicable. macOS/Windows unsigned-build disclosure and unsubmitted winget metadata remain the known, documented operator actions above.
