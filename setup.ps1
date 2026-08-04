# Setup automatizado do ViewCoin App para Windows.
# Uso (PowerShell):  .\setup.ps1
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "==> Verificando pnpm..."
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "pnpm não encontrado. Instalando via corepack..."
    corepack enable
    corepack prepare pnpm@latest --activate
}

Write-Host "==> Instalando dependências (pnpm install)..."
pnpm install

Write-Host "==> Configurando arquivos .env..."
$pkgs = @("artifacts/api-server", "artifacts/viewcoin-app", "lib/db")
foreach ($pkg in $pkgs) {
    $example = Join-Path $pkg ".env.example"
    $envFile = Join-Path $pkg ".env"
    if ((Test-Path $example) -and -not (Test-Path $envFile)) {
        Copy-Item $example $envFile
        Write-Host "   criado $envFile"
    }
}

$envPath = "artifacts/api-server/.env"
$dbLine = Get-Content $envPath | Where-Object { $_ -match '^DATABASE_URL=' }
$dbUrl = ($dbLine -replace '^DATABASE_URL=', '').Trim()

if ([string]::IsNullOrEmpty($dbUrl)) {
    Write-Host ""
    Write-Host "AVISO: DATABASE_URL ainda não está preenchida em artifacts/api-server/.env" -ForegroundColor Yellow
    Write-Host "Edite esse arquivo com a conexão do seu PostgreSQL, por exemplo:"
    Write-Host "  DATABASE_URL=postgres://postgres:postgres@localhost:5432/viewcoin"
    Write-Host ""
    Write-Host "Depois rode:"
    Write-Host "  pnpm --filter @workspace/db run push"
    Write-Host "  pnpm run dev"
    exit 0
}

Write-Host "==> Criando tabelas no banco (drizzle push)..."
pnpm --filter @workspace/db run push

Write-Host ""
Write-Host "Setup completo! Para rodar o app (frontend + backend juntos):" -ForegroundColor Green
Write-Host "  pnpm run dev"
Write-Host ""
Write-Host "  Depois acesse http://localhost:5173"
