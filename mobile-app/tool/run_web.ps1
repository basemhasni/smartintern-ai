$ErrorActionPreference = "Stop"
$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $projectRoot

& "$PSScriptRoot\clean_generated.ps1"
flutter pub get
flutter run -d chrome

