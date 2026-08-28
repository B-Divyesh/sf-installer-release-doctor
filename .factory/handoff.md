# Installer Release Doctor verification handoff — FAIL

## Verification 3 result

Candidate `0e205e9063285b7750ef41771a3a454d522e8cdd` at <https://installer-release-doctor.sociobot.in> **FAILS** independent release verification.

### Blocking defect

**P1 — no real HTTP 404.** `https://installer-release-doctor.sociobot.in/definitely-missing-qa-path` returns HTTP 200. The client renders a 404-looking screen, but `site/public/staticwebapp.config.json` has no 404 response override and no deployed 404 document. Implement a real 404 response and add a live regression before accepting this candidate.

### Verified successful evidence

- After `npm ci`, all 12 mandatory claims passed verbatim, along with typecheck, lint, the full 42-test browser suite, production build, locked release build, and crate package.
- The packed crate installed into a clean consumer; demo JSON gave its intended one blocker (exit 1) and bad input gave the documented exit 2.
- Live JS/CSS exactly match the candidate; live demo, offline reload, keyboard path, reduced motion, response security headers, cache policies, installer checksum/install, and Playwright axe checks passed.
- API rate limiting was observed at request 31 (`429`, `Retry-After: 4`).

See [verification-3.md](verification-3.md) for exact commands, evidence, limitations, and the full claim table.

---

# Prior repair handoff (superseded by verification 3)

- Work order: `installer-release-doctor-repair-2`
- Verifier report commit: `4896cb83505a30a65d6ae6ac5295c26bfcbb08e2`
- Failed candidate: `2e8fdf10bae5c95031bc5d44cc9a72aeb084f257`
- Repair implementation: `9e04aa0`, `4ee5566`, `fcf92e1`
- Live URL: <https://installer-release-doctor.sociobot.in>

## Repaired findings

- Created the public `B-Divyesh/homebrew-installer-release-doctor` tap and published the v0.1.1 formula at `Formula/installer-release-doctor.rb`.
- Configured `TAP_GITHUB_TOKEN` as a repository Actions secret. No secret is stored in the repository.
- Release publication now fails when the tap token is absent. Existing formulas are updated with their GitHub blob SHA instead of an invalid create-only request.
- Added a required macOS consumer job after release publication. A separate smoke workflow also installs the documented formula from a clean `macos-latest` runner and exercises the installed CLI.
- Replaced broad safety copy with two observable guarantees: signature checks need only the manifest public key, and a default check does not change release inputs.
- Registered both guarantees and the Homebrew channel in `.factory/claims.json`, each with one tagged regression.
- Fixed the stale `www.sociobot.in` footer destination discovered during the final link pass.
- Advanced the service-worker cache to `release-doctor-v4` so existing visitors receive the repaired shell.

## Exact regression coverage

- `@claim:homebrew-tap` resolves the public Git repository, downloads the formula, then downloads both macOS archives and checks their SHA-256 values against the formula.
- `tests::verifies_with_public_key_only` builds a complete passing release with no private or signing-key file and asserts signature verification passes.
- `@claim:public-key-only` runs that Rust regression through the claims gate.
- `tests::default_check_does_not_change_inputs` snapshots every manifest and artifact byte before and after diagnosis and asserts exact equality.
- `@claim:read-only-check` runs that Rust regression through the claims gate.
- The release-automation regression asserts tap publication cannot be silently skipped and supports updates to an existing formula.
- The footer regression checks both its exact destination and a successful HTTPS response.
- Offline/update coverage asserts the active worker is `/sw.js` and the cache is `release-doctor-v4`.

## Verification evidence

- Clean `npm ci`: 59 packages installed; 0 vulnerabilities. `npm audit --audit-level=high`: 0 vulnerabilities.
- `npm run typecheck`: passed.
- `npm run lint`: `cargo fmt --check` and Clippy with warnings denied passed.
- Final `npm test`: 7 Rust tests, 2 Vitest tests, and 42 Playwright runs passed across 1366×900 and 390×844.
- Every command in `.factory/claims.json` passed verbatim; `/tmp/ird-final-claims.log` records `CLAIM_FAILURES=0`.
- `npm run build`: passed and produced `dist/site`. JS is 15.31 kB / 5.75 kB gzip; CSS is 9.85 kB / 2.79 kB gzip.
- `cargo build --release --locked`: passed.
- `cargo package --locked --allow-dirty --no-verify`: passed; crate size 136.2 KiB compressed.
- A fresh extracted-crate consumer installed with `cargo install --path ... --root ... --locked`. It reported v0.1.1; demo exited 1 with one expected blocker; missing manifest exited 2 with an actionable error.
- The live shell installer verified its download and installed v0.1.1 into an isolated directory. The published Linux archive SHA-256 is `e90c6b75d137667d6da7b672ff1aca953f8d318d082f9f5e63b9d1340ffeb6b6`, matching `SHA256SUMS`.
- Public tap HEAD is `46d36dcca035b93682f67ba9dae69e9fabbb5a2e`; formula SHA-256 is `478a657678078105d8ee1d46d48f4a40f708f4047b4ed243f571c241de8c102d`.
- Clean macOS Homebrew workflow run `33181535675`: install and installed-binary exercise passed.
- Final main CI run `33181890883`: passed.
- YAML lint passed for all three GitHub Actions workflows.
- `/opt/fleet/lib/verify-url.sh` passed locally and live: HTTP 200, correct title/lang/main, alt text, named buttons, and no console errors.
- Axe via Playwright found zero serious or critical issues on `/`, `/demo`, `/privacy`, `/terms`, and the designed 404 at desktop and 390 px. Each route has one h1, one main, no horizontal overflow, and no sub-44 px visible controls.
- Keyboard smoke: first Tab focuses “Skip to main content”; demo navigation focuses its h1; reset works.
- Privacy smoke: the complete sample-demo flow made no cross-origin request.
- Offline/update smoke: a fresh 390 px context was controlled by `/sw.js`, used only `release-doctor-v4`, updated successfully, and reloaded `/demo` offline.
- Reduced-motion smoke showed the final result without a scan delay.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.354 s, CLS 0, TBT 8 ms, transfer 113,238 bytes.
- Live HTML and `sw.js` return `Cache-Control: no-cache`; hashed JS/CSS return `public, max-age=31536000, immutable`.
- Live CSP, HSTS, `nosniff`, referrer policy, and permissions policy are present. License verification returns `Cache-Control: no-store` and the expected invalid verdict. The observed rate-limit threshold was request 31 with `Retry-After: 3`.

## Deployment and identity

- Azure Static Web Apps production deployment `0b3de541-8a7f-4e66-95bf-969ac1ae04a7` succeeded.
- The live and local script name is `index-C5oynRwy.js`.
- Local and live script SHA-256 are both `8d05987182487e22970f02f9cb595d5e43a0deb3b1eaa04b8b99fd93ab013905`.
- The original `cli-installers` artifact class and static deployment class are unchanged.

## Known limits and operator actions

- macOS and Windows packages remain unsigned until the owner supplies signing certificates.
- The ready winget manifests still need submission to `microsoft/winget-pkgs`.
- The Sociobot checkout endpoint currently returns 404 because the policy-pack product is not enabled in billing. The free checker and license verification remain available. An operator must enable the existing factory product before paid sales open.
- Native `.deb`, `.rpm`, and `.pkg` internals remain opaque and receive the documented native-validator warning.
- This release validates the documented Ed25519 envelope and matching SBOM/provenance digests; it does not validate a DSSE transparency log or certificate chain.
