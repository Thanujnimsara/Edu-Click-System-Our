# ==============================================================================
#  EDU CLICK – WINDOWS 10 / 11 DESKTOP & PWA LAUNCHER
#  Tagline: One Platform. Every Device. Every Student.
# ==============================================================================

$Host.UI.RawUI.WindowTitle = "EDU CLICK – Windows Desktop Launcher"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  EDU CLICK LMS – WINDOWS 10/11 DESKTOP & PWA ENVIRONMENT" -ForegroundColor White
Write-Host "  Brand: One Platform. Every Device. Every Student." -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

# 1. Verify Centralized Backend Server
$BackendUrl = "http://localhost:5000/api/v1/health"
Write-Host "[1/3] Checking centralized backend server on port 5000..." -ForegroundColor Gray
$BackendRunning = $false
try {
    $res = Invoke-RestMethod -Uri $BackendUrl -Method Get -TimeoutSec 2 -ErrorAction Stop
    if ($res.status -eq "UP" -or $res.success -eq $true) {
        $BackendRunning = $true
        Write-Host "      ✓ Centralized backend is active." -ForegroundColor Green
    }
} catch {
    $BackendRunning = $false
}

if (-not $BackendRunning) {
    Write-Host "      -> Starting centralized backend server in background..." -ForegroundColor Yellow
    $backendPath = Join-Path $ProjectRoot "backend"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm", "start", "--prefix", "`"$backendPath`"" -WindowStyle Hidden
    Start-Sleep -Seconds 2
}

# 2. Verify Web App / PWA Server
$WebUrl = "http://localhost:3000"
Write-Host "[2/3] Checking EDU CLICK web frontend on port 3000..." -ForegroundColor Gray
$WebRunning = $false
try {
    $webRes = Invoke-WebRequest -Uri $WebUrl -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($webRes.StatusCode -eq 200) {
        $WebRunning = $true
        Write-Host "      ✓ Web frontend server is active." -ForegroundColor Green
    }
} catch {
    $WebRunning = $false
}

if (-not $WebRunning) {
    Write-Host "      -> Starting frontend dev server in background..." -ForegroundColor Yellow
    $webPath = Join-Path $ProjectRoot "apps\web"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm", "run", "dev", "--prefix", "`"$webPath`"" -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

# 3. Create Windows Desktop Shortcut if not exists
$DesktopShortcut = Join-Path $env:USERPROFILE "Desktop\EDU CLICK LMS.lnk"
$IconPath = Join-Path $ScriptDir "src-tauri\icons\icon.ico"

try {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($DesktopShortcut)
    $Shortcut.TargetPath = "powershell.exe"
    $Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$($MyInvocation.MyCommand.Path)`""
    $Shortcut.WorkingDirectory = $ScriptDir
    $Shortcut.WindowStyle = 7 # Minimized
    if (Test-Path $IconPath) {
        $Shortcut.IconLocation = "$IconPath,0"
    }
    $Shortcut.Description = "EDU CLICK – Complete Grade 1-13 Learning Management System"
    $Shortcut.Save()
    Write-Host "      ✓ Desktop shortcut configured at: $DesktopShortcut" -ForegroundColor Green
} catch {
    # Non-fatal if desktop shortcut creation is restricted
}

# 4. Launch Dedicated Standalone Application Window
Write-Host "[3/3] Launching EDU CLICK Dedicated Desktop Window..." -ForegroundColor Cyan

# Locate browser executable for application window mode
$BrowserPath = ""
$edgePaths = @(
    "$env:ProgramFiles (x86)\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
)
$chromePaths = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

foreach ($p in $edgePaths) {
    if (Test-Path $p) { $BrowserPath = $p; break }
}
if (-not $BrowserPath) {
    foreach ($p in $chromePaths) {
        if (Test-Path $p) { $BrowserPath = $p; break }
    }
}

$ProfileDir = Join-Path $env:LOCALAPPDATA "EDU_CLICK_Desktop"
if (-not (Test-Path $ProfileDir)) {
    New-Item -ItemType Directory -Force -Path $ProfileDir | Out-Null
}

if ($BrowserPath) {
    $appArgs = @(
        "--app=http://localhost:3000",
        "--window-size=1280,820",
        "--app-id=educlick-lms",
        "--user-data-dir=`"$ProfileDir`"",
        "--enable-features=OverlayScrollbar,WindowControlsOverlay"
    )
    Start-Process -FilePath $BrowserPath -ArgumentList $appArgs
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "  EDU CLICK WINDOWS DESKTOP APP RUNNING SUCCESSFULLY" -ForegroundColor White
    Write-Host "======================================================================" -ForegroundColor Green
} else {
    # Fallback to standard default browser
    Start-Process "http://localhost:3000"
}
