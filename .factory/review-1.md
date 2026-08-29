# Adversarial first-read review 1 — Installer Release Doctor

**Verdict: FAIL**

Reviewed 2026-08-29 UTC against <https://installer-release-doctor.sociobot.in> and repository commit `e914afb1fcf67e9eb4f74f2383102c25e20bef14`. A pass requires zero findings and no untested claim. This review found 9 blocking, 14 major, and 11 minor findings.

## 1. Cold first screen

Fresh Chromium contexts were used with no cookies or storage.

| Viewport | What does it do? | For whom? | What should I click first? | Result |
|---|---|---|---|---|
| 390 × 844 | It checks installer releases before upload. | CLI authors shipping signed releases to package channels. | **Try it with sample data**. | Understandable, but only one of the three promised facts fits before scrolling. |
| 1366 × 768 | It checks installer releases before upload. | CLI authors shipping signed releases to package channels. | Cannot tell. The primary action is below the fold; only the equally weighted header links **Demo**, **Install**, and **Privacy** are visible. | **BLOCKING** (`F-1-1`). |

Exact layout evidence: on desktop, **Try it with sample data** starts at `y=809.6`; all three facts start below `y=894.4`. On mobile, the action is visible at `y=668.0`, but **No account or network required** and **Core checker is free** start at `y=852.9` and `y=889.7`. The viewport ends at 768 and 844 respectively.

## 2. Copy audit

Counts use visible words; punctuation marks and separator glyphs are not words, while hyphenated terms count as one. Commands and JSON examples are excluded because they are code, not sentences. Headings, action labels, facts, list fragments, alt text, and terminal copy are included. No sentence exceeds 22 words and no banned marketing adjective appears. `F-*` in the result column identifies a finding and rewrite below.

### Live landing page

| Sentence or standalone line | Words | Result |
|---|---:|---|
| PRE-FLIGHT / LOCAL CLI / POLICY 2026-08 | 5 | `F-1-24` |
| Check installer releases before upload | 5 | pass |
| For CLI authors shipping signed releases across package channels without learning every policy. | 13 | `F-1-10` |
| Try it with sample data | 5 | pass |
| See one blocked release and its repair. | 7 | pass |
| Runs on local files | 4 | pass |
| No account or network required | 5 | pass |
| Core checker is free | 4 | pass |
| A package moves through a mechanical inspection bench into release channels. | 11 | pass (image alt text describes the illustration) |
| One artifact enters. | 3 | `F-1-12` |
| Channel-specific evidence leaves. | 3 | `F-1-12` |
| 01 / LIVE PREVIEW | 3 | pass |
| Find the blocker before CI does | 6 | `F-1-11` |
| One manifest describes the release. | 5 | `F-1-21` |
| Each result names the failed check and the next repair. | 10 | `F-1-13` |
| release-doctor check | 2 | pass |
| exit 1 | 2 | pass |
| Binary and license found. | 4 | pass |
| Provenance companion is missing. | 4 | pass |
| Create the .intoto.jsonl companion. | 4 | pass |
| Maintainer URL is not set. | 5 | pass |
| 2 of 3 channels ready · 1 warning · 1 failure | 9 | `F-1-27` |
| 02 / HOW IT WORKS | 4 | pass |
| Inspect a release in three steps | 6 | pass |
| Describe channels | 2 | pass |
| List each artifact and its required evidence in one YAML manifest. | 11 | pass |
| Run local checks | 3 | pass |
| The CLI reads archives safely. | 5 | pass |
| Signature checks use the public key in your manifest. | 9 | pass |
| Repair blockers | 2 | pass |
| Use the channel matrix or GitHub Actions annotations before upload. | 10 | pass |
| 03 / BOUNDARIES | 2 | pass |
| The checker stays in its lane | 6 | `F-1-25` |
| It checks files you already built. | 6 | pass |
| A default check reports findings without changing those files. | 9 | pass |
| Read the privacy note | 4 | pass |
| 04 / INSTALL | 2 | pass |
| Install the local checker | 4 | pass |
| Download release-doctor-v0.1.3-linux-x86_64.tar.gz | 2 | pass |
| Published v0.1.3. | 2 | pass |
| SHA256SUMS is included. | 3 | pass |
| macOS and Linux | 3 | pass |
| Windows PowerShell | 2 | pass |
| Homebrew | 1 | pass |
| macOS and Windows builds are unsigned in v0.1.3. | 8 | pass; declared test coverage is inadequate (`F-1-8`) |
| Inspect checksums before installation. | 4 | pass |
| 05 / AVAILABILITY | 2 | pass |
| Use the free checker today | 5 | pass |
| The local checker is available now. | 6 | pass |
| It checks release evidence before you upload. | 7 | pass |
| Company policy packs are not offered from this site until checkout is available. | 13 | pass |
| Check installer artifacts before upload. | 5 | pass |

### README

| Sentence or standalone line | Words | Result |
|---|---:|---|
| Installer Release Doctor | 3 | pass |
| Check installer artifacts before release channels reject them. | 8 | pass |
| Installer Release Doctor is for CLI authors who already build release files. | 12 | `F-1-26` |
| It finds missing evidence, unsafe archive layouts, invalid metadata, and broken upgrade paths before upload. | 15 | pass |
| The checker runs on local files without network access or an account. | 12 | pass |
| A default check reports findings without changing release files. | 9 | `F-1-26` |
| Signature checks use the public key stored in the manifest. | 10 | pass |
| Try the bundled demo | 4 | pass |
| The command creates a temporary Acme CLI release, runs all checks, and prints the workspace path. | 16 | `F-1-14` |
| The sample contains one missing provenance file, so exit code 1 is expected. | 13 | pass |
| The matching browser demo is at https://installer-release-doctor.sociobot.in/demo. | 7 | pass |
| It works offline after its first visit. | 7 | pass |
| Install | 1 | pass |
| macOS or Linux | 3 | pass |
| The installer verifies the release checksum, installs to ~/.local/bin, and adds that directory to your login-shell PATH. | 17 | pass |
| Open a new terminal after it finishes. | 7 | pass |
| Windows PowerShell | 2 | pass |
| The PowerShell installer verifies the checksum, adds its install directory to your user PATH, and runs the installed binary before it exits. | 22 | pass; declared test coverage is inadequate (`F-1-7`) |
| Homebrew | 1 | pass |
| Scoop, after adding the repository bucket | 6 | pass |
| A winget manifest for 0.1.3 is ready in winget/InstallerReleaseDoctor/0.1.3. | 9 | pass |
| The owner submits it to microsoft/winget-pkgs after release verification. | 9 | `F-1-17` |
| The release also includes .deb, .rpm, an unsigned .pkg, and portable archives. | 12 | declared test coverage is incomplete (`F-1-9`) |
| Check SHA256SUMS before installing a downloaded file. | 7 | pass |
| Use | 1 | pass |
| Copy the example manifest and point the checker at a release directory. | 12 | pass |
| Write JSON for another script. | 5 | pass |
| Write a Markdown matrix and GitHub Actions annotations. | 8 | pass |
| Exit codes are stable. | 4 | `F-1-15` |
| 0: no blocking findings. | 4 | pass |
| 1: one or more blocking findings, or a warning with --strict. | 11 | `F-1-27` |
| 2: the command or manifest could not be read. | 9 | pass |
| The manifest schema is shown in release-doctor.example.yml. | 7 | pass |
| Policy versions are dates because distribution rules change outside this project. | 11 | pass |
| Evidence format | 2 | pass |
| Set checks.signature_public_key to the base64 form of a 32-byte Ed25519 public key. | 12 | pass |
| The matching .sig file is JSON. | 6 | pass |
| The signature covers the artifact’s 32 raw SHA-256 bytes. | 9 | pass |
| The checker rejects evidence it cannot parse or bind to that digest. | 12 | pass; SPDX coverage is missing (`F-1-5`) |
| CycloneDX SBOMs must include the artifact SHA-256 in metadata.component.hashes. | 9 | pass |
| SPDX SBOMs use a checksum entry. | 6 | declared test coverage is missing (`F-1-5`) |
| In-toto provenance names the digest in a statement subject. | 9 | pass |
| What v0.1.3 checks | 3 | pass |
| ZIP, tar, and tar.gz entries that stay within the archive root. | 11 | declared test coverage is inadequate (`F-1-3`) |
| Expected binary and companion files inside an archive. | 8 | declared test coverage is incomplete (`F-1-4`) |
| Ed25519 signatures over the artifact digest. | 6 | pass |
| CycloneDX or SPDX SBOM structure and artifact binding. | 8 | declared test coverage is incomplete (`F-1-5`) |
| In-toto provenance structure and artifact binding. | 6 | pass |
| SHA256SUMS entries and artifact hashes. | 5 | pass |
| Reverse-DNS package identifiers and known architecture names. | 7 | pass |
| Monotonic upgrade versions. | 3 | `F-1-28` |
| Opaque package formats receive a warning to run their native verifier. | 11 | pass |
| The checker does not claim that a channel will accept a release. | 12 | pass |
| Native validators and registry review remain the final authority. | 9 | pass |
| Develop and verify | 3 | pass |
| Requirements: Rust 1.85 or newer and Node.js 22. | 8 | `F-1-16` |
| The static site lands in dist/site. | 6 | `F-1-29` |
| The Rust binary lands in target/release/release-doctor. | 6 | `F-1-30` |
| Run one claim test with its recorded command. | 8 | pass |
| See .factory/claims.json for all claims and sandbox steps. | 8 | pass |
| Release | 1 | pass |
| Pushing a v* tag runs the release workflow. | 8 | `F-1-18` |
| GitHub-hosted runners build Linux, macOS, and Windows assets. | 8 | `F-1-19` |
| The workflow validates native package metadata and publishes checksums, latest.json, package installers, portable archives, and a Homebrew formula. | 18 | `F-1-20` |
| The factory owns publishing credentials. | 5 | `F-1-22` |
| Do not publish registry packages from a development machine. | 9 | pass |
| Privacy and license | 3 | pass |
| The core checker has no telemetry. | 6 | pass |
| The website collects no release or account data. | 8 | pass |
| It caches GitHub’s public release listing for one hour. | 9 | pass |
| Read the privacy notice and terms. | 6 | pass |
| MIT © 2026 Sociobot (Param Factory). | 5 | pass |
| See LICENSE. | 2 | pass |

Terminology check:

| Concept | Terms found | Result |
|---|---|---|
| Built release item | artifact; release file; downloaded file | inconsistent (`F-1-26`) |
| Blocking diagnostic | blocker; failure; blocking finding | inconsistent (`F-1-27`) |
| Distribution destination | channel | consistent |
| Configuration file | manifest | consistent |
| Suggested correction | repair | consistent |
| Sample environment | demo | consistent |

Action-label check: **Try it with sample data**, **Read the privacy note**, **Download…**, **Run release check**, and **Reset demo** name their result. **Start for real** and **Return to the workbench** do not (`F-1-33`, `F-1-32`).

## 3. Demo and sandbox

The one-click path works at `/demo`. The first 390px screen shows Acme CLI 1.4.0, winget status **BLOCKED**, the heading **11 checks**, and the beginning of populated findings. The persistent banner says **Demo — sample data, nothing is saved**. **Reset demo** restores **Ready to inspect the winget channel**, closes the repair disclosure, and leaves cookies, local storage, session storage, and IndexedDB empty. **Start for real** leaves the demo and focuses the landing h1.

The complete live demo flow made only same-origin requests. It reloaded with HTTP 200 after the browser context was put offline. A local CLI run from `/tmp/ird-review-1-cli-sQ1uqh`, with HTTP and HTTPS proxies pointed at an unreachable local port, returned status 1, printed a JSON report with the intended missing provenance blocker, and created `/tmp/release-doctor-demo-L0zeCZ`.

Demo behavior passes manual verification. Its declared persistence regression is incomplete (`F-1-6`), and its exit label is vague (`F-1-33`).

## 4. Declared claims

I cloned the candidate with `git clone --no-local` into `/tmp/ird-review-1-clean-yq5RWe/repo`, ran `npm ci`, and confirmed clean commit `e914afb1fcf67e9eb4f74f2383102c25e20bef14`. I then ran the exact `test` command from every entry in `.factory/claims.json` separately. Each command also ran the Rust tests, Vitest tests, and site build before its selected Playwright claim in both configured projects.

| Claim id | Command result |
|---|---|
| `sample-blocker` | PASS, 2 Playwright projects |
| `demo-private` | PASS, 2 Playwright projects |
| `demo-ephemeral` | PASS, 2 Playwright projects; incomplete assertion (`F-1-6`) |
| `offline-demo` | PASS, 2 Playwright projects |
| `cli-local` | PASS, 2 Playwright projects |
| `json-output` | PASS, 2 Playwright projects |
| `exit-codes` | PASS, 2 Playwright projects |
| `archive-safe` | PASS, 2 Playwright projects; inadequate format coverage (`F-1-3`) |
| `archive-layout` | PASS, 2 Playwright projects; incomplete format coverage (`F-1-4`) |
| `evidence-validation` | PASS, 2 Playwright projects; no SPDX fixture (`F-1-5`) |
| `channel-policy-checks` | PASS, 2 Playwright projects |
| `public-key-only` | PASS, 2 Playwright projects |
| `read-only-check` | PASS, 2 Playwright projects |
| `homebrew-tap` | PASS, 2 Playwright projects |
| `windows-manifests` | PASS, 2 Playwright projects |
| `posix-installer` | PASS, 2 Playwright projects |
| `powershell-installer` | PASS, 2 Playwright projects; source inspection only (`F-1-7`) |
| `release-checksums` | PASS, 2 Playwright projects; incomplete asset assertion (`F-1-9`) |
| `release-identity` | PASS, 2 Playwright projects |
| `unsigned-builds` | PASS, 2 Playwright projects; public binaries are not inspected (`F-1-8`) |
| `no-checkout` | PASS, 2 Playwright projects |
| `matrix-annotations` | PASS, 2 Playwright projects |
| `website-storage` | PASS, 2 Playwright projects |
| `free-core` | PASS, 2 Playwright projects |

All 24 commands returned zero. Green status does not satisfy the contract where the assertion does not observe the full claim. Findings `F-1-3` through `F-1-9` identify those gaps. Findings `F-1-10` through `F-1-22` identify live or README claims that do not have a matching claims entry or cannot be verified as written.

## 5. History check

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files, so there are no earlier finding IDs to recheck. I read `.factory/handoff.md`. Its statement that the cold first screen presents **Try it with sample data** is not true at the requested 1366 × 768 desktop viewport (`F-1-1`). Its statement that all claims have a regression counts tags but does not detect the incomplete observable assertions in `F-1-3` through `F-1-9`.

## 6. Structure, routing, accessibility, and identity

The live `/`, `/demo`, `/privacy`, and `/terms` routes return 200, have `lang=en`, one h1, a main landmark, correct route titles, working canonical URLs, and no horizontal overflow at 390px. Browser back/forward restores the route, resets scroll to zero, focuses the new h1, and updates the polite announcement. The designed 404 returns HTTP 404. The root has a favicon, apple-touch icon, canonical, Open Graph image, Twitter card, and a 1200 × 630 product image. The visual identity is distinct: graph paper, hard rules, offset shadows, inspection colors, and original package art match `.factory/design.md`; it is not a generic SaaS template.

The link crawl found one dead fragment (`F-1-2`). Route metadata is incomplete (`F-1-23`). Axe reported one moderate landmark violation on `/demo` (`F-1-34`); no serious or critical violation appeared. Keyboard navigation, 44px targets, visible focus, reduced-motion behavior, and the 390px expanded repair path pass the checked flows.

## 7. Findings

### Blocking

#### F-1-1 — The first screen hides required content

- **Quote/location:** Landing hero, **Try it with sample data** and the facts **Runs on local files**, **No account or network required**, **Core checker is free**.
- **Why this fails:** At 1366 × 768 the primary action starts at `y=809.6`, so a cold visitor cannot identify the intended first click without scrolling. At 390 × 844 only the first fact fits. This violates the mandatory first-screen shape.
- **Fix:** Reduce the desktop headline scale/hero top padding and tighten the mobile hero so the headline, audience sentence, primary action, adjacent result text, and all three facts fit in each requested viewport. Add a viewport assertion for the bottom edge of every required element.

#### F-1-2 — The 404 header contains a dead route

- **Quote/location:** Live 404 header, **Policy pack**, `href="/#pricing"`.
- **Why this fails:** `/` has no `#pricing` element. The link returns 200 but takes the visitor to no named destination. The 404 header also differs from the three-link header on every application route. This is broken routing.
- **Fix:** Remove the link or point it to an existing section, use the same header on every route, and make the crawler assert that every fragment target exists.

#### F-1-3 — `archive-safe` does not test the claimed archive formats

- **Quote/location:** Claim: **ZIP, tar, and tar.gz entries cannot escape the inspection root.** Test calls `cargo test blocks_parent_paths`.
- **Why this fails:** The Rust test calls the path-cleaning helper with `../escape`; it never gives the CLI a malicious ZIP, tar, or tar.gz. Format parsing and the connection between parser and helper remain untested.
- **Fix:** Add three malicious archives, run the public `check` command on each, and assert blocker output, exit 1, and no file created outside the temporary inspection root.

#### F-1-4 — `archive-layout` covers ZIP only

- **Quote/location:** Claim: **The checker verifies the expected binary and required files inside supported archives.** Sandbox says **bundled ZIP fixture**.
- **Why this fails:** “Supported archives” includes ZIP, tar, and tar.gz, but the regression exercises one ZIP fixture.
- **Fix:** Either narrow the claim to ZIP or add good and missing-file fixtures for ZIP, tar, and tar.gz through the public CLI.

#### F-1-5 — `evidence-validation` never exercises SPDX

- **Quote/location:** Claim and README: **CycloneDX or SPDX SBOM**. The selected Rust tests create only CycloneDX JSON.
- **Why this fails:** The test passes without entering the SPDX branch. A broken SPDX implementation would leave the claim green.
- **Fix:** Add valid, malformed, and digest-mismatched SPDX fixtures and assert the public report and exit status.

#### F-1-6 — `demo-ephemeral` tests reset only

- **Quote/location:** Claim: **Demo sample state stays in memory and is discarded on reset or exit.**
- **Why this fails:** The test inspects storage only after **Reset demo**. It does not prove that actions never persisted state before reset, nor that **Start for real** discards it. Manual behavior currently passes, but the declared regression does not cover the claim.
- **Fix:** Inspect all storage before reset, then run separate reset and exit branches from fresh contexts and assert no `demo:` or user-data keys at every point.

#### F-1-7 — The PowerShell installer behavior is not run

- **Quote/location:** Claim: **The PowerShell installer verifies SHA-256, updates the user and current-process PATH, and runs the installed binary.**
- **Why this fails:** The test only checks that five strings exist in `install.ps1`. Those lines may be unreachable or behave incorrectly. This violates the requirement to assert the observable result.
- **Fix:** Run the installer under PowerShell in a Windows CI job against a local fake release endpoint. Assert success, persisted and current PATH, installed binary execution, and checksum-failure rollback.

#### F-1-8 — Unsigned-download status is inferred from workflow text

- **Quote/location:** Claim: **The macOS and Windows downloads are unsigned.**
- **Why this fails:** The test searches the workflow for signing-related words. It never downloads the public artifacts or inspects Authenticode and macOS code-signing status.
- **Fix:** Download the published Windows executable and macOS binaries in platform jobs, run their native signature inspection tools, and assert the disclosed unsigned state.

#### F-1-9 — The release asset test omits part of the claimed set

- **Quote/location:** README: **The release also includes .deb, .rpm, an unsigned .pkg, and portable archives.** Claim sandbox promises the **complete asset set**.
- **Why this fails:** The test checks Linux, two macOS archives, Windows ZIP, `.deb`, and `.rpm`, but not the `.pkg`. It also checks only that `SHA256SUMS` exists, not that the promised assets are represented in it.
- **Fix:** Assert the `.pkg`, Homebrew formula, and every documented asset. Parse `SHA256SUMS` and verify one matching entry and digest for every downloadable binary/package.

### Major

#### F-1-10 — The audience sentence makes an unlisted “every policy” promise

- **Quote/location:** Hero: **For CLI authors shipping signed releases across package channels without learning every policy.**
- **Why this fails:** The tool explicitly warns that native validators and registry review remain authoritative. No claim test can establish that users need not learn every policy.
- **Fix:** Rewrite to: **For CLI authors checking archives and release evidence before publishing installers.**

#### F-1-11 — The preview heading makes an unlisted timing claim

- **Quote/location:** Landing h2: **Find the blocker before CI does**.
- **Why this fails:** The heading relies on a race against CI that no claim tests. It also does not name the section out of context.
- **Fix:** Rewrite to: **Sample release report**.

#### F-1-12 — The hero caption says the tool produces evidence

- **Quote/location:** **One artifact enters. Channel-specific evidence leaves.**
- **Why this fails:** The checker validates evidence and emits findings; it does not generate signatures, SBOMs, or provenance. This metaphor is both unlisted and misleading.
- **Fix:** Rewrite to: **The checker validates one artifact against each channel’s requirements.** Add a claim only if that broader wording is covered end to end.

#### F-1-13 — “Each result” is an unlisted universal claim

- **Quote/location:** Landing preview: **Each result names the failed check and the next repair.**
- **Why this fails:** `sample-blocker` verifies one seeded failure, not every failure produced by the checker.
- **Fix:** Rewrite to the tested scope: **The sample’s failed check includes a repair step.**

#### F-1-14 — The README says the demo runs “all checks” without a matching claim

- **Quote/location:** README: **The command creates a temporary Acme CLI release, runs all checks, and prints the workspace path.**
- **Why this fails:** The declared demo claim checks the missing provenance result, not completeness against every checker rule.
- **Fix:** Rewrite to: **The command creates a temporary Acme CLI release, checks its manifest, and prints the workspace path.** List that exact behavior in `claims.json` or keep only already-listed observable details.

#### F-1-15 — Exit-code stability is unlisted and untestable as written

- **Quote/location:** README: **Exit codes are stable:**
- **Why this fails:** `exit-codes` verifies current values, not future stability.
- **Fix:** Rewrite the heading to: **Exit codes:**

#### F-1-16 — The minimum toolchain claim has no claim entry

- **Quote/location:** README: **Requirements: Rust 1.85 or newer and Node.js 22.**
- **Why this fails:** No declared claim runs the build on Rust 1.85 or verifies the Node 22 requirement.
- **Fix:** Add a `minimum-toolchain` claim with CI on exact minimum versions, or state only the versions used for development.

#### F-1-17 — The README predicts an owner action

- **Quote/location:** README: **The owner submits it to microsoft/winget-pkgs after release verification.**
- **Why this fails:** This is an untestable future assertion and does not tell the current reader what to do.
- **Fix:** Rewrite as an explicit current status: **The manifest is not yet published in winget; the owner must submit it after verification.** Add a registry-publication claim when it becomes available.

#### F-1-18 — Tag-trigger behavior is an unlisted claim

- **Quote/location:** README: **Pushing a v* tag runs the release workflow.**
- **Why this fails:** No claims entry proves the trigger or its observable result.
- **Fix:** Add a release-workflow claim exercised in a disposable repository, or rewrite this as a maintainer instruction without asserting successful execution.

#### F-1-19 — Runner-platform behavior is an unlisted claim

- **Quote/location:** README: **GitHub-hosted runners build Linux, macOS, and Windows assets.**
- **Why this fails:** Public assets are tested, but the sentence specifically claims how and where they are built; no claims entry covers that.
- **Fix:** Delete the implementation detail or add a claim tied to a successful workflow run and its platform jobs.

#### F-1-20 — Release-workflow validation is an unlisted compound claim

- **Quote/location:** README: **The workflow validates native package metadata and publishes checksums, latest.json, package installers, portable archives, and a Homebrew formula.**
- **Why this fails:** Existing entries cover several published outputs but not this full compound workflow behavior or native metadata validation.
- **Fix:** Split it into individually testable sentences and claims, or link to workflow documentation without making broader verified-product claims.

#### F-1-21 — The one-manifest statement is unlisted

- **Quote/location:** Landing preview: **One manifest describes the release.**
- **Why this fails:** It is a product-format promise, but no claims entry names and tests a multi-channel release described by one manifest.
- **Fix:** Add a `single-manifest` claim using a multi-channel fixture, or rewrite to: **The sample uses one YAML manifest.**

#### F-1-22 — The credential sentence is unlisted and not useful to a reader

- **Quote/location:** README: **The factory owns publishing credentials.**
- **Why this fails:** It exposes an internal responsibility without giving a contributor an actionable boundary, and no test can establish ownership.
- **Fix:** Delete it. Keep the actionable next sentence: **Do not publish registry packages from a development machine.**

#### F-1-23 — Route metadata describes the landing page on every SPA route

- **Quote/location:** `/demo`, `/privacy`, and `/terms` retain OG title **Check installer releases before upload**, OG description **A local CLI for release authors shipping across package channels**, and the landing meta description. The HTTP 404 has no meta description, canonical, Open Graph fields, or apple-touch icon.
- **Why this fails:** Shared previews for legal and demo links misdescribe their destination; the 404 does not meet the required metadata skeleton.
- **Fix:** Update title, description, canonical, and OG/Twitter fields on every route. Add appropriate metadata and apple-touch icon to `404.html`, then assert it per route.

### Minor

#### F-1-24 — The hero eyebrow uses a metaphor and decorative code

- **Quote/location:** **PRE-FLIGHT / LOCAL CLI / POLICY 2026-08**.
- **Why this fails:** “Pre-flight” is metaphorical and the slash label is not a plain section name.
- **Fix:** Rewrite to: **LOCAL RELEASE CHECKER · POLICY 2026-08**.

#### F-1-25 — The boundaries heading is a metaphor

- **Quote/location:** **The checker stays in its lane**.
- **Why this fails:** The heading does not name the boundary when read out of context.
- **Fix:** Rewrite to: **Checks are read-only**.

#### F-1-26 — The same input is called both “artifact” and “release file”

- **Quote/location:** README: **release files**; landing and README elsewhere: **artifacts**.
- **Why this fails:** The terminology table in the existing copy audit specifies **artifact**, but the public copy changes terms.
- **Fix:** Use **release artifact** on first mention and **artifact** thereafter, including **without changing artifacts**.

#### F-1-27 — Blocking results use three terms

- **Quote/location:** **blocker**, **failure**, and **blocking finding** on the landing page and README.
- **Why this fails:** A first-time reader must infer whether these statuses differ.
- **Fix:** Use **blocker** in prose and summaries: **1 blocker** and **one or more blockers**. Keep machine enum names only in JSON/code.

#### F-1-28 — “Monotonic” is unexplained jargon

- **Quote/location:** README bullet: **Monotonic upgrade versions.**
- **Why this fails:** It is a fragment and requires the reader to translate the rule.
- **Fix:** Rewrite to: **Versions increase on every upgrade.**

#### F-1-29 — “The static site lands” is a metaphor

- **Quote/location:** README: **The static site lands in dist/site.**
- **Why this fails:** “Lands” does not name the build action.
- **Fix:** Rewrite to: **The site build writes files to dist/site.**

#### F-1-30 — “The Rust binary lands” is a metaphor

- **Quote/location:** README: **The Rust binary lands in target/release/release-doctor.**
- **Why this fails:** “Lands” is avoidable figurative copy.
- **Fix:** Rewrite to: **Cargo writes the Rust binary to target/release/release-doctor.**

#### F-1-31 — The 404 headline is a package metaphor

- **Quote/location:** 404 h1: **This package went to the wrong path**.
- **Why this fails:** It delays the literal error and makes the heading less useful out of context.
- **Fix:** Rewrite to: **Page not found**.

#### F-1-32 — The 404 action does not name its destination

- **Quote/location:** 404 action: **Return to the workbench**.
- **Why this fails:** “Workbench” is brand lore, not a route or result.
- **Fix:** Rewrite to: **Return to Installer Release Doctor** or **Open the checker home page**.

#### F-1-33 — The demo exit action is vague

- **Quote/location:** Demo banner: **Start for real**.
- **Why this fails:** The site has no real-data workspace or upload form; the link only returns home.
- **Fix:** Rewrite to: **Leave demo**. If it should lead to installation, use **Install the CLI** and link to `/#install`.

#### F-1-34 — The demo has an Axe landmark violation

- **Quote/location:** `/demo`, `<aside class="demo-command">Run the same demo in the CLI…</aside>` inside `<main>`.
- **Why this fails:** Axe reports `landmark-complementary-is-top-level` at moderate impact because a complementary landmark is nested inside another landmark.
- **Fix:** Use a labelled `<section>` for this related command block, or move and label the complementary landmark appropriately. Make the Axe gate reject moderate violations too.

## 8. Missed leverage

No additional AI feature is justified. The job is deterministic artifact validation; model output would reduce trust and require sending data. JSON output, a Markdown matrix, GitHub Actions annotations, Homebrew/Scoop/winget distribution, and a bundled demo already cover the obvious export and integration paths. An automatic manifest initializer could be convenient, but the brief does not make it necessary enough to record as a defect.

## What would make this perfect

Resolve every finding above, then rerun the cold 390 × 844 and 1366 × 768 first-screen assertions, a fragment-aware link crawl, route-specific metadata checks, Axe with moderate findings enabled, and all declared claims from a fresh clone. Expand claim tests so they execute every named archive/evidence/platform path rather than helper functions or source-text checks. Remove every unlisted or future-tense claim, keep one term per concept, and rerun this entire checklist from a fresh browser context. The pass bar is zero remaining findings.
