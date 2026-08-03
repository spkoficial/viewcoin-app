@echo off
echo ============================================
echo  ViewCoin App - Iniciando...
echo ============================================

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo ERRO: Node.js nao encontrado!
  echo Instale em: https://nodejs.org
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Instalando dependencias (so na primeira vez)...
  npm install
)

echo Abrindo no navegador em: http://localhost:3000
start "" "http://localhost:3000"
node server.js
pause
