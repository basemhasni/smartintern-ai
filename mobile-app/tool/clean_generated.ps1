param(
  [switch] $IncludeDartTool
)

$ErrorActionPreference = "Stop"
$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $projectRoot

$targets = @(
  "build",
  "ios\Flutter\ephemeral",
  "ios\Flutter\Generated.xcconfig",
  "ios\Flutter\flutter_export_environment.sh"
)

if ($IncludeDartTool) {
  $targets += ".dart_tool"
}

foreach ($target in $targets) {
  if (Test-Path $target) {
    attrib -R -S -H -P +U $target /S /D 2>$null
    Remove-Item -LiteralPath $target -Recurse -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "Flutter generated files cleaned."

