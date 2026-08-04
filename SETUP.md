# Rodando o ViewCoin App localmente (fora do Replit)

## Modo rápido (recomendado)

**Mac/Linux:**
```bash
bash setup.sh
```

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

Isso instala as dependências, cria os `.env` a partir dos `.env.example` e
já cria as tabelas do banco — **se** você já tiver preenchido `DATABASE_URL`
em `artifacts/api-server/.env` antes de rodar (edite esse arquivo com a
conexão do seu PostgreSQL). Se não tiver preenchido, o script avisa e
para nesse ponto.

Depois de rodar o script com sucesso, suba tudo com um único comando:
```bash
pnpm run dev
```
Isso já roda **backend (porta 8080) e frontend (porta 5173) juntos**, no
mesmo terminal, com prefixos coloridos `[api]`/`[web]`. Acesse
**http://localhost:5173**.

Pressione `Ctrl+C` para parar os dois de uma vez.

---

## Modo manual (passo a passo)

### 0. Pré-requisitos
- Node.js 22+ (o projeto foi feito para Node 24, mas 22+ funciona)
- pnpm (`corepack enable` ou `npm install -g pnpm`)
- PostgreSQL rodando localmente (ou uma URL de conexão de um Postgres hospedado)

### 1. Instalar dependências
```bash
pnpm install
```

### 2. Configurar variáveis de ambiente
Copie os `.env.example` para `.env` nos pacotes que precisam:

```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
cp artifacts/viewcoin-app/.env.example artifacts/viewcoin-app/.env
```

Edite `artifacts/api-server/.env` e preencha `DATABASE_URL` com a conexão
do seu Postgres, por exemplo:
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/viewcoin
```
(crie o banco `viewcoin` antes, com `createdb viewcoin` ou via seu client
de Postgres preferido)

O `.env` do frontend já vem com defaults que funcionam (porta 5173,
apontando para a API na porta 8080) — normalmente não precisa editar nada.

### 3. Criar as tabelas no banco
```bash
pnpm --filter @workspace/db run push
```

### 4. Checar tipos (opcional, mas recomendado)
```bash
pnpm run typecheck
```

### 5. Rodar o projeto

**Opção A — os dois juntos, em um comando:**
```bash
pnpm run dev
```

**Opção B — separado, em 2 terminais** (útil se quiser ver os logs de cada um isolado):

Terminal 1 — backend (porta 8080):
```bash
pnpm --filter @workspace/api-server run dev
```

Terminal 2 — frontend (porta 5173):
```bash
pnpm --filter @workspace/viewcoin-app run dev
```

Acesse **http://localhost:5173** no navegador.

## Se algo der erro
Me mande a mensagem de erro completa (do terminal) que eu corrijo.

