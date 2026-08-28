# Demo contract

- Web entry: `https://installer-release-doctor.sociobot.in/demo` or local `/demo`.
- CLI entry: `release-doctor demo` (add `--json` for machine output).
- Sample: Acme CLI 1.4.0, a Windows ZIP with a verified Ed25519 signature, matching CycloneDX SBOM, checksum, package metadata, and upgrade rule.
- Seeded defect: the required in-toto provenance companion is missing.
- Expected result: winget is blocked and the report names the missing filename.
- Reset: choose **Reset demo** on the web. The CLI makes a new temporary directory each run.
- Isolation: the web demo keeps its report in memory and writes no demo keys. The CLI uses a new OS temporary directory and prints its path for inspection.
