import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getLandingData } from '@/services/landing'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { VideoFacade } from '@/components/landing/VideoFacade'
import { Cta } from '@/components/landing/Cta'
import { Ticker } from '@/components/landing/Ticker'
import { CourseCarousel } from '@/components/landing/CourseCarousel'
import { HeroPortrait } from '@/components/landing/HeroPortrait'
import { SITE_NAME, TEACHER } from '@/lib/site'
import {
  BENEFITS,
  FAQ,
  HERO,
  OFFER,
  TEACHER_BIO,
  TEACHER_STATS,
  TESTIMONIAL,
} from '@/lib/landing'
import { heroBg, sectionTitle } from '@/lib/ui'
import { plural } from '@/lib/format'

// Landing é ISR, NÃO force-dynamic como as páginas da área logada: ela recebe
// tráfego de anúncio e precisa sair do cache. Os números do catálogo se
// atualizam sozinhos a cada 10 min.
export const revalidate = 600

const TITLE = `Aulas de guitarra com ${TEACHER.name}`
const DESCRIPTION =
  'Do primeiro desenho da pentatônica ao improviso sobre a progressão inteira. O método do DM Project em trilha, no seu ritmo.'

export async function generateMetadata(): Promise<Metadata> {
  const { images } = await getLandingData()
  return {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      siteName: SITE_NAME,
      locale: 'pt_BR',
      type: 'website',
      ...(images.og ? { images: [{ url: images.og }] } : {}),
    },
    twitter: {
      card: images.og ? 'summary_large_image' : 'summary',
      title: TITLE,
      description: DESCRIPTION,
    },
    alternates: { canonical: '/' },
  }
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[1.5rem] font-bold tabular-nums leading-none">
        {value}
      </div>
      <div className="mt-1.5 text-[0.6rem] font-medium uppercase tracking-[0.13em] text-text-faint">
        {label}
      </div>
    </div>
  )
}

const wrap = 'mx-auto w-full max-w-page px-[clamp(16px,4vw,48px)]'

// "DM PROJECT" -> "DM" em cima, "PROJECT" embaixo. Sai do SITE_NAME pra que
// trocar a marca leve junto a tipografia gigante do "Quem ensina".
const [BRAND_TOP, ...BRAND_REST] = SITE_NAME.split(' ')
const BRAND_BOTTOM = BRAND_REST.join(' ') || BRAND_TOP

export default async function LandingPage() {
  const { courses, totals, images } = await getLandingData()

  return (
    <>
      <LandingHeader />

      <main>
        {/* ---------------------------------------------------------- hero */}
        <section className="relative overflow-hidden">
          <div className={heroBg} aria-hidden />

          <div
            className={`${wrap} relative z-2 grid items-center gap-[clamp(28px,5vw,56px)] pb-14 pt-28 lg:pb-20 lg:pt-32 ${
              // sem a foto ainda, o texto ocupa a largura toda em vez de
              // deixar meia dobra vazia
              images.hero ? 'lg:grid-cols-[1.05fr_0.95fr]' : 'max-w-[60ch]'
            }`}
          >
            <div>
              {/* linha de fatos — no lugar do "data + local" da referência */}
              <ul className="mb-6 flex flex-wrap gap-x-6 gap-y-2">
                {HERO.facts.map((fact) => (
                  <li
                    key={fact}
                    className="flex items-center gap-2 text-[0.78rem] font-medium text-text-dim"
                  >
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 flex-none rounded-full bg-accent-2"
                    />
                    {fact}
                  </li>
                ))}
              </ul>

              <h1 className="text-[clamp(2.3rem,6vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
                {HERO.headline.lead}
                <br />
                <span className="text-accent-2">{HERO.headline.highlight}</span>
              </h1>

              {/* os dois parágrafos ficam aqui, e não no config, por causa do
                  <strong> no meio */}
              <p className="mt-6 max-w-[46ch] text-[clamp(1rem,1.7vw,1.15rem)] leading-[1.55] text-text">
                Pentatônica, modos gregos e reharmonização{' '}
                <strong className="font-semibold">aplicados no braço</strong>,
                na ordem certa, até você improvisar com intenção.
              </p>

              <p className="mt-4 max-w-[50ch] text-[0.92rem] leading-[1.65] text-text-dim">
                Um método em ordem, do primeiro desenho até o chorus inteiro —{' '}
                <strong className="font-semibold text-text">
                  mesmo que hoje você trave toda vez que o solo abre
                </strong>
                .
              </p>

              <Cta className="mt-9" label={HERO.ctaLabel} />

              {totals.courses > 0 ? (
                <div className="mt-9 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/8 pt-6">
                  <Stat
                    value={String(totals.courses)}
                    label={totals.courses === 1 ? 'Curso' : 'Cursos'}
                  />
                  <Stat value={String(totals.lessons)} label="Aulas" />
                  {totals.durationLabel ? (
                    <Stat value={totals.durationLabel} label="De conteúdo" />
                  ) : null}
                </div>
              ) : null}
            </div>

            {images.hero ? (
              <HeroPortrait
                src={images.hero}
                cutout={images.heroIsCutout}
                alt={TEACHER.name}
              />
            ) : null}
          </div>

          <Ticker />
        </section>

        {/* ---------------------------------------------------- benefícios */}
        <section className={`${wrap} py-[clamp(48px,7vw,88px)]`}>
          <div className="grid gap-5 md:grid-cols-3">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-xl border border-white/8 bg-surface p-6"
              >
                <h3 className="text-[1rem] font-bold">{b.title}</h3>
                <p className="mt-2.5 text-[0.88rem] leading-[1.6] text-text-dim">
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------ o que você vai ver */}
        {/* Estilo da referência: cabeçalho centralizado, carrossel de cards
            RETRATO sangrando pelas bordas com o título em caixa alta sobre a
            imagem, dots de paginação e CTA fechando a seção. */}
        {courses.length > 0 ? (
          <section className="pb-[clamp(48px,7vw,88px)]">
            <div className={`${wrap} text-center`}>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-accent-2">
                // O método
              </p>
              <h2 className="mt-3 text-[clamp(1.7rem,4vw,2.4rem)] font-extrabold leading-[1.08] tracking-[-0.025em]">
                O que você vai aprender
              </h2>
              <p className="mx-auto mt-4 max-w-[56ch] text-[0.9rem] leading-[1.6] text-text-dim">
                {plural(totals.courses, 'curso')} ·{' '}
                {plural(totals.lessons, 'aula')}
                {totals.durationLabel ? ` · ${totals.durationLabel}` : ''} de
                conteúdo, numa sequência que leva do desenho básico ao improviso
                sobre a progressão inteira.
              </p>
            </div>

            <div className="mt-9">
              <CourseCarousel
                courses={courses}
                fallbackCover={images.courseCover}
              />
            </div>

            <div className={`${wrap} mt-9 flex justify-center`}>
              <Cta label={HERO.ctaLabel} />
            </div>
          </section>
        ) : null}

        {/* ------------------------------------------------- depoimento */}
        <section className="border-y border-white/8 bg-bg-2 py-[clamp(48px,7vw,88px)]">
          <div
            className={`${wrap} grid items-center gap-[clamp(28px,4vw,52px)] lg:grid-cols-[1fr_1fr]`}
          >
            <div>
              <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-accent-2">
                Aluno da casa
              </p>
              <h2 className={`${sectionTitle} text-[clamp(1.4rem,3vw,1.9rem)]`}>
                {TESTIMONIAL.studentName}
              </h2>
              <p className="mt-3 max-w-[46ch] text-[0.92rem] leading-[1.6] text-text-dim">
                {TESTIMONIAL.quote}
              </p>
            </div>

            <VideoFacade
              videoId={TESTIMONIAL.videoId}
              title={TESTIMONIAL.title}
            />
          </div>
        </section>

        {/* -------------------------------------------- sobre o professor */}
        {/* Estrutura da referência: bloco sólido com o texto, foto sobrepondo
            a borda dele e a marca em tipografia gigante sangrando pra fora.
            Adaptado pro tema escuro — o card assume o carmim no lugar do creme.

            As duas palavras gigantes são ancoradas À FOTO (bottom-full /
            top-full), não à seção. Isso resolve os dois breakpoints com o
            mesmo código:
              desktop -> foto à direita, palavras acima e abaixo dela
              mobile  -> foto em cima do card, então a palavra de baixo cai
                         exatamente na emenda e o card a engole (ela fica em
                         z-0, atrás), que é o efeito do print. */}
        <section className="relative overflow-hidden py-[clamp(52px,8vw,104px)]">
          <div className={`${wrap} relative`}>
            <div
              className={`grid items-center gap-6 lg:gap-0 ${
                images.about ? 'lg:grid-cols-[1.12fr_0.88fr]' : ''
              }`}
            >
              {/* o bloco sólido — no mobile sangra até as bordas da tela e o
                  texto centraliza, como no print */}
              <div
                className={`relative z-10 order-2 -mx-[clamp(16px,4vw,48px)] bg-accent px-[clamp(24px,6vw,48px)] py-[clamp(36px,7vw,56px)] text-center lg:order-1 lg:mx-0 lg:rounded-2xl lg:text-left ${
                  images.about ? 'lg:pr-[clamp(64px,9vw,132px)]' : ''
                }`}
              >
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white/65">
                  // Quem ensina
                </p>

                <h2 className="mt-4 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-white">
                  {TEACHER.name}
                </h2>

                <p className="mx-auto mt-5 max-w-[46ch] text-[0.93rem] leading-[1.7] text-white/80 lg:mx-0">
                  {TEACHER_BIO}
                </p>

                {TEACHER_STATS.length > 0 ? (
                  <div className="mt-9 flex flex-wrap justify-center gap-x-10 gap-y-6 border-t border-white/25 pt-7 lg:justify-start lg:gap-x-12">
                    {TEACHER_STATS.map((stat) => (
                      <div
                        key={stat.label}
                        className="text-center lg:text-left"
                      >
                        <div className="text-[clamp(2.6rem,11vw,3.4rem)] font-extrabold leading-[0.9] tracking-[-0.03em] text-white">
                          {stat.value}
                        </div>
                        <div className="mx-auto mt-2 max-w-[18ch] text-[0.76rem] leading-[1.4] text-white/70 lg:mx-0">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* Aqui ficava um link pro canal. Saiu de propósito: mandar
                    quem está decidindo a compra pra fora da página é vazamento
                    de conversão. A seção fecha com o botão. */}
                <Cta className="mt-9" label={HERO.ctaLabel} variant="light" />
              </div>

              {/* a foto, com as palavras gigantes penduradas nela */}
              {images.about ? (
                <div className="relative order-1 lg:order-2 lg:-ml-[clamp(40px,7vw,112px)]">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-full right-0 z-0 translate-y-[0.2em] select-none text-[clamp(3.5rem,15vw,11rem)] font-extrabold uppercase leading-[0.78] tracking-[-0.05em] text-white/[0.05]"
                  >
                    {BRAND_TOP}
                  </span>

                  <div className="relative z-10 aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 shadow-[0_44px_90px_-32px_rgba(0,0,0,0.9)]">
                    <Image
                      src={images.about}
                      alt={TEACHER.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                  </div>

                  <span
                    aria-hidden
                    className="pointer-events-none absolute right-0 top-full z-0 translate-y-[0.08em] select-none text-[clamp(3rem,13vw,8.5rem)] font-extrabold uppercase leading-[0.78] tracking-[-0.05em] text-accent/35"
                  >
                    {BRAND_BOTTOM}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ oferta */}
        <section className={`${wrap} pb-[clamp(48px,7vw,88px)]`}>
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-[radial-gradient(120%_140%_at_80%_0%,rgba(158,34,76,0.35),transparent_62%),linear-gradient(135deg,#1d1d25,#141018)] p-[clamp(28px,5vw,56px)] text-center">
            <h2 className="text-[clamp(1.6rem,3.5vw,2.3rem)] font-extrabold leading-[1.1] tracking-[-0.02em]">
              Comece hoje a improvisar com intenção
            </h2>

            {OFFER.priceLabel || OFFER.installmentLabel ? (
              <p className="mt-4 text-[1.1rem] font-semibold">
                {OFFER.installmentLabel ?? OFFER.priceLabel}
              </p>
            ) : null}

            <p className="mx-auto mt-3 max-w-[46ch] text-[0.9rem] leading-[1.6] text-text-dim">
              Pagamento pela Hotmart, com {OFFER.guaranteeDays} dias de
              garantia. O acesso é liberado automaticamente após a confirmação.
            </p>

            <Cta className="mt-7" label="Quero começar agora" note />
          </div>
        </section>

        {/* --------------------------------------------------------- faq */}
        {/* Estilo da referência: faixa vinho ocupando a largura toda, cards
            creme com o botão de seta trocando de estado, e o rodapé dentro da
            mesma faixa separado por um filete.

            Continua em <details>/<summary> nativo: acordeão sem uma linha de
            JavaScript, e o estado aberto/fechado do botão sai do group-open. */}
        <section className="bg-accent-deep py-[clamp(56px,8vw,104px)]">
          <div className={wrap}>
            <div className="text-center">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-cream/60">
                // FAQ
              </p>
              <h2 className="mt-3 text-[clamp(1.7rem,4vw,2.4rem)] font-extrabold leading-[1.08] tracking-[-0.025em] text-cream">
                Perguntas frequentes
              </h2>
            </div>

            <div className="mx-auto mt-10 flex max-w-[840px] flex-col gap-3.5">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  // primeiro item aberto: a referência mostra as respostas à
                  // vista, e um FAQ todo fechado vira uma parede de barras
                  open={item === FAQ[0]}
                  className="group overflow-hidden rounded-2xl bg-cream"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-5 px-6 py-5 sm:px-7">
                    <h3 className="flex-1 text-[clamp(1rem,2.2vw,1.15rem)] font-semibold leading-[1.35] text-ink">
                      {item.q}
                    </h3>

                    <span
                      aria-hidden
                      className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-accent-deep/35 text-accent-deep transition-colors group-open:border-accent-deep group-open:bg-accent-deep group-open:text-cream"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 transition-transform duration-200 group-open:rotate-180"
                      >
                        {/* seta apontando pro canto superior direito; ao abrir
                            ela gira 180° e passa a apontar pro inferior
                            esquerdo, como na referência */}
                        <path d="M4.5 11.5 11.5 4.5" />
                        <path d="M6 4.5h5.5V10" />
                      </svg>
                    </span>
                  </summary>

                  <p className="px-6 pb-6 text-[0.92rem] leading-[1.65] text-ink/75 sm:px-7">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>

            {/* rodapé dentro da mesma faixa, como no print */}
            <footer className="mt-[clamp(40px,6vw,72px)] flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-cream/15 pt-8 text-[0.78rem] text-cream/60">
              <span className="font-extrabold tracking-[0.2em] text-cream">
                {SITE_NAME}
              </span>
              <span>
                © {new Date().getFullYear()} {TEACHER.name} — todos os direitos
                reservados
              </span>
              <Link
                href="/login"
                className="ml-auto text-cream/75 transition-colors hover:text-cream"
              >
                Entrar na plataforma
              </Link>
            </footer>
          </div>
        </section>
      </main>
    </>
  )
}
