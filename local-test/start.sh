#!/usr/bin/env bash
echo "============================================"
echo " ViewCoin App - Iniciando SERVIDOR"
echo "============================================"
echo ""

if ! command -v node &> /dev/null; then
  echo "ERRO: Node.js nao encontrado!"
  echo "Instale em: https://nodejs.org"
  exit 1
fi

# Open browser after 2s
(sleep 2 && open "http://localhost:3000" 2>/dev/null || xdg-open "http://localhost:3000" 2>/dev/null) &

node server.js
