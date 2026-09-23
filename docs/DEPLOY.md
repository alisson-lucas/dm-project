# Roteiro de deploy e configuração da Hotmart

Passo a passo pra tirar a plataforma do `localhost` e deixar pronta pra cadastrar
cursos reais. Pensado pra ser executado de cima pra baixo, boa parte junto com o
cliente (os passos no painel da Hotmart são os que dependem dele).

Documentação de arquitetura: [`IMPLEMENTACAO.md`](./IMPLEMENTACAO.md).

---

## ⚠️ Antes de começar — duas regras

**1. Nunca rode o seed em produção.** `prisma db seed` cria quatro usuários de
teste com a senha pública `senha12345` (um deles **ADMIN**) e nove cursos com
vídeos de terceiros. Em produção isso é uma porta aberta. O mesmo vale em dobro
pro `npm run db:reset`, que **apaga o banco inteiro**.

**2. Credencial não entra no repositório.** O `.env` está no `.gitignore` e
continua assim. Em produção, os valores vão nas variáveis de ambiente da
hospedagem — nunca num arquivo commitado.

---

## 1. Banco de produção

Crie um banco **novo e vazio**, separado do de desenvolvimento. Neon, Supabase
ou qualquer Postgres gerenciado serve.

Guarde a connection string — é o `DATABASE_URL`. Se o provedor der duas URLs
(pooled e direct), use a **pooled** no `DATABASE_URL`.

> Não aponte o projeto pra um banco que já tem outro sistema dentro. O
> `prisma migrate` detecta o desencontro e oferece **apagar tudo** pra
> sincronizar — ver o incidente registrado em `IMPLEMENTACAO.md`, seção 14.

## 2. Variáveis de ambiente

| Variável | De onde vem |
| --- | --- |
| `DATABASE_URL` | passo 1 |
| `NEXT_PUBLIC_SITE_URL` | domínio final, com `https://` e **sem barra no fim** — ex.: `https://dmproject.com.br` |
| `SESSION_SECRET` | gere: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `CRON_SECRET` | gere igual ao de cima, valor diferente |
| `HOTMART_HOTTOK` | painel da Hotmart (passo 5) — pode ficar em branco até lá |

`NEXT_PUBLIC_SITE_URL` alimenta OpenGraph, canonical, `sitemap.xml` e
`robots.txt`. Sem ele, o site anuncia `localhost:3000` pro Google e pro WhatsApp.

## 3. Deploy na Vercel

1. Importe o repositório na Vercel.
2. Cadastre as variáveis do passo 2 em **Settings → Environment Variables**
   (ambiente *Production*).
3. Não mexa no build command: o `package.json` já tem
   `"vercel-build": "prisma migrate deploy && next build"`, então **as migrations
   rodam sozinhas a cada deploy**. O `postinstall` cuida do `prisma generate`.
4. Deploy. O banco sai do passo 3 com todas as tabelas criadas e **vazio** — é o
   esperado.

Aponte o domínio final pro projeto antes de seguir: o webhook da Hotmart precisa
de uma URL pública e estável.

## 4. Primeiro acesso do professor (admin)

Não existe tela de cadastro nem rota separada de admin: quem entra no `/admin` é
o usuário que tem `role = ADMIN` no banco. Como o banco de produção nasce vazio,
essa primeira linha é criada na mão.

1. Com a `DATABASE_URL` **de produção** no seu `.env` local, abra:
   ```bash
   npx prisma studio
   ```
2. Tabela `users` → **Add record**:
   - `email`: o e-mail real do professor
   - `name`: o nome dele
   - `role`: `ADMIN`
   - `passwordHash`: **deixe vazio**
   - os demais campos têm valor padrão
3. Salve e **feche o Studio** (não deixe uma sessão aberta contra produção).
4. Peça pro professor entrar em `https://seu-dominio/login`, clicar em
   **“Primeiro acesso? Definir senha”** e definir a senha dele.

> ⚠️ **Faça esse passo 4 imediatamente após criar a linha.** Enquanto a conta
> estiver sem senha, qualquer pessoa que souber o e-mail pode reivindicá-la —
> é a falha conhecida do `/api/auth/set-password` (pendência nº 6 do
> `IMPLEMENTACAO.md`). Vale para o admin e para todo aluno criado pelo webhook.

Confirme que `https://seu-dominio/admin` abre pra ele e cai no `/app` pra
qualquer outro usuário.

## 5. Webhook da Hotmart

No painel da Hotmart, do lado do cliente:

1. **Ferramentas → Webhook → aba Autenticação**: copie o **Hottok**.
2. Cadastre o Hottok como `HOTMART_HOTTOK` na Vercel e **faça redeploy** (a
   variável só entra em vigor no build seguinte).
3. Cadastre a URL do webhook:
   ```
   https://seu-dominio/api/webhooks/hotmart
   ```
4. Marque os eventos: compra aprovada, compra completa, reembolso, chargeback,
   cancelamento, compra expirada/atrasada e cancelamento de assinatura.
5. Use o **botão de testar webhook** do painel.

### 5.1. Capture o payload — este é o passo que destrava o resto

O arquivo [`src/lib/hotmartPayload.ts`](../src/lib/hotmartPayload.ts) foi escrito
a partir de documentação pública; **nunca vimos um payload real desta conta**. O
teste do passo 5 grava o JSON cru no banco mesmo que o processamento falhe.

Com a `DATABASE_URL` de produção, abra o `npx prisma studio`, vá na tabela
`webhook_events`, pegue a linha mais recente e copie a coluna **`payload`**
inteira. É esse JSON que eu preciso para:

- ajustar os nomes de campo em `hotmartPayload.ts`, e
- fixar se o Hottok chega no header `x-hotmart-hottok` ou dentro do corpo
  (hoje [a rota](../src/app/api/webhooks/hotmart/route.ts) aceita os dois).

Como ler o `status` da linha:

| status | o que significa |
| --- | --- |
| `PROCESSED` | funcionou de ponta a ponta |
| `IGNORED` | payload não reconhecido — **esperado no primeiro teste**; o JSON está lá |
| `RECEIVED` | chegou mas travou no meio; o cron reprocessa em até 5 min |
| `FAILED` | processou e deu erro — leia a coluna `error` |

Um `FAILED` com *"Nenhum curso mapeado para o produto Hotmart X"* é normal antes
do passo 6: o evento chegou certo, só não existe curso ligado àquele produto
ainda.

## 6. Cadastrar os cursos reais

Tudo pelo `/admin`, nesta ordem, **um curso por vez**:

1. **Novo curso** → título, endereço, descrição, estilo, nível, capa e o
   **link de compra** (URL de checkout da Hotmart). Salve.
2. Na tela seguinte, **Produto na Hotmart** → cole o **código do produto** (o
   código da oferta só se o produto tiver ofertas que dão cursos diferentes).
   *Sem isso a compra chega e nada é liberado.*
3. **Conteúdo do curso** → crie os módulos e, dentro de cada um, as aulas
   (título, onde está o vídeo, código do vídeo, duração no formato `24:19`).

No código do vídeo vai só o **identificador**, nunca a URL inteira: no YouTube é
o que vem depois de `v=`.

A lista do `/admin` marca em âmbar o que ainda trava cada curso — *sem aulas*,
*não libera na compra*, *sem link de compra*. Zere essas marcas antes de divulgar.

## 7. Crons

Já estão declarados no [`vercel.json`](../vercel.json) e passam a rodar sozinhos
assim que o `CRON_SECRET` existir no ambiente:

| Rota | Quando | Pra quê |
| --- | --- | --- |
| `/api/cron/reconcile-webhooks` | a cada 5 min | reprocessa evento que travou em `RECEIVED` |
| `/api/cron/revoke-expired-enrollments` | de hora em hora | tira o acesso de assinatura cancelada quando o ciclo pago acaba |

Teste manualmente:
```bash
curl -i -H "Authorization: Bearer SEU_CRON_SECRET" \
  https://seu-dominio/api/cron/reconcile-webhooks
```
Espere `200` e `{"ok":true}`. Sem o header, `401` — é o comportamento correto.

## 8. Checklist antes de divulgar

- [ ] Landing abre no domínio final e o compartilhamento no WhatsApp mostra o
      domínio certo (não `localhost`)
- [ ] Professor entra no `/admin`; aluno comum cai no `/app`
- [ ] Um curso real completo: ficha, produto ligado, módulos e aulas
- [ ] `/app/explorar` lista o curso; quem não comprou vê **“Comprar curso”** e o
      botão leva ao checkout certo
- [ ] Os dois crons respondem `200` com o secret e `401` sem
- [ ] **Compra de verdade de ponta a ponta**: comprar (ou usar cupom de 100%),
      confirmar que o e-mail vira aluno com matrícula `ACTIVE` e que ele assiste
- [ ] Nenhum curso com marca âmbar no `/admin`
- [ ] Banco de produção **sem** os usuários de teste do seed

## 9. Pendências que continuam abertas

Não bloqueiam o deploy, mas bloqueiam vender com tranquilidade:

1. **`/api/auth/set-password` é placeholder.** Qualquer um que saiba o e-mail de
   um aluno recém-criado pode reivindicar a conta antes dele. Precisa virar
   token enviado por e-mail — é a correção mais urgente da lista.
2. **E-mail de boas-vindas não existe.** Hoje o aluno compra e não recebe nada
   dizendo como entrar. TODO em `services/enrollment.ts#grantAccess`.
3. **`SUBSCRIPTION_CANCELLATION` usa fallback de 30 dias** em vez da data real da
   próxima cobrança — só importa se algum curso for vendido por assinatura.
4. **Panda Video**: se migrarem do YouTube, trocar o subdomínio em
   `services/videoEmbed.ts`.

---

## Alternativa: fora da Vercel

Se hospedar em outro lugar (`npm run build && npm run start`):

- Rode `npx prisma migrate deploy` a cada release, antes de subir a aplicação.
- Os crons do `vercel.json` são ignorados; agende no `crontab`:
  ```
  */5 * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://seu-dominio/api/cron/reconcile-webhooks
  0   * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://seu-dominio/api/cron/revoke-expired-enrollments
  ```
- O processamento assíncrono do webhook usa `after()` do Next. Num servidor
  persistente ele é confiável; o cron de reconciliação continua sendo a rede de
  segurança em qualquer cenário.
