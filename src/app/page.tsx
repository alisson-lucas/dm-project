import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getLandingData } from '@/services/landing'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { Logo } from '@/components/Logo'
import { DevNotice } from '@/components/landing/DevNotice'
import { VideoFacade } from '@/components/landing/VideoFacade'
import { Cta } from '@/components/landing/Cta'
import { Ticker } from '@/components/landing/Ticker'
import { CourseCarousel } from '@/components/landing/CourseCarousel'
import { Offer } from '@/components/landing/Offer'
import { HeroPortrait } from '@/components/landing/HeroPortrait'
import { HeroStage } from '@/components/landing/HeroStage'
import { Reveal } from '@/components/landing/Reveal'
import { Parallax } from '@/components/landing/Parallax'
import { CountUp } from '@/components/landing/CountUp'
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
import { sectionTitle } from '@/lib/ui'
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
      {/* <DevNotice /> */}
      <LandingHeader />

      <main>
        {/* ---------------------------------------------------------- hero */}
        {/* Composição da referência Nexora: figura recortada CENTRALIZADA, os
            dois blocos de texto flanqueando lá em cima, headline gigante
            atravessando a base por cima da figura e os botões no canto
            inferior esquerdo. Fundo escuro com halo carmim chapado atrás da
            figura, trama de pontos e réguas verticais. */}
        <section className="relative isolate flex min-h-[min(94vh,900px)] flex-col overflow-hidden">
          {/* camadas de fundo */}
          <div aria-hidden className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,#1a1016,#0b0b0f_62%)]" />
            {/* trama de pontos, densa no centro e sumindo nas bordas */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(74%_64%_at_50%_46%,#000_8%,transparent_78%)]" />
            {/* réguas verticais da grade */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:25%_100%] [mask-image:linear-gradient(to_bottom,transparent,#000_16%,#000_84%,transparent)]" />
          </div>

          {/* HeroStage é só a casca cliente da animação de entrada: ela acha
              os alvos abaixo pelo data-hero e roda a linha do tempo. O
              conteúdo continua renderizado no servidor. */}
          <HeroStage
            className={`${wrap} relative z-10 flex flex-1 flex-col pt-28 lg:pt-32`}
          >
            {/* ---- linha de cima: textos flanqueando a figura ---- */}
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-6">
              <div data-hero="side" className="lg:max-w-[15ch]">
                <p className="text-[clamp(1.15rem,2.1vw,1.6rem)] font-extrabold uppercase leading-[1.12] tracking-[-0.01em]">
                  {HERO.headline.lead}
                </p>

                <ul className="mt-5 flex flex-col gap-2">
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
              </div>

              {/* coluna central: espaço da figura no desktop */}
              <div aria-hidden className="hidden lg:block" />

              <div
                data-hero="side"
                className="lg:ml-auto lg:max-w-[26ch] lg:pt-1"
              >
                <p className="max-w-[34ch] text-[0.92rem] leading-[1.6] text-text-dim">
                  Pentatônica, modos gregos e reharmonização{' '}
                  <strong className="font-semibold text-text">
                    aplicados no braço
                  </strong>
                  , na ordem certa, até você improvisar com intenção.
                </p>

                <Link
                  href="#metodo"
                  className="mt-4 inline-block text-[0.88rem] font-medium text-text underline underline-offset-4 transition-colors hover:text-accent-2"
                >
                  O que você vai aprender?
                </Link>
              </div>
            </div>

            {/* ---- a figura ---- */}
            {images.hero ? (
              <HeroPortrait
                data-hero="figure"
                src={images.hero}
                cutout={images.heroIsCutout}
                alt={TEACHER.name}
                // A figura precisa caber ENTRE os dois blocos de texto: com
                // largura total, o braço da guitarra invadia a coluna da
                // direita e comia a primeira palavra do parágrafo.
                className="mx-auto mt-6 aspect-square w-[min(78%,340px)] lg:absolute lg:bottom-0 lg:left-1/2 lg:top-[140px] lg:mt-0 lg:aspect-auto lg:w-[min(620px,46%)] lg:-translate-x-1/2"
              />
            ) : (
              // sem figura, o miolo não pode colapsar e grudar a headline no topo
              <div aria-hidden className="min-h-[clamp(40px,10vw,150px)]" />
            )}

            {/* empurra a headline pro rodapé do hero no desktop */}
            <div aria-hidden className="hidden flex-1 lg:block" />

            {/* ---- headline gigante + botões, por cima da figura ---- */}
            <div className="relative z-20 mt-10 pb-10 lg:mt-0 lg:pb-14">
              <h1
                data-hero="title"
                className="text-[clamp(2.4rem,9.5vw,7rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.045em] [text-shadow:0_10px_40px_rgba(0,0,0,0.55)]"
              >
                {HERO.headline.highlight}
              </h1>

              <div
                data-hero="actions"
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <Cta label={HERO.ctaLabel} />
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-7 py-4 text-[0.82rem] font-bold uppercase tracking-[0.08em] text-text backdrop-blur-sm transition-colors hover:bg-white/12"
                >
                  Já sou aluno
                </Link>
              </div>

              {totals.courses > 0 ? (
                <div
                  data-hero="stats"
                  className="mt-9 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-6"
                >
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
          </HeroStage>

          <Ticker />
        </section>

        {/* ---------------------------------------------------- benefícios */}
        <section className={`${wrap} py-[clamp(48px,7vw,88px)]`}>
          <Reveal stagger className="grid gap-5 md:grid-cols-3">
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
          </Reveal>
        </section>

        {/* ------------------------------------------ o que você vai ver */}
        {/* Estilo da referência: cabeçalho centralizado, carrossel de cards
            RETRATO sangrando pelas bordas com o título em caixa alta sobre a
            imagem, dots de paginação e CTA fechando a seção. */}
        {courses.length > 0 ? (
          <section
            id="metodo"
            className="scroll-mt-20 pb-[clamp(48px,7vw,88px)]"
          >
            <Reveal stagger className={`${wrap} text-center`}>
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
            </Reveal>

            {/* a fita sangra pelas bordas, então ela entra por escala e não
                por deslocamento lateral — empurrar de lado brigaria com o
                scroll horizontal do próprio carrossel */}
            <Reveal from="scale" className="mt-9">
              <CourseCarousel
                courses={courses}
                fallbackCover={images.courseCover}
              />
            </Reveal>

            <Reveal className={`${wrap} mt-9 flex justify-center`}>
              <Cta label={HERO.ctaLabel} />
            </Reveal>
          </section>
        ) : null}

        {/* ------------------------------------------------- depoimento */}
        <section className="overflow-hidden border-y border-white/8 bg-bg-2 py-[clamp(48px,7vw,88px)]">
          <div
            className={`${wrap} grid items-center gap-[clamp(28px,4vw,52px)] lg:grid-cols-[1fr_1fr]`}
          >
            <Reveal from="left">
              <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-accent-2">
                Aluno da casa
              </p>
              <h2 className={`${sectionTitle} text-[clamp(1.4rem,3vw,1.9rem)]`}>
                {TESTIMONIAL.studentName}
              </h2>
              <p className="mt-3 max-w-[46ch] text-[0.92rem] leading-[1.6] text-text-dim">
                {TESTIMONIAL.quote}
              </p>
            </Reveal>

            <Reveal from="right">
              <VideoFacade
                videoId={TESTIMONIAL.videoId}
                title={TESTIMONIAL.title}
              />
            </Reveal>
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
              <Reveal
                from="left"
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
                        <CountUp
                          value={stat.value}
                          className="block text-[clamp(2.6rem,11vw,3.4rem)] font-extrabold tabular-nums leading-[0.9] tracking-[-0.03em] text-white"
                        />
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
              </Reveal>

              {/* a foto, com as palavras gigantes penduradas nela */}
              {images.about ? (
                <Reveal
                  from="right"
                  className="relative order-1 lg:order-2 lg:-ml-[clamp(40px,7vw,112px)]"
                >
                  {/* As duas palavras gigantes andam com o scroll, mais que a
                      foto: é o que dá a sensação de profundidade entre elas e
                      o card. Decorativas — o nome da marca já está no logo. */}
                  <Parallax
                    hidden
                    distance={18}
                    className="pointer-events-none absolute bottom-full right-0 z-0 translate-y-[0.2em] select-none text-[clamp(3.5rem,15vw,11rem)] font-extrabold uppercase leading-[0.78] tracking-[-0.05em] text-white/[0.05]"
                  >
                    {BRAND_TOP}
                  </Parallax>

                  <div className="relative z-10 aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 shadow-[0_44px_90px_-32px_rgba(0,0,0,0.9)]">
                    <Image
                      src={images.about}
                      alt={TEACHER.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                  </div>

                  <Parallax
                    hidden
                    distance={18}
                    className="pointer-events-none absolute right-0 top-full z-0 translate-y-[0.08em] select-none text-[clamp(3rem,13vw,8.5rem)] font-extrabold uppercase leading-[0.78] tracking-[-0.05em] text-accent/35"
                  >
                    {BRAND_BOTTOM}
                  </Parallax>
                </Reveal>
              ) : null}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ oferta */}
        <Reveal from="scale">
          <Offer totals={totals} />
        </Reveal>

        {/* --------------------------------------------------------- faq */}
        {/* Estilo da referência: faixa vinho ocupando a largura toda, cards
            creme com o botão de seta trocando de estado, e o rodapé dentro da
            mesma faixa separado por um filete.

            Continua em <details>/<summary> nativo: acordeão sem uma linha de
            JavaScript, e o estado aberto/fechado do botão sai do group-open. */}
        <section className="bg-accent-deep py-[clamp(56px,8vw,104px)]">
          <div className={wrap}>
            <Reveal stagger className="text-center">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-cream/60">
                // FAQ
              </p>
              <h2 className="mt-3 text-[clamp(1.7rem,4vw,2.4rem)] font-extrabold leading-[1.08] tracking-[-0.025em] text-cream">
                Perguntas frequentes
              </h2>
            </Reveal>

            <Reveal
              stagger
              className="mx-auto mt-10 flex max-w-[840px] flex-col gap-3.5"
            >
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
            </Reveal>

            {/* rodapé dentro da mesma faixa, como no print */}
            <footer className="mt-[clamp(40px,6vw,72px)] flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-cream/15 pt-8 text-[0.78rem] text-cream/60">
              <Logo className="text-cream" markClassName="h-8 w-8" textClassName="text-[0.95rem]" />
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
