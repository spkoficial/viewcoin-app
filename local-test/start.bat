@echo off
title ViewCoin App - SERVIDOR
color 0A
echo.
echo  ============================================
echo   ViewCoin App - Iniciando SERVIDOR
echo  ============================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  color 0C
  echo  ERRO: Node.js nao encontrado!
  echo.
  echo  Instale o Node.js em: https://nodejs.org
  echo  Escolha a versao LTS e reinicie o computador.
  echo.
  pause
  exit /b 1
)

echo  Abrindo o app neste computador...
echo.
start "" "http://localhost:3000"
node server.js

echo.
echo  O servidor foi encerrado.
pause
