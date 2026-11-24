# ==============================================================================
#  EDU CLICK – ONE-CLICK GITHUB REPOSITORY & PAGES DEPLOYMENT
#  GitHub Account: Thanujnimsara
#  Repository: edu-click-lms
# ==============================================================================

$Host.UI.RawUI.WindowTitle = "Deploy EDU CLICK to GitHub"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  EDU CLICK LMS – GITHUB DEPLOYMENT SETUP" -ForegroundColor White
Write-Host "  GitHub User: Thanujnimsara" -ForegroundColor Yellow
Write-Host "  Target Repo: https://github.com/Thanujnimsara/edu-click-lms.git" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Initialize git if needed
if (-not (Test-Path ".git")) {
    Write-Host "[1/4] Initializing Git repository..." -ForegroundColor Gray
    git init
} else {
    Write-Host "[1/4] Git repository already initialized." -ForegroundColor Green
}

# 2. Stage and commit all files
Write-Host "[2/4] Staging and committing files..." -ForegroundColor Gray
git add .
git commit -m "Initial commit - Complete Grade 1-13 EDU CLICK LMS Platform"

# 3. Rename branch to main
git branch -M main

# 4. Configure remote
$RemoteUrl = "https://github.com/Thanujnimsara/edu-click-lms.git"
Write-Host "[3/4] Configuring remote origin to: $RemoteUrl" -ForegroundColor Gray
git remote remove origin 2>$null
git remote add origin $RemoteUrl

Write-Host "`n[4/4] READY TO PUSH!" -ForegroundColor Green
Write-Host "To publish to GitHub and activate GitHub Pages, run:" -ForegroundColor Yellow
Write-Host "git push -u origin main`n" -ForegroundColor White

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  YOUR PERMANENT GITHUB PAGES URLS (NEVER EXPIRE):" -ForegroundColor White
Write-Host "  Home:    https://thanujnimsara.github.io/edu-click-lms/" -ForegroundColor Green
Write-Host "  Student: https://thanujnimsara.github.io/edu-click-lms/login?role=student" -ForegroundColor Green
Write-Host "  Teacher: https://thanujnimsara.github.io/edu-click-lms/login?role=teacher" -ForegroundColor Green
Write-Host "  Admin:   https://thanujnimsara.github.io/edu-click-lms/login?role=admin" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
