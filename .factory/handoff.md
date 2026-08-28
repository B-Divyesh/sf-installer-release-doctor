# Installer Release Doctor v0.1.1 repair handoff

- Repair work order: `installer-release-doctor-repair-1`
- Verifier report: `0b61e89e53825cb887ca7e18e520241712356d52`
- Failed candidate: `134e2c12c151d787344fa129d2d3a0e0a7675c72`

## What changed

- Replaced companion-file presence checks with content verification.
- `.sig` is now a JSON Ed25519 signature over the artifact's raw SHA-256 digest. The manifest supplies the base64 public key.
- CycloneDX and SPDX SBOMs must have required document fields and include the inspected artifact's SHA-256.
- Direct and DSSE-wrapped in-toto statements must be valid JSONL and bind a subject to the artifact's SHA-256.
- Empty, malformed, mismatched, unsupported, and unverifiable evidence blocks the channel with a repair message.
- Added a valid signed demo artifact and matching CycloneDX fixture. Its missing provenance remains the demo's single blocker.
- Stopped focusing the h1 during the initial render. The first Tab now reaches the skip link. Client-side route changes still focus and announce the new h1.
- Added Azure Static Web Apps route headers: one-year immutable caching for `/assets/*`, and revalidation for `index.html` and `sw.js`.
- Bumped the service-worker cache to `release-doctor-v3`.
- Added TypeScript and Rust lint gates to local and GitHub CI.
- Bumped the CLI and site to v0.1.1 without changing the artifact or deployment class.

## Exact regression coverage

- `tests::rejects_empty_evidence_companions` recreates the verifier's three zero-byte files. It asserts three failures and zero ready channels.
- `tests::verifies_release_evidence` proves valid evidence passes, then proves bad signature bytes and wrong SBOM/provenance digests fail.
- `@claim:evidence-validation` exposes those checks through the claims gate.
- The keyboard test asserts the cold-load sequence starts with the skip link and wordmark. It also asserts SPA navigation focuses the demo h1.
- The deployment-policy test reads the built SWA configuration and asserts the exact immutable and revalidation directives.
- Browser tests run at 1366×900 and 390×844. They cover axe, console errors, overflow, keyboard use, 44 px targets, reduced motion, privacy, offline reload, and service-worker update.

## Local verification

- `npm ci`: 59 packages installed; 0 vulnerabilities.
- `npm run typecheck`: passed.
- `npm run lint`: `cargo fmt --check` and Clippy with warnings denied passed.
- `npm test`: 5 Rust tests, 2 Vitest tests, and 32 Playwright project runs passed across desktop and mobile.
- Every command in `.factory/claims.json` passed verbatim from a fresh browser context.
- The independent zero-byte reproduction now exits 1 with `{channels:1, passed:0, failures:3}`. Signature, SBOM, and provenance each report an empty-file failure.
- `cargo build --release --locked`: passed.
- `cargo package --allow-dirty --no-verify`: passed; 135.9 KiB compressed crate.
- Fresh extracted-crate consumer: `cargo install --path ... --root ... --locked` passed. The installed binary reports `release-doctor 0.1.1`; its demo exits 1 with exactly one missing-provenance failure.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `sh -n site/public/install.sh`: passed. PowerShell was not installed in the repair container, so the existing PowerShell installer receives its platform test in GitHub Actions.
- Local `/opt/fleet/lib/verify-url.sh`: HTTP 200, no console errors, title and `lang=en`, one h1, main landmark, no missing alt text, and no unnamed buttons.
- Local mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.57 s, CLS 0, TBT 47 ms, 113,566 bytes transferred.
- Production bundles: JS 15.32 KiB / 5.76 KiB gzip; CSS 9.85 KiB / 2.79 KiB gzip. Mobile hero is 28 KiB.

## Release and deployment

The v0.1.1 GitHub release and static production deployment are completed after the repair commit is pushed. Their run IDs, checksums, live headers, and asset identity are recorded here in the final handoff update.

## Known limits

- Native `.deb`, `.rpm`, and `.pkg` internals remain opaque and receive the existing native-validator warning.
- The accepted detached signature format is the documented `ed25519-sha256` JSON envelope. Other signature formats fail closed.
- DSSE envelopes require a non-empty DSSE signature and a valid matching statement. This release does not validate a DSSE transparency log or certificate chain.
- Channel policy `2026-08-01` remains the first policy set. A passing report reduces known blockers but cannot guarantee registry acceptance.

## Needs operator action

- macOS and Windows packages remain unsigned. Signing needs the owner's Apple installer and Windows Authenticode certificates.
- Submit the v0.1.1 winget manifests to `microsoft/winget-pkgs` after release hashes are recorded.
- Register the paid policy-pack product if it is not already registered. No payment-provider secret is stored here.
