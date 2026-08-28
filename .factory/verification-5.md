# Independent verification 5 — FAIL

- **Candidate commit:** `ea5595502ea8cecf58f3e8c3e237286098808448`
- **Branch / URL:** `main` / <https://installer-release-doctor.sociobot.in>
- **Verifier date:** 2026-08-28 UTC
- **Verdict:** **FAIL**

The local checker, demo, website deployment, checksum publication, POSIX installer, accessibility baseline, and performance budget work. The candidate is still not releasable: its published Debian and RPM metadata contain a literal `{VERSION}`, the public CLI binary was built from an older commit and differs from the candidate, the claims manifest omits public promises, and the key mobile repair flow overflows the viewport.

## Release-blocking findings

### High — published Linux packages have invalid version metadata

The public `v0.1.1` release asset `release-doctor-0.1.1-amd64.deb` does not identify itself as version 0.1.1. Its control metadata contains:

```text
Package: release-doctor
Version: {VERSION}
Architecture: amd64
```

`dpkg-deb -f ... Package Version Architecture` exits nonzero with:

```text
'Version' field value '{VERSION}': version number does not start with digit
```

The public RPM contains `release-doctor-{VERSION}-1`, `{VERSION}`, and `{VERSION}-1` in its metadata strings. The cause is present at the candidate commit: `nfpm.yaml` sets `version: "$${VERSION}"`. Checksums prove the downloaded files are intact, but not installable package metadata. Regenerate both packages with `0.1.1`, validate them with native package tools, and replace the release assets.

### High — the public CLI release does not match the candidate

The `v0.1.1` tag resolves to commit `7262672ea438566f662a2f72f690ac5ab87dc29d`, not candidate `ea55955`. The difference is observable in the product's public API:

- Downloaded `v0.1.1` binary help: “No files are uploaded and signing keys are never read.”
- Candidate-built binary help: “Checks use local files and the signature public key recorded in the manifest.”

The release binary SHA-256 is `571725c156f5b7a77c4a43b632501474dd610c7acd4f8a6c8a12a2791b2cc19c`; the locally built candidate binary SHA-256 is `4f22d650b245d08631ea5892fa1f9fd1effee0eb34b675d250146b22614298a3`. Both report version `0.1.1`, so users cannot distinguish them by version. Publish a new version from the accepted candidate and update the site/manifests to it.

### High — `.factory/claims.json` does not list all public claims

All 12 listed claims pass, but the live page and README make additional promises absent from the claims manifest, which is release-blocking under the claims contract. Examples:

- Demo banner: “sample data, nothing is saved.” The `demo-private` claim and tagged test only assert that requests do not leave the origin; they do not list or test persistence.
- README: the POSIX installer verifies the checksum, adds its directory to PATH, and the PowerShell installer verifies, updates PATH, and runs the binary.
- README: the checker validates expected archive files, checksums, package identifiers, architectures, upgrade versions, and opaque-package warnings.
- Landing install state: “Published v0.1.1. SHA256SUMS is included.”
- README privacy: “The core checker has no telemetry” and the website stores no release or account data.

Some installer behavior has untagged regression coverage and this verification observed it working, but the required one-claim/one-tagged-test inventory is incomplete.

## Other defects

### Medium — the demonstrated repair breaks the 390px layout

At `/demo`, the initial state has no horizontal overflow. After expanding **Show repair**—the action the page explicitly asks the user to take—the document becomes **478 CSS px wide in a 390 CSS px viewport**. The long `.intoto.jsonl` filename expands the grid item and the repair text is clipped unless the user scrolls sideways. This fails the required mobile end-to-end state.

### Medium — Intel macOS receives an ARM64 primary download

With an explicit Intel Mac user agent, the detected-platform button is:

```text
Download release-doctor-v0.1.1-darwin-aarch64.pkg
```

The site matches only `darwin` and selects the first matching asset. The release has an x86_64 tarball, but the primary action sends Intel users to the incompatible ARM package. The shell installer detects `uname -m` correctly; the website should expose both architectures or choose safely.

### Medium — the required copy audit is stale

`.factory/copy-audit.md` still inventories removed paid-copy sentences such as “Add company policy checks” and omits the current availability copy. It is not an extraction of the candidate landing page as required.

## Mandatory claims gate — PASS for all listed claims

`.factory/claims.json` exists. Before broader QA, every exact `test` command was run independently from this checkout through the demo entry point. Every command exited 0, and each claim ID appears exactly once as a test tag.

| Claim | Result | Fresh evidence |
| --- | --- | --- |
| `sample-blocker` | PASS | Demo names the missing provenance companion and repair. |
| `demo-private` | PASS | Full demo flow made only three same-origin requests. |
| `offline-demo` | PASS | Service-worker-controlled `/demo` reloaded offline. |
| `cli-local` | PASS | CLI demo completed with HTTP/HTTPS proxies blocked. |
| `json-output` | PASS | JSON parsed with version, policy version, and failure summary. |
| `archive-safe` | PASS | Parent-directory archive entry was rejected. |
| `evidence-validation` | PASS | Valid evidence passed; empty/mismatched evidence failed. |
| `public-key-only` | PASS | Signature passed with public-key-only fixture. |
| `read-only-check` | PASS | Input bytes remained identical. |
| `homebrew-tap` | PASS | Public tap, formula, URLs, and both macOS checksums resolved. |
| `matrix-annotations` | PASS | Markdown matrix and GitHub annotation were produced. |
| `free-core` | PASS | Landing says the core is free and `LICENSE` is MIT. |

## First-read gate — PASS

The live page was opened cold at 1440×900 and 390×844 before interaction.

- **What:** “Check installer releases before upload.”
- **For whom:** “For CLI authors shipping signed releases across package channels without learning every policy.”
- **First action:** visible **Try it with sample data**, beside “See one blocked release and its repair.”

One click opens `/demo`, which immediately shows the Acme CLI release, 11 checks, the winget blocker, persistent demo banner, Reset demo, and Start for real.

## Clean install, tests, build, and consumer — PASS

- `npm ci`: 59 packages installed; audit found 0 vulnerabilities.
- `npm run typecheck`: passed.
- `npm run lint`: passed (`cargo fmt --check`; Clippy with warnings denied).
- `npm test`: passed — 7 Rust tests, 2 Vitest tests, and 46 Playwright tests.
- `npm run build`: passed; `dist/site` produced 12.90 kB JS (4.97 kB gzip) and 9.85 kB CSS (2.79 kB gzip).
- `cargo build --release --locked`: passed.
- `cargo package --locked --allow-dirty --no-verify`: passed; crate size 136.4 KiB.
- Clean consumer: unpacked the crate into `/tmp`, installed with `cargo install --path ... --root ... --locked`, and ran the installed CLI.
- Normal/recovery paths: a complete signed sample with matching SBOM, provenance, and checksum exited 0; the seeded missing-provenance demo exited 1 and named the repair; a nonexistent manifest exited 2 with an actionable message; `demo --json` emitted valid JSON.

## Live web, privacy, accessibility, and performance

- Candidate web identity: local and live JS SHA-256 are both `cb97b49d1af54cffe0976c7a5eba943d778b056e0d1ea64da56b91febe0def50`; CSS hashes are both `33c2c544ad2c92cee1a6cb707d0c38b92d67e5f1cce961fddeaefc662ae023ba`. `sw.js`, both installer scripts, 404 assets, favicon, robots, and sitemap also match byte-for-byte.
- `npm run test:live`: 6/6 passed.
- `/opt/fleet/lib/verify-url.sh`: passed in 633 ms with title, `lang=en`, one h1, main landmark, alt text, named controls, and no normal-load console/page errors.
- Fresh Axe checks: zero serious/critical violations on `/`, `/demo`, `/privacy`, `/terms`, and the 404 at desktop and 390px.
- Keyboard: all demo controls and links were reachable; Space ran the check; Enter expanded the repair; focus used a visible 3px cobalt outline; route navigation focused the new h1; no trap was found.
- Reduced motion: final state appeared in 44 ms and the scan animation was suppressed.
- Touch targets: no visible control under 44×44 CSS px on the tested routes.
- Privacy: the complete demo flow made no off-origin request, set no cookie, and left localStorage empty. A cold landing made only same-origin requests plus the documented GitHub release API request; no analytics, fonts, or third-party scripts loaded.
- Recovery: a failed GitHub API request produced the calm “Downloads are being published” state. Normal routes emitted no console/page errors.
- Service worker: registration was active, cache `release-doctor-v6` existed after update, and `/demo` reloaded with HTTP 200 while `navigator.onLine` was false.
- Headers: HSTS, `nosniff`, strict referrer policy, restrictive Permissions-Policy, and a CSP limited to self plus `api.github.com` are live. Root and service worker use `no-cache`; hashed JS/CSS use one-year immutable caching. Unknown paths return the designed document with HTTP 404.
- Lighthouse mobile: **99 performance / 100 accessibility / 100 best practices / 100 SEO**; FCP 0.9 s, LCP 1.9 s, CLS 0, TBT 80 ms, 110 KiB transferred.
- Static budgets: initial JS 12.90 kB raw, CSS 9.85 kB raw, no web fonts, and mobile hero 27.53 kB.
- Metadata/routes: title, description, canonical, Open Graph/Twitter metadata, 1200×630 OG image, 180×180 touch icon, `robots.txt`, sitemap, `/privacy`, `/terms`, and external links all resolved.

## Release assets and installers

- GitHub `v0.1.1` includes Linux tar, `.deb`, `.rpm`, macOS arm64/x86_64 archives, arm64 `.pkg`, Windows ZIP, `SHA256SUMS`, `latest.json`, and formula.
- Every one of the seven platform/package files matched `SHA256SUMS`; `latest.json` parsed and contained matching URLs and digests.
- The Windows ZIP and Linux tar each contain the expected single binary.
- The live POSIX installer downloaded the public tar, verified its checksum, installed into an isolated destination, and ran version `0.1.1`.
- A fresh default-HOME install added an idempotent profile block; a new login shell found and ran `release-doctor` by name.
- PowerShell execution was not available on this Linux verifier. Its checked-in/live script and regression test cover checksum comparison, persistent user PATH update, current-process PATH update, and post-install execution.

## Applicability notes

- This is a static site plus local CLI. It has no product-owned server endpoint, no unlock call, and no documented request allowance, so a product API 429/`Retry-After` test is not applicable.
- The product has no sign-in, so the Entra authority requirement is not applicable.
- macOS and Windows artifacts are intentionally unsigned and the live page discloses that fact.

## Required next actions

1. Correct the nFPM version interpolation and publish validated `.deb` and `.rpm` assets under a new release version.
2. Publish all downloadable binaries from the accepted commit so version/build identity is unambiguous.
3. Add every public promise to `.factory/claims.json` with one observable tagged test each, then refresh `.factory/copy-audit.md` from current copy.
4. Prevent long repair paths from expanding the mobile results grid.
5. Stop offering ARM64 as the primary download to Intel Mac user agents; provide explicit architecture choices when detection is uncertain.
