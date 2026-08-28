#!/bin/sh
set -eu
REPO="B-Divyesh/sf-installer-release-doctor"
API="https://api.github.com/repos/$REPO/releases/latest"
OS=$(uname -s)
ARCH=$(uname -m)
case "$OS:$ARCH" in
  Linux:x86_64) MATCH="linux-x86_64.tar.gz" ;;
  Linux:aarch64|Linux:arm64) MATCH="linux-aarch64.tar.gz" ;;
  Darwin:x86_64) MATCH="darwin-x86_64.tar.gz" ;;
  Darwin:arm64) MATCH="darwin-aarch64.tar.gz" ;;
  *) echo "Unsupported platform: $OS $ARCH" >&2; exit 1 ;;
esac
TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/release-doctor.XXXXXX")
trap 'rm -rf "$TMP_DIR"' EXIT INT TERM
JSON=$(curl -fsSL "$API")
URL=$(printf '%s' "$JSON" | tr ',' '\n' | sed -n 's/.*"browser_download_url":[ ]*"\([^"]*'"$MATCH"'\)".*/\1/p' | head -1)
[ -n "$URL" ] || { echo "A matching release asset is not published yet." >&2; exit 1; }
curl -fsSL "$URL" -o "$TMP_DIR/package.tar.gz"
curl -fsSL "${URL%/*}/SHA256SUMS" -o "$TMP_DIR/SHA256SUMS"
EXPECTED=$(awk -v file="$(basename "$URL")" '$2 == file || $2 == "*" file {print $1}' "$TMP_DIR/SHA256SUMS")
[ -n "$EXPECTED" ] || { echo "Checksum entry is missing." >&2; exit 1; }
ACTUAL=$(if command -v sha256sum >/dev/null 2>&1; then sha256sum "$TMP_DIR/package.tar.gz" | awk '{print $1}'; else shasum -a 256 "$TMP_DIR/package.tar.gz" | awk '{print $1}'; fi)
[ "$EXPECTED" = "$ACTUAL" ] || { echo "Checksum did not match. Nothing was installed." >&2; exit 1; }
tar -xzf "$TMP_DIR/package.tar.gz" -C "$TMP_DIR"
DEST="${INSTALL_DIR:-$HOME/.local/bin}"
mkdir -p "$DEST"
install -m 755 "$TMP_DIR/release-doctor" "$DEST/release-doctor"
echo "Installed release-doctor to $DEST/release-doctor"
echo "Add $DEST to PATH if the command is not found."
