#!/usr/bin/env pwsh
Push-Location $PSScriptRoot;
npm start 2> $null;
Write-Out $LASTEXITCODE;
If($LASTEXITCODE -eq 1) {
    ./Install-Chromedriver.ps1;
    npm start;
}
Pop-Location;