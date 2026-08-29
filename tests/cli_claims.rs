use flate2::{Compression, write::GzEncoder};
use serde_json::Value;
use sha2::{Digest, Sha256};
use std::{
    fs,
    io::Write,
    path::{Path, PathBuf},
    process::{Command, Output},
};
use tempfile::TempDir;
use zip::write::SimpleFileOptions;

fn binary() -> PathBuf {
    PathBuf::from(env!("CARGO_BIN_EXE_release-doctor"))
}

fn run_check(root: &Path) -> Output {
    Command::new(binary())
        .args([
            "check",
            "--manifest",
            root.join("release-doctor.yml").to_str().unwrap(),
            "--artifacts",
            root.join("artifacts").to_str().unwrap(),
            "--format",
            "json",
        ])
        .output()
        .unwrap()
}

fn manifest(channels: &str, checks: &str) -> String {
    format!(
        "product: {{name: Fixture, version: 1.0.0, binary: release-doctor}}\nchecks: {{{checks}}}\nchannels:\n{channels}"
    )
}

fn write_zip(path: &Path, names: &[&str]) {
    let file = fs::File::create(path).unwrap();
    let mut archive = zip::ZipWriter::new(file);
    for name in names {
        archive
            .start_file(name, SimpleFileOptions::default())
            .unwrap();
        archive.write_all(b"fixture").unwrap();
    }
    archive.finish().unwrap();
}

fn tar_bytes(names: &[&str]) -> Vec<u8> {
    let mut bytes = Vec::new();
    for name in names {
        let body = b"fixture";
        let mut header = [0u8; 512];
        header[..name.len()].copy_from_slice(name.as_bytes());
        header[100..108].copy_from_slice(b"0000644\0");
        header[108..116].copy_from_slice(b"0000000\0");
        header[116..124].copy_from_slice(b"0000000\0");
        header[124..136].copy_from_slice(format!("{:011o}\0", body.len()).as_bytes());
        header[136..148].copy_from_slice(b"00000000000\0");
        header[148..156].fill(b' ');
        header[156] = b'0';
        header[257..263].copy_from_slice(b"ustar\0");
        header[263..265].copy_from_slice(b"00");
        let checksum: u32 = header.iter().map(|byte| u32::from(*byte)).sum();
        header[148..156].copy_from_slice(format!("{:06o}\0 ", checksum).as_bytes());
        bytes.extend_from_slice(&header);
        bytes.extend_from_slice(body);
        bytes.resize(bytes.len().div_ceil(512) * 512, 0);
    }
    bytes.extend_from_slice(&[0u8; 1024]);
    bytes
}

fn write_tar(path: &Path, names: &[&str], gzip: bool) {
    let bytes = tar_bytes(names);
    if gzip {
        let mut encoder = GzEncoder::new(fs::File::create(path).unwrap(), Compression::default());
        encoder.write_all(&bytes).unwrap();
        encoder.finish().unwrap();
    } else {
        fs::write(path, bytes).unwrap();
    }
}

fn fixture() -> TempDir {
    let root = tempfile::tempdir().unwrap();
    fs::create_dir(root.path().join("artifacts")).unwrap();
    root
}

#[test]
fn public_cli_rejects_unsafe_zip_tar_and_tar_gz_entries_without_writing_outside() {
    let root = fixture();
    let artifacts = root.path().join("artifacts");
    write_zip(&artifacts.join("unsafe.zip"), &["../escape-zip"]);
    write_tar(&artifacts.join("unsafe.tar"), &["../escape-tar"], false);
    write_tar(&artifacts.join("unsafe.tar.gz"), &["../escape-tgz"], true);
    fs::write(
        root.path().join("release-doctor.yml"),
        manifest(
            "  - {name: zip, artifact: unsafe.zip, format: zip}\n  - {name: tar, artifact: unsafe.tar, format: tar}\n  - {name: tgz, artifact: unsafe.tar.gz, format: tar.gz}\n",
            "",
        ),
    )
    .unwrap();

    let output = run_check(root.path());
    assert_eq!(output.status.code(), Some(1));
    let report: Value = serde_json::from_slice(&output.stdout).unwrap();
    for channel in ["zip", "tar", "tgz"] {
        assert!(
            report["findings"]
                .as_array()
                .unwrap()
                .iter()
                .any(|finding| {
                    finding["channel"] == channel
                        && finding["check"] == "archive-safety"
                        && finding["level"] == "fail"
                        && finding["message"]
                            .as_str()
                            .unwrap()
                            .contains("Unsafe archive entry")
                })
        );
    }
    for name in ["escape-zip", "escape-tar", "escape-tgz"] {
        assert!(!root.path().join(name).exists());
    }
}

#[test]
fn public_cli_checks_layout_for_zip_tar_and_tar_gz() {
    let root = fixture();
    let artifacts = root.path().join("artifacts");
    write_zip(&artifacts.join("good.zip"), &["release-doctor", "LICENSE"]);
    write_zip(&artifacts.join("missing.zip"), &["release-doctor"]);
    write_tar(
        &artifacts.join("good.tar"),
        &["release-doctor", "LICENSE"],
        false,
    );
    write_tar(&artifacts.join("missing.tar"), &["release-doctor"], false);
    write_tar(
        &artifacts.join("good.tar.gz"),
        &["release-doctor", "LICENSE"],
        true,
    );
    write_tar(&artifacts.join("missing.tar.gz"), &["release-doctor"], true);
    fs::write(
        root.path().join("release-doctor.yml"),
        manifest(
            "  - {name: zip-good, artifact: good.zip, format: zip, required_files: [LICENSE]}\n  - {name: zip-missing, artifact: missing.zip, format: zip, required_files: [LICENSE]}\n  - {name: tar-good, artifact: good.tar, format: tar, required_files: [LICENSE]}\n  - {name: tar-missing, artifact: missing.tar, format: tar, required_files: [LICENSE]}\n  - {name: tgz-good, artifact: good.tar.gz, format: tar.gz, required_files: [LICENSE]}\n  - {name: tgz-missing, artifact: missing.tar.gz, format: tar.gz, required_files: [LICENSE]}\n",
            "",
        ),
    )
    .unwrap();

    let output = run_check(root.path());
    assert_eq!(output.status.code(), Some(1));
    let report: Value = serde_json::from_slice(&output.stdout).unwrap();
    for channel in ["zip-good", "tar-good", "tgz-good"] {
        assert!(
            report["findings"]
                .as_array()
                .unwrap()
                .iter()
                .any(|finding| {
                    finding["channel"] == channel
                        && finding["check"] == "required-file"
                        && finding["level"] == "pass"
                })
        );
    }
    for channel in ["zip-missing", "tar-missing", "tgz-missing"] {
        assert!(
            report["findings"]
                .as_array()
                .unwrap()
                .iter()
                .any(|finding| {
                    finding["channel"] == channel
                        && finding["check"] == "required-file"
                        && finding["level"] == "fail"
                })
        );
    }
}

fn spdx_document(digest: &str) -> String {
    format!(
        r#"{{"spdxVersion":"SPDX-2.3","SPDXID":"SPDXRef-DOCUMENT","name":"fixture","dataLicense":"CC0-1.0","documentNamespace":"https://example.test/spdx/fixture","creationInfo":{{"created":"2026-08-29T00:00:00Z","creators":["Tool: fixture"]}},"packages":[{{"name":"fixture","checksums":[{{"algorithm":"SHA256","checksumValue":"{digest}"}}]}}]}}"#
    )
}

#[test]
fn public_cli_accepts_valid_spdx_and_rejects_malformed_or_mismatched_spdx() {
    let root = fixture();
    let artifacts = root.path().join("artifacts");
    let artifact = artifacts.join("release.zip");
    write_zip(&artifact, &["release-doctor", "LICENSE"]);
    fs::write(
        root.path().join("release-doctor.yml"),
        manifest(
            "  - {name: fixture, artifact: release.zip, format: zip, required_files: [LICENSE]}\n",
            "require_sbom: true",
        ),
    )
    .unwrap();
    let digest = format!("{:x}", Sha256::digest(fs::read(&artifact).unwrap()));
    let sbom = artifacts.join("release.zip.sbom.json");

    fs::write(&sbom, spdx_document(&digest)).unwrap();
    let valid = run_check(root.path());
    assert_eq!(valid.status.code(), Some(0));
    let valid_report: Value = serde_json::from_slice(&valid.stdout).unwrap();
    assert!(
        valid_report["findings"]
            .as_array()
            .unwrap()
            .iter()
            .any(|finding| {
                finding["check"] == "sbom"
                    && finding["level"] == "pass"
                    && finding["message"].as_str().unwrap().contains("Valid SPDX")
            })
    );

    fs::write(
        &sbom,
        r#"{"spdxVersion":"SPDX-2.3","SPDXID":"SPDXRef-DOCUMENT"}"#,
    )
    .unwrap();
    let malformed = run_check(root.path());
    assert_eq!(malformed.status.code(), Some(1));
    assert!(
        String::from_utf8_lossy(&malformed.stdout).contains("missing required document fields")
    );

    fs::write(&sbom, spdx_document(&"0".repeat(64))).unwrap();
    let mismatched = run_check(root.path());
    assert_eq!(mismatched.status.code(), Some(1));
    assert!(
        String::from_utf8_lossy(&mismatched.stdout)
            .contains("does not contain this artifact SHA-256")
    );
}
