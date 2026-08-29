# Independent verification 7 — FAIL

- **Candidate:** `9cff7cabbf3398e6d46b9d58ab6a0d58d097031b`
- **Live URL:** <https://installer-release-doctor.sociobot.in>
- **Verified:** 2026-08-29 UTC
- **Verdict:** **FAIL** — the shipped checker reports a Windows-style traversal entry as safe, accepts malformed package identifiers, and rejects a valid prerelease-to-final upgrade.

## Release-blocking findings

### High — archive safety misses Windows separators when run on Linux

This violates the researched constraint to validate untrusted archives safely and contradicts claim `archive-safe`.

I created a ZIP whose only entry is the literal `..\outside.exe` and ran both the candidate release build and the binary installed from the public v0.1.3 release on Linux. Both emitted:

```json
{
  "archive_safety": [{
    "level": "pass",
    "message": "Archive has 1 safe entries."
  }]
}
```

The process happened to exit 1 only because the separate archive-layout check could not find the requested binary. The safety check itself passed. `clean_entry` uses the host platform's `std::path::Path` components (`src/main.rs:975`), so a Linux run does not treat backslashes or Windows prefixes as separators. This is especially relevant because the product exists to check Windows packages alongside Linux and macOS packages.

Repair: normalize and validate both `/` and `\` independently of the host OS; reject drive-qualified and UNC paths; add public-CLI ZIP and tar regressions for Windows separators.

### High — malformed package identifiers are reported as valid

This contradicts claim `channel-policy-checks` and can let a channel-blocking metadata error pass preflight. The public CLI returned exit 0 and a `package-id` pass for each of these identifiers:

```text
.
foo.
.foo
com..acme
```

The implementation only checks that the value contains a dot and no space (`src/main.rs:480`). These are not reverse-DNS identifiers.

Repair: validate non-empty dot-separated labels and the allowed label grammar for the declared channel; add boundary tests for empty, leading/trailing-dot, repeated-dot, invalid-character, and valid identifiers.

### Medium — a stable version is treated as older than its prerelease

This contradicts the advertised upgrade-path check. For current version `1.0.0` and previous version `1.0.0-rc.2`, the candidate and public binaries returned exit 1:

```text
Release 1.0.0 does not advance previous version 1.0.0-rc.2.
```

Under Semantic Versioning, `1.0.0` is newer than `1.0.0-rc.2`. The custom comparator splits on dots and hyphens and converts non-numeric pieces to zero (`src/main.rs:1067`), which does not implement prerelease precedence.

Repair: use a tested version parser/comparator or document and validate a narrower version grammar. Add prerelease-to-prerelease, prerelease-to-final, build-metadata, malformed, and large-component cases.

### Low — the Cargo package includes ignored `node_modules` files

After the required `npm ci`, `cargo package --locked --no-verify` refused to package without `--allow-dirty`, listing 102 ignored dependency files as uncommitted package content. With `--allow-dirty`, the crate contained 118 files / 137.1 KiB compressed, including those 102 `node_modules/**/LICENSE` and `README.md` files. The broad basename patterns in `Cargo.toml:9-17` match recursively. The crate still installed and ran in a clean consumer.

Repair: anchor root file includes or explicitly exclude `node_modules`, then assert package contents in CI.

### Low — running the demo drops keyboard focus

The run button is keyboard-operable and its polite live region announces completion. However, after Enter activates **Run release check**, the focused button is temporarily disabled and focus falls to `BODY`; it is not restored when the button is enabled. A keyboard user must tab back through page controls to reach **Show repair**.

Repair: retain or restore focus to the run button/status, or move focus to the failed result after announcing completion.

## First-read gate

**PASS.** In fresh desktop (1366 × 768) and mobile (390 × 844) contexts, the first viewport says:

- What: **Check installer releases before upload**.
- For whom: **CLI authors checking archives and release evidence before publishing installers.**
- First action: **Try it with sample data**, followed by **See one blocked release and its repair.**

The action opens the sample in one keyboard-operable click. The persistent banner says **Demo — sample data, nothing is saved**, with **Reset demo** and **Leave demo**.

## Claims gate

`.factory/claims.json` exists with 24 unique entries. After `npm ci`, I ran every listed `test` command verbatim and independently. All 24 returned exit 0 in both configured Playwright projects:

`sample-blocker`, `demo-private`, `demo-ephemeral`, `offline-demo`, `cli-local`, `json-output`, `exit-codes`, `archive-safe`, `archive-layout`, `evidence-validation`, `channel-policy-checks`, `public-key-only`, `read-only-check`, `homebrew-tap`, `windows-manifests`, `posix-installer`, `powershell-installer`, `release-checksums`, `release-identity`, `unsigned-builds`, `no-checkout`, `matrix-annotations`, `website-storage`, and `free-core`.

An initial pre-install invocation from the untouched checkout stopped at `vitest: not found`; no tagged claim assertion executed. The required clean setup (`npm ci`: 59 packages, 0 audit vulnerabilities) resolved that prerequisite. The result above is the clean-installed claims result.

Passing claim tests do not rescue the candidate: independent boundary cases prove that the public `archive-safe` and `channel-policy-checks` claims are false. The tests cover POSIX `../` traversal and one space-containing identifier but omit the failing cases above.

## Local build and product flow

- `npm run typecheck`: PASS.
- `npm run lint`: PASS (`cargo fmt --check`; Clippy with warnings denied).
- `npm test`: PASS — 12 Rust, 4 Vitest, and 78 Playwright executions.
- `npm run build`: PASS; `dist/site` produced.
- `cargo build --release --locked`: PASS.
- `cargo package --locked --allow-dirty --no-verify`: completed with the package-content defect above.
- Clean consumer: extracted the `.crate`, installed with `cargo install --locked --path ... --root ...`, and ran `release-doctor 0.1.3`.
- Normal/recovery flow: bundled demo exited 1 with one missing provenance companion; adding the named in-toto file and rerunning returned exit 0, one ready channel, valid Ed25519/SBOM/provenance results, and a ready Markdown matrix.
- Invalid input: a missing manifest returned exit 2 and named `--manifest` as the recovery action.
- Public POSIX installer: installed to an isolated directory, verified the published checksum, and ran `release-doctor 0.1.3`.
- Candidate CI run [33239116750](https://github.com/B-Divyesh/sf-installer-release-doctor/actions/runs/33239116750): PASS for Linux tests, Windows installer success/rollback plus Authenticode inspection, and macOS signature inspection.

## Live site, privacy, accessibility, and performance

- `npm run test:live`: PASS, 6/6.
- `/opt/fleet/lib/verify-url.sh`: PASS after providing its required evidence directory; HTTP 200, title, `lang=en`, one h1, main landmark, complete alt text, named buttons, and zero console errors.
- Independent Axe scans: zero violations on `/`, `/demo`, `/privacy`, `/terms`, and the designed 404 at 1366 px and 390 px.
- Desktop/mobile: no horizontal overflow; expanded 390 px repair view had `scrollWidth === clientWidth === 390`; visible controls were at least 44 × 44 CSS px.
- Keyboard: skip link, header, sample action, demo action, reset/leave, disclosure, and footer were reachable. Focus rings were 3 px cobalt. Route entry focused the demo h1 and announced it. The focus-loss defect after running is recorded above.
- Reduced motion: the demo completed in about 80 ms instead of the normal 700 ms scan.
- Demo privacy: only same-origin HTML, JS, and CSS requests; no cookies, localStorage, sessionStorage, or IndexedDB before use or after reset.
- Landing privacy: one request to the documented GitHub releases API; one `release-cache:v2` localStorage entry; reload in the same context made no second GitHub request.
- Offline/update: service worker controlled `/demo`, `registration.update()` completed, cache `release-doctor-v9` existed, and offline reload returned 200 with the demo intact.
- Console/page errors: none on normal routes or flows. The intentional HTTP 404 naturally creates Chromium's failed-document console message.
- Headers: CSP limits connections to self and `https://api.github.com`; HSTS, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation denial were present. HTML and `sw.js` revalidate; hashed JS/CSS use `public, max-age=31536000, immutable`.
- Bundle: JS 15,154 bytes raw / 5.59 kB gzip; CSS 10,902 bytes raw / 3.04 kB gzip; total Lighthouse transfer 113,188 bytes. No web fonts are loaded.
- Fresh mobile Lighthouse: performance 99, accessibility 100, best practices 100, SEO 100; FCP 847 ms, LCP 1,696 ms, TBT 115 ms, CLS 0.
- Links: every landing-page link tested 200, including the selected Linux asset and Param Factory destination.

## Deployment and release identity

Fresh local and live bytes matched exactly:

| Resource | SHA-256 |
|---|---|
| `index.html` | `030e02f819f921b65925865e37e0751a6888ea6af4216430c54d7c4adefa7fa4` |
| `index-D-QdyTs3.js` | `3c537f2a7056c23e7f19a0bf4b6113ec3141f5025fd5f783f538d0bea135fc30` |
| `index-52zNTPoZ.css` | `5fc594575014a45669aa6360eb730d013d61ecdf63e62b2a330f8265cfe477f8` |
| `sw.js` | `3049bca01a879e537b1b9c374f34ef359474ca9523b31ed78d96050d04572b4d` |
| `install.sh` | `bf94149e4f68f61a2979db0e0e31726390cfd17f6cd58e10f3adeab025a22336` |
| `install.ps1` | `6b6b94a03a7cda66608dce01af92821898f6e35f338922aac9f1a82708d5d6ff` |
| `404.html` | `23bcb5f2a102d80f877ecb826141b539b61191c4f3a82c07600cbae00e52bdfe` |

The latest GitHub release is v0.1.3. It contains Linux, Windows, two macOS archives, `.deb`, `.rpm`, `.pkg`, Homebrew formula, `SHA256SUMS`, and `latest.json`. The Linux archive digest is `72e6bc9dba49e0ab75ad0f61f28652662bae8738dab10dc88505b34a1e5ae5eb`, matching both manifests. `latest.json` identifies source commit `78852b7fe04dc16a4361a0ceb284ae839ef952af`; the candidate has no CLI source changes after that tag, and the public binary reproduced the findings above.

## Not applicable

The product is a static site plus local CLI. It has no product backend, unlock endpoint, paid checkout, or sign-in. API concurrency/persistence, 429 allowance, and Microsoft Entra authority checks therefore do not apply.
