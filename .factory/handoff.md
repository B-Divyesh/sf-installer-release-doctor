# Installer Release Doctor repair handoff — PASS

- Work order: `installer-release-doctor-repair-3`
- Failed verifier commit: `9889d0119cf6de9a89cbd949aae686260d0bea16`
- Repaired candidate base: `0e205e9063285b7750ef41771a3a454d522e8cdd`
- Product repair commit: `9fac506eed9b29a9aa3ac26736f0ab67f0f40c8e`
- Live URL: <https://installer-release-doctor.sociobot.in>

## Repaired release blocker

Unknown URLs previously fell through `navigationFallback` to the SPA shell and returned HTTP 200. The static deployment now has explicit shell rewrites only for `/demo`, `/privacy`, and `/terms`, plus a `responseOverrides.404` rewrite to a shipped `404.html` with status 404. The recovery page has the product header/footer, a skip link, one main landmark and one h1, a visible return action, the existing neo-brutalist tokens, mobile layout, and reduced-motion support.

The service-worker cache advanced from `release-doctor-v4` to `release-doctor-v5`. This prevents a client that cached an old unknown-path shell response from retaining that response after it receives the repair.

## Exact regression coverage

- The built-site deployment-policy regression asserts there is no catch-all navigation fallback, each real SPA route rewrites to `index.html`, the 404 response override is exactly `{"rewrite":"/404.html","statusCode":404}`, and the shipped document contains its h1 and recovery link.
- `npm run test:live` is a dedicated production regression. It requests `/definitely-missing-qa-path`, asserts HTTP 404, HTML content type, the 404 h1, and the recovery link.
- The same live suite runs at desktop and 390 px. It loads the 404 document in a browser, verifies the 404 navigation response, one main/h1, the skip-link keyboard path, no horizontal overflow, and no serious/critical Playwright Axe findings.
- Existing offline/update coverage now asserts cache `release-doctor-v5`.

## Verification evidence

- Clean install: `npm ci` installed 59 packages; npm audit reported 0 vulnerabilities.
- `npm run typecheck`: passed.
- `npm run lint`: passed (`cargo fmt --check`; Clippy with warnings denied).
- `npm test`: passed — 7 Rust tests, 2 Vitest tests, and 42 Playwright runs across 1366×900 and 390×844. This includes all 12 tagged claims, keyboard, Axe, privacy, offline, reduced-motion, and service-worker update coverage.
- `npm run build`: passed; `dist/site` contains JS 15.31 kB (5.75 kB gzip) and CSS 9.85 kB (2.79 kB gzip).
- `cargo build --release --locked`: passed.
- `cargo package --locked --allow-dirty --no-verify`: passed; 136.3 KiB compressed crate.
- A fresh extracted-crate consumer installed with `cargo install --path … --root … --locked`; `release-doctor --version` reported 0.1.1; `demo --format json` produced the expected single blocker and exit 1; a missing manifest produced the documented actionable message and exit 2.
- GitHub CI for the repair commit passed: <https://github.com/B-Divyesh/sf-installer-release-doctor/actions/runs/33188657354>.
- Production deployment used Azure Static Web Apps CLI 2.0.10 to deploy `dist/site` to `sf-installer-release-doctor` production.
- Live response check: `GET /definitely-missing-qa-path` returned `HTTP/2 404`, `content-type: text/html`, and the expected `This package went to the wrong path` h1.
- `npm run test:live`: 4/4 passed (response policy and browser/Axe/keyboard smoke at desktop and 390 px).
- `/opt/fleet/lib/verify-url.sh https://installer-release-doctor.sociobot.in <temp evidence dir>` passed: HTTP 200 at root, title, `lang=en`, h1, main landmark, image alt text, named controls, and zero browser console/page errors.
- Live `/sw.js` starts with `const CACHE = 'release-doctor-v5';`.
- Local and live `assets/index-C5oynRwy.js` SHA-256 both equal `8d05987182487e22970f02f9cb595d5e43a0deb3b1eaa04b8b99fd93ab013905`.

## Known limits and operator actions

- macOS and Windows packages remain unsigned until the owner supplies signing certificates.
- Winget manifests are ready but still need owner submission to `microsoft/winget-pkgs`.
- The policy-pack checkout remains unavailable until the existing Sociobot billing product is enabled. The free checker and license verification are unaffected.
- Native `.deb`, `.rpm`, and `.pkg` internals retain the documented native-validator warning.
