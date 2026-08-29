# Adversarial first-read review 2 — Installer Release Doctor

**Verdict: FAIL**

Reviewed 2026-08-29 UTC against the live site and a fresh clone of
`b79cf9f2837a05335514b6088904c9274ee7138a`.

## Cold first read

| Viewport | What it does | For whom | First click | Result |
|---|---|---|---|---|
| 390 × 844 | Checks installer releases before upload. | CLI authors checking archives and release evidence before publishing installers. | **Try it with sample data** | Clear; headline, audience, action, and all three facts fit. |
| 1366 × 768 | Checks installer releases before upload. | CLI authors checking archives and release evidence before publishing installers. | **Try it with sample data** | Clear; action is y=559–612 and facts end at y=687. |

## Findings

### Blocking

#### F-2-1 — The one-click demo opens an idle screen

- **Quote/location:** **“Try it with sample data”** opens `/?demo=1`. Its
  first 390 px and desktop viewport contains **“INSPECT THE SAMPLE RELEASE”**,
  **“The sample has one blocker. Expand the failed result to see its repair.”**,
  and **“Run release check”**. Only after that second click does it show
  **“Finished: winget is blocked by 1 missing file.”**
- **Why:** The required one-click demo must show the realistic sample being
  used on the first screen after entering it. This requires a second action to
  see the report and repair.
- **Fix:** Preload the completed Acme report with its blocked winget row and
  repair control in the initial `/demo` viewport. Rename the remaining action
  **Run release check again**. Add a 390 px test that asserts those sample
  results are visible immediately.

#### F-2-2 — Two declared claim commands are flaky in sequential verification

- **Quote/location:** From the clean clone, running all 24 recorded
  `npm test -- --grep @claim:<id>` commands in listed order produced
  `net::ERR_CONNECTION_REFUSED at http://127.0.0.1:4173/?demo=1` for
  `demo-ephemeral` and `offline-demo`. Both passed when run alone. The
  Playwright configuration has `reuseExistingServer: true`, so a later
  filtered run can reuse the preceding preview process while it is shutting
  down.
- **Why:** A claim command is a release gate. A normal clean verifier run must
  not need a manual delay or retry; this run has two failing claim tests.
- **Fix:** Give every filtered Playwright run its own stable preview process
  (prefer a unique port) or wait for teardown before reuse. Add a CI regression
  that runs all claim commands consecutively without retries.

## Demo, privacy, and claims

The demo banner is persistent and exact: **“Demo — sample data, nothing is
saved”**, with **Reset demo** and **Leave demo**. After running, its Acme CLI
1.4.0 report contains eleven checks, the missing provenance companion, and a
repair disclosure. Reset restores the start state.

In a fresh 390 px context, cookies, localStorage, sessionStorage, and
IndexedDB were empty before run, after run, and after reset. The complete demo
request log contained only the product-origin document, JS, and CSS. This
confirms demo isolation; it does not cure `F-2-1`.

All 24 `claims.json` commands were run from the fresh clone. Twenty-two passed
in the sequential sweep. `demo-ephemeral` and `offline-demo` failed as in
`F-2-2` then passed in isolated reruns. The full `npm test` suite and
`npm run build` also passed. No live or README reliance claim lacks a matching
claims entry.

| Claim IDs with isolated result | Result |
|---|---|
| sample-blocker; demo-private; demo-ephemeral; offline-demo; cli-local; json-output | PASS (the middle two are flaky in the sequential sweep) |
| exit-codes; archive-safe; archive-layout; evidence-validation; channel-policy-checks; public-key-only | PASS |
| read-only-check; homebrew-tap; windows-manifests; posix-installer; powershell-installer; release-checksums | PASS |
| release-identity; unsigned-builds; no-checkout; matrix-annotations; website-storage; free-core | PASS |

## Copy audit

Counts use visible words. Hyphenated terms and URLs count as one word. Commands
and the JSON block are not sentences. No listed line exceeds 22 words; no
banned marketing word, metaphor/mood heading, inconsistent term, or vague
button was found. The product vocabulary remains **artifact**, **channel**,
**manifest**, **blocker**, **repair**, and **demo**. The full landing inventory
matches the current `.factory/copy-audit.md`; this review records it and the
README inventory below.

### Landing page

| Copy | Words |
|---|---:|
| LOCAL RELEASE CHECKER · POLICY 2026-08 | 5 |
| Check installer releases before upload | 5 |
| For CLI authors checking archives and release evidence before publishing installers. | 11 |
| Try it with sample data; See one blocked release and its repair. | 5; 7 |
| Runs on local files; No account or network required; Core checker is free | 4; 5; 4 |
| A package moves through a mechanical inspection bench into release channels. | 11 |
| The checker validates one artifact against each channel’s requirements. | 9 |
| 01 / LIVE PREVIEW; Sample release report | 3; 3 |
| The sample uses one YAML manifest.; Its failed check includes a repair step. | 6; 7 |
| Binary and license found.; Provenance companion is missing.; Create the .intoto.jsonl companion.; Maintainer URL is not set. | 4; 4; 4; 5 |
| 2 of 3 channels ready · 1 warning · 1 blocker | 9 |
| 02 / HOW IT WORKS; Inspect a release in three steps | 4; 6 |
| Describe channels; List each artifact and its required evidence in one YAML manifest. | 2; 11 |
| Run local checks; The CLI reads archives safely.; Signature checks use the public key in your manifest. | 3; 5; 9 |
| Repair blockers; Use the channel matrix or GitHub Actions annotations before upload. | 2; 10 |
| 03 / BOUNDARIES; Checks are read-only | 2; 4 |
| It checks artifacts you already built.; A default check reports findings without changing those artifacts. | 6; 9 |
| Read the privacy note | 4 |
| 04 / INSTALL; Install the local checker; Checking published builds… | 2; 4; 3 |
| Choose your Mac:; Download for Apple silicon; Download for Intel Mac | 3; 4; 4 |
| Published v0.1.4.; SHA256SUMS is included. | 2; 3 |
| Downloads have no publisher signature.; macOS binaries may use ad hoc signatures.; Inspect checksums before installation. | 5; 7; 4 |
| 05 / AVAILABILITY; Use the free checker today | 2; 5 |
| The local checker is available now.; It checks release evidence before you upload. | 6; 7 |
| Company policy packs are not offered from this site until checkout is available. | 13 |
| Check installer artifacts before upload. | 5 |

### README

| Copy | Words |
|---|---:|
| Installer Release Doctor; Check installer artifacts before release channels reject them. | 3; 8 |
| Installer Release Doctor is for CLI authors who already build release artifacts. | 12 |
| It finds missing evidence, unsafe archive layouts, invalid metadata, and broken upgrade paths before upload. | 15 |
| The checker runs on local files without network access or an account. | 12 |
| A default check reports findings without changing artifacts.; Signature checks use the public key stored in the manifest. | 8; 10 |
| Try the bundled demo | 4 |
| The command creates a temporary Acme CLI release, checks its manifest, and prints the workspace path. | 16 |
| The sample contains one missing provenance file, so exit code 1 is expected. | 13 |
| The matching browser demo is at URL.; It works offline after its first visit. | 7; 7 |
| Install; macOS or Linux; Windows PowerShell; Homebrew | 1; 3; 2; 1 |
| The installer verifies the release checksum, installs to ~/.local/bin, and adds that directory to your login-shell PATH. | 17 |
| Open a new terminal after it finishes. | 7 |
| The PowerShell installer verifies the checksum, adds its install directory to your user PATH, and runs the installed binary before it exits. | 22 |
| Scoop, after adding the repository bucket | 6 |
| A winget manifest for the current release is ready under winget/InstallerReleaseDoctor. | 10 |
| It is not yet published in winget; the owner must submit it after verification. | 14 |
| The release also includes .deb, .rpm, a .pkg, and portable archives. | 11 |
| Downloads have no publisher signature; macOS binaries may use ad hoc signatures. | 11 |
| For the unsigned .pkg, use Finder's Open action from the file context menu. | 14 |
| Check SHA256SUMS before installing an artifact. | 6 |
| Use; Copy the example manifest and point the checker at a release directory. | 1; 12 |
| Write JSON for another script.; Write a Markdown matrix and GitHub Actions annotations. | 5; 8 |
| Exit codes; 0: no blockers.; 1: one or more blockers, or a warning with --strict.; 2: the command or manifest could not be read. | 2; 3; 10; 10 |
| The manifest schema is shown in release-doctor.example.yml. | 8 |
| Policy versions are dates because distribution rules change outside this project. | 11 |
| Evidence format; Set checks.signature_public_key to the base64 form of a 32-byte Ed25519 public key. | 2; 12 |
| The matching .sig file is JSON.; The signature covers the artifact's 32 raw SHA-256 bytes. | 6; 9 |
| The checker rejects evidence it cannot parse or bind to that digest. | 12 |
| CycloneDX SBOMs must include the artifact SHA-256 in metadata.component.hashes.; SPDX SBOMs use a checksum entry.; In-toto provenance names the digest in a statement subject. | 8; 6; 9 |
| What v0.1.4 checks | 3 |
| ZIP, tar, and tar.gz entries that stay within the archive root.; Expected binary and companion files inside an archive. | 11; 8 |
| Ed25519 signatures over the artifact digest.; CycloneDX or SPDX SBOM structure and artifact binding.; In-toto provenance structure and artifact binding. | 6; 8; 7 |
| SHA256SUMS entries and artifact hashes.; Reverse-DNS package identifiers with lowercase DNS labels and known architecture names. | 5; 10 |
| Semantic Versions increase on every upgrade, including prerelease-to-final releases.; Opaque package formats receive a warning to run their native verifier. | 9; 11 |
| The checker does not claim that a channel will accept a release.; Native validators and registry review remain the final authority. | 13; 9 |
| Develop and verify; Install Rust and Node.js, then run. | 3; 7 |
| The site build writes files to dist/site.; Cargo writes the Rust binary to target/release/release-doctor. | 8; 9 |
| Run one claim test with its recorded command.; See .factory/claims.json for all claims and sandbox steps. | 9; 8 |
| Release; To prepare a release, push a v* tag and monitor the release workflow.; Do not publish registry packages from a development machine. | 1; 14; 10 |
| Privacy and license; The core checker has no telemetry.; The website collects no release or account data. | 3; 6; 8 |
| It caches GitHub's public release listing for one hour.; Read the privacy notice and terms.; MIT © 2026 Sociobot (Param Factory). | 10; 6; 6 |

## History, structure, and scope

Every `F-1-1` through `F-1-34` in `review-1.md` was confirmed fixed in the
current source and live page: the first screen fits, the 404/link repair,
archive/evidence/demo/installer claim coverage, copy rewrites and terminology,
route metadata, demo landmark, and button labels are all present. The earlier
verification defects (real evidence parsing, initial focus, cache headers,
Homebrew/installer behavior, checkout removal, archive path/identifier/SemVer
boundaries) are likewise fixed. No `F-1-*` is regressed.

`/`, `/demo`, `/privacy`, `/terms`, and the designed HTTP 404 have correct
titles, one h1, main landmark, description, canonical, OG image, favicon, and
no normal-load console error. Internal links resolve, header/footer/Privacy/
Terms are consistent, back/forward uses History API, and route changes move
focus to the h1 with a polite announcement. There was no 390 px overflow. The
graph-paper inspection bench, hard offset shadows, stamps, acid/cobalt palette,
and original art are distinct from a generic SaaS template. No AI feature is
implied or useful here; the CLI already offers the expected JSON and Markdown/
GitHub Actions export paths.

## What would make this perfect

Make the demo show the completed sample report in one click, make every
recorded claim command stable when invoked consecutively, and rerun this entire
review from a new clone without retries.
