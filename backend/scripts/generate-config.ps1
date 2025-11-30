$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot ".env"
$templateFile = Join-Path $PSScriptRoot "servers.json.template"
$outputFile = Join-Path $projectRoot "servers.json"

$envVars = @{}
Get-Content $envFile | Where-Object { $_ -notmatch '^\s*#' -and $_ -notmatch '^\s*$' } | ForEach-Object {
    $parts = $_ -split '=', 2
    $envVars[$parts[0].Trim()] = $parts[1].Trim()
}

$template = Get-Content $templateFile -Raw

foreach ($key in $envVars.Keys) {
    $template = $template -replace "\`${$key}", $envVars[$key]
}

$template | Set-Content $outputFile -NoNewline

Write-Host "servers.json generated!"
Write-Host "  User: $($envVars['POSTGRES_USER'])"
Write-Host "  DB: $($envVars['POSTGRES_DB'])"