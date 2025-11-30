param(
    [switch]$Rebuild,
    [switch]$ForceRecreate
)

Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force -ErrorAction SilentlyContinue

$projectRoot = Split-Path -Parent $PSScriptRoot
$composeFile = Join-Path $projectRoot "docker-compose.dev.yml"
$generateScript = Join-Path $PSScriptRoot "generate-config.ps1"

Write-Host "Generating servers.json..."
& $generateScript

Write-Host "Starting services in detached mode..."
$fullCmd = "docker compose -f `"$composeFile`" up -d"
if ($Rebuild) {
    $fullCmd += " --build"
}
if ($ForceRecreate) {
    $fullCmd += " --force-recreate"
}
Write-Host "Executing: $fullCmd"
Invoke-Expression $fullCmd

Start-Sleep -Seconds 2
Write-Host "`nServices status:"
Invoke-Expression "docker compose -f `"$composeFile`" ps"

Write-Host "`nUser-service logs (last 10 lines):"
Invoke-Expression "docker compose -f `"$composeFile`" logs user-service --tail=10"