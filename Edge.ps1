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

function Get-EdgedriverLink {

    [CmdletBinding()]
    param(
        [ValidateNotNullOrEmpty()]
        [string]$EdgeVersion = (Get-EdgeVersion),
        [ValidateSet("win32", "win64", "mac64", "linux64", "arm64")]
        [string]$System = (Get-SystemString)
    )

    "https://msedgedriver.azureedge.net/$EdgeVersion/edgedriver_$System.zip"

}

# function Get-EdgedriverLink {

#     [CmdletBinding()]
#     param(
#         [ValidateNotNullOrEmpty()]
#         [string]$EdgeVersion = (Get-EdgeVersion)
#     )

#     (Invoke-WebRequest -UseBasicParsing -Uri https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/).Links.href | 
#         Where-Object {$_ -like "https://msedgedriver.azureedge.net/$EdgeVersion*"}

# }
