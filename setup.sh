#!/usr/bin/env bash
# Setup automatizado do ViewCoin App para Mac/Linux.
# Uso:  bash setup.sh
set -e

cd "$(dirname "$0")"

echo "==> Verificando pnpm..."
if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm não encontrado. Instalando via corepack..."
  corepack enable
  corepack prepare pnpm@latest --activate
fi

echo "==> Instalando dependências (pnpm install)..."
pnpm install

echo "==> Configurando arquivos .env..."
for pkg in artifacts/api-server artifacts/viewcoin-app lib/db; do
  if [ -f "$pkg/.env.example" ] && [ ! -f "$pkg/.env" ]; then
    cp "$pkg/.env.example" "$pkg/.env"
    echo "   criado $pkg/.env"
  fi
done

# Carrega o DATABASE_URL do .env do api-server, se já estiver preenchido
DATABASE_URL="$(grep -m1 '^DATABASE_URL=' artifacts/api-server/.env 2>/dev/null | cut -d= -f2-)"

if [ -z "$DATABASE_URL" ]; then
  echo ""
  echo "⚠  DATABASE_URL ainda não está preenchida em artifacts/api-server/.env"
  echo "   Edite esse arquivo com a conexão do seu PostgreSQL, por exemplo:"
  echo "   DATABASE_URL=postgres://postgres:postgres@localhost:5432/viewcoin"
  echo ""
  echo "   Depois rode:"
  echo "     pnpm --filter @workspace/db run push"
  echo "     pnpm run dev"
  exit 0
fi

echo "==> Criando tabelas no banco (drizzle push)..."
pnpm --filter @workspace/db run push

echo ""
echo "✅ Setup completo! Para rodar o app (frontend + backend juntos):"
echo "   pnpm run dev"
echo ""
echo "   Depois acesse http://localhost:5173"
