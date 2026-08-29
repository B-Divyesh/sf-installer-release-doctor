# Adversarial first-read review 3 — Installer Release Doctor

**Verdict: PASS**

Reviewed 2026-08-29 UTC against the deployed site and a clean clone at commit
2bf87b9e44711f0b03d0e8b779fa0a2fa02a8174. There are zero blocking, major, or
minor findings. All 24 declared claim commands were exercised.

## Cold first read

Fresh Chromium contexts had no cookies, cache, or storage.

| Viewport | What it does | For whom | First action | Result |
|---|---|---|---|---|
| 390 × 844 | Checks installer releases before upload. | CLI authors checking archives and release evidence before publishing installers. | Try it with sample data | Clear. The action ends at y=461.5 and all three facts end at y=611.3. |
| 1366 × 768 | Checks installer releases before upload. | CLI authors checking archives and release evidence before publishing installers. | Try it with sample data | Clear. The action ends at y=611.6 and all three facts end at y=687.2. |

The first screen names the job, audience, first action, immediate result, and
three concrete facts without relying on the product name or illustration.

## Copy audit

Counts treat hyphenated compounds, commands, and URLs as one word. Code
examples are excluded. Visible labels, headings, facts, terminal output, and
buttons are included. No sentence exceeds 22 words. No banned marketing
adjective, unclear heading, unexplained metaphor, inconsistent term, or vague
button was found. No rewrite is proposed because there are no copy findings.

### Landing-page inventory

| Copy | Words |
|---|---:|
| LOCAL RELEASE CHECKER · POLICY 2026-08 | 5 |
| Check installer releases before upload | 5 |
| For CLI authors checking archives and release evidence before publishing installers. | 11 |
| Try it with sample data / See one blocked release and its repair. | 5 / 7 |
| Runs on local files / No account or network required / Core checker is free | 4 / 5 / 4 |
| A package moves through a mechanical inspection bench into release channels. / The checker validates one artifact against each channel’s requirements. | 11 / 10 |
| 01 / LIVE PREVIEW / Sample release report | 3 / 3 |
| The sample uses one YAML manifest. / Its failed check includes a repair step. | 6 / 7 |
| release-doctor check / exit 1 | 2 / 2 |
| Binary and license found. / Provenance companion is missing. / Create the .intoto.jsonl companion. / Maintainer URL is not set. | 4 / 4 / 4 / 5 |
| 2 of 3 channels ready · 1 warning · 1 blocker | 9 |
| 02 / HOW IT WORKS / Inspect a release in three steps | 4 / 6 |
| Describe channels / List each artifact and its required evidence in one YAML manifest. | 2 / 11 |
| Run local checks / The CLI reads archives safely. / Signature checks use the public key in your manifest. | 3 / 5 / 9 |
| Repair blockers / Use the channel matrix or GitHub Actions annotations before upload. | 2 / 10 |
| 03 / BOUNDARIES / Checks are read-only | 2 / 4 |
| It checks artifacts you already built. / A default check reports findings without changing those artifacts. | 6 / 9 |
| Read the privacy note | 4 |
| 04 / INSTALL / Install the local checker / Checking published builds… | 2 / 4 / 3 |
| Choose your Mac: / Download for Apple silicon / Download for Intel Mac | 3 / 4 / 4 |
| Published v0.1.4. / SHA256SUMS is included. / Build v0.1.4 is published. | 2 / 3 / 4 |
| Choose an asset on the GitHub Release page. / Downloads are being published. / Use the install command, or check the GitHub Releases page. | 8 / 4 / 10 |
| macOS and Linux / Windows PowerShell / Homebrew | 3 / 2 / 1 |
| Downloads have no publisher signature. / macOS binaries may use ad hoc signatures. / Inspect checksums before installation. | 5 / 7 / 4 |
| 05 / AVAILABILITY / Use the free checker today | 2 / 5 |
| The local checker is available now. / It checks release evidence before you upload. | 6 / 7 |
| Company policy packs are not offered from this site until checkout is available. / Check installer artifacts before upload. | 13 / 5 |

### README inventory

| Copy | Words |
|---|---:|
| Installer Release Doctor / Check installer artifacts before release channels reject them. | 3 / 8 |
| Installer Release Doctor is for CLI authors who already build release artifacts. / It finds missing evidence, unsafe archive layouts, invalid metadata, and broken upgrade paths before upload. | 12 / 15 |
| The checker runs on local files without network access or an account. / A default check reports findings without changing artifacts. / Signature checks use the public key stored in the manifest. | 12 / 8 / 10 |
| Try the bundled demo | 4 |
| The command creates a temporary Acme CLI release, checks its manifest, and prints the workspace path. / The sample contains one missing provenance file, so exit code 1 is expected. | 16 / 13 |
| The matching browser demo is at URL. / It opens with the completed sample report and works offline after its first visit. | 7 / 12 |
| Install / macOS or Linux / Windows PowerShell / Homebrew | 1 / 3 / 2 / 1 |
| The installer verifies the release checksum, installs to ~/.local/bin, and adds that directory to your login-shell PATH. / Open a new terminal after it finishes. | 17 / 7 |
| The PowerShell installer verifies the checksum, adds its install directory to your user PATH, and runs the installed binary before it exits. | 22 |
| Scoop, after adding the repository bucket | 6 |
| A winget manifest for the current release is ready under winget/InstallerReleaseDoctor. / It is not yet published in winget; the owner must submit it after verification. | 10 / 14 |
| The release also includes .deb, .rpm, a .pkg, and portable archives. / Downloads have no publisher signature; macOS binaries may use ad hoc signatures. / For the unsigned .pkg, use Finder's Open action from the file context menu. / Check SHA256SUMS before installing an artifact. | 11 / 11 / 14 / 6 |
| Use / Copy the example manifest and point the checker at a release directory. | 1 / 12 |
| Write JSON for another script. / Write a Markdown matrix and GitHub Actions annotations. | 5 / 8 |
| Exit codes / 0: no blockers. / 1: one or more blockers, or a warning with --strict. / 2: the command or manifest could not be read. | 2 / 3 / 10 / 10 |
| The manifest schema is shown in release-doctor.example.yml. / Policy versions are dates because distribution rules change outside this project. | 8 / 11 |
| Evidence format / Set checks.signature_public_key to the base64 form of a 32-byte Ed25519 public key. / The matching .sig file is JSON. | 2 / 12 / 6 |
| The signature covers the artifact's 32 raw SHA-256 bytes. / The checker rejects evidence it cannot parse or bind to that digest. | 9 / 12 |
| CycloneDX SBOMs must include the artifact SHA-256 in metadata.component.hashes. / SPDX SBOMs use a checksum entry. / In-toto provenance names the digest in a statement subject. | 8 / 6 / 9 |
| What v0.1.4 checks | 3 |
| ZIP, tar, and tar.gz entries that stay within the archive root. / POSIX and Windows traversal, absolute, drive-qualified, and UNC paths are rejected on every host. | 11 / 14 |
| Expected binary and companion files inside an archive. / Ed25519 signatures over the artifact digest. / CycloneDX or SPDX SBOM structure and artifact binding. / In-toto provenance structure and artifact binding. | 8 / 6 / 8 / 6 |
| SHA256SUMS entries and artifact hashes. / Reverse-DNS package identifiers with lowercase DNS labels and known architecture names. / Semantic Versions increase on every upgrade, including prerelease-to-final releases. / Opaque package formats receive a warning to run their native verifier. | 5 / 10 / 9 / 11 |
| The checker does not claim that a channel will accept a release. / Native validators and registry review remain the final authority. | 13 / 9 |
| Develop and verify / Install Rust and Node.js, then run. | 3 / 7 |
| The site build writes files to dist/site. / Cargo writes the Rust binary to target/release/release-doctor. | 8 / 9 |
| Run one claim test with its recorded command. / See .factory/claims.json for all claims and sandbox steps. / Run every recorded command consecutively with npm run test:claims:sequential. | 9 / 8 / 11 |
| Release / To prepare a release, push a v* tag and monitor the release workflow. / Do not publish registry packages from a development machine. | 1 / 14 / 10 |
| Privacy and license / The core checker has no telemetry. / The website collects no release or account data. / It caches GitHub's public release listing for one hour. / Read the privacy notice and terms. | 3 / 6 / 8 / 10 / 6 |
| MIT © 2026 Sociobot (Param Factory). / See LICENSE. | 6 / 2 |

Terminology remains artifact, channel, manifest, blocker, repair, and demo. All
interactive controls name a result or action.

## Demo and sandbox behaviour

/?demo=1 and /demo load directly into a completed Acme CLI 1.4.0 report. At 390
× 844 the completed status, blocked channel, missing provenance finding, and
Show repair control all appeared in the initial viewport. The persistent banner
was exactly “Demo — sample data, nothing is saved”; Reset demo and Leave demo
worked.

- Reset restored the completed sample and closed the repair disclosure.
- Leave demo returned to / and removed the banner.
- Cookies, localStorage, sessionStorage, and IndexedDB were empty before
  interaction, after replay, after reset, and after leaving.
- The full demo request log included only product document, JavaScript, and CSS.
  It made no off-site request.
- After a first visit and service-worker activation, /demo reloaded offline with
  the completed report.
- The CLI demo was run from a fresh temporary directory with HTTP and HTTPS
  proxies blocked. It exited 1 for the documented blocker, emitted the report,
  and printed a new temporary workspace path.

## Claims

An independent clone at /tmp/ird-review3-clean-Ob7c09/repo ran every exact
command from .factory/claims.json in listed order without retry. The first
command bootstrapped locked Node dependencies from the clean checkout. All 24
passed.

| Claim IDs | Result |
|---|---|
| sample-blocker; demo-private; demo-ephemeral; offline-demo | PASS |
| cli-local; json-output; exit-codes; archive-safe; archive-layout; evidence-validation | PASS |
| channel-policy-checks; public-key-only; read-only-check; matrix-annotations | PASS |
| homebrew-tap; windows-manifests; posix-installer; powershell-installer | PASS |
| release-checksums; release-identity; unsigned-builds; no-checkout; website-storage; free-core | PASS |

All reliance claims in landing and README map to an applicable listed test:
local/offline/no-account to cli-local and offline-demo; privacy to
demo-private, demo-ephemeral, and website-storage; checking to archive,
evidence, channel, public-key, and read-only tests; outputs and installers to
their named tests; release availability to release tests; checkout availability
to no-checkout; free/MIT status to free-core. No unlisted claim was found.

## Structure, accessibility, and identity

Live /, /demo, /privacy, and /terms each returned 200 with a route-specific
title, description, canonical URL, Open Graph and Twitter metadata, lang=en,
exactly one h1, and one main landmark. Unknown routes returned the designed
404.html with HTTP 404 and a working home action.

All internal links and fragments returned 200. The release archive link resolved
as an expected download: HTTP 302 to GitHub, then HTTP 200. Header and footer
are consistent and include Privacy, Terms, a skip link, product one-liner, and
build information. Navigation updates metadata; back navigation restored the
home route and focused its h1; route changes focus the destination h1 and
announce it.

Live desktop and 390 px checks found no console/page errors, no horizontal
overflow, and zero Axe violations. Graph paper, hard ink rules and shadows,
inspection stamps, acid/cobalt safety colours, mono type, original inspection
art, and matching 404 implement the documented inspection-bench identity rather
than a generic SaaS template. Reduced motion removes inspection animation.

The brief implies no AI feature. Expected automation outputs already exist:
JSON, a Markdown channel matrix, and GitHub Actions annotations. An AI call
would not improve this local validation job and would introduce a needless data
path.

## Earlier finding verification

Every prior finding was checked on the live site and current source; none is
merely marked fixed.

| Earlier ID | Verification |
|---|---|
| F-1-1 | Both cold viewports contain job, audience, sample action, result, and facts. |
| F-1-2 | Unknown paths return a designed 404 with a live home action and no dead fragment. |
| F-1-3 | archive-safe passed for ZIP, tar, and tar.gz traversal cases. |
| F-1-4 | archive-layout passed for good and missing-file archives. |
| F-1-5 | evidence-validation passed signature, SBOM, provenance, and SPDX cases. |
| F-1-6 | demo-ephemeral and direct inspection found no demo persistence. |
| F-1-7 | powershell-installer passed. |
| F-1-8 | Unsigned-download copy is accurate and unsigned-builds passed. |
| F-1-9 | release-checksums passed for published packages. |
| F-1-10 | The audience copy is concrete and scoped. |
| F-1-11 | The preview heading is Sample release report. |
| F-1-12 | The evidence caption says validates, not creates. |
| F-1-13 | The completed sample and repair are visible and scoped. |
| F-1-14 | README accurately describes the temporary CLI demo. |
| F-1-15 | README uses Exit codes. |
| F-1-16 | README makes no unsupported toolchain-minimum promise. |
| F-1-17 | README accurately states winget publication status. |
| F-1-18 | Tag handling is an instruction, not an untested result. |
| F-1-19 | The hosted-runner claim is absent. |
| F-1-20 | Release-output claims have individual tests. |
| F-1-21 | The YAML-manifest statement is scoped to the sample. |
| F-1-22 | The credential-ownership claim is absent. |
| F-1-23 | Real and 404 routes have complete route-specific metadata. |
| F-1-24 | The eyebrow names the local release checker and policy version. |
| F-1-25 | The boundary heading is Checks are read-only. |
| F-1-26 | Public copy consistently uses artifact. |
| F-1-27 | Human-facing diagnostics consistently use blocker. |
| F-1-28 | README explains upgrade versions in plain words. |
| F-1-29 | README says the site build writes files. |
| F-1-30 | README says Cargo writes the Rust binary. |
| F-1-31 | The 404 headline is Page not found. |
| F-1-32 | The 404 action names its result. |
| F-1-33 | Leave demo discards the sample. |
| F-1-34 | Demo results use a labelled section; Axe reports zero violations. |
| F-2-1 | Completed demo report and repair control load in first viewport. |
| F-2-2 | All 24 exact claim commands passed consecutively from a clean clone. |

## What would make this perfect

No concrete change is outstanding. Preserve the claim-command sweep and repeat
this full cold-start, demo-isolation, live-route, and clean-clone verification
whenever copy, installers, or routing changes.

