# Installer Release Doctor repair handoff — v0.1.4

- **Work order:** `installer-release-doctor-repair-6`
- **Base verifier report:** `9ba6ccd5be82cc5ed4060af127b353529304e73b` / `.factory/verification-7.md`
- **Repair commits:** `259b231` and `9fb117f`
- **Release:** [v0.1.4](https://github.com/B-Divyesh/sf-installer-release-doctor/releases/tag/v0.1.4), built from `9fb117f543101d86f725c0f5fffaeabeaa33b834`
- **Deployment:** `https://installer-release-doctor.sociobot.in` deployed through Azure Static Web Apps deployment `18d53a9c-b4fb-4127-8398-fcb656aa9c62`.

## Repairs

1. Archive entry validation is now platform-neutral. It normalizes both separator styles before checking entries, and rejects `..`, absolute, drive-qualified, and UNC names. The exact verifier fixture `..\\outside.exe` now produces an `archive-safety` failure on Linux. Public-CLI ZIP, tar, and tar.gz regressions cover POSIX traversal, Windows traversal, drive paths, and UNC paths.
2. Package identifiers now require lowercase reverse-DNS labels: two or more non-empty labels, letter-led, 63 characters or fewer, and only lowercase letters, digits, or interior hyphens. Public-CLI coverage rejects `.`, `foo.`, `.foo`, `com..acme`, and invalid characters, while accepting `in.sociobot.tool`.
3. Upgrade checks now use the `semver` parser and Semantic Version precedence. Regressions cover prerelease-to-prerelease, prerelease-to-final, build metadata, malformed versions, and a maximum-size numeric component. `1.0.0` correctly advances `1.0.0-rc.2`.
4. Cargo package include patterns are anchored at the repository root. `npm ci` no longer causes ignored dependency files to enter the crate. CI runs `cargo package --locked --no-verify` and fails if package contents contain `node_modules`.
5. The demo restores keyboard focus to **Run release check** after its scan completes. A Playwright keyboard regression asserts it.
6. The `archive-safe` claim now states the archive formats and every advertised unsafe-path class it proves. README scope text documents the same contract.

## Verification

- Clean install: `npm ci` — 59 packages, 0 vulnerabilities.
- Local quality gates: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `cargo build --release --locked` passed. `npm test` passed 11 Rust unit tests, 4 public CLI integration tests, 4 Vitest tests, and 80 Playwright desktop/mobile tests.
- Exact new-claim coverage passed through `npm test -- --grep @claim:archive-safe` and `npm test -- --grep @claim:channel-policy-checks`; the complete suite executed every claim tag.
- Release/consumer checks: `cargo package --locked --no-verify` created a 16-file, 22.2 KiB compressed crate with no `node_modules` entries. A clean extracted crate installed with `cargo install --locked --path … --root …`; the installed binary reports `release-doctor 0.1.4`.
- Published artifact check: downloaded `release-doctor-v0.1.4-linux-x86_64.tar.gz` reports `release-doctor 0.1.4` and rejects a ZIP containing literal `..\\outside.exe` with `archive-safety: fail`.
- Published release checks passed for the current 0.1.4 assets, SHA256SUMS, latest.json, Homebrew formula, Scoop manifest, and generated winget 0.1.4 manifests. The Windows ZIP SHA-256 is `632e3ea8f0fc5f4c47f1f92b4701f96f6619f46dce8361eee1898d292632e5e4`; Linux tar SHA-256 is `70fc2de3fb3f3388845da1f7311f9f964776a86fef8e8e4b7b28bc69ef5e04f2`.
- GitHub Actions release run [33242632823](https://github.com/B-Divyesh/sf-installer-release-doctor/actions/runs/33242632823) passed verify, Linux, macOS, Windows, publish, and Homebrew consumer jobs.
- Browser/accessibility: local Playwright covers desktop and 390 px mobile, keyboard, privacy/storage, offline/service-worker update, and Axe across routes. The deployed `verify-url.sh` run passed: 200 response, title, `lang=en`, one h1, main landmark, complete image alt text, labelled buttons, and zero console errors. `npm run test:live` passed 6/6 response-policy and live-identity checks after deployment.
- Live Lighthouse mobile run measured performance 100, accessibility 100, best practices 96, SEO 92; LCP 1,435 ms, TBT 16 ms, CLS 0, and transfer 109,625 bytes.

## Run and release

```sh
npm ci
npm run typecheck && npm run lint && npm test && npm run build
cargo build --release --locked
```

Use `release-doctor demo` for the bundled local sample. The browser demo is `/demo` or `/?demo=1`; it is isolated and resettable.

## Known gaps / operator action

- No product defects are known from this repair run.
- The winget 0.1.4 files are ready under `winget/InstallerReleaseDoctor/0.1.4`; the owner still submits them to `microsoft/winget-pkgs`, as documented.
