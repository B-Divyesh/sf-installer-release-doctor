# Installer Release Doctor

Check installer artifacts before release channels reject them.

Installer Release Doctor is for CLI authors who already build release artifacts. It finds missing evidence, unsafe archive layouts, invalid metadata, and broken upgrade paths before upload.

The checker runs on local files without network access or an account. A default check reports findings without changing artifacts. Signature checks use the public key stored in the manifest.

## Try the bundled demo

```sh
cargo run -- demo
```

The command creates a temporary Acme CLI release, checks its manifest, and prints the workspace path. The sample contains one missing provenance file, so exit code `1` is expected.

The matching browser demo is at <https://installer-release-doctor.sociobot.in/?demo=1>. It opens with the completed sample report and works offline after its first visit.

## Install

macOS or Linux:

```sh
curl -fsSL https://installer-release-doctor.sociobot.in/install.sh | sh
```

The installer verifies the release checksum, installs to `~/.local/bin`, and adds that directory to your login-shell PATH. Open a new terminal after it finishes.

Windows PowerShell:

```powershell
irm https://installer-release-doctor.sociobot.in/install.ps1 | iex
```

The PowerShell installer verifies the checksum, adds its install directory to your user PATH, and runs the installed binary before it exits.

Homebrew:

```sh
brew install B-Divyesh/installer-release-doctor/installer-release-doctor
```

Scoop, after adding the repository bucket:

```powershell
scoop bucket add installer-release-doctor https://github.com/B-Divyesh/sf-installer-release-doctor
scoop install installer-release-doctor
```

A winget manifest for the current release is ready under [`winget/InstallerReleaseDoctor`](winget/InstallerReleaseDoctor). It is not yet published in winget; the owner must submit it after verification.

The release also includes `.deb`, `.rpm`, a `.pkg`, and portable archives. Downloads have no publisher signature; macOS binaries may use ad hoc signatures. For the unsigned `.pkg`, use Finder's **Open** action from the file context menu. Check `SHA256SUMS` before installing an artifact.

## Use

Copy the example manifest and point the checker at a release directory:

```sh
cp release-doctor.example.yml release-doctor.yml
release-doctor check --manifest release-doctor.yml --artifacts dist/release
```

Write JSON for another script:

```sh
release-doctor check --json > doctor-report.json
```

Write a Markdown matrix and GitHub Actions annotations:

```sh
release-doctor check --github --matrix dist/channel-matrix.md
```

Exit codes:

- `0`: no blockers.
- `1`: one or more blockers, or a warning with `--strict`.
- `2`: the command or manifest could not be read.

The manifest schema is shown in [`release-doctor.example.yml`](release-doctor.example.yml). Policy versions are dates because distribution rules change outside this project.

## Evidence format

Set `checks.signature_public_key` to the base64 form of a 32-byte Ed25519 public key. The matching `.sig` file is JSON:

```json
{"algorithm":"ed25519-sha256","signature":"BASE64_SIGNATURE"}
```

The signature covers the artifact's 32 raw SHA-256 bytes. The checker rejects evidence it cannot parse or bind to that digest.

CycloneDX SBOMs must include the artifact SHA-256 in `metadata.component.hashes`. SPDX SBOMs use a checksum entry. In-toto provenance names the digest in a statement subject.

## What v0.1.4 checks

- ZIP, tar, and tar.gz entries that stay within the archive root. POSIX and Windows traversal, absolute, drive-qualified, and UNC paths are rejected on every host.
- Expected binary and companion files inside an archive.
- Ed25519 signatures over the artifact digest.
- CycloneDX or SPDX SBOM structure and artifact binding.
- In-toto provenance structure and artifact binding.
- `SHA256SUMS` entries and artifact hashes.
- Reverse-DNS package identifiers with lowercase DNS labels and known architecture names.
- Semantic Versions increase on every upgrade, including prerelease-to-final releases.
- Opaque package formats receive a warning to run their native verifier.

The checker does not claim that a channel will accept a release. Native validators and registry review remain the final authority.

## Develop and verify

Install Rust and Node.js, then run:

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build:site
cargo build --release
```

The site build writes files to `dist/site`. Cargo writes the Rust binary to `target/release/release-doctor`.

Run one claim test with its recorded command:

```sh
npm test -- --grep @claim:sample-blocker
```

See [`.factory/claims.json`](.factory/claims.json) for all claims and sandbox steps.
Run every recorded command consecutively with `npm run test:claims:sequential`.

## Release

To prepare a release, push a `v*` tag and monitor [the release workflow](.github/workflows/release.yml). Do not publish registry packages from a development machine.

## Privacy and license

The core checker has no telemetry. The website collects no release or account data. It caches GitHub's public release listing for one hour. Read the [privacy notice](https://installer-release-doctor.sociobot.in/privacy) and [terms](https://installer-release-doctor.sociobot.in/terms).

MIT © 2026 Sociobot (Param Factory). See [LICENSE](LICENSE).
