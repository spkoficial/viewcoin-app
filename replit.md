# ViewCoin App

Aplicativo web que simula a interface de um smartphone moderno. Usuários ganham Viewcoins (moeda fictícia) assistindo às lives da grade de horários — a cada 5 minutos completos, 1 Viewcoin é creditado automaticamente.

## Run & Operate

- `pnpm --filter @workspace/viewcoin-app run dev` — frontend (porta via PORT env)
- `pnpm --filter @workspace/api-server run dev` — API server (porta 8080)
- `pnpm run typecheck` — full typecheck
- `pnpm --filter @workspace/api-spec run codegen` — regenerar hooks e schemas da spec OpenAPI
- `pnpm --filter @workspace/db run push` — aplicar mudanças no schema do banco

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + framer-motion
- Backend: Express 5 + Drizzle ORM + PostgreSQL
- Auth: tokens em memória (no servidor) + localStorage (no cliente)
- Roteamento: wouter
- Ícones: lucide-react

## Where things live

- `artifacts/viewcoin-app/src/pages/` — telas: boot, login, home, grade, ranking, perfil, instruções
- `artifacts/viewcoin-app/src/components/phone-layout.tsx` — moldura do celular (iPhone mockup)
- `artifacts/viewcoin-app/src/hooks/use-auth.ts` — autenticação via localStorage
- `artifacts/viewcoin-app/src/hooks/use-timer.ts` — timer de contagem de Viewcoins
- `artifacts/api-server/src/routes/` — auth, users, schedule, viewcoins
- `artifacts/api-server/src/lib/auth.ts` — tokens em memória + hash de senha
- `lib/db/src/schema/` — users, schedule_slots, viewcoin_transactions
- `lib/api-spec/openapi.yaml` — contrato da API (fonte da verdade)
- `attached_assets/image_1785729593271.png` — imagem do iPhone usada como moldura

## Architecture decisions

- **Autenticação stateful em memória:** tokens são armazenados em um Map no servidor. Não persistem entre restarts. Para produção, usar Redis ou banco.
- **localStorage no cliente:** token e dados do usuário são guardados no localStorage para persistir entre sessões do browser.
- **Sem formato `email` ou `integer` no OpenAPI:** Orval + Zod v3 não suporta esses formats — usar `string` e `number` no lugar.
- **z-index do celular:** o conteúdo (`z-20`) fica acima da imagem do frame (`z-10`) para ser visível. A borda do celular enquadra visualmente o conteúdo.

## Product

- Tela de boot com botão "Ligar" (Power)
- Login e cadastro de usuários
- Tela principal com canal ativo, saldo de Viewcoins e botão Ligar
- Timer de 5 minutos que credita Viewcoins ao assistir
- Grade de horários 24h × 7 dias
- Ranking de usuários por Viewcoins
- Perfil com histórico de transações
- Instruções de uso detalhadas
- Painel admin para editar a grade

## User preferences

- Interface toda em português do Brasil
- Tema escuro como padrão
- Interface simulada dentro da moldura de iPhone

## Gotchas

- Reiniciar o servidor perde todos os tokens de autenticação (usuários precisam logar novamente)
- Admin padrão: email `admin@viewcoin.tv`, senha `admin123`
- Orval gera sintaxe Zod v4 para `format: email` e `type: integer` — evitar esses tipos no openapi.yaml
