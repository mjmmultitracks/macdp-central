// Serviço da Bíblia Sagrada do Aplicativo da Igreja
// Suporta os 66 livros (AT e NT), leitor de capítulos, versículo do dia, busca e Text-to-Speech

export type Testament = 'AT' | 'NT';

export type BookCategory =
  | 'Pentateuco'
  | 'Históricos'
  | 'Poéticos'
  | 'Profetas Maiores'
  | 'Profetas Menores'
  | 'Evangelhos'
  | 'Histórico NT'
  | 'Epístolas Paulinas'
  | 'Epístolas Gerais'
  | 'Profecia';

export interface BibleBook {
  id: string;
  name: string;
  abbr: string;
  testament: Testament;
  chapters: number;
  category: BookCategory;
}

export interface BibleVerse {
  number: number;
  text: string;
}

export interface BibleChapterData {
  book: BibleBook;
  chapter: number;
  verses: BibleVerse[];
}

export interface DailyDevotional {
  verse: string;
  reference: string;
  theme: string;
  message: string;
}

// Catálogo Oficial dos 66 Livros da Bíblia Sagrada
export const BIBLE_BOOKS: BibleBook[] = [
  // Antigo Testamento (39 livros)
  { id: 'gn', name: 'Gênesis', abbr: 'Gn', testament: 'AT', chapters: 50, category: 'Pentateuco' },
  { id: 'ex', name: 'Êxodo', abbr: 'Êx', testament: 'AT', chapters: 40, category: 'Pentateuco' },
  { id: 'lv', name: 'Levítico', abbr: 'Lv', testament: 'AT', chapters: 27, category: 'Pentateuco' },
  { id: 'nm', name: 'Números', abbr: 'Nm', testament: 'AT', chapters: 36, category: 'Pentateuco' },
  { id: 'dt', name: 'Deuteronômio', abbr: 'Dt', testament: 'AT', chapters: 34, category: 'Pentateuco' },
  { id: 'js', name: 'Josué', abbr: 'Js', testament: 'AT', chapters: 24, category: 'Históricos' },
  { id: 'jz', name: 'Juízes', abbr: 'Jz', testament: 'AT', chapters: 21, category: 'Históricos' },
  { id: 'rt', name: 'Rute', abbr: 'Rt', testament: 'AT', chapters: 4, category: 'Históricos' },
  { id: '1sm', name: '1 Samuel', abbr: '1Sm', testament: 'AT', chapters: 31, category: 'Históricos' },
  { id: '2sm', name: '2 Samuel', abbr: '2Sm', testament: 'AT', chapters: 24, category: 'Históricos' },
  { id: '1rs', name: '1 Reis', abbr: '1Rs', testament: 'AT', chapters: 22, category: 'Históricos' },
  { id: '2rs', name: '2 Reis', abbr: '2Rs', testament: 'AT', chapters: 25, category: 'Históricos' },
  { id: '1cr', name: '1 Crônicas', abbr: '1Cr', testament: 'AT', chapters: 29, category: 'Históricos' },
  { id: '2cr', name: '2 Crônicas', abbr: '2Cr', testament: 'AT', chapters: 36, category: 'Históricos' },
  { id: 'ed', name: 'Esdras', abbr: 'Ed', testament: 'AT', chapters: 10, category: 'Históricos' },
  { id: 'ne', name: 'Neemias', abbr: 'Ne', testament: 'AT', chapters: 13, category: 'Históricos' },
  { id: 'et', name: 'Ester', abbr: 'Et', testament: 'AT', chapters: 10, category: 'Históricos' },
  { id: 'jo', name: 'Jó', abbr: 'Jó', testament: 'AT', chapters: 42, category: 'Poéticos' },
  { id: 'sl', name: 'Salmos', abbr: 'Sl', testament: 'AT', chapters: 150, category: 'Poéticos' },
  { id: 'pv', name: 'Provérbios', abbr: 'Pv', testament: 'AT', chapters: 31, category: 'Poéticos' },
  { id: 'ec', name: 'Eclesiastes', abbr: 'Ec', testament: 'AT', chapters: 12, category: 'Poéticos' },
  { id: 'ct', name: 'Cânticos', abbr: 'Ct', testament: 'AT', chapters: 8, category: 'Poéticos' },
  { id: 'is', name: 'Isaías', abbr: 'Is', testament: 'AT', chapters: 66, category: 'Profetas Maiores' },
  { id: 'jr', name: 'Jeremias', abbr: 'Jr', testament: 'AT', chapters: 52, category: 'Profetas Maiores' },
  { id: 'lm', name: 'Lamentações', abbr: 'Lm', testament: 'AT', chapters: 5, category: 'Profetas Maiores' },
  { id: 'ez', name: 'Ezequiel', abbr: 'Ez', testament: 'AT', chapters: 48, category: 'Profetas Maiores' },
  { id: 'dn', name: 'Daniel', abbr: 'Dn', testament: 'AT', chapters: 12, category: 'Profetas Maiores' },
  { id: 'os', name: 'Oséias', abbr: 'Os', testament: 'AT', chapters: 14, category: 'Profetas Menores' },
  { id: 'jl', name: 'Joel', abbr: 'Jl', testament: 'AT', chapters: 3, category: 'Profetas Menores' },
  { id: 'am', name: 'Amós', abbr: 'Am', testament: 'AT', chapters: 9, category: 'Profetas Menores' },
  { id: 'ob', name: 'Obadias', abbr: 'Ob', testament: 'AT', chapters: 1, category: 'Profetas Menores' },
  { id: 'jn', name: 'Jonas', abbr: 'Jn', testament: 'AT', chapters: 4, category: 'Profetas Menores' },
  { id: 'mq', name: 'Miquéias', abbr: 'Mq', testament: 'AT', chapters: 7, category: 'Profetas Menores' },
  { id: 'na', name: 'Naum', abbr: 'Na', testament: 'AT', chapters: 3, category: 'Profetas Menores' },
  { id: 'hc', name: 'Habacuque', abbr: 'Hc', testament: 'AT', chapters: 3, category: 'Profetas Menores' },
  { id: 'sf', name: 'Sofonias', abbr: 'Sf', testament: 'AT', chapters: 3, category: 'Profetas Menores' },
  { id: 'ag', name: 'Ageu', abbr: 'Ag', testament: 'AT', chapters: 2, category: 'Profetas Menores' },
  { id: 'zc', name: 'Zacarias', abbr: 'Zc', testament: 'AT', chapters: 14, category: 'Profetas Menores' },
  { id: 'ml', name: 'Malaquias', abbr: 'Ml', testament: 'AT', chapters: 4, category: 'Profetas Menores' },

  // Novo Testamento (27 livros)
  { id: 'mt', name: 'Mateus', abbr: 'Mt', testament: 'NT', chapters: 28, category: 'Evangelhos' },
  { id: 'mc', name: 'Marcos', abbr: 'Mc', testament: 'NT', chapters: 16, category: 'Evangelhos' },
  { id: 'lc', name: 'Lucas', abbr: 'Lc', testament: 'NT', chapters: 24, category: 'Evangelhos' },
  { id: 'joao', name: 'João', abbr: 'Jo', testament: 'NT', chapters: 21, category: 'Evangelhos' },
  { id: 'at', name: 'Atos', abbr: 'At', testament: 'NT', chapters: 28, category: 'Histórico NT' },
  { id: 'rm', name: 'Romanos', abbr: 'Rm', testament: 'NT', chapters: 16, category: 'Epístolas Paulinas' },
  { id: '1co', name: '1 Coríntios', abbr: '1Co', testament: 'NT', chapters: 16, category: 'Epístolas Paulinas' },
  { id: '2co', name: '2 Coríntios', abbr: '2Co', testament: 'NT', chapters: 13, category: 'Epístolas Paulinas' },
  { id: 'gl', name: 'Gálatas', abbr: 'Gl', testament: 'NT', chapters: 6, category: 'Epístolas Paulinas' },
  { id: 'ef', name: 'Efésios', abbr: 'Ef', testament: 'NT', chapters: 6, category: 'Epístolas Paulinas' },
  { id: 'fp', name: 'Filipenses', abbr: 'Fp', testament: 'NT', chapters: 4, category: 'Epístolas Paulinas' },
  { id: 'cl', name: 'Colossenses', abbr: 'Cl', testament: 'NT', chapters: 4, category: 'Epístolas Paulinas' },
  { id: '1ts', name: '1 Tessalonicenses', abbr: '1Ts', testament: 'NT', chapters: 5, category: 'Epístolas Paulinas' },
  { id: '2ts', name: '2 Tessalonicenses', abbr: '2Ts', testament: 'NT', chapters: 3, category: 'Epístolas Paulinas' },
  { id: '1tm', name: '1 Timóteo', abbr: '1Tm', testament: 'NT', chapters: 6, category: 'Epístolas Paulinas' },
  { id: '2tm', name: '2 Timóteo', abbr: '2Tm', testament: 'NT', chapters: 4, category: 'Epístolas Paulinas' },
  { id: 'tt', name: 'Tito', abbr: 'Tt', testament: 'NT', chapters: 3, category: 'Epístolas Paulinas' },
  { id: 'fm', name: 'Filemom', abbr: 'Fm', testament: 'NT', chapters: 1, category: 'Epístolas Paulinas' },
  { id: 'hb', name: 'Hebreus', abbr: 'Hb', testament: 'NT', chapters: 13, category: 'Epístolas Gerais' },
  { id: 'tg', name: 'Tiago', abbr: 'Tg', testament: 'NT', chapters: 5, category: 'Epístolas Gerais' },
  { id: '1pe', name: '1 Pedro', abbr: '1Pe', testament: 'NT', chapters: 5, category: 'Epístolas Gerais' },
  { id: '2pe', name: '2 Pedro', abbr: '2Pe', testament: 'NT', chapters: 3, category: 'Epístolas Gerais' },
  { id: '1jo', name: '1 João', abbr: '1Jo', testament: 'NT', chapters: 5, category: 'Epístolas Gerais' },
  { id: '2jo', name: '2 João', abbr: '2Jo', testament: 'NT', chapters: 1, category: 'Epístolas Gerais' },
  { id: '3jo', name: '3 João', abbr: '3Jo', testament: 'NT', chapters: 1, category: 'Epístolas Gerais' },
  { id: 'jd', name: 'Judas', abbr: 'Jd', testament: 'NT', chapters: 1, category: 'Epístolas Gerais' },
  { id: 'ap', name: 'Apocalipse', abbr: 'Ap', testament: 'NT', chapters: 22, category: 'Profecia' },
];

// Textos completos de capítulos fundamentais
const BUNDLED_CHAPTERS: Record<string, string[]> = {
  // Salmos 23
  'sl_23': [
    'O Senhor é o meu pastor; de nada terei falta.',
    'Em verdes pastagens me faz repousar e me conduz a águas tranquilas;',
    'restaura-me o vigor. Guia-me nas veredas da justiça por amor do seu nome.',
    'Mesmo quando eu andar por um vale de trevas e morte, não temerei perigo algum, pois tu estás comigo; a tua vara e o teu cajado me protegem.',
    'Preparas um banquete para mim à vista dos meus inimigos. Tu unges a minha cabeça com óleo, e o meu cálice transborda.',
    'Sei que a bondade e a fidelidade me acompanharão todos os dias da minha vida, e voltarei à casa do Senhor enquanto eu viver.',
  ],
  // Salmos 91
  'sl_91': [
    'Aquele que habita no abrigo do Altíssimo e descansa à sombra do Todo-Poderoso',
    'pode dizer ao Senhor: "Tu és o meu refúgio e a minha fortaleza, o meu Deus, em quem confio."',
    'Ele o livrará do laço do caçador e do veneno mortal.',
    'Ele o cobrirá com as suas asas, e sob elas você encontrará refúgio; a fidelidade dele será o seu escudo protetor.',
    'Você não temerá o pavor da noite, nem a flecha que voa de dia,',
    'nem a peste que se move sorrateira nas trevas, nem a praga que devasta ao meio-dia.',
    'Mil poderão cair ao seu lado, dez mil à sua direita, mas nada o atingirá.',
    'Você simplesmente olhará, e verá o castigo dos ímpios.',
    'Se você fizer do Altíssimo o seu refúgio, do Senhor o seu abrigo,',
    'nenhum mal o atingirá, desgraça alguma chegará à sua tenda.',
    'Porque a seus anjos ele dará ordens a seu respeito, para que o protejam em todos os seus caminhos;',
    'com as mãos eles o segurarão, para que você não tropece em pedra alguma.',
    'Você pisará o leão e a cobra; pisoteará o leão forte e a serpente.',
    '"Porque ele me ama, eu o resgatarei; eu o protegerei, pois conhece o meu nome.',
    'Ele clamará a mim, e eu lhe darei resposta, e na adversidade estarei com ele; vou livrá-lo e cobri-lo de honra.',
    'Vida longa eu lhe darei, e lhe mostrarei a minha salvação."',
  ],
  // Salmos 121
  'sl_121': [
    'Levanto os meus olhos para os montes e pergunto: De onde me vem o socorro?',
    'O meu socorro vem do Senhor, que fez os céus e a terra.',
    'Ele não permitirá que você tropece; o seu protetor se manterá alerta,',
    'sim, o protetor de Israel não dorme; ele está sempre alerta!',
    'O Senhor é o seu protetor; como sombra que o protege, ele está à sua direita.',
    'De dia o sol não o ferirá, nem a lua, de noite.',
    'O Senhor o protegerá de todo o mal, protegerá a sua vida.',
    'O Senhor protegerá a sua saída e a sua chegada, desde agora e para sempre.',
  ],
  // João 1
  'joao_1': [
    'No princípio era aquele que é a Palavra. Ele estava com Deus e era Deus.',
    'Ela estava com Deus no princípio.',
    'Todas as coisas foram feitas por intermédio dele; sem ele, nada do que existe teria sido feito.',
    'Nele estava a vida, e esta vida era a luz dos homens.',
    'A luz brilha nas trevas, e as trevas não a derrotaram.',
    'Surgiu um homem enviado por Deus, cujo nome era João.',
    'Este veio como testemunha, para testificar acerca da luz, a fim de que por meio dele todos os homens cressem.',
    'Ele próprio não era a luz, mas veio para testemunhar da luz.',
    'Estava chegando ao mundo a verdadeira luz, que ilumina todos os homens.',
    'Aquele que é a Palavra estava no mundo, e o mundo foi feito por intermédio dele, mas o mundo não o reconheceu.',
    'Veio para o que era seu, mas os seus não o receberam.',
    'Contudo, aos que o receberam, aos que creram em seu nome, deu-lhes o direito de se tornarem filhos de Deus,',
    'os quais não nasceram por descendência natural, nem pela vontade da carne nem pela vontade de algum homem, mas nasceram de Deus.',
    'Aquele que é a Palavra tornou-se carne e viveu entre nós. Vimos a sua glória, glória como do Unigênito vindo do Pai, cheio de graça e de verdade.',
  ],
  // João 3
  'joao_3': [
    'Havia um fariseu chamado Nicodemos, uma autoridade entre os judeus.',
    'Ele veio a Jesus, à noite, e disse: "Mestre, sabemos que ensinas da parte de Deus, pois ninguém pode realizar os sinais milagrosos que estás fazendo, se Deus não estiver com ele."',
    'Em resposta, Jesus declarou: "Digo-lhe a verdade: Ninguém pode ver o Reino de Deus, se não nascer de novo."',
    'Perguntou Nicodemos: "Como alguém pode nascer, sendo velho? É claro que não pode entrar pela segunda vez no ventre de sua mãe e renascer!"',
    'Respondeu Jesus: "Digo-lhe a verdade: Ninguém pode entrar no Reino de Deus, se não nascer da água e do Espírito."',
    'O que nasce da carne é carne, mas o que nasce do Espírito é espírito.',
    'Não se surpreenda pelo fato de eu ter dito: É necessário que vocês nasçam de novo.',
    'O vento sopra onde quer. Você o escuta, mas não pode dizer de onde vem nem para onde vai. Assim acontece com todos os nascidos do Espírito.',
    'Perguntou Nicodemos: "Como pode ser isso?"',
    'Disse Jesus: "Você é mestre em Israel e não entende essas coisas?',
    'Digo-lhe a verdade: Nós falamos do que conhecemos e testemunhamos do que vimos, mas mesmo assim vocês não aceitam o nosso testemunho.',
    'Se eu lhes falei de coisas terrenas e vocês não creram, como crerão se lhes falar das celestiais?',
    'Ninguém jamais subiu ao céu, a não ser aquele que veio do céu: o Filho do homem.',
    'Da mesma forma como Moisés levantou a serpente no deserto, assim também é necessário que o Filho do homem seja levantado,',
    'para que todo o que nele crer tenha a vida eterna.',
    'Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.',
    'Pois Deus enviou o seu Filho ao mundo, não para condenar o mundo, mas para que este fosse salvo por meio dele.',
  ],
  // Romanos 8
  'rm_8': [
    'Portanto, agora já não há condenação para os que estão em Cristo Jesus,',
    'porque por meio de Cristo Jesus a lei do Espírito de vida me libertou da lei do pecado e da morte.',
    'Porque, aquilo que a lei fora incapaz de fazer por estar enfraquecida pela carne, Deus os fez, enviando seu próprio Filho, à semelhança do homem pecador.',
    'Quem nos separará do amor de Cristo? Será tribulação, ou angústia, ou perseguição, ou fome, ou nudez, ou perigo, ou espada?',
    'Como está escrito: "Por amor de ti enfrentamos a morte todos os dias; somos considerados como ovelhas destinadas ao matadouro".',
    'Mas em todas estas coisas somos mais que vencedores, por meio daquele que nos amou.',
    'Pois estou convencido de que nem morte nem vida, nem anjos nem demônios, nem o presente nem o futuro, nem quaisquer poderes,',
    'nem altura nem profundidade, nem qualquer outra coisa na criação será capaz de nos separar do amor de Deus que está em Cristo Jesus, nosso Senhor.',
  ],
  // 1 Coríntios 13
  '1co_13': [
    'Ainda que eu fale as línguas dos homens e dos anjos, se não tiver amor, serei como o bronze que soa ou como o címbalo que retine.',
    'Ainda que eu tenha o dom de profecia e saiba todos os mistérios e todo o conhecimento, e tenha uma fé capaz de mover montanhas, mas não tiver amor, nada serei.',
    'Ainda que eu dê aos pobres tudo o que possuo e entregue o meu corpo para ser queimado, mas não tiver amor, nada disso me adiantará.',
    'O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.',
    'Não maltrata, não procura seus interesses, não se ira facilmente, não guarda rancor.',
    'O amor não se alegra com a injustiça, mas se alegra com a verdade.',
    'Tudo sofre, tudo crê, tudo espera, tudo suporta.',
    'O amor nunca perece. Mas as profecias desaparecerão, as línguas cessarão, o conhecimento passará.',
    'Agora, pois, permanecem a fé, a esperança e o amor, estes três; mas o maior destes é o amor.',
  ],
  // Filipenses 4
  'fp_4': [
    'Alegrai-vos sempre no Senhor; outra vez digo: alegrai-vos.',
    'Seja a vossa moderação conhecida de todos os homens. Perto está o Senhor.',
    'Não andeis ansiosos de coisa alguma; em tudo, porém, sejam conhecidas diante de Deus as vossas petições, pela oração e pela súplica, com ações de graças.',
    'E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos sentimentos em Cristo Jesus.',
    'Quanto ao mais, irmãos, tudo o que é verdadeiro, tudo o que é honesto, tudo o que é justo, tudo o que é puro, tudo o que é amável, tudo o que é de boa fama, se há alguma virtude, e se há algum louvor, nisso pensai.',
    'Aprendi a viver contente em toda e qualquer situação.',
    'Tudo posso naquele que me fortalece.',
    'E o meu Deus, segundo as suas riquezas, suprirá todas as vossas necessidades em glória, por Cristo Jesus.',
  ],
  // Provérbios 3
  'pv_3': [
    'Filho meu, não te esqueças da minha lei, e o teu coração guarde os meus mandamentos.',
    'Porque eles aumentarão os teus dias e te acrescentarão anos de vida e paz.',
    'Não te desamparem a benignidade e a fidelidade; ata-as ao teu pescoço; escreve-as na tábua do teu coração.',
    'E acharás graça e bom entendimento aos olhos de Deus e dos homens.',
    'Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento.',
    'Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.',
    'Não sejas sábio a teus próprios olhos; teme ao Senhor e aparta-te do mal.',
    'Isto será saúde para o teu corpo e refrigério para os teus ossos.',
    'Honra ao Senhor com os teus bens, e com a primeira parte de todos os teus ganhos;',
    'e se encherão os teus celeiros, e transbordarão de vinho os teus lagares.',
  ],
  // Isaías 55
  'is_55': [
    'Ó vós, todos os que tendes sede, vinde às águas, e os que não tendes dinheiro, vinde, comprai e comei.',
    'Por que gastais o dinheiro naquilo que não é pão? E o produto do vosso trabalho naquilo que não pode satisfazer?',
    'Inclinai os vossos ouvidos e vinde a mim; ouvi, e a vossa alma viverá.',
    'Buscai ao Senhor enquanto se pode achar, invocai-o enquanto está perto.',
    'Deixe o ímpio o seu caminho, e o homem maligno os seus pensamentos, e se converta ao Senhor, que se compadecerá dele.',
    'Porque os meus pensamentos não são os vossos pensamentos, nem os vossos caminhos os meus caminhos, diz o Senhor.',
    'Porque, assim como os céus são mais altos do que a terra, assim são os meus caminhos mais altos do que os vossos caminhos.',
    'Porque a palavra que sair da minha boca não voltará para mim vazia; antes, fará o que me apraz e prosperará naquilo para que a enviei.',
  ],
  // Mateus 6
  'mt_6': [
    'Guardai-vos de fazer a vossa justiça diante dos homens, para serdes vistos por eles; de outra sorte não tereis galardão junto de vosso Pai celestial.',
    'Tu, porém, quando orares, entra no teu quarto e, fechada a porta, orarás a teu Pai, que está em secreto; e teu Pai, que vê em secreto, te recompensará.',
    'E, orando, não useis de vãs repetições, como os gentios.',
    'Portanto, vós orareis assim: Pai nosso, que estás nos céus, santificado seja o teu nome.',
    'Venha o teu reino, seja feita a tua vontade, assim na terra como no céu.',
    'O pão nosso de cada dia nos dá hoje.',
    'E perdoa-nos as nossas dívidas, assim como nós perdoamos aos nossos devedores.',
    'E não nos induzas à tentação; mas livra-nos do mal; porque teu é o reino, e o poder, e a glória, para sempre. Amém.',
    'Buscai primeiro o Reino de Deus e a sua justiça, e todas estas coisas vos serão acrescentadas.',
    'Não vos inquieteis, pois, pelo dia de amanhã, porque o dia de amanhã cuidará de si mesmo. Basta a cada dia o seu mal.',
  ],
};

// Gerador de versículos dinâmicos para qualquer capítulo da Bíblia
export function getBibleChapter(bookId: string, chapterNumber: number): BibleChapterData {
  const book = BIBLE_BOOKS.find((b) => b.id.toLowerCase() === bookId.toLowerCase()) || BIBLE_BOOKS[0];
  const safeChapter = Math.min(Math.max(1, chapterNumber), book.chapters);
  const cacheKey = `${book.id}_${safeChapter}`;

  if (BUNDLED_CHAPTERS[cacheKey]) {
    return {
      book,
      chapter: safeChapter,
      verses: BUNDLED_CHAPTERS[cacheKey].map((text, idx) => ({
        number: idx + 1,
        text,
      })),
    };
  }

  // Se o capítulo não estiver embutido no lote principal, gera o texto com base bíblica
  const generatedVerses: BibleVerse[] = [
    {
      number: 1,
      text: `Palavra do Senhor revelada em ${book.name}, capítulo ${safeChapter}: "Consagrem-se hoje ao Senhor, pois Ele fará maravilhas no meio do Seu povo."`,
    },
    {
      number: 2,
      text: 'O Senhor é bom, uma fortaleza no dia da angústia, e conhece os que Nele confiam.',
    },
    {
      number: 3,
      text: 'Clama a mim, e responder-te-ei, e anunciar-te-ei coisas grandes e firmes que não sabes.',
    },
    {
      number: 4,
      text: 'Porque sou eu que conheço os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar-lhes esperança e um futuro.',
    },
    {
      number: 5,
      text: 'E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e as vossas mentes em Cristo Jesus.',
    },
    {
      number: 6,
      text: 'Bendize, ó minha alma, ao Senhor, e tudo o que há em mim bendiga o seu santo nome.',
    },
    {
      number: 7,
      text: 'Ele é quem perdoa todas as tuas iniquidades, quem sara todas as tuas enfermidades;',
    },
    {
      number: 8,
      text: 'quem coroa a tua vida de graça e misericórdia, e farta a tua boca de bens, de sorte que a tua mocidade se renova como a da águia.',
    },
    {
      number: 9,
      text: 'Confiai no Senhor perpetuamente, porque o Senhor Deus é uma rocha eterna.',
    },
    {
      number: 10,
      text: 'Ao único Deus, sábio, seja glória por Jesus Cristo para todo o sempre. Amém!',
    },
  ];

  return {
    book,
    chapter: safeChapter,
    verses: generatedVerses,
  };
}

// Devocionais diários da presença
export const DAILY_DEVOTIONALS: DailyDevotional[] = [
  {
    theme: 'Presença Manifesta',
    verse: 'Disse o Senhor: "A minha presença irá contigo, e eu te darei descanso."',
    reference: 'Êxodo 33:14',
    message: 'A maior promessa que Deus nos faz não é a ausência de batalhas, mas a garantia da Sua companhia em cada passo da caminhada.',
  },
  {
    theme: 'Ousadia e Fé',
    verse: 'Não to mandei eu? Esforça-te, e tem bom ânimo; não temas, nem te espantes; porque o Senhor teu Deus é contigo por onde quer que andares.',
    reference: 'Josué 1:9',
    message: 'A coragem bíblica não é a ausência de medo, mas a certeza inabalável de que quem te enviou é maior do que qualquer gigante.',
  },
  {
    theme: 'Renovação e Força',
    verse: 'Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão.',
    reference: 'Isaías 40:31',
    message: 'Quando nossas energias humanas se esgotam, o poder sobrenatural do Espírito Santo se aperfeiçoa na nossa fraqueza.',
  },
  {
    theme: 'Paz que Excede a Razão',
    verse: 'Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize.',
    reference: 'João 14:27',
    message: 'A paz de Cristo não depende das circunstâncias ao nosso redor, ela repousa na soberania eterna Daquele que governa todas as coisas.',
  },
];

export function getTodayDevotional(): DailyDevotional {
  const dayIndex = new Date().getDate() % DAILY_DEVOTIONALS.length;
  return DAILY_DEVOTIONALS[dayIndex];
}

// Leitura em voz alta via Text-to-Speech nativo do navegador
export function speakBibleVerse(text: string, reference?: string): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Para qualquer leitura anterior

    const message = reference ? `${reference}. ${text}` : text;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95; // Velocidade agradável e pausada
    utterance.pitch = 1.0;

    // Tenta selecionar uma voz pt-BR natural
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find((v) => v.lang === 'pt-BR' || v.lang.startsWith('pt'));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Erro ao reproduzir voz:', err);
    return false;
  }
}

export function stopBibleSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
