# Changelog

## Unreleased

## 0.1.2 — 2026-08-29

- Publish Linux packages with validated 0.1.2 package metadata.
- Publish all release binaries from the repaired source commit.
- Choose Intel and Apple silicon downloads explicitly on macOS.
- Keep expanded repair paths inside a 390 px viewport.
- Cover every public product claim with a tagged regression test.

- Publish the documented Homebrew tap and verify it on a clean macOS runner.
- Fail releases when the tap cannot be updated, and update existing formulas safely.
- Add claim tests for public-key-only verification and read-only checks.

## 0.1.1 — 2026-08-28

- Verify Ed25519 signatures instead of checking only for a `.sig` file.
- Validate CycloneDX or SPDX SBOMs and bind them to the artifact digest.
- Validate in-toto provenance statements and bind them to the artifact digest.
- Restore the skip link as the first cold-load keyboard target.
- Cache content-hashed site assets for one immutable year.

## 0.1.0 — 2026-08-28

- Add local ZIP and tar-family safety checks.
- Add signature, SBOM, provenance, checksum, metadata, and upgrade checks.
- Add text, JSON, GitHub annotation, and Markdown matrix output.
- Add a temporary-directory CLI demo with one seeded defect.
- Add the static product site, offline browser demo, and paid policy-pack license flow.
- Add cross-platform release packaging and checksum-verifying installers.
