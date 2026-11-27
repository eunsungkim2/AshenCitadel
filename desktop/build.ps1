param(
    [string]$SdkDirectory
)

$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
$version = '1.0.2210.55'
if (!$SdkDirectory) {
    $SdkDirectory = Join-Path ([IO.Path]::GetTempPath()) "AshenCitadel-WebView2-$version"
    if (!(Test-Path -LiteralPath (Join-Path $SdkDirectory 'lib/net45/Microsoft.Web.WebView2.Core.dll'))) {
        $archive = Join-Path ([IO.Path]::GetTempPath()) ("WebView2-" + [guid]::NewGuid() + '.zip')
        try {
            $url = "https://api.nuget.org/v3-flatcontainer/microsoft.web.webview2/$version/microsoft.web.webview2.$version.nupkg"
            Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $archive
            Expand-Archive -LiteralPath $archive -DestinationPath $SdkDirectory -Force
        } finally {
            if (Test-Path -LiteralPath $archive) { Remove-Item -LiteralPath $archive }
        }
    }
}

$compiler = Join-Path $env:WINDIR 'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
$sdk = (Resolve-Path -LiteralPath $SdkDirectory).Path
$output = Join-Path $project 'AshenCitadel.exe'
$core = Join-Path $sdk 'lib/net45/Microsoft.Web.WebView2.Core.dll'
$winforms = Join-Path $sdk 'lib/net45/Microsoft.Web.WebView2.WinForms.dll'
$loader = Join-Path $sdk 'runtimes/win-x64/native/WebView2Loader.dll'
$arguments = @(
    '/nologo', '/target:winexe', '/platform:x64', '/optimize+', '/codepage:65001',
    "/out:$output", '/reference:System.Windows.Forms.dll', '/reference:System.Drawing.dll',
    "/reference:$core", "/reference:$winforms",
    "/resource:$core,Microsoft.Web.WebView2.Core.dll",
    "/resource:$winforms,Microsoft.Web.WebView2.WinForms.dll",
    "/resource:$loader,WebView2Loader.dll"
)
foreach ($asset in 'index.html', 'style.css', 'game.js') {
    $arguments += "/resource:$(Join-Path $project $asset),$asset"
}
foreach ($notice in 'LICENSE.txt', 'NOTICE.txt') {
    $arguments += "/resource:$(Join-Path $sdk $notice),$notice"
}
$arguments += Join-Path $PSScriptRoot 'Program.cs'
& $compiler @arguments
if ($LASTEXITCODE -ne 0) { throw "Build failed (csc exit code $LASTEXITCODE)." }
Get-Item -LiteralPath $output
