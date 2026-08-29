$ErrorActionPreference = "Stop"
$Fixture = Join-Path $env:RUNNER_TEMP "release-doctor-installer-fixture"
$Payload = Join-Path $Fixture "payload"
$Metadata = cargo metadata --no-deps --format-version 1 | ConvertFrom-Json
$Package = $Metadata.packages | Where-Object { $_.name -eq "installer-release-doctor" } | Select-Object -First 1
if (-not $Package) { throw "Could not read the installer-release-doctor version from Cargo metadata." }
$Version = $Package.version
if ($env:EXPECTED_VERSION -and $env:EXPECTED_VERSION.TrimStart("v") -ne $Version) {
  throw "The requested release version $($env:EXPECTED_VERSION) does not match source version $Version."
}
$ExpectedVersionOutput = "release-doctor $Version"
$BuiltBinary = Resolve-Path "target/release/release-doctor.exe"
$BuiltVersionOutput = (& $BuiltBinary --version | Out-String).Trim()
if ($BuiltVersionOutput -ne $ExpectedVersionOutput) {
  throw "The built binary reported '$BuiltVersionOutput'; expected '$ExpectedVersionOutput'."
}
$Archive = Join-Path $Fixture "release-doctor-v$Version-windows-x86_64.zip"
$Checksums = Join-Path $Fixture "SHA256SUMS"
$Destination = Join-Path $Fixture "installed"
$OriginalUserPath = [Environment]::GetEnvironmentVariable("Path", "User")
$OriginalProcessPath = $env:Path

Remove-Item $Fixture -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $Payload | Out-Null
Copy-Item $BuiltBinary (Join-Path $Payload "release-doctor.exe")
Compress-Archive (Join-Path $Payload "release-doctor.exe") $Archive
$Hash = (Get-FileHash $Archive -Algorithm SHA256).Hash.ToLower()
Set-Content $Checksums "$Hash  $([IO.Path]::GetFileName($Archive))"
$Server = Start-Process node -ArgumentList @("tests/windows/fixture-server.mjs", $Fixture, "8765", $Version) -PassThru

try {
  $ServerReady = $false
  for ($Attempt = 0; $Attempt -lt 20; $Attempt++) {
    try {
      Invoke-RestMethod "http://127.0.0.1:8765/release" | Out-Null
      $ServerReady = $true
      break
    } catch {
      Start-Sleep -Milliseconds 100
    }
  }
  if (-not $ServerReady) { throw "The local release fixture server did not start." }
  $env:RELEASE_DOCTOR_RELEASE_API_URL = "http://127.0.0.1:8765/release"
  $env:INSTALL_DIR = $Destination
  $Output = & "site/public/install.ps1" *>&1 | Out-String
  $InstalledBinary = Join-Path $Destination "release-doctor.exe"
  if (-not (Test-Path $InstalledBinary)) { throw "The installer did not copy the binary." }
  if (-not (($env:Path -split ";") -contains $Destination)) { throw "The current-process PATH was not updated." }
  if (-not (([Environment]::GetEnvironmentVariable("Path", "User") -split ";") -contains $Destination)) { throw "The user PATH was not persisted." }
  if ($Output -notmatch [regex]::Escape($ExpectedVersionOutput)) { throw "The installed binary was not executed." }
  $InstalledVersionOutput = (& $InstalledBinary --version | Out-String).Trim()
  if ($InstalledVersionOutput -ne $ExpectedVersionOutput) { throw "The installed binary did not report the source version." }

  $InstalledHashBeforeRejection = (Get-FileHash $InstalledBinary -Algorithm SHA256).Hash
  Set-Content $Checksums "$('0' * 64)  $([IO.Path]::GetFileName($Archive))"
  $Rejected = $false
  try { & "site/public/install.ps1" } catch { $Rejected = $_.Exception.Message -match "Checksum did not match" }
  if (-not $Rejected) { throw "A bad checksum was not rejected." }
  $InstalledHashAfterRejection = (Get-FileHash $InstalledBinary -Algorithm SHA256).Hash
  if ($InstalledHashAfterRejection -ne $InstalledHashBeforeRejection) { throw "The previous binary was not preserved after checksum rejection." }
  $RollbackVersionOutput = (& $InstalledBinary --version | Out-String).Trim()
  if ($RollbackVersionOutput -ne $ExpectedVersionOutput) { throw "The previous binary no longer runs after checksum rejection." }
} finally {
  [Environment]::SetEnvironmentVariable("Path", $OriginalUserPath, "User")
  $env:Path = $OriginalProcessPath
  if ($Server) { Stop-Process -Id $Server.Id -Force -ErrorAction SilentlyContinue }
  Remove-Item $Fixture -Recurse -Force -ErrorAction SilentlyContinue
}
