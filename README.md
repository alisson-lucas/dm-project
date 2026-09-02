# Scaffold: integração Hotmart + player de aulas (Next.js)

Plataforma de vídeo-aulas com liberação de acesso via webhook da Hotmart.
**Next.js (App Router) + Prisma + PostgreSQL.** A regra de negócio (webhook →
services → Prisma) vive em `src/services` / `src/lib` e não depende do
framework — as rotas HTTP são só uma casca fina por cima.

## Como rodar no VS Code

1. Abra a pasta no VS Code (`File → Open Folder`, ou `code api-scaffold`).
2. Instale a extensão oficial do Prisma (`Prisma.prisma`) — highlight e
   formatação do `schema.prisma`.
3. No terminal integrado (`` Ctrl+` ``), instale as dependências:
   ```bash
   npm install
   ```
   (o `postinstall` já roda `prisma generate`)
4. Copie o arquivo de variáveis de ambiente e preencha:
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL`: um banco gratuito no [Neon](https://neon.tech) ou
     [Supabase](https://supabase.com) resolve rápido; local, um
     `docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres` basta.
   - `HOTMART_HOTTOK`: painel Hotmart → Ferramentas → Webhook → aba Autenticação.
   - `SESSION_SECRET`: string aleatória longa (assina o cookie de sessão).
     `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
   - `CRON_SECRET`: string aleatória que protege as rotas `/api/cron/*`.
5. Crie as tabelas no banco:
   ```bash
   npx prisma migrate dev --name init
   ```
6. Popule dados de exemplo (opcional, mas recomendado enquanto não há compras
   reais):
   ```bash
   npm run prisma:seed
   ```
7. Suba em modo desenvolvimento:
   ```bash
   npm run dev
   ```
   Abre em `http://localhost:3000`.
8. `npx prisma studio` abre uma UI local pras tabelas (`users`, `courses`,
   `enrollments`, ...).

## Dados de exemplo (seed)

`prisma/seed.ts` popula três cursos de guitarra (`Guitarra para Iniciantes`,
`Solos e Improviso`, `Harmonia no Braço` — este sem matrícula, pra ver o estado
"não matriculado") com módulos e aulas, o mapeamento de produto Hotmart, e
quatro usuários — um por estado de matrícula. É **idempotente** (id fixo +
upsert), pode rodar quantas vezes quiser:

```bash
npm run prisma:seed     # popula / atualiza
npm run db:reset        # dropa tudo, re-migra e roda o seed de novo
```

| E-mail | Senha | Matrícula | Serve pra testar |
| --- | --- | --- | --- |
| `aluno.ativo@example.com` | `senha12345` | `ACTIVE` | login + player liberado |
| `aluno.pendente@example.com` | *(sem senha)* | `PENDING` | fluxo `/api/auth/set-password` |
| `aluno.revogado@example.com` | `senha12345` | `REVOKED` | login OK, player devolve 403 |
| `sem.matricula@example.com` | `senha12345` | — | login OK, player devolve 403 |

Aula de teste: **`/lessons/lesson-boas-vindas`** (só o `aluno.ativo` consegue ver).
Os `hotmartProductId` / IDs de vídeo no seed são placeholders.

## Rotas

### API (Route Handlers, em `src/app/api`)

| Método | Rota | O que faz |
| --- | --- | --- |
| `POST` | `/api/webhooks/hotmart` | Recebe o evento da Hotmart, valida o Hottok, grava (idempotência) e processa em `after()` depois de responder 200. |
| `GET` | `/api/lessons/:id/player` | Devolve `{ provider, embedUrl }` da aula — só se o usuário logado tiver matrícula `ACTIVE` no curso. |
| `POST` | `/api/auth/login` | E-mail + senha → cookie de sessão (JWT httpOnly). |
| `POST` | `/api/auth/set-password` | Primeiro acesso: define a senha da conta criada pelo webhook (**placeholder** — em produção precisa de token por e-mail). |
| `POST` | `/api/auth/logout` | Limpa o cookie. |
| `GET` | `/api/auth/me` | Dados do usuário logado. |
| `GET` | `/api/cron/reconcile-webhooks` | Reprocessa eventos travados em `RECEIVED`. Protegido por `CRON_SECRET`. |
| `GET` | `/api/cron/revoke-expired-enrollments` | Efetiva revogações agendadas (assinatura cancelada). Protegido por `CRON_SECRET`. |

### Páginas (frontend, em `src/app`)

Tema dark estilo Netflix/Prime Video, accent `#9E224C`. Tokens e estilos em
`src/app/globals.css`; componentes em `src/components`.

- `/` — catálogo. **Hero carrossel** no topo (`src/components/HeroCarousel.tsx`,
  client) com um slide por curso cadastrado: capa de fundo, título, e botão
  **"▶ Ver curso"** se o aluno tem matrícula ativa, ou o aviso
  **"🔒 Disponível após a compra"** se não. Auto-avança, com setas e dots.
  Abaixo, a seção **Seus cursos** (grid dos matriculados). Capa =
  `course.coverImageUrl`. Requer sessão.
- `/courses/:slug` — página interna do curso: hero (usa a capa de fundo) +
  carrosséis de aulas por módulo. 404 se o curso não existe, "acesso não
  liberado" se o aluno não tem matrícula ativa nele.
- `/lessons/:id` — player da aula (server component: checa sessão + matrícula,
  renderiza o `<iframe>` do embed) + playlist do módulo na lateral. Voltar leva
  pro `/courses/:slug`.
- `/login` — entrar ou definir senha no primeiro acesso.

`src/middleware.ts` redireciona pro `/login` quem não tem sessão em `/courses/*`
e `/lessons/*`. Dados do catálogo/curso em `src/services/catalog.ts`.

## Autenticação

Substitui o antigo placeholder `requireAuth` do Express:

- **Sessão** = JWT assinado com `SESSION_SECRET` (lib `jose`), guardado num
  cookie `httpOnly`. Primitivas em `src/lib/sessionToken.ts` (edge-safe, usadas
  no middleware); helpers de cookie em `src/lib/session.ts`.
- **Senha** = `bcryptjs`, hash em `users.password_hash`.
- Route handlers e server components usam `getCurrentUser()` / `requireUser()`
  de `src/lib/auth.ts`.

O aluno é criado **sem senha** pelo webhook (`grantAccess`). O fluxo de
primeiro acesso (`/api/auth/set-password`) é um **placeholder**: hoje permite
definir a senha só enquanto `password_hash` é null, sem validar identidade. Em
produção, troque por um token único enviado no e-mail de boas-vindas (o mesmo
TODO já marcado em `src/services/enrollment.ts#grantAccess`).

## Crons

Sem processo separado — são rotas `GET` protegidas por `CRON_SECRET`.

- **Vercel:** `vercel.json` já declara os dois schedules. Defina `CRON_SECRET`
  nas env vars do projeto e a Vercel manda `Authorization: Bearer <CRON_SECRET>`
  automaticamente.
- **Self-hosted (`next start`):** chame as rotas pelo crontab, ex.:
  ```
  */5 * * * *  curl -s -H "Authorization: Bearer $CRON_SECRET" https://seu-host/api/cron/reconcile-webhooks
  0   * * * *  curl -s -H "Authorization: Bearer $CRON_SECRET" https://seu-host/api/cron/revoke-expired-enrollments
  ```
  (ou `?secret=<valor>` na URL, se for mais simples)

## Testando o webhook da Hotmart localmente

O painel precisa de uma URL pública HTTPS. Com o `npm run dev` rodando:

```bash
npx ngrok http 3000
```

Cole `https://algo.ngrok-free.app/api/webhooks/hotmart` no painel (Ferramentas →
Webhook), use o botão de teste, e confira em `npx prisma studio` (tabela
`webhook_events`) se o evento foi gravado.

## Como as peças se encaixam

```
src/app/api/webhooks/hotmart/route.ts → valida o Hottok, responde rápido, processa em after()
src/services/hotmartProcessor.ts      → grava o evento (idempotência) e decide o que fazer por tipo
src/services/enrollment.ts            → efetivamente libera/revoga acesso no banco
src/lib/hotmartPayload.ts             → traduz o JSON cru da Hotmart pro formato interno (ÚNICO lugar
                                         a ajustar se algum nome de campo estiver diferente)

src/app/api/lessons/[id]/player/route.ts → rota autenticada, delega pro service
src/app/lessons/[id]/page.tsx            → mesma checagem, renderizada server-side
src/services/lessonAccess.ts             → regra compartilhada: matrícula ativa? então resolve o embed
src/services/videoEmbed.ts               → monta a URL de embed por provedor (YouTube/Vimeo/Panda)

src/jobs/revokeExpiredEnrollments.ts  → chamado pelo cron: efetiva revogação agendada
src/services/hotmartProcessor.ts#reconcileStuckWebhookEvents → chamado pelo cron: reprocessa travados
```

## Variáveis de ambiente

```
DATABASE_URL=postgresql://...
HOTMART_HOTTOK=<hottok do painel Hotmart, aba Autenticação do Webhook>
SESSION_SECRET=<string aleatória longa>
CRON_SECRET=<string aleatória; protege /api/cron/*>
```

## O que ainda precisa de decisão/ajuste antes de produção

1. **Confirmar o payload real da Hotmart** e ajustar `src/lib/hotmartPayload.ts`
   — os nomes de campo vêm de documentação pública, não confirmados 1:1.
2. **Confirmar se o Hottok vem em header (`x-hotmart-hottok`) ou no corpo** —
   ajustar `src/app/api/webhooks/hotmart/route.ts`.
3. **Fluxo de primeiro acesso de verdade** — trocar o placeholder de
   `/api/auth/set-password` por token enviado no e-mail de boas-vindas.
4. **Enviar e-mail de boas-vindas / definição de senha** — TODO em
   `src/services/enrollment.ts#grantAccess`.
5. **Confirmar o campo de próxima cobrança** no `SUBSCRIPTION_CANCELLATION` —
   hoje há fallback de 30 dias em `hotmartProcessor.ts`.
6. **Trocar a URL de embed do Panda** em `videoEmbed.ts` pelo subdomínio real.
7. **`after()` e ambientes serverless:** na Vercel o processamento assíncrono do
   webhook roda após a resposta; o cron `reconcile-webhooks` é a rede de
   segurança se a função for encerrada antes de terminar. Mantenha o cron ativo.
8. **`npx prisma validate`** — este scaffold foi montado sem acesso à internet;
   rode antes da primeira migration.

## Migrations

```bash
npx prisma migrate dev --name init
```
