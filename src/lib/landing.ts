// Tudo que é copy/oferta da landing mora aqui, no mesmo espírito do site.ts:
// mexer no texto ou no preço não deve exigir caçar JSX.

export const OFFER = {
  // TODO: colar o link do checkout da Hotmart. Enquanto for null, os botões
  // de compra ficam inertes e a página avisa que falta configurar — melhor
  // isso do que um botão que leva pro lugar errado.
  checkoutUrl: null as string | null,

  // R$ 97 à vista, confirmado pelo professor no briefing de 16/09/2026 — ele
  // respondeu o mesmo valor que estava provisório aqui, e deixou o campo de
  // parcelamento em branco (por isso `prefix` segue null).
  //
  // Fica em partes (e não numa string só) porque a seção compõe a tipografia
  // da referência: prefixo pequeno, "R$" médio, número gigante e centavos
  // menores. Uma string única não daria esse controle.
  price: {
    prefix: null as string | null, // ex.: "12x de"
    amount: "97", // parte inteira, sem "R$"
    cents: null as string | null, // ex.: ",90"
    // linha da pílula tracejada; null esconde a pílula
    alternative: null as string | null, // ex.: "Ou R$ 970,00 à vista"
  },

  // ⚠️ NÃO RESPONDIDO no briefing: o campo voltou em branco. Fica nos 7 dias,
  // que é o mínimo que a lei exige — mas é uma promessa pública que o
  // professor ainda não confirmou. Ver PLACEHOLDERS.
  guaranteeDays: 7,

  // Checklist da coluna esquerda. As três primeiras linhas (cursos, aulas e
  // duração) são geradas a partir do catálogo real — estas aqui são as que
  // não dá pra derivar do banco.
  includes: [
    "Trilha em ordem, do primeiro desenho ao improviso",
    "A plataforma guarda onde você parou",
    "Assista no computador ou no celular",
    "Acesso enquanto sua compra estiver ativa",
  ],
};

// Caminhos esperados em public/images/landing/, SEM extensão: o build tenta
// .png, .webp, .jpg e .jpeg nessa ordem (services/landing.ts) e o que não
// existir vira null, com a seção degradando em vez de quebrar.
//
// A extensão do hero também decide o tratamento visual:
//   .png/.webp -> tratado como recorte (fundo transparente): a foto fica POR
//                 CIMA do círculo, estourando a borda, como na referência.
//   .jpg/.jpeg -> tratado como foto retangular: vira um bloco arredondado.
export const LANDING_IMAGES = {
  hero: "/images/landing/professor-hero",
  // capa padrão dos cards do carrossel de cursos: vale pra todos, já que não
  // existe arte por curso. Se um curso ganhar capa própria no banco, ela tem
  // prioridade sobre esta.
  courseCover: "/images/landing/curso-cover",
  about: "/images/landing/professor-sobre",
  og: "/images/landing/og",
};

// Hero. A copy dos dois parágrafos fica no JSX da página porque tem <strong>
// no meio; o resto é texto puro e mora aqui.
export const HERO = {
  // equivalente ao "data + local" da referência, adaptado pra curso gravado
  facts: ["100% online, no seu ritmo", "Acesso imediato após a compra"],
  headline: {
    lead: "Pare de decorar formas.",
    highlight: "Comece a improvisar.",
  },
  ctaLabel: "Quero começar agora",
};

// Fita rolante no pé do hero: as dores de quem já toca e trava na hora de
// solar. Nada de número inventado — só o problema que o método resolve.
export const TICKER = [
  "Decora a forma e trava na hora de solar",
  "Sabe a pentatônica, mas tudo sai igual",
  "Não sabe o que tocar em cima do acorde",
  "Improvisa sempre com as mesmas três frases",
  "Toca há anos e continua no mesmo lugar",
  "Modos gregos sempre pareceram teoria demais",
];

// Bio do professor na seção "Quem ensina".
//
// TODO: substituir pela bio real. Credencial concreta (anos ensinando, formação,
// com quem tocou, quantos alunos já passaram) é a prova social mais forte que
// essa página pode ter, e é a única coisa aqui que eu não tenho como escrever
// no lugar dele. O texto abaixo descreve o método, que é verificável, em vez de
// inventar currículo.
// Texto do próprio professor (briefing de 16/09/2026), em primeira pessoa.
// Mexi só na ortografia, na pontuação e no nome próprio das escolas — nenhum
// fato foi acrescentado, tirado ou arredondado. O original bruto está em
// docs/respostas-cliente.csv, se precisar conferir.
export const TEACHER_BIO =
  "Comecei na música aos 14 anos, na igreja, e logo fui atrás de aulas com músicos da região. Aos 20 já tocava com bandas e artistas locais e dava as primeiras aulas na comunidade onde morava. Isso me levou a dar aula em escolas como o Colégio Salesiano, o Espaço Musical Asafe e a Escola Dom Bosco de Artes e Ofícios. Há 15 anos fundei o meu próprio espaço, o DM Project Music, por onde já passaram músicos que hoje vivem de música.";

// Números grandes do card "Quem ensina". Credencial concreta é a prova social
// mais forte dessa seção — e por isso mesmo nenhum número entra aqui sem o
// professor ter confirmado por escrito.
//
// Os dois respondidos e confirmados pelo professor no briefing de 16/09/2026.
// 35 anos bate com a bio (começou a dar aula aos 20); o total de alunos veio
// como "2.0000" no formulário e ele confirmou depois que são 2.000.
export const TEACHER_STATS: { value: string; label: string }[] = [
  { value: "+35", label: "Anos dando aula" },
  { value: "+2.000", label: "Alunos" },
];

// Depoimento em vídeo do aluno.
//
// ⚠️ TEMPORÁRIO — `quote` hoje DESCREVE o vídeo em vez de citar o aluno. A
// seção passou a exibir essa frase em corpo grande, como fala dele: com o
// texto atual ela lê como legenda, não como depoimento. Ver PLACEHOLDERS.
export const TESTIMONIAL = {
  videoId: "2_lJfSzOB-Q",
  studentName: "Fernando Lima",
  title: "Apresentação do aluno Fernando Lima",
  quote:
    "Aluno do DM Project tocando o que construiu ao longo da trilha.",
};

// `art` escolhe o diagrama de braço que acompanha o card (ver
// components/landing/Benefits.tsx). Fica aqui, e não pela POSIÇÃO no array,
// pra reordenar a lista não trocar os desenhos de lugar.
export const BENEFITS: {
  title: string;
  body: string;
  art: "ordem" | "braco" | "ritmo";
}[] = [
  {
    art: "ordem",
    title: "Uma ordem que faz sentido",
    body: "Cada aula abre a próxima, do primeiro desenho até o improviso sobre a progressão inteira. Você sempre sabe qual é o passo seguinte — e a plataforma te devolve exatamente onde parou.",
  },
  {
    art: "braco",
    title: "No braço, não no quadro",
    body: "Pentatônica, modos gregos e reharmonização com o desenho na mão e o porquê de cada nota. Teoria só na medida em que você usa pra tocar.",
  },
  {
    art: "ritmo",
    title: "No seu ritmo, sem prazo",
    body: "Assista pelo computador ou pelo celular, quantas vezes precisar. Volte na mesma aula até a frase sair limpa.",
  },
];

export const FAQ = [
  {
    q: "Como eu recebo o acesso depois de comprar?",
    a: "O acesso é liberado automaticamente assim que a Hotmart confirma o pagamento. Você recebe um e-mail e, no primeiro acesso, usa a opção “Primeiro acesso? Definir senha” na tela de login com o mesmo e-mail da compra.",
  },
  {
    q: "Comprei e ainda não consigo entrar. O que faço?",
    a: "Pagamentos por boleto ou Pix podem levar alguns minutos para serem confirmados pela Hotmart. Depois da confirmação, o acesso aparece sozinho — atualize a página. Se passar disso, fale com a gente pelo e-mail de suporte.",
  },
  {
    q: "Para quem é o DM Project?",
    a: "Para quem já tira alguns acordes e algumas frases, mas trava na hora de improvisar — repete sempre os mesmos desenhos e não sabe o que tocar em cima de cada acorde. Se você nunca pegou numa guitarra, comece pelos fundamentos antes.",
  },
  {
    q: "Preciso saber ler partitura?",
    a: "Não. As aulas são conduzidas no braço da guitarra, mostrando o desenho e o som. Se você já toca alguns acordes e quer começar a improvisar, tem base suficiente.",
  },
  {
    q: "Por quanto tempo eu tenho acesso?",
    a: "Enquanto sua compra estiver ativa na Hotmart. Em caso de reembolso ou cancelamento, o acesso é revogado automaticamente.",
  },
  {
    q: "Posso assistir pelo celular?",
    a: "Sim. A plataforma funciona no navegador do celular, do tablet e do computador, sem instalar nada.",
  },
];

// ---------------------------------------------------------------------------
// Checklist do que ainda é provisório nesta página.
//
// "+30 anos" e "+1000 alunos" são AFIRMAÇÕES PÚBLICAS numa página de vendas:
// se forem ao ar sem confirmação, viram propaganda enganosa. Por isso a lista
// existe e um aviso aparece na tela — mas SÓ em desenvolvimento, nunca para o
// visitante (ver components/landing/DevNotice.tsx).
//
// Apague a linha correspondente conforme cada item for resolvido; quando a
// lista esvaziar, o aviso some sozinho.
// ---------------------------------------------------------------------------
export const PLACEHOLDERS: string[] = [
  "OFFER.guaranteeDays: 7 dias é suposição nossa; o professor não respondeu",
  "OFFER.checkoutUrl: link de checkout da Hotmart ainda não configurado",
  "images.og: falta a imagem de compartilhamento (1200x630)",
  "TESTIMONIAL.quote: descreve o vídeo em vez de citar o aluno — falta a fala real",
  "FAQ promete um e-mail de suporte que não existe em lugar nenhum do código",
];
