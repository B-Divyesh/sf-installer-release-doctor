# Installer Release Doctor repair handoff — PASS

- Work order: `installer-release-doctor-repair-4`
- Failed verifier candidate: `c5e0ecd83dea8bd49f89adfad6918aa11b81e3da`
- Verifier report: [`.factory/verification-4.md`](verification-4.md)
- Repair commit: `ed7f5c37c3f002ac001e4ad1ccacee886249204d`
- Live URL: <https://installer-release-doctor.sociobot.in>
- Deployment: Azure Static Web Apps production deployment using `swa` 2.0.10.

## Repaired release blockers

1. The paid policy-pack checkout was unregistered and returned HTTP 404. The product no longer advertises the $49 offer, its three paid-feature claims, license restoration, or the Sociobot checkout link. The availability section plainly says that company policy packs are not offered until checkout is available. The privacy and terms pages, README, CSP, and browser code no longer refer to the inactive billing flow. The free local checker and every shipped release-check behavior are unchanged.
2. The POSIX installer previously placed the binary in `~/.local/bin` without making a fresh shell find it. It now prepends the destination for its verification run and, for the default destination, safely adds an idempotent PATH block to the appropriate login profile (`.profile`, `.bash_profile`, or `.zprofile`). It runs `release-doctor --version` after checksum verification and installation. The PowerShell installer now persists its destination in the user PATH, updates the current session PATH, and executes `release-doctor.exe --version` before success.

## Exact regression coverage

- Local browser regression: the rebuilt home page has no **Buy the policy pack** link, no `api.sociobot.in` link, no `$49` offer, no billing endpoint in client source, and no billing origin in the deployment CSP.
- Live browser regression: `npm run test:live` opens the deployed home page at desktop and 390 px, asserts the same absence of paid checkout/price, and records zero requests to `https://api.sociobot.in`.
- Installer regression: a Playwright test creates a checksum-verified fixture release, runs `install.sh` with a clean HOME and PATH, confirms the profile block, starts a fresh login shell, and runs `release-doctor --version` by name. A companion assertion verifies that `install.ps1` persists User PATH, updates the current PATH, and runs its installed executable.
- Offline/update regression advances the service worker cache to `release-doctor-v6`, preventing older cached client code from keeping the removed paid flow.

## Verification evidence

- Clean install: `npm ci` installed 59 packages; `npm audit` reported 0 vulnerabilities.
- `npm run typecheck`: passed.
- `npm run lint`: passed (`cargo fmt --check`; Clippy with warnings denied).
- `npm test`: passed — 7 Rust tests, 2 Vitest tests, and 46 Playwright desktop/390px runs, including all 12 recorded claims, demo privacy, offline reload/update, keyboard, Axe serious/critical checks, and the new installer and checkout regressions.
- `npm run build`: passed. `dist/site` contains 12.90 kB JS (4.97 kB gzip) and 9.85 kB CSS (2.79 kB gzip).
- `cargo build --release --locked`: passed.
- `cargo package --locked --allow-dirty --no-verify`: passed; `target/package/installer-release-doctor-0.1.1.crate` is 136.4 KiB.
- Fresh consumer: unpacked the crate and ran `cargo install --path … --root … --locked`; installed `release-doctor --version` returned `0.1.1`. `demo --format json` reported exactly one expected failure; a missing manifest returned the documented actionable error with exit code 2.
- Production: deployed `dist/site` to `sf-installer-release-doctor` production. The deployed `assets/index-hmDIqeBI.js` SHA-256 and local build SHA-256 are both `cb97b49d1af54cffe0976c7a5eba943d778b056e0d1ea64da56b91febe0def50`.
- `npm run test:live`: passed 6/6, covering response-policy 404 status, desktop and 390px keyboard/Axe checks, and the deployed checkout-removal regression.
- `/opt/fleet/lib/verify-url.sh https://installer-release-doctor.sociobot.in`: passed — HTTP 200, correct title and `lang=en`, one h1, main landmark, image alt text, named controls, and zero console/page errors (1,206 ms load measurement).
- Lighthouse mobile on the deployed page: **100 performance / 100 accessibility**, 1.4 s LCP, 0 CLS, and 110 KiB transferred.
- Live `install.sh` and `install.ps1` were fetched after deployment and contain the PATH persistence and post-install version checks. The live CSP permits only `self` and `https://api.github.com` for connections.

## Known limits and next steps

- macOS and Windows packages remain unsigned until the owner supplies signing certificates; the site discloses this.
- Winget manifests are ready but still require owner submission to `microsoft/winget-pkgs`.
- Do not reintroduce a paid policy pack until the Sociobot product is registered and its checkout endpoint redirects successfully. At that point, restore the paid-unlock flow with a live checkout regression test.
