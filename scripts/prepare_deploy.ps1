# PowerShell script to prepare combined backend+frontend deploy (Windows)
Set-StrictMode -Version Latest

# Install backend requirements
python -m pip install -r backend\requirements.txt

# Frontend: install and build
npm ci
npm run build

# Move dist to backend/frontend_build
if (Test-Path "backend\frontend_build") {
    Remove-Item "backend\frontend_build" -Recurse -Force
}
New-Item -ItemType Directory -Path "backend\frontend_build" | Out-Null
Move-Item -Path "dist\*" -Destination "backend\frontend_build\"

Write-Host "✅ Frontend build movido para backend/frontend_build"
