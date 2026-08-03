#!/usr/bin/env bash
echo "============================================"
echo " ViewCoin App - Iniciando..."
echo "============================================"

if ! command -v node &> /dev/null; then
  echo "ERRO: Node.js nao encontrado!"
  echo "Instale em: https://nodejs.org"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Instalando dependencias (so na primeira vez)..."
  npm install
fi

# Open browser after 1.5s
(sleep 1.5 && open "http://localhost:3000" 2>/dev/null || xdg-open "http://localhost:3000" 2>/dev/null) &

echo "Abrindo em: http://localhost:3000"
node server.js
