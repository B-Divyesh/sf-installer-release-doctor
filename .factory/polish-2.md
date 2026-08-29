# Polish round 2 — cumulative finding closure

- Released candidate: `0e750a43058e255e27bbe0b7c510a4fe6d1d2b05`
- Adversarial report commit: `d2f52694841c480c0816484cb4e5a83793820867`
- Repair implementation: `4275735af497b6b0b2b80097e989807879ea9eae`
- Deployment: `b5960aa7-1282-4439-819c-34b3aad4d784`
- Live URL: <https://installer-release-doctor.sociobot.in>

Every finding from both review reports is closed. The round-one fixes were rechecked; round two adds the immediate completed demo and process-isolated claim servers.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Kept the job, audience, sample action, outcome, and three facts within both cold viewports. | `cold first screen keeps the action, outcome, and three facts in view`; `qa-artifacts/polish-2/live/cold-desktop.png`; `live/cold-mobile.png`; live `/`. |
| F-1-2 | The 404 header has no dead fragment and links home. | `every internal link and fragment has a real destination`; `deployment policy caches hashed assets…`; live `/definitely-missing-polish-2` returned 404. |
| F-1-3 | ZIP, tar, and tar.gz traversal variants run through the public CLI. | `@claim:archive-safe`; clean result in `qa-artifacts/polish-2/clean-claim-results.json`. |
| F-1-4 | Good and missing-file ZIP, tar, and tar.gz layouts run through the public CLI. | `@claim:archive-layout`; clean result JSON. |
| F-1-5 | Valid, malformed, and mismatched SPDX fixtures supplement Ed25519, CycloneDX, and in-toto cases. | `@claim:evidence-validation`; clean result JSON. |
| F-1-6 | Storage is checked on arrival, after replay, after reset, and after exit in separate contexts. | `@claim:demo-ephemeral`; `live/audit.json` records empty cookies, local/session storage, and IndexedDB. |
| F-1-7 | The Windows workflow executes installer success, PATH, checksum rejection, and rollback flows. | `@claim:powershell-installer`; `.github/workflows/ci.yml`; CI run `33249111484`. |
| F-1-8 | Copy accurately distinguishes absent publisher signatures from possible macOS ad hoc signatures; native CI inspects both platforms. | `@claim:unsigned-builds`; CI run `33249111484`; live `/#install`. |
| F-1-9 | The claim downloads and hashes all seven portable/native packages and requires the formula and manifests. | `@claim:release-checksums`; clean result JSON. |
| F-1-10 | The audience sentence names CLI authors and the concrete checks without an “every policy” promise. | `cold first screen…`; `live/cold-mobile.png`; `.factory/copy-audit.md`. |
| F-1-11 | The preview heading is the literal “Sample release report.” | route/accessibility test; live `/`; `.factory/copy-audit.md`. |
| F-1-12 | The caption says the checker validates an artifact; it does not claim to create evidence. | `@claim:evidence-validation`; live `/`. |
| F-1-13 | The repair statement is scoped to the bundled sample. | `@claim:sample-blocker`; live `/?demo=1`. |
| F-1-14 | README says the CLI demo checks its manifest, not that it runs every possible check. | `@claim:cli-local`; README demo section. |
| F-1-15 | “Exit codes” replaces the untestable stability claim. | `@claim:exit-codes`; README. |
| F-1-16 | The unsupported minimum-toolchain promise remains removed. | `npm run typecheck`; `npm run lint`; README development section. |
| F-1-17 | The winget text states current publication status and the needed owner action. | `@claim:windows-manifests`; README install section. |
| F-1-18 | Tag handling remains a maintainer instruction rather than an unlisted outcome promise. | `.github/workflows/release.yml`; README release section. |
| F-1-19 | The unlisted hosted-runner claim remains removed. | README release section; CI run `33249111484` supplies current platform evidence. |
| F-1-20 | Individual release outputs have observable tests instead of one unbounded workflow claim. | `@claim:release-checksums`, `release-identity`, `homebrew-tap`, `windows-manifests`. |
| F-1-21 | Copy is scoped to “The sample uses one YAML manifest.” | `@claim:sample-blocker`; live `/`. |
| F-1-22 | The internal credential-ownership sentence remains removed. | README release section; copy audit. |
| F-1-23 | Every SPA route updates title, description, canonical, OG, and Twitter metadata; standalone 404 metadata remains complete. | `routes have one h1, route-specific metadata…`; `live/audit.json`; live `/demo`, `/privacy`, `/terms`, and 404. |
| F-1-24 | The first eyebrow is the literal “LOCAL RELEASE CHECKER · POLICY 2026-08.” | `live/cold-desktop.png`; `.factory/copy-audit.md`. |
| F-1-25 | The boundary heading remains “Checks are read-only.” | `@claim:read-only-check`; live `/`. |
| F-1-26 | Public input terminology remains “artifact.” | README, privacy route, landing page, and copy audit. |
| F-1-27 | Human-facing blocking diagnostics remain “blocker.” | `@claim:exit-codes`; live `/` and `/?demo=1`. |
| F-1-28 | The README explains that Semantic Versions increase on upgrades. | `@claim:channel-policy-checks`; README scope list. |
| F-1-29 | README says the site build “writes files.” | `npm run build`; README development section. |
| F-1-30 | README says Cargo “writes the Rust binary.” | `cargo build --release --locked`; README development section. |
| F-1-31 | The 404 headline remains “Page not found.” | `live/audit.json`; live missing route. |
| F-1-32 | The 404 action remains “Open the checker home page.” | internal-link test; live missing route. |
| F-1-33 | The demo exit action remains “Leave demo.” | `@claim:demo-ephemeral`; `live/demo-mobile-first-screen.png`. |
| F-1-34 | The demo result section is a labelled section, not a nested complementary landmark. | route Axe test; `live/audit.json` reports zero violations. |
| F-2-1 | `?demo=1` now opens with the completed report, blocked winget stamp, missing provenance row, and repair control. The replay action is “Run release check again”; reset restores this completed sample. The blocker is ordered first and the mobile demo layout is tightened without changing its inspection-bench identity. | `@claim:sample-blocker` asserts the result and repair control fit the 390 × 844 first viewport without a second action; `live/demo-mobile-first-screen.png`; live `/?demo=1` (repair control bottom y=831.6). |
| F-2-2 | Every test invocation receives a unique preview port and starts a strict, non-reused server. A manifest-driven runner executes all claim commands consecutively and records results; CI runs it without retries. | `npm run test:claims:sequential`: 24/24 pass in 169.7 s from clean clone `4275735`; `qa-artifacts/polish-2/clean-claim-results.json`; CI run `33249111484`. |

## Final evidence

- `npm test`: 11 Rust unit tests, 4 Rust CLI integration tests, 4 Vitest tests, and 80 Playwright executions passed.
- Clean-clone claim sweep: all 24 exact `.factory/claims.json` commands passed consecutively with no retry.
- `npm run typecheck`, `npm run lint`, `npm run build`, `cargo build --release --locked`, and `cargo package --locked --allow-dirty --no-verify` passed.
- Live audit: both cold first screens fit; the completed 390 px demo fits; traffic is same-origin; demo storage is empty; offline reload works; every route has zero Axe violations.
- Live `/opt/fleet/lib/verify-url.sh`: HTTPS 200, correct title/lang/h1/main/alt/labels, and zero console errors.
- Live Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; FCP 0.80 s, LCP 1.65 s, TBT 0 ms, CLS 0, transfer 113,293 bytes.
- Local/live SHA-256 values match for `index.html`, `sw.js`, both installer scripts, and `404.html`.
