[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string]
    $GeckoDriverOutputPath, 
    [Parameter(Mandatory = $false)]
    [Switch]
    $ForceDownload
)

# Install in $PSScriptRoot by default
If([string]::IsNullOrEmpty($GeckoDriverOutputPath) -and $PSScriptRoot) {
    If($IsWindows -or $Env:OS) {
        $GeckoDriverOutputPath = "$PSScriptRoot/geckodriver.exe";
    } else {
        $GeckoDriverOutputPath = "$PSScriptRoot/geckodriver";
    }
    Write-Output "Geckodriver Path: $GeckoDriverOutputPath";
}

# store original preference to revert back later
$OriginalProgressPreference = $ProgressPreference;
# setting progress preference to silently continue will massively increase the performance of downloading the GeckoDriver
$ProgressPreference = 'SilentlyContinue';

Function Set-Geckodriver-Location {
    Try {
        If($PSScriptRoot) {
             Push-Location $PSScriptRoot;
        }
        npm run setup firefox (Get-ChildItem $ChromeDriverOutputPath).DirectoryName;
        If($PSScriptRoot) {
            Pop-Location;
        }
    } Catch {
        If($PSScriptRoot) {
            Pop-Location;
        }
        Throw "Node is not installed";
    }
}

Function Get-SystemString {

    # $IsWindows will PowerShell Core but not on PowerShell 5 and below, but $Env:OS does
    # this way you can safely check whether the current machine is running Windows pre and post PowerShell Core
    If ($IsWindows -or $Env:OS) {
        If ([Environment]::Is64BitOperatingSystem) {
            "win64"
        }
        Else {
            "Win32"
        }
    }
    ElseIf ($IsLinux) {
        "linux64"
    }
    ElseIf ($IsMacOS) {
        "mac64"
    }
    Else {
        "arm64"
    }

}

Function Get-GeckodriverVersion {
    (Invoke-WebRequest -UseBasicParsing -Uri "https://github.com/mozilla/geckodriver/releases" ).Links.href | 
    Where-Object {$_.contains('/tag/')} | Select-Object -First 1 | 
    %{$_.Substring($_.IndexOf('/tag/') + 5)}
}

Function Get-GeckodriverUrl {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [string]$GeckodriverVersion = (Get-GeckodriverVersion),
        [ValidateSet("win32", "win64", "mac64", "linux64", "arm64")]
        [string]$System = (Get-SystemString)
    )

    "https://github.com/mozilla/geckodriver/releases/download/$GeckodriverVersion/geckodriver-$GeckodriverVersion-$System.zip"

}

If([string]::IsNullOrEmpty($GeckoVersion)) {
    $GeckodriverVersion = Get-GeckodriverVersion;
}
$GeckodriverUrl = Get-GeckodriverUrl -GeckodriverVersion $GeckodriverVersion;

If (($ForceDownload -eq $False) -and (Test-path $GeckoDriverOutputPath)) {
    $ExistingGeckoDriverVersion = & $GeckoDriverOutputPath --version;
    $ExistingGeckoDriverVersion = $ExistingGeckoDriverVersion.Split(" ")[1];
    If ($GeckodriverVersion -eq $ExistingGeckoDriverVersion) {
        Write-Output "Geckodriver on machine is already latest version. Skipping.";
        Write-Output "Use -ForceDownload to reinstall regardless";
        Set-Geckodriver-Location;
        Exit;
    }
}

$TempFilePath = [System.IO.Path]::GetTempFileName();
$TempZipFilePath = $TempFilePath.Replace(".tmp", ".zip");
Rename-Item -Path $TempFilePath -NewName $TempZipFilePath;
$TempFileUnzipPath = $TempFilePath.Replace(".tmp", "");
If ($IsWindows -or $Env:OS) {
    Invoke-WebRequest $GeckodriverUrl -OutFile $TempZipFilePath;
    Expand-Archive $TempZipFilePath -DestinationPath $TempFileUnzipPath;
    Move-Item "$TempFileUnzipPath/geckodriver.exe" -Destination $GeckoDriverOutputPath -Force;
}
ElseIf ($IsLinux) {
    Invoke-WebRequest $GeckodriverUrl -OutFile $TempZipFilePath;
    Expand-Archive $TempZipFilePath -DestinationPath $TempFileUnzipPath;
    Move-Item "$TempFileUnzipPath/geckodriver" -Destination $GeckoDriverOutputPath -Force;
}
ElseIf ($IsMacOS) {
    Invoke-WebRequest $GeckodriverUrl -OutFile $TempZipFilePath;
    Expand-Archive $TempZipFilePath -DestinationPath $TempFileUnzipPath;
    Move-Item "$TempFileUnzipPath/geckodriver" -Destination $GeckoDriverOutputPath -Force;
    chmod +x "$GeckoDriverOutputPath";
}
Else {
    Throw "Your operating system is not supported by this script.";
}

#   After the initial download, it is recommended that you occasionally go through the above process again to see if there are any bug fix releases.

# Clean up temp files
Remove-Item $TempZipFilePath;
Remove-Item $TempFileUnzipPath -Recurse;

# reset back to original Progress Preference
$ProgressPreference = $OriginalProgressPreference;

Set-Geckodriver-Location;
