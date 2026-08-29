# Independent verification 9 — PASS

- **Candidate:** `0e750a43058e255e27bbe0b7c510a4fe6d1d2b05` (`main`)
- **Live URL:** <https://installer-release-doctor.sociobot.in>
- **Verified:** 2026-08-29 UTC
- **Result:** **PASS** — no release-blocking defects found.

## Cold first read

From a fresh browser context, the first screen says: **“Check installer releases before upload.”** It says it is **for CLI authors** checking archives and release evidence before publishing installers. The first action is the visible **“Try it with sample data”** link, immediately explained as **“See one blocked release and its repair.”** The cold-read and one-click-demo gate passes.

## Mandatory claim gate

`.factory/claims.json` exists and has 24 claims. From the clean candidate checkout, after `npm ci`, I ran every recorded command exactly as written. All passed:

`sample-blocker`, `demo-private`, `demo-ephemeral`, `offline-demo`, `cli-local`, `json-output`, `exit-codes`, `archive-safe`, `archive-layout`, `evidence-validation`, `channel-policy-checks`, `public-key-only`, `read-only-check`, `homebrew-tap`, `windows-manifests`, `posix-installer`, `powershell-installer`, `release-checksums`, `release-identity`, `unsigned-builds`, `no-checkout`, `matrix-annotations`, `website-storage`, and `free-core`.

Each command was `npm test -- --grep @claim:<id>`; no command failed. These cover the seeded blocker/repair, normal-ready and unreadable-input exit paths, malformed evidence and archive-path boundaries, local/no-network CLI use, installers, published checksums, package-channel metadata, and privacy/storage behavior.

## Local and packaged product verification

- `npm ci`: PASS (59 packages; 0 reported vulnerabilities).
- `npm test`: PASS — 11 Rust unit tests, 4 Rust public-CLI integration tests, 4 Vitest tests, and 80 Playwright executions.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS (`cargo fmt --check` and locked Clippy with warnings denied).
- `npm run build`: PASS; production output is `dist/site`. Initial JS is 15,164 bytes raw / 5.60 kB gzip and CSS is 10,902 bytes raw / 3.04 kB gzip, well within the static budget.
- `cargo build --release --locked`: PASS; `release-doctor --version` prints `release-doctor 0.1.4`.
- `release-doctor demo --json`: expected exit 1; reports the bundled missing provenance companion and its repair.
- `cargo package --locked`: PASS (16 files, 81.9 KiB unpacked / 22.2 KiB compressed). I unpacked the crate into a fresh temporary consumer, installed it with `cargo install --path`, and exercised `--help`, `--version`, and `demo --json`. The consumer installed as v0.1.4 and the seeded demo correctly returned exit 1 with one failure.

## Live deployment, accessibility, and privacy

- `npm run test:live`: PASS, 6/6 (desktop and 390 px projects).
- Direct desktop and 390 px Playwright checks found no page/console errors, no horizontal overflow, no targets below 44 px, and no serious or critical Axe findings on home, demo, privacy, terms, or the real 404 page.
- Keyboard testing reached the skip link first, showed a designed cobalt `3px` focus outline with `3px` offset, moved to `main`, activated the demo, expanded its repair, reset it, and left it without a trap. Reduced-motion mode reports the completed result immediately. A controlled offline reload after service-worker control reopened `/demo` successfully.
- The direct demo request log contained only same-origin document, JS, CSS, and bundled image requests. It sent no sample data off-site. Before, during, after reset, and after exit it had no cookies, local/session storage, or IndexedDB entries. The non-demo landing page made only the documented GitHub public-release API request, which is needed to show downloads.
- HTTPS responses include CSP (`connect-src 'self' https://api.github.com`), HSTS, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation denial. Hashed JS/CSS/image assets use `public, max-age=31536000, immutable`; the HTML is `no-cache`; a deliberate missing route returns the designed document with HTTP 404.
- This static CLI product has no product server-side API or sign-in flow, so client request allowance/429 and Entra checks are not applicable.

## Deployment identity and release assets

The live `index.html`, hashed JS, hashed CSS, `sw.js`, `install.sh`, `install.ps1`, and `404.html` SHA-256 values exactly match this candidate's `dist/site` build. The site is therefore deployed from the tested candidate.

The public latest release is `v0.1.4`. Its `latest.json` records tag commit `9fb117f543101d86f725c0f5fffaeabeaa33b834`; that is expected because the candidate changes release verification/workflow, manifests, and documentation, not CLI runtime or site source relative to the tag. The current candidate CI run `33245187026` is successful for `test`, `windows-installer`, and `macos-signatures`. I independently downloaded `release-doctor-v0.1.4-linux-x86_64.tar.gz`: its SHA-256 was `70fc2de3fb3f3388845da1f7311f9f964776a86fef8e8e4b7b28bc69ef5e04f2`, exactly matching `SHA256SUMS`, and its binary prints v0.1.4.

## Defects

None found.

