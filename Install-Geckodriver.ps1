Function Get-GeckodriverVersion {
    (Invoke-WebRequest -UseBasicParsing -Uri "https://github.com/mozilla/geckodriver/releases" `
    -Proxy http://proxy.wal-mart.com:8080/ -ProxyUseDefaultCredentials).Links.href | 
    Where-Object {$_.contains('/tag/')} | Select-Object -First 1 | 
    %{$_.Substring($_.IndexOf('/tag/') + 5)}
}

Function Get-GeckodriverUrl {
    [CmdletBinding()]
    param(
        [ValidateSet("win32", "win64", "mac64", "linux64", "arm64")]
        [string]$System = (Get-SystemString)
    )

    $GeckodriverVersion = Get-GeckodriverVersion;

    "https://github.com/mozilla/geckodriver/releases/download/$GeckodriverVersion/geckodriver-$GeckodriverVersion-$System.zip"

}
