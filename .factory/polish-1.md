# Polish round 1 — finding closure

- Candidate: `ad24207668641c3abdd70e83fac64a9e7ce75d30`
- Review report: `db942c354422addd8f230a372e73a37a5c39f47e` (`.factory/review-1.md`)
- Repair implementation: `8f420dec8e231fe27347b2a03229417a6598cdca`
- Deployment: `a5159f5a-c6f3-4bba-88ef-aa0a594cef4c`
- Live URL: <https://installer-release-doctor.sociobot.in>

Every review finding is closed below. There were no earlier review or polish files.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Reduced header and hero height, tightened type and spacing, and restored a one-column mobile grid. The action, outcome, and all three facts now fit both required viewports. | `cold first screen keeps the action, outcome, and three facts in view`; `qa-artifacts/polish-1/live/audit.json`; `live/cold-desktop.png`; `live/cold-mobile.png`; live `/`. |
| F-1-2 | Removed the nonexistent policy-pack fragment from the standalone 404 and matched the application header. Added a fragment-aware internal-link crawl. | `every internal link and fragment has a real destination`; `deployment policy caches hashed assets immutably and revalidates the shell`; live `/does-not-exist` returns 404. |
| F-1-3 | Added malicious ZIP, tar, and tar.gz fixtures that invoke the public `check` command and assert exit 1, an archive-safety blocker, and no outside file. | `@claim:archive-safe`; Rust integration `public_cli_rejects_unsafe_zip_tar_and_tar_gz_entries_without_writing_outside`. |
| F-1-4 | Added good and missing-required-file ZIP, tar, and tar.gz fixtures through the public CLI. | `@claim:archive-layout`; Rust integration `public_cli_checks_layout_for_zip_tar_and_tar_gz`. |
| F-1-5 | Added valid, malformed, and digest-mismatched SPDX documents through the public CLI while retaining Ed25519, CycloneDX, and in-toto cases. | `@claim:evidence-validation`; Rust integration `public_cli_accepts_valid_spdx_and_rejects_malformed_or_mismatched_spdx`. |
| F-1-6 | Checks storage before actions, after run/repair, after reset, and after a separate fresh-context exit. | `@claim:demo-ephemeral`; `live/audit.json` shows empty cookies, local/session storage, and IndexedDB before and after reset. |
| F-1-7 | Added a Windows CI job that runs the shipped PowerShell installer against a local fake release, then checks checksum rejection, rollback, both PATH updates, and installed binary execution. | `@claim:powershell-installer`; Actions run [33238729066](https://github.com/B-Divyesh/sf-installer-release-doctor/actions/runs/33238729066), job `windows-installer`; `ci-jobs.json`. |
| F-1-8 | Inspected public PE and Mach-O signature structures. Corrected the false “unsigned” copy: downloads have no publisher signature, while macOS binaries may be ad hoc signed. Added native Authenticode, codesign, and pkgutil CI checks. | `@claim:unsigned-builds`; Actions run 33238729066 jobs `windows-installer` and `macos-signatures`; live `/#install`. |
| F-1-9 | The release test now requires the `.pkg`, Homebrew formula, both macOS archives, Windows ZIP, Linux archive, `.deb`, and `.rpm`; it downloads every package and verifies its `SHA256SUMS` entry and digest. | `@claim:release-checksums`; `clean-claim-results.tsv`. |
| F-1-10 | Replaced the unbounded policy promise with “For CLI authors checking archives and release evidence before publishing installers.” | `cold first screen…`; `live/cold-desktop.png`; `.factory/copy-audit.md`. |
| F-1-11 | Renamed the preview heading to “Sample release report.” | `routes have one h1…`; live `/`; `.factory/copy-audit.md`. |
| F-1-12 | Replaced evidence-generation copy with the accurate validation caption. | `@claim:evidence-validation`; live `/`; `.factory/copy-audit.md`. |
| F-1-13 | Scoped the statement to the sample’s tested failure and repair. | `@claim:sample-blocker`; live `/`; `.factory/copy-audit.md`. |
| F-1-14 | Replaced “runs all checks” with the observed manifest check and workspace output. | `@claim:cli-local`; README demo section. |
| F-1-15 | Changed “Exit codes are stable” to the literal heading “Exit codes.” | `@claim:exit-codes`; README. |
| F-1-16 | Removed the untested minimum-version assertion and retained direct development commands. | README development section; `npm run typecheck`, `npm run lint`, and `npm test` pass. |
| F-1-17 | Rewrote the winget sentence as current status and required operator action. | README install section. |
| F-1-18 | Recast tag handling as a maintainer instruction, without promising an untested trigger result. | README release section. |
| F-1-19 | Removed the unlisted hosted-runner implementation claim. | README release section. |
| F-1-20 | Removed the unlisted compound workflow claim; release outputs remain covered individually. | `@claim:release-checksums`, `@claim:release-identity`, `@claim:homebrew-tap`, and `@claim:windows-manifests`. |
| F-1-21 | Scoped the statement to “The sample uses one YAML manifest.” | `@claim:sample-blocker`; live `/`. |
| F-1-22 | Removed the internal credential-ownership sentence and retained the contributor instruction. | README release section. |
| F-1-23 | Added per-route description, canonical, OG, and Twitter updates. Added complete standalone 404 metadata and apple-touch icon. | `routes have one h1, route-specific metadata, and no moderate accessibility findings`; `live/audit.json`; live `/demo`, `/privacy`, `/terms`, and `/does-not-exist`. |
| F-1-24 | Replaced the metaphorical eyebrow with “LOCAL RELEASE CHECKER · POLICY 2026-08.” | `live/cold-desktop.png`; `live/cold-mobile.png`; `.factory/copy-audit.md`. |
| F-1-25 | Replaced the metaphorical heading with “Checks are read-only.” | live `/`; `.factory/copy-audit.md`. |
| F-1-26 | Standardized public input terminology on “release artifact” and “artifact.” | README, privacy route, landing page, and `.factory/copy-audit.md`. |
| F-1-27 | Standardized human-facing blocking diagnostics on “blocker”; retained `FAIL`/`failures` only as machine output fields. | live `/`; terminal SVG; README exit-code text; `@claim:exit-codes`. |
| F-1-28 | Replaced “Monotonic upgrade versions” with “Versions increase on every upgrade.” | README scope list; `@claim:channel-policy-checks`. |
| F-1-29 | Replaced “site lands” with “site build writes files.” | README development section; `npm run build`. |
| F-1-30 | Replaced “binary lands” with “Cargo writes the Rust binary.” | README development section; `cargo build --release --locked`. |
| F-1-31 | Replaced the 404 metaphor with “Page not found.” | live `/does-not-exist`; `tests/live/response-policy.spec.ts`. |
| F-1-32 | Replaced the vague 404 action with “Open the checker home page.” | live `/does-not-exist`; `every internal link and fragment has a real destination`. |
| F-1-33 | Replaced “Start for real” with “Leave demo.” | `@claim:demo-ephemeral`; live `/?demo=1`. |
| F-1-34 | Changed the nested complementary `<aside>` to a labelled `<section>` and raised the Axe gate to reject moderate findings. | `routes have one h1, route-specific metadata, and no moderate accessibility findings`; `live/audit.json` reports zero Axe violations. |

## Acceptance evidence

- Clean clone: `/tmp/ird-polish-claims-Z3JM8M/repo`, commit `8f420dec8e231fe27347b2a03229417a6598cdca`.
- Every one of the 24 exact commands in `.factory/claims.json` passed independently; see `qa-artifacts/polish-1/clean-claim-results.tsv`.
- `npm test`: 12 Rust tests, 4 Vitest tests, and 78 Playwright executions passed.
- `npm run typecheck`, `npm run lint`, `npm run build`, `cargo build --release --locked`, and `cargo package --locked --allow-dirty --no-verify` passed.
- Native CI: Actions run 33238729066 passed Ubuntu, Windows, and macOS jobs.
- Live verification: `/opt/fleet/lib/verify-url.sh` returned HTTP 200 with no console errors and complete baseline semantics.
- Live audit: all first-screen elements fit; demo traffic stayed same-origin; demo storage remained empty; offline reload worked; every checked route had zero Axe violations.
- Live Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.35 s, CLS 0, TBT 0 ms, 113,210 bytes transferred.
- Deployment identity: HTML, JavaScript, and CSS hashes match `dist/site`; see `qa-artifacts/polish-1/deployment-hashes.tsv`.
