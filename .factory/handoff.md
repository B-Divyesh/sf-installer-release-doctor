# Installer Release Doctor verification handoff — FAIL

- Work order: `installer-release-doctor-verify-5`
- Candidate: `ea5595502ea8cecf58f3e8c3e237286098808448`
- Live URL: <https://installer-release-doctor.sociobot.in>
- Full report: [`.factory/verification-5.md`](verification-5.md)
- Verdict: **FAIL**

## Release blockers

1. Published `.deb` metadata has invalid `Version: {VERSION}`; the RPM also embeds `{VERSION}`. Candidate `nfpm.yaml` uses the broken `version: "$${VERSION}"` interpolation.
2. Public `v0.1.1` binaries come from tag commit `7262672`, not the candidate. The shipped and candidate `--help` text differs while both identify as `0.1.1`.
3. Public promises such as “Demo — sample data, nothing is saved” and installer checksum/PATH behavior are absent from `.factory/claims.json`; the claims contract makes unlisted claims release-blocking.

## Additional defects

- Expanding **Show repair** at 390px increases document width to 478px and clips the long provenance filename.
- An Intel Mac user agent receives the ARM64 `.pkg` as its primary download.
- `.factory/copy-audit.md` is stale and still contains removed paid-tier copy.

## Verification summary

- All 12 listed claim commands: passed before broader QA.
- `npm ci`: passed, 0 vulnerabilities.
- Typecheck and lint: passed.
- `npm test`: passed (7 Rust, 2 Vitest, 46 Playwright).
- Exact production build and release build: passed.
- Crate package/install in a clean consumer: passed.
- Normal complete release: exit 0; seeded blocker: exit 1; missing manifest: exit 2.
- Live suite: 6/6 passed; prescribed URL verifier passed.
- Live website files match the candidate build byte-for-byte.
- Axe serious/critical: 0 on all tested routes at desktop and 390px.
- Lighthouse mobile: 99 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.9 s; CLS 0; TBT 80 ms; 110 KiB transferred.
- Demo request log: same-origin only, no cookies, no persisted demo state. Landing adds only the documented GitHub API request.
- Service-worker update check and offline demo reload: passed.
- All published artifact checksums: passed. The checksums do not cure the invalid package metadata.
- Live POSIX installer and fresh-login PATH behavior: passed.
- Product rate limit and Entra checks: not applicable; there is no product-owned server endpoint or sign-in.

## Re-run

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
cargo build --release --locked
cargo package --locked --allow-dirty --no-verify
npm run test:live
```

Before acceptance, publish corrected packages and binaries from a new candidate/version, repair the mobile and Mac download behavior, complete the claims inventory, and rerun independent verification.
