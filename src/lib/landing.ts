// Tudo que é copy/oferta da landing mora aqui, no mesmo espírito do site.ts:
// mexer no texto ou no preço não deve exigir caçar JSX.

export const OFFER = {
  // TODO: colar o link do checkout da Hotmart. Enquanto for null, os botões
  // de compra ficam inertes e a página avisa que falta configurar — melhor
  // isso do que um botão que leva pro lugar errado.
  checkoutUrl: null as string | null,
  // TODO: preencher com os valores reais da oferta na Hotmart.
  priceLabel: null as string | null,
  installmentLabel: null as string | null,
  guaranteeDays: 7,
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
export const TEACHER_BIO =
  "Guitarrista e professor. O DM Project é o caminho que ele desenhou para tirar o aluno da repetição de formas decoradas e levar até o improviso com intenção — a mesma sequência, na mesma ordem, aula por aula.";

// Números grandes do card "Quem ensina" (o "+6 anos / +400 clientes" da
// referência). Credencial concreta é a prova social mais forte dessa seção.
//
// TODO: preencher com os números REAIS do professor — anos ensinando, alunos
// já formados, tempo de palco, turmas. Enquanto a lista estiver vazia a linha
// inteira não é renderizada; nada de placeholder aparecendo pro visitante.
//
// Exemplo do formato:
//   { value: "+12", label: "anos ensinando guitarra" },
//   { value: "+300", label: "alunos já passaram pelo método" },
export const TEACHER_STATS: { value: string; label: string }[] = [];

// Depoimento em vídeo do aluno.
export const TESTIMONIAL = {
  videoId: "2_lJfSzOB-Q",
  studentName: "Fernando Lima",
  title: "Apresentação do aluno Fernando Lima",
  quote:
    "Aluno do DM Project tocando o que construiu ao longo da trilha.",
};

export const BENEFITS = [
  {
    title: "Uma ordem que faz sentido",
    body: "Cada aula abre a próxima, do primeiro desenho até o improviso sobre a progressão inteira. Você sempre sabe qual é o passo seguinte — e a plataforma te devolve exatamente onde parou.",
  },
  {
    title: "No braço, não no quadro",
    body: "Pentatônica, modos gregos e reharmonização com o desenho na mão e o porquê de cada nota. Teoria só na medida em que você usa pra tocar.",
  },
  {
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
