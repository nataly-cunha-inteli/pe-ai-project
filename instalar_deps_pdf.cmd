@echo off
REM Script para instalar novas dependencias do backend
REM Instala reportlab e pypdf para geracao de PDFs

echo ========================================
echo Instalando dependencias do backend...
echo ========================================
echo.

cd backend

echo Instalando reportlab (geracao de PDF)...
pip install reportlab==4.0.7

echo.
echo Instalando pypdf (leitura de PDF)...
pip install pypdf==3.17.0

echo.
echo ========================================
echo Instalacao concluida!
echo ========================================
echo.
echo As seguintes bibliotecas foram instaladas:
echo - reportlab: Geracao de PDFs formatados
echo - pypdf: Leitura e extracao de texto de PDFs
echo.
pause
