$ErrorActionPreference = "Stop"
$Fixture = Join-Path $env:RUNNER_TEMP "release-doctor-installer-fixture"
$Payload = Join-Path $Fixture "payload"
$Archive = Join-Path $Fixture "release-doctor-v0.1.3-windows-x86_64.zip"
$Checksums = Join-Path $Fixture "SHA256SUMS"
$Destination = Join-Path $Fixture "installed"
$RejectedDestination = Join-Path $Fixture "rejected"
$OriginalUserPath = [Environment]::GetEnvironmentVariable("Path", "User")

New-Item -ItemType Directory -Force $Payload | Out-Null
Copy-Item "target/release/release-doctor.exe" (Join-Path $Payload "release-doctor.exe")
Compress-Archive (Join-Path $Payload "release-doctor.exe") $Archive
$Hash = (Get-FileHash $Archive -Algorithm SHA256).Hash.ToLower()
Set-Content $Checksums "$Hash  $([IO.Path]::GetFileName($Archive))"
$Server = Start-Process node -ArgumentList @("tests/windows/fixture-server.mjs", $Fixture, "8765") -PassThru

try {
  for ($Attempt = 0; $Attempt -lt 20; $Attempt++) {
    try { Invoke-RestMethod "http://127.0.0.1:8765/release" | Out-Null; break } catch { Start-Sleep -Milliseconds 100 }
  }
  $env:RELEASE_DOCTOR_RELEASE_API_URL = "http://127.0.0.1:8765/release"
  $env:INSTALL_DIR = $Destination
  $Output = & "site/public/install.ps1" *>&1 | Out-String
  if (-not (Test-Path (Join-Path $Destination "release-doctor.exe"))) { throw "The installer did not copy the binary." }
  if (-not (($env:Path -split ";") -contains $Destination)) { throw "The current-process PATH was not updated." }
  if (-not (([Environment]::GetEnvironmentVariable("Path", "User") -split ";") -contains $Destination)) { throw "The user PATH was not persisted." }
  if ($Output -notmatch "release-doctor 0.1.3") { throw "The installed binary was not executed." }

  Set-Content $Checksums "$('0' * 64)  $([IO.Path]::GetFileName($Archive))"
  $env:INSTALL_DIR = $RejectedDestination
  $Rejected = $false
  try { & "site/public/install.ps1" } catch { $Rejected = $_.Exception.Message -match "Checksum did not match" }
  if (-not $Rejected) { throw "A bad checksum was not rejected." }
  if (Test-Path (Join-Path $RejectedDestination "release-doctor.exe")) { throw "A binary remained after checksum rejection." }
} finally {
  [Environment]::SetEnvironmentVariable("Path", $OriginalUserPath, "User")
  if ($Server) { Stop-Process -Id $Server.Id -Force -ErrorAction SilentlyContinue }
}
