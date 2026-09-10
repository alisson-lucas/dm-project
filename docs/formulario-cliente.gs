/**
 * Formulário de coleta dos dados reais da landing page do DM Project.
 *
 * ---------------------------------------------------------------------------
 * COMO USAR
 * ---------------------------------------------------------------------------
 * 1. Abra https://script.google.com  ->  "Novo projeto".
 * 2. Apague o conteúdo do editor e cole este arquivo inteiro.
 * 3. Com "criarFormularioDMProject" selecionado no topo, clique em "Executar".
 *    Na primeira vez o Google pede autorização: "Revisar permissões" ->
 *    escolher sua conta -> "Avançado" -> "Acessar <nome do projeto>" ->
 *    "Permitir". É a sua própria conta criando um arquivo no seu Drive.
 * 4. Abra "Registro de execução" (Ctrl+Enter). Ele imprime dois links:
 *    - LINK PARA O CLIENTE  -> é este que você envia
 *    - LINK DE EDIÇÃO       -> só seu, para ajustar perguntas depois
 * 5. Na aba "Respostas" do formulário, clique no ícone verde para as respostas
 *    caírem numa planilha.
 *
 * ---------------------------------------------------------------------------
 * O TOM DAS PERGUNTAS
 * ---------------------------------------------------------------------------
 * Quem responde não mexe com tecnologia. Nenhuma pergunta aqui pede link,
 * arquivo, formato ou medida — link de checkout, domínio, recorte e
 * redimensionamento de foto ficam com quem faz a página. Sobrou só o que
 * ninguém consegue responder no lugar dele.
 *
 * Por isso também não coletamos e-mail: é um cliente só, e a tela de "faça
 * login para responder" derruba gente que não usa conta Google no celular.
 *
 * ---------------------------------------------------------------------------
 * UMA LIMITAÇÃO DO APPS SCRIPT
 * ---------------------------------------------------------------------------
 * A API não cria perguntas do tipo "envio de arquivo" — só o editor manual
 * cria, e ela obrigaria o cliente a estar logado numa conta Google. Por isso
 * as fotos são pedidas por mensagem, fora do formulário.
 *
 * ---------------------------------------------------------------------------
 * ONDE CADA RESPOSTA É APLICADA DEPOIS
 * ---------------------------------------------------------------------------
 * Anos dando aula / alunos ..... TEACHER_STATS         src/lib/landing.ts
 * A história dele .............. TEACHER_BIO           src/lib/landing.ts
 * Nome com K ou com C .......... TEACHER.name          src/lib/site.ts
 * Preço / parcelamento ......... OFFER.price           src/lib/landing.ts
 * Dias pra desistir ............ OFFER.guaranteeDays   src/lib/landing.ts
 * Vídeo / aluno / a fala ....... TESTIMONIAL           src/lib/landing.ts
 * Fotos (chegam por mensagem) .. public/images/landing/
 * A frase do topo .............. HERO.headline         src/lib/landing.ts
 * Pergunta que falta ........... FAQ                   src/lib/landing.ts
 * Contato de quem comprou ...... ainda NÃO existe no código — criar
 *
 * FICARAM COM VOCÊ, não estão no formulário: o link de checkout da Hotmart
 * (OFFER.checkoutUrl) e o domínio (NEXT_PUBLIC_SITE_URL). Os dois ainda
 * travam a publicação — só mudaram de dono.
 *
 * Conforme cada item for resolvido, apague a linha correspondente de
 * PLACEHOLDERS no fim de src/lib/landing.ts. Quando a lista esvaziar, o aviso
 * de desenvolvimento some sozinho.
 */

function criarFormularioDMProject() {
  var form = FormApp.create('DM Project — o que falta pra sua página ir ao ar');

  form.setDescription(
    'A sua página de vendas está pronta. O que falta é o que só você sabe ' +
      'responder — e umas coisas que eu não posso inventar no seu lugar, ' +
      'porque quem assina a página é você.\n\n' +
      'São 17 perguntas, uns 10 minutinhos. A parte técnica é comigo: aqui não ' +
      'tem nada de site, arquivo nem configuração.\n\n' +
      'Se travar em alguma, pula. Melhor receber dez hoje do que dezessete ' +
      'daqui a um mês.',
  );

  // E-mail NÃO é coletado de propósito: ver o comentário no topo.
  form.setProgressBar(true);
  form.setAllowResponseEdits(true);
  form.setConfirmationMessage(
    'Recebi, obrigado! Se lembrar de alguma coisa depois, é só me chamar. ' +
      'Assim que eu colocar tudo na página, te mando pra você conferir antes ' +
      'de publicar.',
  );

  // ------------------------------------------------------------------ atalhos
  function secao(titulo, ajuda) {
    form.addPageBreakItem().setTitle(titulo).setHelpText(ajuda);
  }

  function curta(titulo, ajuda, obrigatoria) {
    return form
      .addTextItem()
      .setTitle(titulo)
      .setHelpText(ajuda)
      .setRequired(!!obrigatoria);
  }

  function longa(titulo, ajuda, obrigatoria) {
    return form
      .addParagraphTextItem()
      .setTitle(titulo)
      .setHelpText(ajuda)
      .setRequired(!!obrigatoria);
  }

  function confirmacao(titulo, rotulo) {
    return form
      .addCheckboxItem()
      .setTitle(titulo)
      .setChoiceValues([rotulo])
      .setRequired(true);
  }

  var soNumero = FormApp.createTextValidation()
    .setHelpText('Escreve só o número, sem mais nada junto.')
    .requireWholeNumber()
    .build();

  // ----------------------------------------------------------- 1. os números
  secao(
    'Seus números',
    'Do lado da sua foto, a página mostra dois números bem grandes. Hoje estão ' +
      '"+30 anos" e "+1000 alunos" — fui eu que chutei, só pra montar o desenho ' +
      'da página, e eles não podem entrar no ar assim.\n\n' +
      'Se alguém te cobrar esses números um dia, quem responde é você. Então se ' +
      'for pra arredondar, arredonda pra baixo: número menor e verdadeiro vale ' +
      'mais que número grande e furado.',
  );

  curta(
    'Há quantos anos você dá aula de guitarra?',
    'Pode ser só o número.',
    true,
  ).setValidation(soNumero);

  curta(
    'Quantos alunos você já ensinou até hoje?',
    'Somando aula particular, turma e aluno de internet. Não precisa contar ' +
      'certinho — se estiver na dúvida, chuta pra menos.',
    true,
  ).setValidation(soNumero);

  confirmacao(
    'Só uma confirmação',
    'Confirmo que esses dois números são verdadeiros e que eu consigo explicar ' +
      'de onde eles saíram, se alguém perguntar.',
  );

  // ---------------------------------------------------------------- 2. você
  secao(
    'Você',
    'Hoje tem um textinho sobre você na página, escrito por mim, que serviria ' +
      'pra qualquer professor de guitarra do Brasil. É o que eu mais quero trocar.',
  );

  longa(
    'Me conta a sua história em umas 4 linhas.',
    'Do jeito que você contaria pra alguém que nunca te viu tocar: onde ' +
      'aprendeu, onde já tocou, há quanto tempo ensina e por que resolveu montar ' +
      'esse método. Escreve solto, sem se preocupar com as palavras — eu dou uma ' +
      'ajeitada sem mudar o que você disse.',
    true,
  );

  form
    .addMultipleChoiceItem()
    .setTitle('Seu nome na página: com K ou com C?')
    .setHelpText(
      'No seu canal está "Dinho Moska", mas em alguns vídeos você assina ' +
        '"Dinho Mosca". Preciso usar um só, senão fica trocando de um canto ' +
        'pro outro.',
    )
    .setChoiceValues(['Dinho MosKa', 'Dinho MosCa'])
    .showOtherOption(true)
    .setRequired(true);

  // ------------------------------------------------------ 3. quanto custar
  secao(
    'Quanto vai custar',
    'Hoje a página mostra R$ 97, que também fui eu que chutei. Esse é o número ' +
      'que mais trava tudo: sem ele eu não consigo deixar a página pronta pra ' +
      'vender.',
  );

  curta('Quanto você quer cobrar pelo curso?', 'Só o valor, ex.: 197.', true);

  curta(
    'Pode parcelar? Em quantas vezes?',
    'Se não quiser parcelar, deixa em branco.',
    false,
  );

  curta(
    'A pessoa tem quantos dias pra desistir e pedir o dinheiro de volta?',
    'Hoje a página promete 7 dias. Por lei tem que ser 7 no mínimo, mas você ' +
      'pode dar mais se quiser — quanto mais tempo, mais confiança passa.',
    true,
  ).setValidation(soNumero);

  // ------------------------------------------------------------- 4. o aluno
  secao(
    'O aluno que aparece tocando',
    'A página mostra o vídeo do Fernando Lima tocando, e do lado tem uma frase ' +
      'dele. Só que essa frase fui eu que escrevi — ela não é dele. E na página ' +
      'nova ela aparece grande, como se fosse fala do aluno. Não dá pra deixar ' +
      'assim.',
  );

  form
    .addMultipleChoiceItem()
    .setTitle('Pode continuar com o vídeo do Fernando?')
    .setHelpText(
      'Se preferir mostrar outro aluno, marca a última opção e escreve o nome ' +
        'dele.',
    )
    .setChoiceValues(['Pode, esse mesmo'])
    .showOtherOption(true)
    .setRequired(true);

  longa(
    'O que esse aluno falaria do seu método?',
    'Uma ou duas frases, com as palavras dele. Se ele já te falou algo assim ' +
      'por mensagem, melhor ainda — é só me contar o que ele disse.',
    true,
  );

  confirmacao(
    'Sobre usar a imagem dele',
    'Já falei com esse aluno e ele deixa usar o nome, a imagem e a fala dele ' +
      'na página.',
  );

  // -------------------------------------------------------------- 5. fotos
  secao(
    'Suas fotos',
    'As fotos você me manda pelo WhatsApp mesmo, do jeito que estiverem — não ' +
      'precisa recortar, editar nem diminuir nada. Quanto mais original o ' +
      'arquivo, melhor pra mim. Aqui eu só quero saber o que você já tem.',
  );

  form
    .addCheckboxItem()
    .setTitle('Quais dessas fotos você tem ou consegue tirar?')
    .setHelpText(
      'Marca o que já tem em mãos. O que faltar a gente resolve depois — não ' +
        'trava tudo por causa de uma foto.',
    )
    .setChoiceValues([
      'Uma sua de corpo inteiro, tocando, com o corpo todo aparecendo',
      'Uma sua em pé, do sapato até a cabeça',
      'Uma foto deitada (mais larga do que alta), sua ou da guitarra',
      'Nenhuma ainda — preciso tirar',
    ])
    .setValidation(
      FormApp.createCheckboxValidation().requireSelectAtLeast(1).build(),
    )
    .setRequired(true);

  longa(
    'Quer me falar alguma coisa sobre as fotos?',
    'Tipo: "a do palco é a que eu mais gosto", "não usa a de camiseta branca", ' +
      '"mês que vem eu faço umas novas".',
    false,
  );

  // ------------------------------------------------------------ 6. contato
  secao('Quem atende quem comprar', '');

  curta(
    'Se um aluno comprar e tiver problema pra entrar, ele fala com quem?',
    'A página promete que a pessoa pode chamar alguém se der ruim. Me passa um ' +
      'e-mail ou um WhatsApp que você acompanha — pode ser o seu mesmo.',
    true,
  );

  // ------------------------------------------------------------- 7. textos
  secao(
    'O que a página fala',
    'Os textos são meus, mas a página é sua e é o seu nome que está lá em cima. ' +
      'Nada disso entra no ar sem você dizer que pode.',
  );

  form
    .addMultipleChoiceItem()
    .setTitle('A frase grande do topo pode ficar?')
    .setHelpText(
      'Ela está assim: "Pare de decorar formas. Comece a improvisar." É a ' +
        'primeira coisa que a pessoa lê quando abre a página. Se quiser mudar, ' +
        'marca a última opção e escreve a sua.',
    )
    .setChoiceValues([
      'Pode ficar, gostei',
      'Não sei, prefiro conversar sobre isso',
    ])
    .showOtherOption(true)
    .setRequired(true);

  longa(
    'Tem alguma coisa que você NÃO quer que a página diga?',
    'Alguma promessa que te deixa desconfortável, comparação com outro ' +
      'professor, algum número que você prefere não mostrar. É muito mais fácil ' +
      'tirar agora do que depois que estiver no ar.',
    false,
  );

  longa(
    'Tem alguma pergunta que seus alunos vivem te fazendo?',
    'A página já responde as principais: como recebe o acesso, o que fazer se ' +
      'não conseguir entrar, pra quem é o curso, se precisa saber ler música, ' +
      'por quanto tempo tem acesso e se dá pra assistir no celular. Se faltar ' +
      'alguma que você escuta sempre, me fala.',
    false,
  );

  // ------------------------------------------------------------------- links
  Logger.log('LINK PARA O CLIENTE: ' + form.getPublishedUrl());
  Logger.log('LINK DE EDIÇÃO (só seu): ' + form.getEditUrl());
}
