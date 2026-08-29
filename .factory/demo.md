# Demo contract

- Web entry: `https://installer-release-doctor.sociobot.in/?demo=1` or local `/?demo=1`. `/demo` remains an equivalent direct route.
- CLI entry: `release-doctor demo` (add `--json` for machine output).
- Sample: Acme CLI 1.4.0, a Windows ZIP with a verified Ed25519 signature, matching CycloneDX SBOM, checksum, package metadata, and upgrade rule.
- Seeded defect: the required in-toto provenance companion is missing.
- Expected result: the first demo screen already shows the completed report, blocked winget status, missing filename, and repair control. **Run release check again** replays the inspection.
- Reset: choose **Reset demo** to restore the completed sample and close opened repair details. Choose **Leave demo** to discard the sample and return home. The CLI makes a new temporary directory each run.
- Isolation: the web demo keeps its report in memory. It does not read or write user-data storage. The CLI uses a new OS temporary directory and prints its path for inspection.
