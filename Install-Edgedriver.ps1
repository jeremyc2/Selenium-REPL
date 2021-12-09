[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string]
    $EdgeDriverOutputPath,
    [Parameter(Mandatory = $false)]
    [string]
    $EdgeVersion, 
    [Parameter(Mandatory = $false)]
    [Switch]
    $ForceDownload
)

# Install in $PSScriptRoot by default
If([string]::IsNullOrEmpty($EdgeDriverOutputPath) -and $PSScriptRoot) {
    If($IsWindows -or $Env:OS) {
        $EdgeDriverOutputPath = "$PSScriptRoot/msedgedriver.exe";
    } else {
        $EdgeDriverOutputPath = "$PSScriptRoot/msedgedriver";
    }
    Write-Output "Edgedriver Path: $EdgeDriverOutputPath";
}

# store original preference to revert back later
$OriginalProgressPreference = $ProgressPreference;
# setting progress preference to silently continue will massively increase the performance of downloading the EdgeDriver
$ProgressPreference = 'SilentlyContinue';

Function Set-Edgedriver-Location {
    Try {
        If($PSScriptRoot) {
             Push-Location $PSScriptRoot;
        }
        npm run setup edge (Get-ChildItem $EdgeDriverOutputPath).DirectoryName;
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

function Get-EdgeVersion {

    # $IsWindows will PowerShell Core but not on PowerShell 5 and below, but $Env:OS does
    # this way you can safely check whether the current machine is running Windows pre and post PowerShell Core
    If ($IsWindows -or $Env:OS) {
        Try {
            (Get-Item (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe' -ErrorAction Stop).'(Default)').VersionInfo.FileVersion;
        }
        Catch {
            Throw "Edge not found in registry";
        }
    }
    Else {
        Throw "Your operating system is not supported by this script.";
    }

}

function Get-SystemString {

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

function Get-EdgedriverUrl {

    [CmdletBinding()]
    param(
        [ValidateNotNullOrEmpty()]
        [string]$EdgeVersion,
        [ValidateSet("win32", "win64", "mac64", "linux64", "arm64")]
        [string]$System = (Get-SystemString)
    )

    "https://msedgedriver.azureedge.net/$EdgeVersion/edgedriver_$System.zip"

}

If([string]::IsNullOrEmpty($EdgeVersion)) {
    $EdgeVersion = (Get-EdgeVersion);
}
$EdgedriverUrl = Get-EdgedriverUrl -EdgeVersion $EdgeVersion;

If (($ForceDownload -eq $False) -and (Test-path $EdgeDriverOutputPath)) {
    $ExistingEdgeDriverVersion = & $EdgeDriverOutputPath --version;
    $ExistingEdgeDriverVersion = $ExistingEdgeDriverVersion.Split(" ")[1];
    If ($EdgeVersion -eq $ExistingEdgeDriverVersion) {
        Write-Output "Edgedriver on machine is already latest version. Skipping.";
        Write-Output "Use -ForceDownload to reinstall regardless";
        Set-Edgedriver-Location;
        Exit;
    }
}

$TempFilePath = [System.IO.Path]::GetTempFileName();
$TempZipFilePath = $TempFilePath.Replace(".tmp", ".zip");
Rename-Item -Path $TempFilePath -NewName $TempZipFilePath;
$TempFileUnzipPath = $TempFilePath.Replace(".tmp", "");
If ($IsWindows -or $Env:OS) {
    Invoke-WebRequest $EdgedriverUrl -OutFile $TempZipFilePath;
    Expand-Archive $TempZipFilePath -DestinationPath $TempFileUnzipPath;
    Move-Item "$TempFileUnzipPath/msedgedriver.exe" -Destination $EdgeDriverOutputPath -Force;
}
ElseIf ($IsLinux) {
    Invoke-WebRequest $EdgedriverUrl -OutFile $TempZipFilePath;
    Expand-Archive $TempZipFilePath -DestinationPath $TempFileUnzipPath;
    Move-Item "$TempFileUnzipPath/msedgedriver" -Destination $EdgeDriverOutputPath -Force;
}
ElseIf ($IsMacOS) {
    Invoke-WebRequest $EdgedriverUrl -OutFile $TempZipFilePath;
    Expand-Archive $TempZipFilePath -DestinationPath $TempFileUnzipPath;
    Move-Item "$TempFileUnzipPath/msedgedriver" -Destination $EdgeDriverOutputPath -Force;
    chmod +x "$EdgeDriverOutputPath";
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

Set-Edgedriver-Location;
