use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use clap::{Parser, Subcommand, ValueEnum};
use ed25519_dalek::{Signature, VerifyingKey};
use flate2::read::GzDecoder;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::BTreeMap,
    fs,
    io::{self, Read},
    path::{Component, Path, PathBuf},
    process::ExitCode,
};

const VERSION: &str = env!("CARGO_PKG_VERSION");
const MAX_ENTRY_BYTES: u64 = 512 * 1024 * 1024;
const MAX_TOTAL_BYTES: u64 = 2 * 1024 * 1024 * 1024;

#[derive(Parser)]
#[command(
    name = "release-doctor",
    version,
    about = "Check installer artifacts before release channels reject them.",
    long_about = "Inspect built release artifacts against a versioned channel manifest. Checks use local files and the signature public key recorded in the manifest."
)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Check a release directory using a manifest.
    Check {
        /// YAML or JSON channel manifest.
        #[arg(short, long, default_value = "release-doctor.yml")]
        manifest: PathBuf,
        /// Directory containing built artifacts.
        #[arg(short, long, default_value = "dist/release")]
        artifacts: PathBuf,
        /// Machine-readable output.
        #[arg(long, value_enum, default_value_t = Format::Text)]
        format: Format,
        /// Emit machine-readable JSON (shorthand for --format json).
        #[arg(long, default_value_t = false)]
        json: bool,
        /// Write a Markdown channel matrix to this path.
        #[arg(long)]
        matrix: Option<PathBuf>,
        /// Emit GitHub Actions workflow commands.
        #[arg(long, default_value_t = false)]
        github: bool,
        /// Treat warnings as release-blocking failures.
        #[arg(long, default_value_t = false)]
        strict: bool,
    },
    /// Run the checker on bundled sample data in a temporary directory.
    Demo {
        /// Machine-readable output.
        #[arg(long, value_enum, default_value_t = Format::Text)]
        format: Format,
        /// Emit machine-readable JSON (shorthand for --format json).
        #[arg(long, default_value_t = false)]
        json: bool,
    },
}

#[derive(Clone, Copy, ValueEnum)]
enum Format {
    Text,
    Json,
}

#[derive(Debug, Deserialize)]
struct Manifest {
    #[serde(default = "default_policy")]
    policy_version: String,
    product: Product,
    #[serde(default)]
    checks: Checks,
    channels: Vec<Channel>,
}
fn default_policy() -> String {
    "2026-08-01".into()
}

#[derive(Debug, Deserialize)]
struct Product {
    name: String,
    version: String,
    binary: String,
}
#[derive(Debug, Default, Deserialize)]
struct Checks {
    #[serde(default)]
    require_signature: bool,
    /// Base64-encoded Ed25519 public key used to verify `.sig` companions.
    signature_public_key: Option<String>,
    #[serde(default)]
    require_sbom: bool,
    #[serde(default)]
    require_provenance: bool,
    #[serde(default)]
    require_checksums: bool,
}
#[derive(Debug, Deserialize)]
struct Channel {
    name: String,
    artifact: String,
    #[serde(default)]
    format: String,
    #[serde(default)]
    required_files: Vec<String>,
    #[serde(default)]
    package: PackageRules,
    #[serde(default)]
    upgrade: UpgradeRules,
}
#[derive(Debug, Default, Deserialize)]
struct PackageRules {
    identifier: Option<String>,
    architecture: Option<String>,
}
#[derive(Debug, Default, Deserialize)]
struct UpgradeRules {
    previous_version: Option<String>,
    #[serde(default)]
    allow_downgrade: bool,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "lowercase")]
enum Level {
    Pass,
    Warning,
    Fail,
}
#[derive(Debug, Serialize)]
struct Finding {
    channel: String,
    check: String,
    level: Level,
    message: String,
    repair: Option<String>,
}
#[derive(Debug, Serialize)]
struct Report {
    version: String,
    policy_version: String,
    product: String,
    release: String,
    summary: Summary,
    findings: Vec<Finding>,
}
#[derive(Debug, Serialize)]
struct Summary {
    channels: usize,
    passed: usize,
    warnings: usize,
    failures: usize,
}

#[derive(Debug, Deserialize)]
struct SignatureEnvelope {
    algorithm: String,
    signature: String,
}

fn main() -> ExitCode {
    match run() {
        Ok(code) => ExitCode::from(code),
        Err(message) => {
            eprintln!("release-doctor: {message}");
            ExitCode::from(2)
        }
    }
}

fn run() -> Result<u8, String> {
    match Cli::parse().command {
        Command::Check {
            manifest,
            artifacts,
            format,
            json,
            matrix,
            github,
            strict,
        } => {
            let report = diagnose(&manifest, &artifacts)?;
            render(&report, if json { Format::Json } else { format }, github);
            if let Some(path) = matrix {
                write_matrix(&report, &path)?;
            }
            Ok(
                if report.summary.failures > 0 || (strict && report.summary.warnings > 0) {
                    1
                } else {
                    0
                },
            )
        }
        Command::Demo { format, json } => {
            let temp = tempfile::Builder::new()
                .prefix("release-doctor-demo-")
                .tempdir()
                .map_err(|e| e.to_string())?;
            let workspace = temp.keep();
            seed_demo(&workspace)?;
            let report = diagnose(
                &workspace.join("release-doctor.yml"),
                &workspace.join("artifacts"),
            )?;
            render(&report, if json { Format::Json } else { format }, false);
            eprintln!("Demo workspace: {}", workspace.display());
            eprintln!("Remove this temporary directory when you finish inspecting it.");
            Ok(if report.summary.failures > 0 { 1 } else { 0 })
        }
    }
}

fn diagnose(manifest_path: &Path, artifacts: &Path) -> Result<Report, String> {
    if !manifest_path.is_file() {
        return Err(format!(
            "manifest not found at {}. Pass --manifest with a YAML or JSON file.",
            manifest_path.display()
        ));
    }
    if !artifacts.is_dir() {
        return Err(format!(
            "artifact directory not found at {}. Build or copy artifacts there first.",
            artifacts.display()
        ));
    }
    let raw = fs::read_to_string(manifest_path)
        .map_err(|e| format!("could not read {}: {e}", manifest_path.display()))?;
    let ext = manifest_path
        .extension()
        .and_then(|x| x.to_str())
        .unwrap_or("");
    let manifest: Manifest = if ext == "json" {
        serde_json::from_str(&raw).map_err(|e| format!("invalid JSON manifest: {e}"))?
    } else {
        serde_yaml::from_str(&raw).map_err(|e| format!("invalid YAML manifest: {e}"))?
    };
    validate_manifest(&manifest)?;
    let checksums = load_checksums(artifacts.join("SHA256SUMS"));
    let mut findings = Vec::new();
    for channel in &manifest.channels {
        inspect_channel(&manifest, channel, artifacts, &checksums, &mut findings);
    }
    let failures = findings.iter().filter(|f| f.level == Level::Fail).count();
    let warnings = findings
        .iter()
        .filter(|f| f.level == Level::Warning)
        .count();
    let passed_channels = manifest
        .channels
        .iter()
        .filter(|c| {
            !findings
                .iter()
                .any(|f| f.channel == c.name && f.level == Level::Fail)
        })
        .count();
    Ok(Report {
        version: VERSION.into(),
        policy_version: manifest.policy_version,
        product: manifest.product.name,
        release: manifest.product.version,
        summary: Summary {
            channels: manifest.channels.len(),
            passed: passed_channels,
            warnings,
            failures,
        },
        findings,
    })
}

fn validate_manifest(m: &Manifest) -> Result<(), String> {
    if m.product.name.trim().is_empty()
        || m.product.version.trim().is_empty()
        || m.product.binary.trim().is_empty()
    {
        return Err("product name, version, and binary are required".into());
    }
    if m.channels.is_empty() {
        return Err("manifest has no channels. Add at least one channel entry.".into());
    }
    if m.channels
        .iter()
        .any(|c| c.name.trim().is_empty() || c.artifact.trim().is_empty())
    {
        return Err("each channel needs a name and artifact".into());
    }
    Ok(())
}

fn add(
    out: &mut Vec<Finding>,
    c: &Channel,
    check: &str,
    level: Level,
    message: impl Into<String>,
    repair: Option<&str>,
) {
    out.push(Finding {
        channel: c.name.clone(),
        check: check.into(),
        level,
        message: message.into(),
        repair: repair.map(str::to_string),
    });
}

fn inspect_channel(
    m: &Manifest,
    c: &Channel,
    root: &Path,
    sums: &BTreeMap<String, String>,
    out: &mut Vec<Finding>,
) {
    let artifact = safe_join(root, &c.artifact);
    let Some(path) = artifact else {
        add(
            out,
            c,
            "artifact",
            Level::Fail,
            "Artifact path leaves the release directory.",
            Some("Use a relative artifact filename without '..'."),
        );
        return;
    };
    if !path.is_file() {
        add(
            out,
            c,
            "artifact",
            Level::Fail,
            format!("Missing artifact: {}.", c.artifact),
            Some("Build this artifact or update the channel manifest."),
        );
        return;
    }
    add(
        out,
        c,
        "artifact",
        Level::Pass,
        format!("Found {}.", c.artifact),
        None,
    );
    match archive_entries(&path, &c.format) {
        Ok(Some(entries)) => {
            add(
                out,
                c,
                "archive-safety",
                Level::Pass,
                format!("Archive has {} safe entries.", entries.len()),
                None,
            );
            let binary_ok = entries.iter().any(|e| {
                e == &m.product.binary
                    || e.ends_with(&format!("/{}", m.product.binary))
                    || e.ends_with(&format!("/{}.exe", m.product.binary))
            });
            if binary_ok {
                add(
                    out,
                    c,
                    "archive-layout",
                    Level::Pass,
                    format!("Archive contains {}.", m.product.binary),
                    None,
                )
            } else {
                add(
                    out,
                    c,
                    "archive-layout",
                    Level::Fail,
                    format!("Archive does not contain {}.", m.product.binary),
                    Some("Place the binary at the archive root or one directory below it."),
                )
            }
            for required in &c.required_files {
                if entries
                    .iter()
                    .any(|e| e == required || e.ends_with(&format!("/{required}")))
                {
                    add(
                        out,
                        c,
                        "required-file",
                        Level::Pass,
                        format!("Archive contains {required}."),
                        None,
                    )
                } else {
                    add(
                        out,
                        c,
                        "required-file",
                        Level::Fail,
                        format!("Archive is missing {required}."),
                        Some("Add the required file before packaging."),
                    )
                }
            }
        }
        Ok(None) => add(
            out,
            c,
            "archive-safety",
            Level::Warning,
            "This package format is checked as an opaque file.",
            Some("Run the native package verifier in CI as a second check."),
        ),
        Err(e) => add(
            out,
            c,
            "archive-safety",
            Level::Fail,
            e,
            Some("Rebuild the archive without absolute paths, '..', links, or oversized entries."),
        ),
    }
    inspect_signature(
        c,
        root,
        &path,
        m.checks.require_signature,
        m.checks.signature_public_key.as_deref(),
        out,
    );
    inspect_sbom(c, root, &path, m.checks.require_sbom, out);
    inspect_provenance(c, root, &path, m.checks.require_provenance, out);
    if m.checks.require_checksums {
        match sums.get(&c.artifact) {
            None => add(
                out,
                c,
                "checksum",
                Level::Fail,
                "SHA256SUMS has no entry for this artifact.",
                Some("Regenerate SHA256SUMS after building every artifact."),
            ),
            Some(expected) => match sha256(&path) {
                Ok(actual) if &actual == expected => add(
                    out,
                    c,
                    "checksum",
                    Level::Pass,
                    "SHA-256 matches SHA256SUMS.",
                    None,
                ),
                Ok(_) => add(
                    out,
                    c,
                    "checksum",
                    Level::Fail,
                    "SHA-256 does not match SHA256SUMS.",
                    Some("Rebuild SHA256SUMS from the final artifact."),
                ),
                Err(e) => add(
                    out,
                    c,
                    "checksum",
                    Level::Fail,
                    e,
                    Some("Check file permissions and retry."),
                ),
            },
        }
    }
    if let Some(id) = &c.package.identifier {
        if id.contains('.') && !id.contains(' ') {
            add(
                out,
                c,
                "package-id",
                Level::Pass,
                format!("Package identifier is {id}."),
                None,
            )
        } else {
            add(
                out,
                c,
                "package-id",
                Level::Fail,
                format!("Package identifier '{id}' is not reverse-DNS form."),
                Some("Use an identifier such as in.sociobot.tool."),
            )
        }
    }
    if let Some(arch) = &c.package.architecture {
        const KNOWN: &[&str] = &["x86_64", "aarch64", "amd64", "arm64", "universal"];
        if KNOWN.contains(&arch.as_str()) {
            add(
                out,
                c,
                "architecture",
                Level::Pass,
                format!("Architecture is {arch}."),
                None,
            )
        } else {
            add(
                out,
                c,
                "architecture",
                Level::Fail,
                format!("Unknown architecture '{arch}'."),
                Some("Use x86_64, aarch64, amd64, arm64, or universal."),
            )
        }
    }
    if let Some(previous) = &c.upgrade.previous_version {
        if !c.upgrade.allow_downgrade && version_cmp(&m.product.version, previous) <= 0 {
            add(
                out,
                c,
                "upgrade-path",
                Level::Fail,
                format!(
                    "Release {} does not advance previous version {previous}.",
                    m.product.version
                ),
                Some("Increase the release version or explicitly allow a downgrade."),
            )
        } else {
            add(
                out,
                c,
                "upgrade-path",
                Level::Pass,
                format!("Upgrade advances {previous} to {}.", m.product.version),
                None,
            )
        }
    }
}

fn safe_join(root: &Path, relative: &str) -> Option<PathBuf> {
    let p = Path::new(relative);
    if p.is_absolute()
        || p.components().any(|x| {
            matches!(
                x,
                Component::ParentDir | Component::RootDir | Component::Prefix(_)
            )
        })
    {
        None
    } else {
        Some(root.join(p))
    }
}
fn missing_companion(c: &Channel, name: &str, label: &str, required: bool, out: &mut Vec<Finding>) {
    add(
        out,
        c,
        &label.to_lowercase(),
        if required {
            Level::Fail
        } else {
            Level::Warning
        },
        if required {
            format!("Missing {label} companion: {name}.")
        } else {
            format!("No {label} companion found.")
        },
        Some(&format!("Add {name} beside the artifact.")),
    );
}

fn read_companion(root: &Path, name: &str) -> Result<Option<Vec<u8>>, String> {
    let path = safe_join(root, name)
        .ok_or_else(|| "Companion path leaves the release directory.".to_string())?;
    if !path.is_file() {
        return Ok(None);
    }
    fs::read(&path)
        .map(Some)
        .map_err(|e| format!("Could not read {name}: {e}"))
}

fn artifact_digest(path: &Path) -> Result<[u8; 32], String> {
    let mut file = fs::File::open(path).map_err(|e| e.to_string())?;
    let mut hash = Sha256::new();
    io::copy(&mut file, &mut hash).map_err(|e| e.to_string())?;
    Ok(hash.finalize().into())
}

fn inspect_signature(
    c: &Channel,
    root: &Path,
    artifact: &Path,
    required: bool,
    public_key: Option<&str>,
    out: &mut Vec<Finding>,
) {
    let name = format!("{}.sig", c.artifact);
    let raw = match read_companion(root, &name) {
        Ok(Some(raw)) => raw,
        Ok(None) => return missing_companion(c, &name, "signature", required, out),
        Err(error) => {
            add(
                out,
                c,
                "signature",
                Level::Fail,
                error,
                Some("Check the signature file permissions and retry."),
            );
            return;
        }
    };
    let result = (|| -> Result<(), String> {
        if raw.is_empty() {
            return Err("Signature companion is empty.".into());
        }
        let envelope: SignatureEnvelope = serde_json::from_slice(&raw)
            .map_err(|e| format!("Signature companion is not valid JSON: {e}"))?;
        if envelope.algorithm != "ed25519-sha256" {
            return Err(format!(
                "Unsupported signature algorithm '{}'.",
                envelope.algorithm
            ));
        }
        let public_key = public_key.ok_or_else(|| {
            "Signature cannot be verified because checks.signature_public_key is missing."
                .to_string()
        })?;
        let key_bytes = BASE64
            .decode(public_key.trim())
            .map_err(|_| "Signature public key is not valid base64.".to_string())?;
        let key_bytes: [u8; 32] = key_bytes
            .try_into()
            .map_err(|_| "Signature public key must decode to 32 bytes.".to_string())?;
        let key = VerifyingKey::from_bytes(&key_bytes)
            .map_err(|_| "Signature public key is not a valid Ed25519 key.".to_string())?;
        let signature_bytes = BASE64
            .decode(envelope.signature.trim())
            .map_err(|_| "Signature value is not valid base64.".to_string())?;
        let signature = Signature::from_slice(&signature_bytes)
            .map_err(|_| "Signature value must decode to 64 bytes.".to_string())?;
        let digest = artifact_digest(artifact)?;
        key.verify_strict(&digest, &signature)
            .map_err(|_| "Signature does not match the artifact and public key.".to_string())
    })();
    match result {
        Ok(()) => add(
            out,
            c,
            "signature",
            Level::Pass,
            "Ed25519 signature matches the artifact SHA-256 digest.",
            None,
        ),
        Err(error) => add(
            out,
            c,
            "signature",
            Level::Fail,
            error,
            Some(
                "Create an ed25519-sha256 signature with the public key recorded in the manifest.",
            ),
        ),
    }
}

fn matching_checksum(value: &serde_json::Value, expected: &str) -> bool {
    match value {
        serde_json::Value::Array(items) => {
            items.iter().any(|item| matching_checksum(item, expected))
        }
        serde_json::Value::Object(object) => {
            let cyclone = object.get("alg").and_then(|v| v.as_str()) == Some("SHA-256")
                && object
                    .get("content")
                    .and_then(|v| v.as_str())
                    .is_some_and(|v| v.eq_ignore_ascii_case(expected));
            let spdx = object
                .get("algorithm")
                .and_then(|v| v.as_str())
                .is_some_and(|v| v.eq_ignore_ascii_case("SHA256"))
                && object
                    .get("checksumValue")
                    .and_then(|v| v.as_str())
                    .is_some_and(|v| v.eq_ignore_ascii_case(expected));
            cyclone
                || spdx
                || object
                    .values()
                    .any(|item| matching_checksum(item, expected))
        }
        _ => false,
    }
}

fn validate_sbom(value: &serde_json::Value, digest: &str) -> Result<&'static str, String> {
    let object = value
        .as_object()
        .ok_or_else(|| "SBOM root must be a JSON object.".to_string())?;
    if object.get("bomFormat").and_then(|v| v.as_str()) == Some("CycloneDX") {
        if object
            .get("specVersion")
            .and_then(|v| v.as_str())
            .is_none_or(str::is_empty)
            || object.get("version").and_then(|v| v.as_u64()).is_none()
            || value
                .pointer("/metadata/component/name")
                .and_then(|v| v.as_str())
                .is_none_or(str::is_empty)
        {
            return Err(
                "CycloneDX SBOM is missing specVersion, version, or metadata.component.name."
                    .into(),
            );
        }
        if !value
            .pointer("/metadata/component/hashes")
            .is_some_and(|v| matching_checksum(v, digest))
        {
            return Err(
                "CycloneDX SBOM does not bind its metadata component to this artifact SHA-256."
                    .into(),
            );
        }
        return Ok("CycloneDX");
    }
    if object
        .get("spdxVersion")
        .and_then(|v| v.as_str())
        .is_some_and(|v| v.starts_with("SPDX-"))
    {
        let core_valid = object.get("SPDXID").and_then(|v| v.as_str()) == Some("SPDXRef-DOCUMENT")
            && object
                .get("name")
                .and_then(|v| v.as_str())
                .is_some_and(|v| !v.is_empty())
            && object
                .get("dataLicense")
                .and_then(|v| v.as_str())
                .is_some_and(|v| !v.is_empty())
            && object
                .get("documentNamespace")
                .and_then(|v| v.as_str())
                .is_some_and(|v| v.starts_with("http"))
            && object
                .get("creationInfo")
                .is_some_and(serde_json::Value::is_object);
        if !core_valid {
            return Err("SPDX SBOM is missing required document fields.".into());
        }
        if !matching_checksum(value, digest) {
            return Err("SPDX SBOM does not contain this artifact SHA-256.".into());
        }
        return Ok("SPDX");
    }
    Err("SBOM must be a CycloneDX or SPDX JSON document.".into())
}

fn inspect_sbom(c: &Channel, root: &Path, artifact: &Path, required: bool, out: &mut Vec<Finding>) {
    let name = format!("{}.sbom.json", c.artifact);
    let raw = match read_companion(root, &name) {
        Ok(Some(raw)) => raw,
        Ok(None) => return missing_companion(c, &name, "SBOM", required, out),
        Err(error) => {
            add(
                out,
                c,
                "sbom",
                Level::Fail,
                error,
                Some("Check the SBOM file permissions and retry."),
            );
            return;
        }
    };
    let result = (|| -> Result<&'static str, String> {
        if raw.is_empty() {
            return Err("SBOM companion is empty.".into());
        }
        let value =
            serde_json::from_slice(&raw).map_err(|e| format!("SBOM is not valid JSON: {e}"))?;
        let digest = sha256(artifact)?;
        validate_sbom(&value, &digest)
    })();
    match result {
        Ok(format) => add(
            out,
            c,
            "sbom",
            Level::Pass,
            format!("Valid {format} SBOM matches the artifact SHA-256."),
            None,
        ),
        Err(error) => add(
            out,
            c,
            "sbom",
            Level::Fail,
            error,
            Some("Generate a valid CycloneDX or SPDX SBOM that includes the artifact SHA-256."),
        ),
    }
}

fn validate_statement(value: &serde_json::Value, digest: &str) -> Result<(), String> {
    let statement = value
        .as_object()
        .ok_or_else(|| "Provenance statement must be a JSON object.".to_string())?;
    let statement_type = statement
        .get("_type")
        .and_then(|v| v.as_str())
        .unwrap_or("");
    if statement_type != "https://in-toto.io/Statement/v1"
        && statement_type != "https://in-toto.io/Statement/v0.1"
    {
        return Err("Provenance _type must be an in-toto Statement.".into());
    }
    if statement
        .get("predicateType")
        .and_then(|v| v.as_str())
        .is_none_or(|v| !v.starts_with("https://"))
    {
        return Err("Provenance predicateType must be an HTTPS URI.".into());
    }
    let subjects = statement
        .get("subject")
        .and_then(|v| v.as_array())
        .ok_or_else(|| "Provenance subject must be an array.".to_string())?;
    let matches = subjects.iter().any(|subject| {
        subject
            .pointer("/digest/sha256")
            .and_then(|v| v.as_str())
            .is_some_and(|v| v.eq_ignore_ascii_case(digest))
    });
    if !matches {
        return Err("Provenance subject does not match this artifact SHA-256.".into());
    }
    if !statement.contains_key("predicate") {
        return Err("Provenance statement is missing its predicate.".into());
    }
    Ok(())
}

fn validate_provenance_line(value: &serde_json::Value, digest: &str) -> Result<(), String> {
    if value.get("payloadType").is_some() || value.get("payload").is_some() {
        if value.get("payloadType").and_then(|v| v.as_str()) != Some("application/vnd.in-toto+json")
        {
            return Err("DSSE provenance payloadType must be application/vnd.in-toto+json.".into());
        }
        let signatures = value
            .get("signatures")
            .and_then(|v| v.as_array())
            .ok_or_else(|| "DSSE provenance signatures must be an array.".to_string())?;
        if signatures.is_empty()
            || signatures.iter().any(|item| {
                item.get("sig")
                    .and_then(|v| v.as_str())
                    .is_none_or(str::is_empty)
            })
        {
            return Err("DSSE provenance must contain a non-empty signature.".into());
        }
        let payload = value
            .get("payload")
            .and_then(|v| v.as_str())
            .ok_or_else(|| "DSSE provenance is missing its payload.".to_string())?;
        let decoded = BASE64
            .decode(payload)
            .map_err(|_| "DSSE provenance payload is not valid base64.".to_string())?;
        let statement = serde_json::from_slice(&decoded)
            .map_err(|e| format!("DSSE provenance payload is not valid JSON: {e}"))?;
        validate_statement(&statement, digest)
    } else {
        validate_statement(value, digest)
    }
}

fn inspect_provenance(
    c: &Channel,
    root: &Path,
    artifact: &Path,
    required: bool,
    out: &mut Vec<Finding>,
) {
    let name = format!("{}.intoto.jsonl", c.artifact);
    let raw = match read_companion(root, &name) {
        Ok(Some(raw)) => raw,
        Ok(None) => return missing_companion(c, &name, "provenance", required, out),
        Err(error) => {
            add(
                out,
                c,
                "provenance",
                Level::Fail,
                error,
                Some("Check the provenance file permissions and retry."),
            );
            return;
        }
    };
    let result = (|| -> Result<usize, String> {
        if raw.is_empty() {
            return Err("Provenance companion is empty.".into());
        }
        let text =
            std::str::from_utf8(&raw).map_err(|_| "Provenance is not UTF-8 JSONL.".to_string())?;
        let digest = sha256(artifact)?;
        let mut count = 0;
        for (index, line) in text
            .lines()
            .enumerate()
            .filter(|(_, line)| !line.trim().is_empty())
        {
            let value = serde_json::from_str(line)
                .map_err(|e| format!("Provenance line {} is not valid JSON: {e}", index + 1))?;
            validate_provenance_line(&value, &digest)
                .map_err(|e| format!("Provenance line {} is invalid: {e}", index + 1))?;
            count += 1;
        }
        if count == 0 {
            return Err("Provenance companion has no statements.".into());
        }
        Ok(count)
    })();
    match result {
        Ok(count) => add(
            out,
            c,
            "provenance",
            Level::Pass,
            format!("{count} in-toto provenance statement(s) match the artifact SHA-256."),
            None,
        ),
        Err(error) => add(
            out,
            c,
            "provenance",
            Level::Fail,
            error,
            Some("Generate in-toto JSONL whose subject SHA-256 matches the artifact."),
        ),
    }
}

fn archive_entries(path: &Path, format: &str) -> Result<Option<Vec<String>>, String> {
    let name = path
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .to_lowercase();
    if format == "zip" || name.ends_with(".zip") {
        inspect_zip(path).map(Some)
    } else if format == "tar.gz" || name.ends_with(".tar.gz") || name.ends_with(".tgz") {
        let f = fs::File::open(path).map_err(|e| e.to_string())?;
        inspect_tar(GzDecoder::new(f)).map(Some)
    } else if format == "tar" || name.ends_with(".tar") {
        let f = fs::File::open(path).map_err(|e| e.to_string())?;
        inspect_tar(f).map(Some)
    } else {
        Ok(None)
    }
}
fn clean_entry(name: &str) -> Result<String, String> {
    let p = Path::new(name);
    if p.is_absolute()
        || p.components().any(|x| {
            matches!(
                x,
                Component::ParentDir | Component::RootDir | Component::Prefix(_)
            )
        })
    {
        Err(format!("Unsafe archive entry: {name}."))
    } else {
        Ok(name.trim_start_matches("./").to_string())
    }
}
fn inspect_zip(path: &Path) -> Result<Vec<String>, String> {
    let f = fs::File::open(path).map_err(|e| format!("Could not open archive: {e}"))?;
    let mut z = zip::ZipArchive::new(f).map_err(|e| format!("Invalid ZIP archive: {e}"))?;
    let mut total = 0;
    let mut out = Vec::new();
    for i in 0..z.len() {
        let e = z.by_index(i).map_err(|e| e.to_string())?;
        if e.is_symlink() {
            return Err(format!("Archive link is not allowed: {}.", e.name()));
        }
        if e.size() > MAX_ENTRY_BYTES {
            return Err(format!(
                "Archive entry is larger than 512 MiB: {}.",
                e.name()
            ));
        }
        total += e.size();
        if total > MAX_TOTAL_BYTES {
            return Err("Archive expands beyond 2 GiB.".into());
        }
        out.push(clean_entry(e.name())?);
    }
    Ok(out)
}
fn inspect_tar<R: Read>(r: R) -> Result<Vec<String>, String> {
    let mut a = tar::Archive::new(r);
    let mut total = 0;
    let mut out = Vec::new();
    for item in a
        .entries()
        .map_err(|e| format!("Invalid tar archive: {e}"))?
    {
        let e = item.map_err(|e| e.to_string())?;
        let kind = e.header().entry_type();
        let n = e
            .path()
            .map_err(|e| e.to_string())?
            .to_string_lossy()
            .into_owned();
        if kind.is_symlink() || kind.is_hard_link() {
            return Err(format!("Archive link is not allowed: {n}."));
        }
        let size = e.size();
        if size > MAX_ENTRY_BYTES {
            return Err(format!("Archive entry is larger than 512 MiB: {n}."));
        }
        total += size;
        if total > MAX_TOTAL_BYTES {
            return Err("Archive expands beyond 2 GiB.".into());
        }
        out.push(clean_entry(&n)?);
    }
    Ok(out)
}
fn load_checksums(path: PathBuf) -> BTreeMap<String, String> {
    fs::read_to_string(path)
        .ok()
        .map(|s| {
            s.lines()
                .filter_map(|l| {
                    let mut p = l.split_whitespace();
                    Some((
                        p.next()?.to_lowercase(),
                        p.next()?.trim_start_matches('*').to_string(),
                    ))
                })
                .map(|(h, n)| (n, h))
                .collect()
        })
        .unwrap_or_default()
}
fn sha256(path: &Path) -> Result<String, String> {
    let mut f = fs::File::open(path).map_err(|e| e.to_string())?;
    let mut h = Sha256::new();
    io::copy(&mut f, &mut h).map_err(|e| e.to_string())?;
    Ok(format!("{:x}", h.finalize()))
}
fn version_cmp(a: &str, b: &str) -> i8 {
    let nums = |s: &str| {
        s.trim_start_matches('v')
            .split('.')
            .map(|x| {
                x.split('-')
                    .next()
                    .unwrap_or("0")
                    .parse::<u64>()
                    .unwrap_or(0)
            })
            .collect::<Vec<_>>()
    };
    let (a, b) = (nums(a), nums(b));
    for i in 0..a.len().max(b.len()) {
        match a.get(i).unwrap_or(&0).cmp(b.get(i).unwrap_or(&0)) {
            std::cmp::Ordering::Greater => return 1,
            std::cmp::Ordering::Less => return -1,
            _ => {}
        }
    }
    0
}

fn render(r: &Report, format: Format, github: bool) {
    if matches!(format, Format::Json) {
        println!("{}", serde_json::to_string_pretty(r).unwrap());
        return;
    }
    println!(
        "RELEASE DOCTOR  v{}  policy {}",
        r.version, r.policy_version
    );
    println!("{} {}", r.product, r.release);
    println!("{:-<72}", "");
    for f in &r.findings {
        let mark = match f.level {
            Level::Pass => "PASS",
            Level::Warning => "WARN",
            Level::Fail => "FAIL",
        };
        println!(
            "{:<5} {:<12} {:<16} {}",
            mark, f.channel, f.check, f.message
        );
        if let Some(repair) = &f.repair {
            println!("      repair: {repair}")
        }
        if github && f.level != Level::Pass {
            let cmd = if f.level == Level::Fail {
                "error"
            } else {
                "warning"
            };
            println!("::{cmd} title={} / {}::{}", f.channel, f.check, f.message)
        }
    }
    println!("{:-<72}", "");
    println!(
        "{} of {} channels ready · {} warnings · {} failures",
        r.summary.passed, r.summary.channels, r.summary.warnings, r.summary.failures
    );
}
fn write_matrix(r: &Report, path: &Path) -> Result<(), String> {
    let mut s = String::from(
        "# Release channel matrix\n\n| Channel | Status | Blocking issue |\n|---|---|---|\n",
    );
    let channels = r
        .findings
        .iter()
        .map(|f| f.channel.clone())
        .collect::<std::collections::BTreeSet<_>>();
    for c in channels {
        let bad = r
            .findings
            .iter()
            .find(|f| f.channel == c && f.level == Level::Fail);
        s.push_str(&format!(
            "| {c} | {} | {} |\n",
            if bad.is_some() { "Blocked" } else { "Ready" },
            bad.map(|f| f.message.as_str()).unwrap_or("—")
        ));
    }
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?
    }
    fs::write(path, s).map_err(|e| format!("could not write matrix: {e}"))
}

fn seed_demo(root: &Path) -> Result<(), String> {
    let artifacts = root.join("artifacts");
    fs::create_dir_all(&artifacts).map_err(|e| e.to_string())?;
    fs::write(
        root.join("release-doctor.yml"),
        include_str!("../examples/demo/release-doctor.yml"),
    )
    .map_err(|e| e.to_string())?;
    fs::write(
        artifacts.join("acme-cli_1.4.0_windows_x86_64.zip"),
        include_bytes!("../examples/demo/artifacts/acme-cli_1.4.0_windows_x86_64.zip"),
    )
    .map_err(|e| e.to_string())?;
    fs::write(
        artifacts.join("acme-cli_1.4.0_windows_x86_64.zip.sig"),
        include_bytes!("../examples/demo/artifacts/acme-cli_1.4.0_windows_x86_64.zip.sig"),
    )
    .map_err(|e| e.to_string())?;
    fs::write(
        artifacts.join("acme-cli_1.4.0_windows_x86_64.zip.sbom.json"),
        include_bytes!("../examples/demo/artifacts/acme-cli_1.4.0_windows_x86_64.zip.sbom.json"),
    )
    .map_err(|e| e.to_string())?;
    fs::write(
        artifacts.join("SHA256SUMS"),
        include_str!("../examples/demo/artifacts/SHA256SUMS"),
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    const ARTIFACT: &str = "acme-cli_1.4.0_windows_x86_64.zip";

    fn evidence_fixture() -> tempfile::TempDir {
        let root = tempfile::tempdir().unwrap();
        let artifacts = root.path().join("artifacts");
        fs::create_dir(&artifacts).unwrap();
        fs::write(
            root.path().join("release-doctor.yml"),
            include_str!("../examples/demo/release-doctor.yml"),
        )
        .unwrap();
        for name in [ARTIFACT, "SHA256SUMS"] {
            fs::write(
                artifacts.join(name),
                fs::read(Path::new("examples/demo/artifacts").join(name)).unwrap(),
            )
            .unwrap();
        }
        fs::write(
            artifacts.join(format!("{ARTIFACT}.sig")),
            include_bytes!("../examples/demo/artifacts/acme-cli_1.4.0_windows_x86_64.zip.sig"),
        )
        .unwrap();
        fs::write(
            artifacts.join(format!("{ARTIFACT}.sbom.json")),
            include_bytes!(
                "../examples/demo/artifacts/acme-cli_1.4.0_windows_x86_64.zip.sbom.json"
            ),
        )
        .unwrap();
        fs::write(
            artifacts.join(format!("{ARTIFACT}.intoto.jsonl")),
            concat!(
                "{\"_type\":\"https://in-toto.io/Statement/v1\",",
                "\"subject\":[{\"name\":\"acme-cli_1.4.0_windows_x86_64.zip\",",
                "\"digest\":{\"sha256\":\"72f0da333168f736893e41756aaabe226a218354505f50b1cd797cd74f7f7589\"}}],",
                "\"predicateType\":\"https://slsa.dev/provenance/v1\",\"predicate\":{}}\n"
            ),
        )
        .unwrap();
        root
    }

    fn evidence_finding<'a>(report: &'a Report, check: &str) -> &'a Finding {
        report
            .findings
            .iter()
            .find(|finding| finding.check == check)
            .unwrap()
    }

    fn fixture_bytes(root: &Path) -> BTreeMap<PathBuf, Vec<u8>> {
        let mut files = BTreeMap::new();
        let manifest = root.join("release-doctor.yml");
        files.insert(
            PathBuf::from("release-doctor.yml"),
            fs::read(manifest).unwrap(),
        );
        for entry in fs::read_dir(root.join("artifacts")).unwrap() {
            let path = entry.unwrap().path();
            if path.is_file() {
                files.insert(
                    PathBuf::from("artifacts").join(path.file_name().unwrap()),
                    fs::read(path).unwrap(),
                );
            }
        }
        files
    }

    #[test]
    fn blocks_parent_paths() {
        assert!(clean_entry("../escape").is_err());
    }
    #[test]
    fn compares_versions() {
        assert_eq!(version_cmp("1.4.0", "1.3.9"), 1);
        assert_eq!(version_cmp("1.0", "1.0.0"), 0);
    }
    #[test]
    fn rejects_empty_channels() {
        let m: Manifest =
            serde_yaml::from_str("product: {name: x, version: 1.0.0, binary: x}\nchannels: []")
                .unwrap();
        assert!(validate_manifest(&m).is_err());
    }

    #[test]
    fn verifies_release_evidence() {
        let root = evidence_fixture();
        let artifacts = root.path().join("artifacts");
        let manifest = root.path().join("release-doctor.yml");
        let report = diagnose(&manifest, &artifacts).unwrap();
        for check in ["signature", "sbom", "provenance"] {
            assert_eq!(evidence_finding(&report, check).level, Level::Pass);
        }

        fs::write(
            artifacts.join(format!("{ARTIFACT}.sig")),
            r#"{"algorithm":"ed25519-sha256","signature":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="}"#,
        )
        .unwrap();
        fs::write(
            artifacts.join(format!("{ARTIFACT}.sbom.json")),
            r#"{"bomFormat":"CycloneDX","specVersion":"1.6","version":1,"metadata":{"component":{"name":"acme","hashes":[{"alg":"SHA-256","content":"deadbeef"}]}}}"#,
        )
        .unwrap();
        fs::write(
            artifacts.join(format!("{ARTIFACT}.intoto.jsonl")),
            r#"{"_type":"https://in-toto.io/Statement/v1","subject":[{"name":"acme","digest":{"sha256":"deadbeef"}}],"predicateType":"https://slsa.dev/provenance/v1","predicate":{}}"#,
        )
        .unwrap();
        let report = diagnose(&manifest, &artifacts).unwrap();
        for check in ["signature", "sbom", "provenance"] {
            assert_eq!(evidence_finding(&report, check).level, Level::Fail);
        }
    }

    #[test]
    fn verifies_with_public_key_only() {
        let root = evidence_fixture();
        let files = fixture_bytes(root.path());
        assert!(files.keys().all(|path| {
            let name = path.to_string_lossy().to_ascii_lowercase();
            !name.ends_with(".key") && !name.contains("private") && !name.contains("signing-key")
        }));

        let report = diagnose(
            &root.path().join("release-doctor.yml"),
            &root.path().join("artifacts"),
        )
        .unwrap();
        assert_eq!(evidence_finding(&report, "signature").level, Level::Pass);
        assert_eq!(report.summary.failures, 0);
    }

    #[test]
    fn default_check_does_not_change_inputs() {
        let root = evidence_fixture();
        let before = fixture_bytes(root.path());

        let report = diagnose(
            &root.path().join("release-doctor.yml"),
            &root.path().join("artifacts"),
        )
        .unwrap();

        assert_eq!(report.summary.failures, 0);
        assert_eq!(fixture_bytes(root.path()), before);
    }

    #[test]
    fn rejects_empty_evidence_companions() {
        let root = evidence_fixture();
        let artifacts = root.path().join("artifacts");
        for suffix in ["sig", "sbom.json", "intoto.jsonl"] {
            fs::write(artifacts.join(format!("{ARTIFACT}.{suffix}")), []).unwrap();
        }
        let report = diagnose(&root.path().join("release-doctor.yml"), &artifacts).unwrap();
        for check in ["signature", "sbom", "provenance"] {
            let finding = evidence_finding(&report, check);
            assert_eq!(finding.level, Level::Fail);
            assert!(finding.message.contains("empty"));
        }
        assert_eq!(report.summary.passed, 0);
        assert_eq!(report.summary.failures, 3);
    }
}
