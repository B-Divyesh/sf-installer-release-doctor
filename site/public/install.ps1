$ErrorActionPreference = "Stop"
$Repo = "B-Divyesh/sf-installer-release-doctor"
$Release = Invoke-RestMethod "https://api.github.com/repos/$Repo/releases/latest"
$Asset = $Release.assets | Where-Object { $_.name -like "*windows-x86_64.zip" } | Select-Object -First 1
if (-not $Asset) { throw "The Windows release asset is not published yet." }
$Temp = Join-Path ([System.IO.Path]::GetTempPath()) ("release-doctor-" + [guid]::NewGuid())
New-Item -ItemType Directory $Temp | Out-Null
try {
  $Zip = Join-Path $Temp $Asset.name
  Invoke-WebRequest $Asset.browser_download_url -OutFile $Zip
  $SumsAsset = $Release.assets | Where-Object { $_.name -eq "SHA256SUMS" } | Select-Object -First 1
  if (-not $SumsAsset) { throw "SHA256SUMS is not published." }
  $Sums = Join-Path $Temp "SHA256SUMS"
  Invoke-WebRequest $SumsAsset.browser_download_url -OutFile $Sums
  $ExpectedLine = Get-Content $Sums | Where-Object { $_ -match [regex]::Escape($Asset.name) } | Select-Object -First 1
  if (-not $ExpectedLine) { throw "Checksum entry is missing." }
  $Expected = ($ExpectedLine -split "\s+")[0].ToLower()
  $Actual = (Get-FileHash $Zip -Algorithm SHA256).Hash.ToLower()
  if ($Expected -ne $Actual) { throw "Checksum did not match. Nothing was installed." }
  Expand-Archive $Zip -DestinationPath $Temp
  $Dest = if ($env:INSTALL_DIR) { $env:INSTALL_DIR } else { Join-Path $env:LOCALAPPDATA "Programs\release-doctor" }
  New-Item -ItemType Directory -Force $Dest | Out-Null
  Copy-Item (Join-Path $Temp "release-doctor.exe") $Dest -Force
  $UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
  $PathItems = @($UserPath -split ";" | Where-Object { $_ })
  if (-not ($PathItems | Where-Object { $_.TrimEnd("\\") -ieq $Dest.TrimEnd("\\") })) {
    $UpdatedPath = (@($PathItems) + $Dest) -join ";"
    [Environment]::SetEnvironmentVariable("Path", $UpdatedPath, "User")
  }
  if (-not (($env:Path -split ";") | Where-Object { $_.TrimEnd("\\") -ieq $Dest.TrimEnd("\\") })) {
    $env:Path = "$Dest;$env:Path"
  }
  Write-Host "Installed release-doctor.exe to $Dest"
  & (Join-Path $Dest "release-doctor.exe") --version
  Write-Host "Added $Dest to your user PATH. New PowerShell windows can run release-doctor."
} finally {
  Remove-Item $Temp -Recurse -Force -ErrorAction SilentlyContinue
}
