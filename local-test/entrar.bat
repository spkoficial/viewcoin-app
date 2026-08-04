@echo off
title ViewCoin App - Conectar ao servidor
color 0B
echo.
echo  ============================================
echo   ViewCoin App - Conectar ao servidor
echo  ============================================
echo.
echo  Quem esta rodando o servidor deve te passar
echo  o endereco IP (exemplo: 192.168.1.10:3000)
echo.
set /p IP="  Digite o endereco (IP:porta): "
echo.
echo  Abrindo: http://%IP%
start "" "http://%IP%"
echo.
echo  Se nao abrir, verifique se o IP esta correto
echo  e se o servidor esta ligado.
echo.
pause
