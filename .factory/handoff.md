# Installer Release Doctor repair handoff — READY

- Work order: `installer-release-doctor-repair-5`
- Failed candidate reviewed: `ea5595502ea8cecf58f3e8c3e237286098808448`
- Verifier report: `.factory/verification-5.md` at report commit `1a865fd22e6f27606af6daeae1aa1846aeb625ff`
- Release: `v0.1.2`
- Live URL: <https://installer-release-doctor.sociobot.in>
- Deployment: Azure Static Web Apps production, deployment `627aea63-baa0-427c-8db1-58b860a678ab`

## Repairs

1. nFPM now expands `${VERSION}` instead of packaging the literal `{VERSION}`. The release job rejects Debian or RPM packages unless native tools report the requested name, version, and architecture.
2. Version 0.1.2 is consistent across Cargo, npm, the site, service-worker cache, Scoop, and winget. `latest.json` records the exact release source commit.
3. The claims inventory now covers demo persistence, installer checksum and PATH behavior, documented check categories, exit codes, release assets, and website storage. Every claim has one tagged regression.
4. Long repair filenames wrap inside the result grid. The expanded demo remains 390 CSS px wide at a 390 px viewport.
5. macOS shows explicit Intel and Apple-silicon archives. An Intel user agent receives the x86_64 archive as the primary action; the incompatible ARM package is never selected.
6. `.factory/copy-audit.md` was regenerated from the current landing copy and includes success and recovery download states.

## Verification evidence

- Clean install: `npm ci` installed 59 packages with 0 vulnerabilities.
- Types and lint: `npm run typecheck` and `npm run lint` passed.
- Full test: `npm test` passed 9 Rust, 4 Vitest, and 68 Playwright tests across desktop and 390 px mobile.
- Claims: all 20 commands in `.factory/claims.json` passed independently; tag inventory is one-to-one.
- Build: `npm run build` produced `dist/site`; initial JS is 13.81 kB raw / 5.33 kB gzip and CSS is 10.00 kB raw / 2.83 kB gzip.
- Package/consumer: `cargo build --release --locked` and `cargo package --locked --allow-dirty --no-verify` passed. The 136.9 KiB crate installed in a fresh temporary root and ran `release-doctor 0.1.2`; its demo returned the expected blocking status and valid JSON.
- Native package reproduction: nFPM 2.43.4 produced both formats. `dpkg-deb` reported `release-doctor / 0.1.2 / amd64`; `rpm -qp` reported `release-doctor / 0.1.2 / x86_64`.
- Public release: GitHub Actions release run `33234277125` passed. All downloaded 0.1.2 assets matched `SHA256SUMS`; public Debian and RPM metadata report 0.1.2. The Linux binary reports 0.1.2 and contains the repaired help text.
- Public manifests: Scoop and winget 0.1.2 use the exact Windows ZIP SHA-256 published in `SHA256SUMS`.
- Browser: live routes `/`, `/demo`, `/privacy`, and `/terms` have one h1, no console errors, no serious/critical Axe findings, and no horizontal overflow at 1366 px or 390 px.
- Mobile repair path: after **Show repair**, document width is 390 CSS px in a 390 px viewport.
- Keyboard: the skip link is first, Enter opens the demo, route focus moves to its h1, and no trap was found.
- Privacy: the full live demo made no off-origin request, set no cookies, and wrote no local or session storage.
- Offline/update: the service-worker-controlled demo reloaded offline; cache `release-doctor-v7` replaced the prior shell cache.
- Response policy: `npm run test:live` passed 6/6. Root and service worker revalidate; hashed assets are immutable; unknown paths return the designed HTTP 404; CSP and security headers are present.
- Deployment identity: deployed JS SHA-256 `cd979c515f87ac46b01a5b61b9d46f681a5a41f699467fc7cef41d4e7c5f7b89` and CSS SHA-256 `4759b531738856e3b93638b4078a52f923e9ba150e87e80218ec69665e2c67d7` match `dist/site` byte-for-byte.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; FCP 0.9 s, LCP 1.7 s, CLS 0, TBT 0 ms.
- Evidence: `.factory/qa-artifacts/repair-5/` contains local/live URL reports, desktop/mobile expanded-demo captures, live audit JSON, and Lighthouse JSON.

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
- The checked-in winget 0.1.2 manifest is ready for owner submission to `microsoft/winget-pkgs`; this worker did not submit it.
- PowerShell was not available in the Linux repair container. The script has exact regression assertions, and the Windows release binary was built on GitHub's Windows runner.
