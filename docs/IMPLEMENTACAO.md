# Implementação — histórico e detalhes

Este documento registra **tudo** o que foi feito no projeto a partir do scaffold
original (Express + Prisma) até o estado atual (Next.js App Router + Prisma +
plataforma de vídeo-aulas com tema dark).

Leia junto com o [`README.md`](../README.md) (guia rápido de setup).

---

## 1. Visão geral

**O que é:** plataforma de vídeo-aulas em que o acesso a cada curso é liberado
automaticamente por um **webhook da Hotmart** (compra aprovada → matrícula
ativa; reembolso/chargeback/cancelamento → matrícula revogada). O aluno faz
login, vê o catálogo, entra no curso e assiste as aulas num player (YouTube /
Vimeo / Panda), sempre com checagem de matrícula ativa no servidor.

**Stack final:**

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 |
| Linguagem | TypeScript (strict) |
| ORM / banco | Prisma 6 + PostgreSQL |
| Sessão | JWT em cookie `httpOnly` (lib `jose`) |
| Senha | `bcryptjs` |
| Estilo | CSS puro (`src/app/globals.css`), sem framework de UI |
| Deploy alvo | Vercel (crons via `vercel.json`) — funciona self-hosted também |

---

## 2. Linha do tempo do que foi feito

1. **Migração Express → Next.js.** As rotas Express viraram Route Handlers
   (`src/app/api/**/route.ts`); a regra de negócio (`src/services`, `src/lib`)
   foi preservada quase sem mudança. Adicionado frontend mínimo (login + player).
2. **Autenticação de verdade.** Substituído o placeholder `requireAuth` do
   Express por sessão JWT em cookie + `bcryptjs`.
3. **Crons sem processo separado.** Viraram rotas `GET /api/cron/*` protegidas
   por `CRON_SECRET`, agendadas em `vercel.json`.
4. **Prisma 6 vs 7.** Investigado o aviso do editor sobre `url` no
   `schema.prisma` — é da extensão do VS Code (que já roda um language server
   v7); o projeto está no Prisma 6, onde `url` no schema é obrigatório. Mantido
   no v6. (Detalhes na seção 9.)
5. **Seed de dados** (`prisma/seed.ts`) — cursos, módulos, aulas, produtos
   Hotmart e 4 usuários (um por estado de matrícula). Idempotente.
6. **Interface tema dark** estilo Netflix / Prime Video, accent `#9E224C`:
   design tokens, top bar, hero, carrosséis de aulas, cards, player com
   playlist lateral, login estilizado.
7. **Reestruturação do catálogo.** A tela inicial (`/`) virou o **catálogo de
   cursos**; o layout "hero + carrosséis de aulas" foi movido para a **página
   interna do curso** (`/courses/[slug]`).
8. **Coluna de capa.** Adicionada `Course.coverImageUrl` (migration
   `add_course_cover`) e usada nas capas do catálogo.
9. **Hero carrossel na tela inicial** (`src/components/HeroCarousel.tsx`) — um
   slide por curso, com capa de fundo, botão "Ver curso" se matriculado ou
   aviso de bloqueio se não, setas, dots e auto-avanço.
10. **Títulos dos cursos → guitarra.** Trocado o conteúdo de exemplo do seed
    (Next.js/TypeScript/Prisma) por cursos de guitarra. Os `id` internos foram
    mantidos (são opacos) para o seed continuar idempotente.

---

## 3. Estrutura de arquivos

```
api-scaffold/
├─ next.config.mjs            # config Next (serverExternalPackages: @prisma/client)
├─ next-env.d.ts              # gerado pelo Next — não editar
├─ tsconfig.json              # config TS padrão Next (paths "@/*" -> "./src/*")
├─ vercel.json                # agendamento dos 2 crons
├─ package.json               # scripts + bloco "prisma": { "seed": "tsx prisma/seed.ts" }
├─ .env.example               # modelo das variáveis
├─ README.md                  # guia rápido
├─ docs/IMPLEMENTACAO.md      # este arquivo
│
├─ prisma/
│  ├─ schema.prisma           # modelos (inalterado exceto Course.coverImageUrl)
│  ├─ seed.ts                 # dados de exemplo (cursos de guitarra)
│  └─ migrations/
│     ├─ 20260902163629_first_migrate/    # criação de todas as tabelas
│     └─ 20260902174516_add_course_cover/ # ALTER TABLE courses ADD cover_image_url
│
└─ src/
   ├─ middleware.ts           # barra /courses/* e /lessons/* sem sessão -> /login
   │
   ├─ app/
   │  ├─ layout.tsx           # <html>/<body> + import "./globals.css"
   │  ├─ globals.css          # design system inteiro (tokens + componentes)
   │  ├─ page.tsx             # TELA INICIAL: hero carrossel + "Seus cursos"
   │  ├─ login/page.tsx       # form login / primeiro acesso (client)
   │  ├─ courses/[slug]/page.tsx   # PÁGINA DO CURSO: hero + carrosséis de aulas
   │  ├─ lessons/[id]/page.tsx     # PLAYER: iframe do embed + playlist do módulo
   │  └─ api/
   │     ├─ webhooks/hotmart/route.ts            # POST — recebe evento Hotmart
   │     ├─ lessons/[id]/player/route.ts         # GET  — embed da aula (JSON)
   │     ├─ auth/login/route.ts                  # POST — e-mail+senha -> cookie
   │     ├─ auth/set-password/route.ts           # POST — 1º acesso (PLACEHOLDER)
   │     ├─ auth/logout/route.ts                 # POST — limpa cookie
   │     ├─ auth/me/route.ts                     # GET  — usuário logado
   │     ├─ cron/reconcile-webhooks/route.ts         # GET — reprocessa travados
   │     └─ cron/revoke-expired-enrollments/route.ts # GET — revoga agendados
   │
   ├─ components/
   │  ├─ TopBar.tsx           # barra fixa: logo, "Início", e-mail, "Sair" (server)
   │  ├─ LogoutButton.tsx     # botão que faz POST /api/auth/logout (client)
   │  ├─ HeroCarousel.tsx     # carrossel de cursos na tela inicial (client)
   │  ├─ Hero.tsx             # hero de UM curso (usado em /courses/[slug]) (server)
   │  ├─ CourseCard.tsx       # card de curso no grid "Seus cursos" (server)
   │  ├─ LessonRow.tsx        # carrossel horizontal de aulas de um módulo (server)
   │  └─ LessonCard.tsx       # card de aula -> /lessons/[id] (server)
   │
   ├─ lib/
   │  ├─ prisma.ts            # singleton do PrismaClient
   │  ├─ sessionToken.ts      # assinar/verificar JWT (jose) — SEM next/headers (edge)
   │  ├─ session.ts           # setSessionCookie / clearSessionCookie / readSession
   │  ├─ auth.ts              # getCurrentUser() / requireUser() / UnauthorizedError
   │  ├─ cron.ts              # assertCronRequest() — valida CRON_SECRET
   │  ├─ hotmartPayload.ts    # normaliza o JSON cru da Hotmart (inalterado)
   │  └─ format.ts            # formatDuration, youtubeThumb, plural, courseMeta
   │
   ├─ services/
   │  ├─ hotmartProcessor.ts  # grava evento (idempotência) + decide ação por tipo
   │  ├─ enrollment.ts        # grant/revoke/markPending/scheduleAccessRevocation
   │  ├─ catalog.ts           # getCatalog() e getCourseForUser()
   │  ├─ lessonAccess.ts      # getLessonPlayerForUser() — checa matrícula + embed
   │  └─ videoEmbed.ts        # monta a URL de embed por provedor (inalterado)
   │
   └─ jobs/
      └─ revokeExpiredEnrollments.ts   # efetiva revogações agendadas (inalterado)
```

**Removidos do scaffold original:** `src/app.ts`, `src/server.ts`,
`src/middleware/requireAuth.ts`, `src/routes/` — substituídos pelo App Router e
por `src/lib/auth.ts`.

---

## 4. Rotas

### API (Route Handlers)

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/webhooks/hotmart` | Valida o Hottok (`x-hotmart-hottok` header **ou** `body.hottok` — confirmar no painel), grava o evento e responde `200` rápido. O processamento pesado roda em `after()` (depois da resposta). |
| `GET` | `/api/lessons/:id/player` | Retorna `{ provider, embedUrl }` da aula — `401` sem sessão, `403` sem matrícula ativa, `404` se a aula não existe. |
| `POST` | `/api/auth/login` | `{ email, password }` → valida com `bcrypt.compare` → seta cookie de sessão. Resposta genérica pra não vazar quais e-mails existem. |
| `POST` | `/api/auth/set-password` | **PLACEHOLDER.** Define a senha de uma conta criada pelo webhook, permitido **só enquanto `passwordHash` é null**. Em produção precisa de token enviado por e-mail. |
| `POST` | `/api/auth/logout` | Limpa o cookie. |
| `GET` | `/api/auth/me` | `{ id, email, name }` do usuário logado, ou `401`. |
| `GET` | `/api/cron/reconcile-webhooks` | Reprocessa eventos travados em `RECEIVED`. Protegido por `CRON_SECRET`. |
| `GET` | `/api/cron/revoke-expired-enrollments` | Efetiva revogações agendadas (assinatura cancelada com ciclo pago restante). Protegido por `CRON_SECRET`. |

Todos os handlers têm `export const dynamic = "force-dynamic"` e rodam no runtime
Node (padrão) — necessário pro Prisma.

### Páginas (App Router)

| Rota | Descrição |
| --- | --- |
| `/` | **Tela inicial.** Hero carrossel com um slide por curso cadastrado (capa de fundo, título, "▶ Ver curso" se matriculado ou "🔒 Disponível após a compra" se não; setas + dots + auto-avanço a cada 7s). Abaixo, seção **Seus cursos** (grid só dos matriculados). Sem sessão → `/login`. |
| `/courses/:slug` | **Página interna do curso.** Hero do curso (capa de fundo) + carrosséis de aulas por módulo. `404` se o curso não existe; tela "Você ainda não tem este curso" se o aluno não tem matrícula ativa. |
| `/lessons/:id` | **Player.** `<iframe>` responsivo 16:9 do embed + playlist do módulo na lateral (aula atual destacada com a borda accent). "Voltar" leva pro `/courses/:slug`. `redirect("/login")` sem sessão; `notFound()` se a aula não existe; tela de acesso negado sem matrícula. |
| `/login` | Form com dois modos: **Entrar** (e-mail + senha) e **Primeiro acesso** (definir senha). Client component; usa `useSearchParams().get("next")` pra voltar pra página de origem. |

`src/middleware.ts` faz `matcher: ["/courses/:path*", "/lessons/:path*"]` — quem
não tem cookie de sessão válido é redirecionado pro `/login?next=<pathname>`. As
rotas de API **não** passam pelo middleware; cada uma chama `getCurrentUser()`.

---

## 5. Autenticação

Substitui o placeholder `requireAuth` do Express. Contrato mantido: o resto do
código só espera um usuário com `{ id }`.

- **Token** — JWT `HS256` assinado com `SESSION_SECRET` via `jose`. Payload:
  `{ userId }`. Validade: 30 dias.
- **Cookie** — nome `session`, `httpOnly`, `sameSite: "lax"`, `secure` em
  produção, `path: "/"`, `maxAge` 30 dias.
- **`src/lib/sessionToken.ts`** — `signSessionToken`, `verifySessionToken`,
  `SESSION_COOKIE`, `SESSION_TTL_SECONDS`. **Não importa `next/headers`**, então
  pode ser usado no middleware (runtime edge).
- **`src/lib/session.ts`** — `setSessionCookie`, `clearSessionCookie`,
  `readSession` (mexem no cookie via `await cookies()` — só route handlers /
  server components).
- **`src/lib/auth.ts`** — `getCurrentUser()` (lê a sessão + busca o `User` no
  banco), `requireUser()` (lança `UnauthorizedError`).
- **Senha** — `bcryptjs`, hash guardado em `users.password_hash`. `passwordHash`
  null = conta criada pelo webhook que ainda não definiu senha.

### Fluxo de primeiro acesso (PLACEHOLDER — trocar antes de produção)

O aluno é criado **sem senha** por `grantAccess` (webhook). Hoje ele acessa
`POST /api/auth/set-password` com `{ email, password }` e a senha é aceita **só
se `passwordHash` ainda for null**. Isso **não valida identidade** — qualquer um
que saiba o e-mail de um aluno recém-criado pode reivindicar a conta antes dele.

**Correção para produção:** enviar um token único no e-mail de boas-vindas (o
mesmo TODO já marcado em `src/services/enrollment.ts#grantAccess`) e exigir esse
token no `set-password`.

---

## 6. Webhook da Hotmart — fluxo

```
POST /api/webhooks/hotmart
  │
  ├─ valida Hottok (header x-hotmart-hottok OU body.hottok)   → 401 se inválido
  │
  ├─ receiveHotmartEvent(payload)          [síncrono, rápido]
  │    ├─ normalizeHotmartPayload()  → { eventType, transactionId, buyerEmail, hotmartProductId, hotmartOfferCode }
  │    ├─ se não reconhece o payload → grava WebhookEvent status IGNORED, responde 200
  │    ├─ se transactionId já existe → idempotência: nada a fazer
  │    └─ grava WebhookEvent status RECEIVED
  │
  ├─ responde 200 "ok"                     ← Hotmart não espera o processamento
  │
  └─ after(() => processHotmartEvent(normalized, record.id))   [assíncrono]
       switch(eventType):
         PURCHASE_APPROVED / PURCHASE_COMPLETE          → grantAccess()   (Enrollment ACTIVE)
         PURCHASE_REFUNDED / CHARGEBACK / CANCELED      → revokeAccess()  (Enrollment REVOKED)
         PURCHASE_EXPIRED / PURCHASE_DELAYED            → markPending()   (Enrollment PENDING)
         SUBSCRIPTION_CANCELLATION                      → scheduleAccessRevocation(+30d)  *(fallback)*
       marca WebhookEvent PROCESSED / FAILED
```

- **`grantAccess`** resolve o `Product` (match exato de oferta, senão o "curinga"
  com `hotmartOfferCode` null), faz `upsert` do `User` por e-mail e `upsert` do
  `Enrollment` como `ACTIVE`. **TODO:** disparar e-mail de boas-vindas /
  definição de senha.
- **Rede de segurança:** se o processo morrer entre o `200` e o fim do `after()`,
  o evento fica `RECEIVED`; o cron `reconcile-webhooks` (a cada 5 min) pega e
  reprocessa.

### Pontos a confirmar no painel da Hotmart antes de produção

1. **Formato do payload real** — os nomes de campo em
   `src/lib/hotmartPayload.ts` vêm de documentação pública, não confirmados 1:1.
   É o **único** arquivo a ajustar se um campo estiver com outro nome.
2. **Onde vem o Hottok** — header `x-hotmart-hottok` ou dentro do JSON. Ajustar
   `src/app/api/webhooks/hotmart/route.ts`.
3. **Campo da próxima cobrança** no `SUBSCRIPTION_CANCELLATION` — hoje há
   fallback conservador de 30 dias em `hotmartProcessor.ts`.

---

## 7. Crons

Não há processo separado — são rotas `GET` idempotentes protegidas por
`CRON_SECRET` (`src/lib/cron.ts#assertCronRequest`, que aceita
`Authorization: Bearer <CRON_SECRET>` **ou** `?secret=<CRON_SECRET>`).

| Rota | Frequência | O que faz |
| --- | --- | --- |
| `/api/cron/reconcile-webhooks` | a cada 5 min (`*/5 * * * *`) | `reconcileStuckWebhookEvents()` — reprocessa `WebhookEvent` presos em `RECEIVED` há mais de 5 min. |
| `/api/cron/revoke-expired-enrollments` | a cada hora (`0 * * * *`) | `revokeExpiredEnrollments()` — `Enrollment` `ACTIVE` com `scheduledRevocationAt <= agora` viram `REVOKED`. |

- **Vercel** — `vercel.json` já declara os dois schedules. Basta definir a env
  var `CRON_SECRET` no projeto; a Vercel manda o header `Authorization: Bearer`
  automaticamente.
- **Self-hosted** — chamar as rotas pelo `crontab` com `curl -H "Authorization:
  Bearer $CRON_SECRET" ...` (ou `?secret=`).

---

## 8. Banco de dados

### Modelos (`prisma/schema.prisma`)

```
User          id, email (unique), name?, passwordHash?, timestamps
              └─ enrollments Enrollment[]

Course        id, slug (unique), title, description?, coverImageUrl?, timestamps
              └─ products Product[]  modules Module[]  enrollments Enrollment[]

Product       id, hotmartProductId, hotmartOfferCode? , courseId
              @@unique([hotmartProductId, hotmartOfferCode])
              # liga um produto/oferta Hotmart a um curso

Module        id, courseId, title, order     @@unique([courseId, order])
              └─ lessons Lesson[]

Lesson        id, moduleId, title, order,
              videoProvider (YOUTUBE|VIMEO|PANDA), videoExternalId, durationSeconds?
              @@unique([moduleId, order])

Enrollment    id, userId, courseId, status (PENDING|ACTIVE|REVOKED),
              sourceTransaction?, grantedAt?, revokedAt?, scheduledRevocationAt?
              @@unique([userId, courseId])   @@index([status])
              # É O QUE CONTROLA ACESSO. Nunca derive acesso de "existe compra".

WebhookEvent  id, eventId (unique = transaction id), eventType, payload (Json),
              status (RECEIVED|PROCESSED|FAILED|IGNORED), error?, receivedAt, processedAt?
              # log bruto + idempotência dos webhooks
```

**Única alteração de schema feita:** `Course.coverImageUrl String? @map("cover_image_url")`
— migration `20260902174516_add_course_cover` (`ALTER TABLE "courses" ADD COLUMN
"cover_image_url" TEXT;`). Aditiva e reversível.

### Prisma 6 vs 7 — o aviso do editor

O editor mostra:

> The datasource property `url` is no longer supported in schema files. Move
> connection URLs for Migrate to `prisma.config.ts`...

Isso é **da extensão Prisma do VS Code**, que já embute um language server do
**Prisma 7**. O projeto está no **Prisma 6.19.3**, onde `url = env("DATABASE_URL")`
no bloco `datasource` é **obrigatório** (testado: removê-lo dá
`Argument "url" is missing in data source block "db"`).

**Decisão:** ficar no Prisma 6. O schema está correto para o toolchain do
projeto. Para silenciar o aviso: ignorar, ou fazer downgrade da extensão, ou
desligar o diagnóstico dela. Subir para o Prisma 7 é um upgrade **major** (a
connection string sai do schema pro `prisma.config.ts`, o runtime passa a exigir
**driver adapter** — `@prisma/adapter-pg` + `pg` — ou Accelerate) e deve ser
feito como tarefa à parte, com teste de deploy.

O `warn ... package.json#prisma is deprecated` que aparece nos comandos do
Prisma é o mesmo caso — inofensivo no v6.

### Runtime do PrismaClient

`src/lib/prisma.ts` mantém um singleton em `globalThis` (evita múltiplas
instâncias no hot reload do dev). O Next carrega o `.env` automaticamente, então
`process.env.DATABASE_URL` está disponível.

---

## 9. Seed (`prisma/seed.ts`)

Idempotente — todo registro usa `id` fixo + `upsert`, pode rodar quantas vezes
quiser sem duplicar. Rodar com `npm run prisma:seed` (precisa do `.env` +
migrations aplicadas).

### Cursos de exemplo (tema guitarra)

| Curso | slug | Módulos / aulas | Matrícula do `aluno.ativo` |
| --- | --- | --- | --- |
| **Guitarra para Iniciantes** | `guitarra-para-iniciantes` | Primeiros passos (Conhecendo a guitarra, Afinação e postura das mãos) · Acordes e ritmo (Acordes maiores e menores, Batidas e levadas essenciais) | ACTIVE |
| **Solos e Improviso** | `solos-e-improviso` | Pentatônica na prática (As 5 posições da pentatônica, Bend/hammer-on/pull-off) | ACTIVE |
| **Harmonia no Braço** | `harmonia-no-braco` | Campo harmônico maior (Montando o campo harmônico, Progressões mais usadas) | *nenhuma* — serve pra ver o card "não matriculado" e a tela de acesso negado |

> Os `id` internos (`course-nextjs`, `mod-intro`, `lesson-boas-vindas`, …) e os
> `videoExternalId` / capas continuam sendo os do scaffold original — são
> **opacos** e **placeholder**. Mantidos assim de propósito para o `prisma:seed`
> atualizar os cursos **no lugar** (sem deixar curso órfão). Troque os
> `videoExternalId` pelos vídeos reais quando tiver — é o único lugar.

### Usuários de teste

| E-mail | Senha | Estado | Serve pra testar |
| --- | --- | --- | --- |
| `aluno.ativo@example.com` | `senha12345` | ACTIVE em 2 cursos | login + catálogo + player liberado |
| `aluno.pendente@example.com` | *(sem senha)* | PENDING | fluxo `/api/auth/set-password` |
| `aluno.revogado@example.com` | `senha12345` | REVOKED | login OK, curso/player devolve acesso negado |
| `sem.matricula@example.com` | `senha12345` | sem matrícula | idem |

Cria também 1 `WebhookEvent` de exemplo (`eventId: seed-tx-0001`, status
`PROCESSED`) pra visualizar a tabela no Prisma Studio.

---

## 10. Frontend / design system

### Tema

- **Arquivo único:** `src/app/globals.css` (tokens + todos os componentes). Sem
  Tailwind, sem CSS Modules.
- **Estética:** dark, estilo Netflix / Prime Video.
- **Accent:** `#9E224C` (`--accent`), hover `#c62c60` (`--accent-2`).
- **Tokens principais:** `--bg #0b0b0f`, `--bg-2 #16161c`, `--surface #1d1d25`,
  `--text #f4f4f6`, `--text-dim`, `--text-faint`, `--border`, `--nav-h 64px`,
  `--maxw 1400px`. Fonte: stack de sistema.
- **Prefixo das classes:** `nf-` (`nf-nav`, `nf-hero`, `nf-hcar`, `nf-row`,
  `nf-card`, `nf-course-*`, `nf-player`, `nf-auth`, `nf-btn`…).

### Componentes

| Componente | Tipo | Onde é usado |
| --- | --- | --- |
| `TopBar` | server | todas as páginas logadas — logo "CURSOS", link "Início", e-mail, botão "Sair" |
| `LogoutButton` | client | dentro do `TopBar` — `POST /api/auth/logout` + `router.push("/login")` |
| `HeroCarousel` | client | `/` — slides absolutos com crossfade, `setInterval` de 7s pausado no hover/foco, setas `‹ ›`, dots |
| `Hero` | server | `/courses/[slug]` — hero de um curso; fundo = `coverImageUrl` ou thumb do YouTube da 1ª aula |
| `CourseCard` | server | grid "Seus cursos" — capa 16:9, título, `courseMeta()`; badge "não matriculado" via `data-locked` |
| `LessonRow` | server | `/courses/[slug]` — um por módulo; carrossel horizontal (`grid-auto-flow: column` + `overflow-x`) |
| `LessonCard` | server | dentro de `LessonRow` — thumb (YouTube) ou fallback com o nome do provedor, badge `1.2`, duração |

### Helpers de UI (`src/lib/format.ts`)

- `formatDuration(segundos)` → `"12 min"` / `"1h 05min"` / `null`.
- `youtubeThumb(id)` → `https://img.youtube.com/vi/<id>/hqdefault.jpg`.
- `plural(n, "módulo")` → `"1 módulo"` / `"3 módulos"`.
- `courseMeta(m, a)` → `"2 módulos · 4 aulas"`.

### Imagens

Usadas com `<img>` puro (não `next/image`) pra não precisar configurar
`remotePatterns`. Thumbs do YouTube resolvem sempre; Vimeo/Panda caem num
fallback com gradiente + nome do provedor.

---

## 11. Variáveis de ambiente

`.env` (copiar de `.env.example`):

| Var | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | sim | Connection string do Postgres. **Aponte para um banco vazio dedicado a este projeto** (ver seção 13). |
| `HOTMART_HOTTOK` | sim (pra webhook) | Painel Hotmart → Ferramentas → Webhook → aba Autenticação. |
| `SESSION_SECRET` | sim | String aleatória longa (assina o cookie JWT). Gerar: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. |
| `CRON_SECRET` | sim (pra crons) | String aleatória que protege `/api/cron/*`. Na Vercel, definir a env var basta — ela injeta o `Bearer` automaticamente. |

O Next carrega o `.env` sozinho (dev e build). Não há mais `dotenv` no projeto.

---

## 12. Comandos

```bash
npm install               # instala + roda "prisma generate" (postinstall)

# banco
npx prisma migrate dev --name <nome>   # cria e aplica migration a partir do schema
npm run prisma:seed                    # popula dados de exemplo (idempotente)
npm run db:reset                       # DROPA tudo, re-migra e re-seeda
npm run prisma:studio                  # UI web local das tabelas

# app
npm run dev                            # http://localhost:3000
npm run build && npm run start         # produção local
npm run lint
```

### Testar o webhook localmente

```bash
npx ngrok http 3000
# cole https://<algo>.ngrok-free.app/api/webhooks/hotmart no painel da Hotmart
# use o botão de teste; confira em `npx prisma studio` a tabela webhook_events
```

---

## 13. Deploy (Vercel)

1. Importar o repositório na Vercel.
2. Definir as env vars: `DATABASE_URL`, `HOTMART_HOTTOK`, `SESSION_SECRET`,
   `CRON_SECRET`.
3. O `postinstall` roda `prisma generate` no build. As migrations você aplica
   com `npx prisma migrate deploy` (num passo de build/release ou manualmente
   apontando pro banco de produção).
4. `vercel.json` já registra os dois cron jobs; a Vercel manda o header
   `Authorization: Bearer <CRON_SECRET>`.
5. Webhook da Hotmart → `https://<seu-dominio>/api/webhooks/hotmart`.

**Observação serverless:** o processamento assíncrono do webhook usa `after()`
(Next 15). Se a função for encerrada antes de terminar, o cron
`reconcile-webhooks` é a rede de segurança — mantenha-o ativo.

Self-hosted (`next start`): igual, só que os crons você agenda no `crontab` (ver
seção 7).

---

## 14. Incidentes durante o desenvolvimento e como recuperar

### `.env` apontando para o banco de outro projeto

Num `prisma migrate dev` o Prisma detectou **drift** e propôs
`prisma migrate reset` (dropar tudo) porque a `DATABASE_URL` apontava para o
banco de **outro sistema** (tabelas `resales`, `distributors`, `campaigns`…).

**Regra:** este projeto precisa de um **banco vazio só dele**. Criar
(`CREATE DATABASE plataforma_cursos;`) e ajustar só o nome no fim da
`DATABASE_URL`. Nunca confirmar `migrate reset` / `migrate dev` / `db push` deste
projeto enquanto a URL apontar para um banco compartilhado com outro sistema.

### `.next` corrompido (`ENOENT ... routes-manifest.json`, `Cannot find module './vendor-chunks/jose.js'`)

Aconteceu porque a pasta `.next` foi apagada / mexida enquanto um `next dev`
ainda a usava (rodar `next build` e `next dev` ao mesmo tempo no mesmo diretório
também causa isso). O código-fonte fica intacto — é só o cache de build.

**Recuperar:**

```powershell
# 1. pare o next dev (Ctrl+C na janela dele)
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force   # se não parar
# 2. apague o cache
Remove-Item -Recurse -Force .next
# 3. suba de novo
npm run dev
```

Não rodar `next build` com um `next dev` ativo no mesmo diretório.

---

## 15. Pendências antes de produção

1. **Confirmar o payload real da Hotmart** e ajustar `src/lib/hotmartPayload.ts`.
2. **Confirmar se o Hottok vem em header ou no corpo** — ajustar
   `src/app/api/webhooks/hotmart/route.ts`.
3. **Fluxo de primeiro acesso de verdade** — trocar o placeholder de
   `/api/auth/set-password` por token enviado por e-mail.
4. **E-mail de boas-vindas / definição de senha** — TODO em
   `src/services/enrollment.ts#grantAccess`.
5. **Campo de próxima cobrança** no `SUBSCRIPTION_CANCELLATION` — hoje fallback
   de 30 dias em `hotmartProcessor.ts`.
6. **URL de embed do Panda** — trocar `player-vz-XXXX` em
   `src/services/videoEmbed.ts` pelo subdomínio real da conta.
7. **Vídeos e capas reais** — `videoExternalId` e `coverImageUrl` no seed são
   placeholder. Cadastrar cursos de verdade via Prisma Studio ou um painel admin
   (ainda não existe).
8. **Prisma 7** — decidir se/quando migrar (ver seção 8).
9. **Rodar `npx prisma validate`** antes da primeira migration num ambiente
   novo (o scaffold foi montado offline).
10. **Painel admin** — não há CRUD de cursos/módulos/aulas; hoje é tudo Prisma
    Studio ou seed.
