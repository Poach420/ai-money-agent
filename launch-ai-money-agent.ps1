# ====================================================
# AI Money Agent — Clean Auto-Launcher
# ====================================================

Write-Host "Cleaning up old Node/Python processes..."
Get-Process node, python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$backend  = "C:\Users\Administrator\Desktop\AI MONEY AGENT\backend"
$frontend = "C:\Users\Administrator\Desktop\AI MONEY AGENT\frontend"
$backendVenv = "$backend\venv\Scripts\activate"

if (-Not (Test-Path $backend) -or -Not (Test-Path $frontend)) {
    Write-Host "ERROR: Missing backend or frontend folder paths." -ForegroundColor Red
    exit
}

Write-Host "`nChecking Python environment..."
cd $backend
if (-Not (Test-Path $backendVenv)) {
    Write-Host "No venv found — creating one..."
    python -m venv venv
}
& "$backend\venv\Scripts\activate"
if (Test-Path "$backend\requirements.txt") {
    Write-Host "Installing backend dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt | Out-Null
}
Start-Sleep -Seconds 2

Write-Host "`nChecking Node environment..."
cd $frontend
if (-Not (Test-Path "$frontend\node_modules")) {
    Write-Host "node_modules missing — running npm install..."
    npm install
} else {
    Write-Host "node_modules present — verifying..."
    npm install --no-audit --no-fund | Out-Null
}
Start-Sleep -Seconds 2

Write-Host "`nLaunching backend (FastAPI on :8000)..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$backend'; Set-ExecutionPolicy -Scope Process Bypass; venv\Scripts\activate; uvicorn server:app --host 0.0.0.0 --port 8000 --reload"
)
Start-Sleep -Seconds 4

Write-Host "`nLaunching frontend (React on :3000)..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$frontend'; if (Test-Path 'node_modules\.cache') { Remove-Item -Recurse -Force 'node_modules\.cache' }; npm start"
)
Start-Sleep -Seconds 6

Write-Host "`nOpening browser at http://localhost:3000 ..."
Start-Process "http://localhost:3000"

Write-Host "`nAll systems go — backend & frontend running!" -ForegroundColor Green
