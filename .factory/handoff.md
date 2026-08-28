# Installer Release Doctor v0.1.0 handoff — **FAIL (independent verification)**

> 2026-08-28 independent verifier result for candidate
> `134e2c12c151d787344fa129d2d3a0e0a7675c72`: **FAIL**. See
> [`.factory/verification.md`](verification.md) for exact evidence. No product
> code was changed by verification.
>
> Release-blocking defect: the CLI treats zero-byte `.sig`, `.sbom.json`, and
> `.intoto.jsonl` companions as valid and reports the release as passing. It
> must verify their contents or stop representing them as passed evidence.
>
> Additional required repairs: restore the initial Tab path to the skip link
> (do not autofocus the h1 on cold load) and configure immutable caching for
> hashed deployed assets. The full local suite, claims, package install,
> live demo, accessibility checks, release checksum, and live installer were
> otherwise verified as recorded in the verification report.

## What was built

- A Rust single-binary CLI named `release-doctor`.
- YAML and JSON manifests with versioned policy dates.
- Safe ZIP, tar, and tar.gz inspection with traversal, link, per-entry size, and expanded-size defenses.
- Checks for binary layout, required files, detached signatures, SBOMs, provenance, checksums, package identifiers, architectures, and upgrade versions.
- Text and JSON output, stable exit codes, strict warnings, GitHub Actions annotations, and Markdown channel matrices.
- A bundled `release-doctor demo` fixture in a new temporary workspace. Its missing provenance file proves the failure and repair path.
- A responsive static site with a one-click isolated demo, empty download state, error-safe GitHub release lookup, keyboard paths, reduced motion, offline shell, privacy, terms, and a 404 route.
- A $49 one-time policy-pack offer using the Sociobot checkout, license return storage, daily verification cache, and paste-to-restore flow.
- Checksum-verifying shell and PowerShell installers.
- A tag-driven GitHub Actions release matrix for a static Linux x64 binary, macOS arm64/x64 archives, Windows ZIP, `.deb`, `.rpm`, unsigned `.pkg`, `SHA256SUMS`, `latest.json`, and a generated Homebrew formula.
- Scoop and winget manifests ready for their post-release SHA-256 values.

## How to run

```sh
npm ci
npm test
npm run build:site
cargo build --release --locked
cargo run -- demo
```

The deploy root is `dist/site`, with `index.html` at that root.

## Verification completed

- `npm test`: passed, including 3 Rust tests, 2 unit tests, 8 claim/accessibility/keyboard/license browser tests (11 browser tests total).
- `cargo build --release --locked`: passed.
- `cargo package --allow-dirty --no-verify`: passed; 130.7 KiB compressed crate.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `sh -n site/public/install.sh`: passed.
- `/opt/fleet/lib/verify-url.sh`: 200 response, no console errors, one h1, `lang=en`, main landmark, no missing alt text, no unnamed buttons.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse lab metrics: LCP 2.0 s, CLS 0, TBT 20 ms.
- First-load bundles: 5.74 KiB JS gzip and 2.75 KiB CSS gzip.
- Responsive hero: 27 KiB at 640 px; large hero: 97 KiB; Open Graph image: 84 KiB.
- Visual review completed at 1366 px and 390 px.
- Every `.factory/claims.json` test passed from the documented sandbox.
- GitHub Actions release run `33168442516`: passed across verify, Linux, macOS, Windows, and publish jobs.
- GitHub Release `v0.1.0`: published 7 platform/package artifacts plus `SHA256SUMS`, `latest.json`, and the Homebrew formula.
- Downloaded `release-doctor-v0.1.0-linux-x86_64.tar.gz`: published SHA-256 verified successfully and the archive contains `release-doctor`.
- Scoop and winget manifests now contain the published Windows ZIP SHA-256.

## Artwork provenance

The final raster assets are `site/public/assets/release-inspection.webp`, its 640 px derivative, and `og-release-doctor.webp`. They were generated and edited with `/opt/fleet/lib/gen-image.sh` using the prompts recorded in `.factory/design.md`. The edit removed unintended platform marks and replaced them with abstract package symbols.

## Known limits

- v0.1 validates signature, SBOM, and provenance companion presence. It does not perform cryptographic signature verification.
- `.deb`, `.rpm`, `.pkg`, and `.msi` internals are treated as opaque files. The report tells users to run each format's native validator in CI.
- Channel policy `2026-08-01` is the first policy set. Distribution rules can change after that date.
- A passing report reduces known blockers but cannot guarantee registry acceptance.

## Needs operator action

- Create `B-Divyesh/homebrew-installer-release-doctor` if it does not exist. Add `TAP_GITHUB_TOKEN` to publish the generated formula automatically.
- Submit the ready winget manifests to `microsoft/winget-pkgs`.
- Register the paid product in the Sociobot billing system. The site intentionally contains no hardcoded billing product ID beyond the product slug.
- macOS and Windows packages are unsigned. Signing later requires the owner's Apple installer certificate and Windows Authenticode certificate. Until then, keep the unsigned notice visible.
