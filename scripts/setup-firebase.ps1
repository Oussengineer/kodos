param(
  [string]$ProjectId = "kodos-push",
  [string]$DisplayName = "Kodos Push Notifications"
)

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Kodos Firebase Push Notification Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Check Firebase CLI ──
Write-Host "[1/5] Checking Firebase CLI..." -ForegroundColor Yellow
try {
  $ver = firebase --version 2>$null
  Write-Host "  Firebase CLI v$ver detected" -ForegroundColor Green
} catch {
  Write-Host "  Installing Firebase CLI..."
  npm install -g firebase-tools
}

# ── Step 2: Authenticate ──
Write-Host ""
Write-Host "[2/5] Firebase Authentication" -ForegroundColor Yellow
$loggedIn = firebase login:list 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "  → Run this command in a NEW terminal (where a browser can open):" -ForegroundColor White
  Write-Host "    firebase login" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "  Then come back and run this script again." -ForegroundColor Yellow
  pause
  exit 1
}
Write-Host "  ✓ Already authenticated!" -ForegroundColor Green

# ── Step 3: Create Firebase Project ──
Write-Host ""
Write-Host "[3/5] Creating Firebase project '$ProjectId'..." -ForegroundColor Yellow
firebase projects:create $ProjectId --display-name "$DisplayName" 2>&1 | ForEach-Object { Write-Host "  $_" }
if ($LASTEXITCODE -ne 0) {
  Write-Host "  Project may already exist. Checking..." -ForegroundColor Yellow
}
Write-Host "  ✓ Done" -ForegroundColor Green

# ── Step 4: Register Android apps + download config ──
Write-Host ""
Write-Host "[4/5] Registering Android apps and downloading google-services.json..." -ForegroundColor Yellow

$apps = @(
  @{ PackageName = "com.kodos.customer"; AppNickname = "Kodos Customer"; AppDir = "android" }
  @{ PackageName = "com.kodos.admin";    AppNickname = "Kodos Admin";    AppDir = "android-admin" }
  @{ PackageName = "com.kodos.driver";   AppNickname = "Kodos Driver";   AppDir = "android-driver" }
)

foreach ($app in $apps) {
  $jsonPath = Join-Path $app.AppDir "app" "google-services.json"
  if (Test-Path $jsonPath) {
    Write-Host "  $($app.AppNickname) — already exists, skipping" -ForegroundColor Green
    continue
  }

  Write-Host "  Registering $($app.AppNickname)..." -ForegroundColor Yellow
  
  # Create Android app in Firebase
  firebase apps:create android --project $ProjectId `
    --package-name $app.PackageName `
    --display-name "$($app.AppNickname)" 2>$null

  # Find the app ID
  $appsList = firebase apps:list android --project $ProjectId --json 2>$null | ConvertFrom-Json
  $appId = ($appsList.result | Where-Object { $_.packageName -eq $app.PackageName } | Select-Object -First 1).appId
  
  if ($appId) {
    firebase apps:android:get-config --app $appId --project $ProjectId --out $jsonPath 2>&1
    if (Test-Path $jsonPath) {
      Write-Host "  ✓ $($app.AppNickname) -> $jsonPath" -ForegroundColor Green
    }
  }
}

# ── Step 5: Sync Capacitor ──
Write-Host ""
Write-Host "[5/5] Syncing Capacitor plugins..." -ForegroundColor Yellow
npm run cap:sync:customer
npm run cap:sync:admin
npm run cap:sync:driver

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ✓ Firebase setup complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Add FCM_SERVER_KEY to .env for firebase-admin:" -ForegroundColor Yellow
Write-Host "  1. Go to https://console.firebase.google.com/project/$ProjectId/settings/cloudmessaging"
Write-Host "  2. Copy the 'Server key'"
Write-Host "  3. Add to server/.env: FCM_SERVER_KEY=your_key_here"
Write-Host ""
Write-Host "Then rebuild APK and notifications will work even when app is closed!" -ForegroundColor Cyan
