#!/usr/bin/env bash
set -euo pipefail

# Instala dependências do backend
python -m pip install -r backend/requirements.txt

# Instala dependências do frontend e builda o Vite
npm ci
npm run build

# Move os arquivos do dist para backend/frontend_build
rm -rf backend/frontend_build
mkdir -p backend/frontend_build
mv dist/* backend/frontend_build/

echo "✅ Frontend build movido para backend/frontend_build"
