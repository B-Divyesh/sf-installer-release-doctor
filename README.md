# Installer Release Doctor

Check installer artifacts before release channels reject them.

Installer Release Doctor is for CLI authors who already build release files. It finds missing evidence, unsafe archive layouts, invalid metadata, and broken upgrade paths before upload.

The checker runs on local files without network access or an account. It does not host packages, sign code, or store credentials.

## Try the bundled demo

```sh
cargo run -- demo
```

The command creates a temporary Acme CLI release, runs all checks, and prints the workspace path. The sample contains one missing provenance file, so exit code `1` is expected.

The matching browser demo is at <https://installer-release-doctor.sociobot.in/demo>. It works offline after its first visit.

## Install

macOS or Linux:

```sh
curl -fsSL https://installer-release-doctor.sociobot.in/install.sh | sh
```

Windows PowerShell:

```powershell
irm https://installer-release-doctor.sociobot.in/install.ps1 | iex
```

Homebrew, after the tap is published:

```sh
brew install B-Divyesh/installer-release-doctor/installer-release-doctor
```

Scoop, after adding the repository bucket:

```powershell
scoop bucket add installer-release-doctor https://github.com/B-Divyesh/sf-installer-release-doctor
scoop install installer-release-doctor
```

The release also includes `.deb`, `.rpm`, an unsigned `.pkg`, and portable archives. Check `SHA256SUMS` before installing a downloaded file.

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

Exit codes are stable:

- `0`: no blocking findings.
- `1`: one or more blocking findings, or a warning with `--strict`.
- `2`: the command or manifest could not be read.

The manifest schema is shown in [`release-doctor.example.yml`](release-doctor.example.yml). Policy versions are dates because distribution rules change outside this project.

## Evidence format

Set `checks.signature_public_key` to the base64 form of a 32-byte Ed25519 public key. The matching `.sig` file is JSON:

```json
{"algorithm":"ed25519-sha256","signature":"BASE64_SIGNATURE"}
```

The signature covers the artifact's 32 raw SHA-256 bytes. This keeps verification fast for large installers. The checker rejects missing keys, invalid JSON, unsupported algorithms, malformed signatures, and signature mismatches.

CycloneDX SBOMs must include the artifact SHA-256 in `metadata.component.hashes`. SPDX SBOMs must include it in a checksum entry. In-toto JSONL provenance must name the artifact SHA-256 in a statement subject. Direct statements and DSSE envelopes are accepted.

## What v0.1.1 checks

- ZIP, tar, and tar.gz paths, links, individual entry size, and total expanded size.
- Expected binary and companion files inside an archive.
- Ed25519 signatures over the artifact digest.
- CycloneDX or SPDX SBOM structure and artifact binding.
- In-toto provenance structure and artifact binding.
- `SHA256SUMS` entries and artifact hashes.
- Reverse-DNS package identifiers and known architecture names.
- Monotonic upgrade versions.
- Opaque package formats receive a warning to run their native verifier.

The checker does not claim that a channel will accept a release. Native validators and registry review remain the final authority.

## Develop and verify

Requirements: Rust 1.85 or newer and Node.js 22.

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build:site
cargo build --release
```

The static site lands in `dist/site`. The Rust binary lands in `target/release/release-doctor`.

Run one claim test with its recorded command:

```sh
npm test -- --grep @claim:sample-blocker
```

See [`.factory/claims.json`](.factory/claims.json) for all claims and sandbox steps.

## Release

Pushing a `v*` tag runs [the release workflow](.github/workflows/release.yml). GitHub-hosted runners build Linux, macOS, and Windows assets. The workflow publishes checksums, `latest.json`, package installers, portable archives, and a Homebrew formula.

The factory owns publishing credentials. Do not publish registry packages from a development machine.

## Privacy and license

The core checker has no telemetry. The website stores a paid license token only when a buyer supplies one. Read the [privacy notice](https://installer-release-doctor.sociobot.in/privacy) and [terms](https://installer-release-doctor.sociobot.in/terms).

MIT © 2026 Sociobot (Param Factory). See [LICENSE](LICENSE).
