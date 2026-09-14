import {
  Member,
  VisitorItem,
  FinancialTransaction,
  MinistrySchedule,
  CellGroup,
  Ministry,
  Sermon,
  ChurchEvent,
  EventRegistration,
  PrayerRequest,
  ChurchStats,
  DatabaseSchema,
  TeachingClass,
  TeachingMaterial,
  TeachingMessageLog,
  KidChild,
  KidLesson,
  PatrimonyAsset,
  PastoralAppointment,
  SystemAccessUser,
  PanelModuleId,
  ChurchSettings,
  BankAccount,
  FinancialCategory,
  ChurchAppSettings,
  AppNotification,
  AppModuleId,
  RegularServiceItem,
} from '../types';
import { pushDatabaseToSupabase } from './supabaseSync';
import { resolveBankLogo } from '../utils/bankLogos';
import { sanitizeDatabase } from './dbSanitizer';
export { sanitizeDatabase };

const DB_STORAGE_KEY = 'macdp_db_data_v3';

export const INITIAL_APP_SETTINGS: ChurchAppSettings = {
  appName: 'MACDP Oficial',
  appShortName: 'MACDP App',
  appSlogan: 'Proibido a Entrada de Pessoas Perfeitas.',
  appLogoUrl: '/images/logo.png',
  liveStreamUrl: 'https://www.youtube.com/@_macdp/live',
  isLiveNow: true,
  liveTitle: 'Culto da Família & Presença de Deus',
  liveSubtitle: 'Transmissão Ao Vivo Oficial • Direto do Templo Central',
  bannerText: 'Bem-vindo ao aplicativo da MACDP! Acesse a Bíblia, cultos ao vivo, ministérios e avisos da igreja.',
  bannerImageUrl: '/images/hero.jpg',
  devotionalOfTheDay: {
    verse: 'Buscai ao Senhor enquanto se pode achar, invocai-o enquanto está perto.',
    reference: 'Isaías 55:6',
    thought: 'A presença manifesta de Deus transforma corações. Dedique o seu dia para buscar intimidade no secreto com o Pai.',
    author: 'Pr. Oziel Gomes Maduro',
  },
  enabledModules: {
    biblia: true,
    live: true,
    midias: true,
    ministerios: true,
    celulas: true,
    eventos: true,
    oracao: true,
    contribuir: true,
    carteirinha: true,
    anotacoes: true,
  },
};

export const INITIAL_APP_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    title: '🔴 Culto da Família Ao Vivo',
    message: 'Nossa transmissão oficial já começou! Conecte-se e receba uma palavra profética para o seu lar.',
    date: '2026-09-03 19:30',
    type: 'live',
    read: false,
    actionUrl: '#live',
  },
  {
    id: 'notif_2',
    title: '🔥 Conferência Caçadores da Presença 2026',
    message: 'Inscrições abertas com lote especial e camisa oficial disponível! Garanta sua vaga com sua célula.',
    date: '2026-09-02 10:00',
    type: 'evento',
    read: false,
    actionUrl: '#eventos',
  },
  {
    id: 'notif_3',
    title: '📖 Devocional da Semana',
    message: 'Nova reflexão bíblica e estudo para as reuniões nas casas já disponível na Bíblia do app.',
    date: '2026-09-01 08:00',
    type: 'pastoral',
    read: true,
    actionUrl: '#biblia',
  },
];

export const INITIAL_CHURCH_SETTINGS: ChurchSettings = {
  name: 'Ministério Apostólico Caçadores da Presença',
  shortName: 'MACDP Central',
  subtitle: 'Ministério Apostólico',
  slogan: 'Proibido a Entrada de Pessoas Perfeitas.',
  description: 'Uma igreja acolhedora, profética e apaixonada pela presença manifesta de Deus em Manaus/AM. Pastores Presidentes Oziel Gomes Maduro e Midiã Gomes Maduro.',
  logoUrl: '/images/logo.png',
  pastorPresident: 'Pr. Oziel Gomes Maduro & Pra. Midiã Gomes Maduro',
  cnpj: '',
  phone: '(92) 99127-9663',
  whatsapp: '92991279663',
  email: 'contato@macdp.com.br',
  address: {
    street: 'Rua Lagoa Grande, 382',
    neighborhood: 'Conj. Canaranas / Cidade Nova',
    city: 'Manaus',
    state: 'AM',
    zip: '69097-750',
  },
  social: {
    instagram: 'https://instagram.com/_macdp',
    instagramHandle: '@_macdp',
    youtube: 'https://www.youtube.com/@_macdp',
    facebook: 'https://facebook.com/macdpoficial',
  },
  pix: {
    key: '92991279663',
    receiver: 'Ministério Apostólico Caçadores da Presença',
    bank: 'Bradesco / NuBank',
  },
  themeColors: {
    primaryColor: '#f59e0b',
    secondaryColor: '#3b82f6',
  },
  mercadoPago: {
    enabled: true,
    accessToken: 'APP_USR-618247065351176-090713-7df8d1b1a7fda47e50d21e09192ac117-2570443730',
    publicKey: 'APP_USR-18bee5ba-a5ca-4dd9-a511-06308a2a2bfe',
    sandbox: false,
  },
  emailSettings: {
    enabled: true,
    provider: 'resend',
    apiKey: '',
    fromEmail: 'eventos@macdp.com.br',
    fromName: 'MACDP Central',
  },
  appSettings: INITIAL_APP_SETTINGS,
  regularServices: [
    {
      id: 'service_domingo_1',
      day: 'Domingo',
      time: '10:00',
      title: 'Culto de Celebração & Ceia',
      description: 'Início da semana em adoração profunda, ministração da Palavra e celebração da Ceia do Senhor. Berçário e Kids abertos.',
      category: 'Geral',
      active: true,
    },
    {
      id: 'service_domingo_2',
      day: 'Domingo',
      time: '18:30',
      title: 'Culto da Família & Caçadores Kids',
      description: 'Culto focado na restauração e fortalecimento dos lares, com louvor contemporâneo e salas para todas as idades infantis.',
      category: 'Famílias',
      active: true,
    },
    {
      id: 'service_quarta',
      day: 'Quarta-feira',
      time: '19:30',
      title: 'Noite de Oração & Estudo Bíblico',
      description: 'Momento precioso de intercessão coletiva pelas causas da igreja, cura e aprofundamento exegético das Escrituras.',
      category: 'Edificação',
      active: true,
    },
    {
      id: 'service_sabado',
      day: 'Sábado',
      time: '19:00',
      title: 'Culto Conexão Jovem (Youth)',
      description: 'Comunidade jovem, música vibrante, temas atuais e comunhão pós-culto na cafeteria da igreja.',
      category: 'Jovens',
      active: true,
    },
  ],
};

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [];

export const INITIAL_FINANCIAL_CATEGORIES: FinancialCategory[] = [
  // Receitas
  { id: 'cat_in_1', name: 'Dízimo', type: 'entrada', color: '#10b981', description: 'Dízimos fiéis dos membros e líderes.', isSystem: true },
  { id: 'cat_in_2', name: 'Oferta Alçada', type: 'entrada', color: '#059669', description: 'Ofertas voluntárias levantadas nos cultos.', isSystem: true },
  { id: 'cat_in_3', name: 'Inscrições de Eventos & Conferências', type: 'entrada', color: '#d97706', description: 'Arrecadação de inscrições e vagas em eventos.', isSystem: true },
  { id: 'cat_in_4', name: 'Venda de Camisas Oficiais', type: 'entrada', color: '#f59e0b', description: 'Receitas da venda de camisas oficiais dos eventos.', isSystem: true },
  { id: 'cat_in_5', name: 'Oferta para Missões', type: 'entrada', color: '#2563eb', description: 'Ofertas destinadas ao sustento missionário.' },
  { id: 'cat_in_6', name: 'Ação Social & Doações', type: 'entrada', color: '#3b82f6', description: 'Doações para cestas básicas e apoio humanitário.' },
  // Despesas
  { id: 'cat_out_1', name: 'Aluguel do Templo & Espaços', type: 'saida', color: '#ef4444', description: 'Locação predial do templo e dependências.', isSystem: true },
  { id: 'cat_out_2', name: 'Contas Fixas (Água/Luz/Net)', type: 'saida', color: '#dc2626', description: 'Serviços públicos essenciais.', isSystem: true },
  { id: 'cat_out_3', name: 'Equipamentos, Som & Mídia', type: 'saida', color: '#b91c1c', description: 'Instrumentos, sonorização e audiovisual.' },
  { id: 'cat_out_4', name: 'Despesas de Eventos & Conferências', type: 'saida', color: '#ea580c', description: 'Chácara, buffet, convidados e logística de eventos.', isSystem: true },
  { id: 'cat_out_5', name: 'Confecção de Camisas & Materiais', type: 'saida', color: '#f97316', description: 'Produção têxtil de camisas e crachás dos eventos.' },
  { id: 'cat_out_6', name: 'Manutenção Predial & Reformas', type: 'saida', color: '#d97706', description: 'Pintura, elétrica, hidráulica e reparos.' },
  { id: 'cat_out_7', name: 'Ajuda Missionária & Social', type: 'saida', color: '#7c3aed', description: 'Envio de recursos a missionários e caridade.' },
];

// Seed initial data
export const INITIAL_DATABASE: DatabaseSchema = {
  members: [
    {
      id: 'm_1',
      name: 'Pr. Oziel Gomes Maduro',
      email: 'oziel.maduro@macdp.com.br',
      phone: '92991279663',
      photoUrl: '/images/pastors_oziel_midia.png',
      status: 'ativo',
      roleInChurch: 'Pastor Presidente & Fundador',
      birthDate: '1975-01-01',
      baptismDate: '1995-01-01',
      membershipDate: '2015-01-01',
      maritalStatus: 'Casado(a)',
      address: {
        street: 'Rua Lagoa Grande, 382',
        neighborhood: 'Conj. Canaranas / Cidade Nova',
        city: 'Manaus',
        zip: '69097-750',
      },
      ministries: ['Presidência Geral', 'Ensino Apostólico'],
      cellGroupId: 'cell_1',
      spiritualGifts: ['Apostolado', 'Pastoreio', 'Ensino'],
      attendanceRate: 100,
      notes: 'Pastor Presidente e Fundador do Ministério Apostólico Caçadores da Presença em Manaus/AM.',
    },
    {
      id: 'm_2',
      name: 'Pra. Midiã Gomes Maduro',
      email: 'midia.maduro@macdp.com.br',
      phone: '92991279663',
      photoUrl: '/images/pastors_oziel_midia.png',
      status: 'ativo',
      roleInChurch: 'Pastora Presidente & Fundadora',
      birthDate: '1978-01-01',
      baptismDate: '1996-01-01',
      membershipDate: '2015-01-01',
      maritalStatus: 'Casado(a)',
      address: {
        street: 'Rua Lagoa Grande, 382',
        neighborhood: 'Conj. Canaranas / Cidade Nova',
        city: 'Manaus',
        zip: '69097-750',
      },
      ministries: ['Presidência Geral', 'Mulheres da Presença', 'Intercessão'],
      cellGroupId: 'cell_5',
      spiritualGifts: ['Profecia', 'Intercessão', 'Exortação'],
      attendanceRate: 100,
      notes: 'Pastora Presidente à frente do ministério com mulheres, acolhimento e intercessão profética.',
    },
    {
      id: 'm_3',
      name: 'Pr. Jaziel Maduro',
      email: 'jaziel.maduro@macdp.com.br',
      phone: '92991279663',
      photoUrl: '/images/pastors_jaziel_abda.png',
      status: 'ativo',
      roleInChurch: 'Pastor Auxiliar',
      birthDate: '1996-01-01',
      baptismDate: '2010-01-01',
      membershipDate: '2015-01-01',
      maritalStatus: 'Casado(a)',
      address: {
        street: 'Rua Lagoa Grande, 382',
        neighborhood: 'Conj. Canaranas / Cidade Nova',
        city: 'Manaus',
        zip: '69097-750',
      },
      ministries: ['Juventude Caçadores', 'Ensino Bíblico'],
      cellGroupId: 'cell_2',
      spiritualGifts: ['Ensino', 'Evangelismo', 'Pastoreio'],
      attendanceRate: 100,
      notes: 'Pastor Auxiliar e liderança atuante na juventude, consolidação e palavra.',
    },
    {
      id: 'm_4',
      name: 'Pra. Abda Maduro',
      email: 'abda.maduro@macdp.com.br',
      phone: '92991279663',
      photoUrl: '/images/pastors_jaziel_abda.png',
      status: 'ativo',
      roleInChurch: 'Pastora Auxiliar',
      birthDate: '1998-01-01',
      baptismDate: '2012-01-01',
      membershipDate: '2016-01-01',
      maritalStatus: 'Casado(a)',
      address: {
        street: 'Rua Lagoa Grande, 382',
        neighborhood: 'Conj. Canaranas / Cidade Nova',
        city: 'Manaus',
        zip: '69097-750',
      },
      ministries: ['Juventude Caçadores', 'Acolhimento & Comunhão'],
      cellGroupId: 'cell_2',
      spiritualGifts: ['Misericórdia', 'Hospitalidade'],
      attendanceRate: 100,
      notes: 'Pastora Auxiliar atuante no pastoreio, acolhimento de famílias e jovens.',
    },
    {
      id: 'm_5',
      name: 'Pr. Samuel Trindade',
      email: 'samuel.trindade@macdp.com.br',
      phone: '92991279663',
      photoUrl: '/images/pastors_samuel_daniely.png',
      status: 'ativo',
      roleInChurch: 'Pastor Auxiliar',
      birthDate: '1990-01-01',
      baptismDate: '2008-01-01',
      membershipDate: '2018-01-01',
      maritalStatus: 'Casado(a)',
      address: {
        street: 'Rua Lagoa Grande, 382',
        neighborhood: 'Conj. Canaranas / Cidade Nova',
        city: 'Manaus',
        zip: '69097-750',
      },
      ministries: ['Células & Discipulado', 'Consolidação'],
      cellGroupId: 'cell_3',
      spiritualGifts: ['Pastoreio', 'Ensino'],
      attendanceRate: 100,
      notes: 'Pastor Auxiliar responsável pelo acompanhamento e supervisão das células e novos convertidos.',
    },
    {
      id: 'm_6',
      name: 'Pra. Daniely Trindade',
      email: 'daniely.trindade@macdp.com.br',
      phone: '92991279663',
      photoUrl: '/images/pastors_samuel_daniely.png',
      status: 'ativo',
      roleInChurch: 'Pastora Auxiliar',
      birthDate: '1992-01-01',
      baptismDate: '2010-01-01',
      membershipDate: '2018-01-01',
      maritalStatus: 'Casado(a)',
      address: {
        street: 'Rua Lagoa Grande, 382',
        neighborhood: 'Conj. Canaranas / Cidade Nova',
        city: 'Manaus',
        zip: '69097-750',
      },
      ministries: ['Células & Discipulado', 'Ministério com Famílias'],
      cellGroupId: 'cell_3',
      spiritualGifts: ['Ensino', 'Hospitalidade'],
      attendanceRate: 100,
      notes: 'Pastora Auxiliar atuante no discipulado, edificação dos lares e ministério de famílias.',
    },
  ],

  visitors: [],

  transactions: [],

  schedules: [],

  cells: [
    {
      id: 'cell_1',
      name: 'Célula Canaranas da Presença',
      leaderName: 'Pr. Oziel & Pra. Midiã Maduro',
      leaderPhone: '92991279663',
      neighborhood: 'Conj. Canaranas / Cidade Nova',
      address: 'Rua Lagoa Grande, 382',
      dayOfWeek: 'Quinta-feira',
      time: '20:00',
      targetAudience: 'Mista',
      membersCount: 18,
      latitude: -3.038,
      longitude: -60.003,
    },
    {
      id: 'cell_2',
      name: 'Célula Conexão Jovem Cidade Nova',
      leaderName: 'Pr. Jaziel & Pra. Abda Maduro',
      leaderPhone: '92991279663',
      neighborhood: 'Cidade Nova 1',
      address: 'Av. Noel Nutels, 820',
      dayOfWeek: 'Sábado',
      time: '18:00',
      targetAudience: 'Jovens',
      membersCount: 26,
      latitude: -3.042,
      longitude: -60.008,
    },
    {
      id: 'cell_3',
      name: 'Célula Aliança de Casais Flores',
      leaderName: 'Pr. Samuel & Pra. Daniely Trindade',
      leaderPhone: '92991279663',
      neighborhood: 'Flores / Parque 10',
      address: 'Rua Desembargador João Machado, 500',
      dayOfWeek: 'Sexta-feira',
      time: '20:30',
      targetAudience: 'Casais',
      membersCount: 16,
      latitude: -3.072,
      longitude: -60.015,
    },
    {
      id: 'cell_4',
      name: 'Célula Família da Fé Ponta Negra',
      leaderName: 'Liderança MACDP Ponta Negra',
      leaderPhone: '92991279663',
      neighborhood: 'Ponta Negra',
      address: 'Av. Coronel Teixeira, 1200',
      dayOfWeek: 'Terça-feira',
      time: '19:45',
      targetAudience: 'Mista',
      membersCount: 14,
      latitude: -3.065,
      longitude: -60.075,
    },
    {
      id: 'cell_5',
      name: 'Célula Mulheres da Presença Adrianópolis',
      leaderName: 'Pra. Midiã Gomes Maduro',
      leaderPhone: '92991279663',
      neighborhood: 'Adrianópolis',
      address: 'Rua Salvador, 420',
      dayOfWeek: 'Quarta-feira',
      time: '15:00',
      targetAudience: 'Mulheres',
      membersCount: 20,
      latitude: -3.107,
      longitude: -60.012,
    },
    {
      id: 'cell_6',
      name: 'Célula Homens da Presença Aleixo',
      leaderName: 'Pr. Oziel Gomes Maduro',
      leaderPhone: '92991279663',
      neighborhood: 'Aleixo / Coroado',
      address: 'Av. André Araújo, 980',
      dayOfWeek: 'Segunda-feira',
      time: '20:00',
      targetAudience: 'Homens',
      membersCount: 17,
      latitude: -3.095,
      longitude: -59.988,
    },
  ],

  ministries: [
    {
      id: 'min_1',
      name: 'Louvor & Adoração Profética',
      leaderName: 'Ministério de Louvor MACDP',
      leaderPhone: '92991279663',
      description: 'Músicos, cantores e ministros que conduzem a congregação à manifestação da Presença de Deus com excelência.',
      meetingSchedule: 'Ensaios: Sábados às 16h',
      membersCount: 18,
    },
    {
      id: 'min_2',
      name: 'Caçadores Kids (Infantil)',
      leaderName: 'Pra. Abda Maduro & Equipe Kids',
      leaderPhone: '92991279663',
      description: 'Cuidado amoroso e discipulado bíblico lúdico para crianças, ensinando os pequenos a caçar a Presença.',
      meetingSchedule: 'Domingos durante os cultos',
      membersCount: 14,
    },
    {
      id: 'min_3',
      name: 'Caçadores Youth (Jovens)',
      leaderName: 'Pr. Jaziel Maduro & Pra. Abda Maduro',
      leaderPhone: '92991279663',
      description: 'Comunidade dinâmica para adolescentes e universitários viverem um avivamento autêntico e contagiante.',
      meetingSchedule: 'Sábados às 19h30',
      membersCount: 45,
    },
    {
      id: 'min_4',
      name: 'Ação Social & Amor ao Próximo',
      leaderName: 'Pr. Samuel Trindade & Diaconia',
      leaderPhone: '92991279663',
      description: 'Assistência social, visitas e distribuição de cestas básicas a famílias carentes da Zona Norte de Manaus.',
      meetingSchedule: 'Quinzena aos sábados às 09h',
      membersCount: 12,
    },
    {
      id: 'min_5',
      name: 'Famílias & Casais na Presença',
      leaderName: 'Pr. Oziel & Pra. Midiã Gomes Maduro',
      leaderPhone: '92991279663',
      description: 'Encontros mensais, cursos e fortalecimento dos lares e casamentos à luz da Palavra e unção profética.',
      meetingSchedule: 'Última sexta do mês às 20h',
      membersCount: 30,
    },
    {
      id: 'min_6',
      name: 'Comunicação & Mídia (MACDP Oficial)',
      leaderName: 'Equipe de Mídia & Transmissão @_macdp',
      leaderPhone: '92991279663',
      description: 'Transmissão ao vivo para o YouTube, captação audiovisual, redes sociais (@_macdp) e som.',
      meetingSchedule: 'Domingos e Quartas durante os cultos',
      membersCount: 10,
    },
    {
      id: 'min_7',
      name: 'Intercessão & Sentinelas',
      leaderName: 'Pra. Midiã Gomes Maduro & Intercessão',
      leaderPhone: '92991279663',
      description: 'Vigílias, clamor pelas famílias, cobertura espiritual da liderança e triagem de pedidos de oração.',
      meetingSchedule: 'Terças às 19h e Domingos antes do culto',
      membersCount: 16,
    },
  ],

  sermons: [
    {
      id: 'srm_1',
      title: 'Proibido a Entrada de Pessoas Perfeitas',
      preacher: 'Pr. Oziel Gomes Maduro',
      preacherRole: 'Pastor Presidente',
      date: '2026-08-30',
      series: 'Série: Caçadores da Presença',
      scripture: 'Lucas 5:31-32; Mateus 11:28-30',
      duration: '52 min',
      videoThumbnail: '/images/hero.jpg',
      videoEmbedUrl: 'https://www.youtube.com/@_macdp',
      audioUrl: '',
      summary:
        'A igreja de Jesus não é um museu para santos perfeitos, mas um hospital de amor e cura para os necessitados de Sua presença transformadora. Venha como você está!',
      tags: ['Graça', 'Acolhimento', 'Presença de Deus', 'Cura'],
    },
    {
      id: 'srm_2',
      title: 'O Clamor que Atrai o Céu na Floresta da Vida',
      preacher: 'Pra. Midiã Gomes Maduro',
      preacherRole: 'Pastora Presidente',
      date: '2026-08-23',
      series: 'Série: Avivamento Profundo',
      scripture: 'Salmos 42:1-2; Jeremias 29:12-14',
      duration: '46 min',
      videoThumbnail: '/images/fellowship.jpg',
      videoEmbedUrl: 'https://www.youtube.com/@_macdp',
      audioUrl: '',
      summary:
        'Como ter um coração sedento pela glória manifesta de Deus, rompendo a religiosidade fria através da adoração profunda.',
      tags: ['Intimidade', 'Oração', 'Presença', 'Família'],
    },
    {
      id: 'srm_3',
      title: 'Alianças Fortes em Tempos Difíceis',
      preacher: 'Pr. Oziel Gomes Maduro',
      preacherRole: 'Pastor Presidente',
      date: '2026-08-16',
      series: 'Série: Famílias no Altar',
      scripture: 'Josué 24:15; Efésios 5:21-33',
      duration: '48 min',
      videoThumbnail: '/images/hero.jpg',
      videoEmbedUrl: 'https://www.youtube.com/@_macdp',
      audioUrl: '',
      summary:
        'Princípios apostólicos para blindar o casamento e abençoar a descendência debaixo da cobertura da Presença.',
      tags: ['Família', 'Aliança', 'Propósito'],
    },
    {
      id: 'srm_4',
      title: 'Geração Caçadora da Presença',
      preacher: 'Pr. Jaziel Maduro',
      preacherRole: 'Pastor Auxiliar',
      date: '2026-08-09',
      series: 'Série: Fogo no Altar',
      scripture: '1 Crônicas 16:11; Salmos 24:6',
      duration: '40 min',
      videoThumbnail: '/images/fellowship.jpg',
      videoEmbedUrl: 'https://www.youtube.com/@_macdp',
      audioUrl: '',
      summary:
        'Despertando os jovens de Manaus para buscar a face do Senhor acima de qualquer entretenimento vazio.',
      tags: ['Juventude', 'Avivamento', 'Chamado'],
    },
  ],

  events: [
    {
      id: 'evt_1',
      title: 'Conferência Caçadores da Presença 2026',
      description:
        'Três dias inesquecíveis de louvor profético, ministração da Palavra e capacitação espiritual para toda a família na Chácara Paraiso Verde.',
      date: '2026-11-13',
      endDate: '2026-11-15',
      time: '19:30',
      location: 'Chácara Paraíso Verde, Estrada do Caldeirão, Iranduba - AM',
      locationDetails: {
        placeName: 'Chácara Paraíso Verde (Retiros & Eventos)',
        formattedAddress: 'Chácara Paraíso Verde, Estrada do Caldeirão, Iranduba - AM, 69405-000',
        neighborhood: 'Estrada do Caldeirão (Ramal do Caldeirão)',
        city: 'Iranduba',
        state: 'AM',
        latitude: -3.21338,
        longitude: -60.2232,
        googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=-3.21338,-60.2232',
      },
      roomReserved: 'Área de Eventos & Salão Campestre',
      category: 'Conferência',
      imageUrl: '/images/hero.jpg',
      isFree: false,
      price: 250,
      hasShirt: true,
      shirtPrice: 50,
      shirtSizes: ['PP', 'P', 'M', 'G', 'GG', 'XGG', 'Infantil 8', 'Infantil 12'],
      totalCapacity: 200,
      registeredCount: 1,
      speakerName: '',
      detailedSchedule: '',
      customQuestions: [
        {
          id: 'q_1788975380777',
          type: 'text',
          label: 'Nome Completo',
          required: true,
        },
        {
          id: 'q_1788975422070',
          type: 'date',
          label: 'Data de Nascimento',
          required: true,
        },
        {
          id: 'q_1788975440148',
          type: 'number',
          label: 'Telefone',
          required: true,
        },
        {
          id: 'q_1788975530487',
          type: 'radio',
          label: 'Qual a sua congregação?',
          options: [
            'Comunidade Plenitude de Cristo',
            'Missão Internacional Fé Apostólica',
            'Ministério Apostólico Jesus Salva',
            'Igreja Cristã Leão de Judá',
            'MACDP Zona Leste. MACDP Central.',
          ],
          required: true,
        },
        {
          id: 'q_1788975736681',
          type: 'text',
          label: 'Você tem alguma restrição alimentar? Se sim, qual?',
          required: true,
        },
        {
          id: 'q_1788975772098',
          type: 'text',
          label: 'Você tem alguma restrição a alguma medicação?',
          required: true,
        },
      ],
      registrations: [],
    },
  ],

  prayers: [],

  teachingClasses: [],

  teachingMaterials: [],

  teachingLogs: [],

  kidsChildren: [],

  kidsLessons: [],

  patrimonyAssets: [],

  pastoralAppointments: [],

  accessUsers: [
    {
      id: 'acc_1',
      name: 'Pr. Oziel Gomes Maduro',
      email: 'oziel.maduro@macdp.com.br',
      password: 'macdp2026',
      phone: '92984509989',
      roleTitle: 'Pastor Presidente',
      roleType: 'Administrador',
      status: 'ativo',
      allowedModules: [
        'dashboard',
        'membros',
        'celulas_admin',
        'ministerios_admin',
        'ensino_admin',
        'kids_admin',
        'patrimonio_admin',
        'pastoral_admin',
        'financeiro',
        'eventos_admin',
        'oracao_admin',
        'acessos_admin',
      ],
      canEdit: true,
      lastAccess: 'Hoje às 15:42',
      createdAt: '2024-01-01',
      notes: 'Acesso irrestrito a todos os módulos do sistema.',
    },
    {
      id: 'acc_2',
      name: 'Pra. Midiã Gomes Maduro',
      email: 'midia.maduro@macdp.com.br',
      password: 'macdp2026',
      phone: '92984509989',
      roleTitle: 'Pastora Presidente',
      roleType: 'Pastor',
      status: 'ativo',
      allowedModules: [
        'dashboard',
        'membros',
        'celulas_admin',
        'ministerios_admin',
        'ensino_admin',
        'kids_admin',
        'pastoral_admin',
        'eventos_admin',
        'oracao_admin',
      ],
      canEdit: true,
      lastAccess: 'Hoje às 14:10',
      createdAt: '2024-01-01',
      notes: 'Supervisão ministerial, gabinete pastoral, células e KIDS.',
    },
    {
      id: 'acc_3',
      name: 'Marcos Vinicius Ribeiro',
      email: 'tesouraria@macdp.com.br',
      password: 'macdp2026',
      phone: '92984509989',
      roleTitle: 'Diretor Financeiro & Tesouraria',
      roleType: 'Tesouraria',
      status: 'ativo',
      allowedModules: ['dashboard', 'financeiro', 'patrimonio_admin'],
      canEdit: true,
      lastAccess: 'Ontem às 18:20',
      createdAt: '2024-02-15',
      notes: 'Gestão de dízimos, ofertas, despesas e inventário de bens.',
    },
    {
      id: 'acc_4',
      name: 'Pr. Jaziel Maduro & Pra. Abda Maduro',
      email: 'jaziel.maduro@macdp.com.br',
      password: 'macdp2026',
      phone: '92984509989',
      roleTitle: 'Pastores Auxiliares',
      roleType: 'Pastor',
      status: 'ativo',
      allowedModules: [
        'dashboard',
        'membros',
        'celulas_admin',
        'ensino_admin',
        'kids_admin',
        'pastoral_admin',
        'oracao_admin',
      ],
      canEdit: true,
      lastAccess: 'Hoje às 11:30',
      createdAt: '2024-03-01',
      notes: 'Acompanhamento de células, famílias e visitas pastorais.',
    },
    {
      id: 'acc_5',
      name: 'Pr. Samuel Trindade & Pra. Daniely Trindade',
      email: 'samuel.trindade@macdp.com.br',
      password: 'macdp2026',
      phone: '92984509989',
      roleTitle: 'Pastores Auxiliares',
      roleType: 'Pastor',
      status: 'ativo',
      allowedModules: [
        'dashboard',
        'membros',
        'celulas_admin',
        'ministerios_admin',
        'ensino_admin',
        'pastoral_admin',
        'eventos_admin',
        'oracao_admin',
      ],
      canEdit: true,
      lastAccess: '28/08/2026',
      createdAt: '2024-03-10',
      notes: 'Supervisão de ministérios, eventos e gabinete pastoral.',
    },
    {
      id: 'acc_6',
      name: 'Camila Albuquerque Silva',
      email: 'camila.kids@macdp.com.br',
      password: 'macdp2026',
      phone: '92984509989',
      roleTitle: 'Coordenadora do Caçadores Kids',
      roleType: 'Liderança',
      status: 'ativo',
      allowedModules: ['kids_admin', 'ensino_admin'],
      canEdit: true,
      lastAccess: 'Hoje às 13:00',
      createdAt: '2024-04-12',
      notes: 'Controle exclusivo de check-in infantil, salas e lições da EBD/EBF.',
    },
    {
      id: 'acc_7',
      name: 'Raquel Vasconcelos',
      email: 'secretaria@macdp.com.br',
      password: 'macdp2026',
      phone: '92984509989',
      roleTitle: 'Secretária Executiva',
      roleType: 'Secretaria',
      status: 'ativo',
      allowedModules: ['dashboard', 'membros', 'eventos_admin', 'oracao_admin'],
      canEdit: true,
      lastAccess: 'Hoje às 09:15',
      createdAt: '2024-05-01',
      notes: 'Cadastro de membros, CRM de visitantes e credenciamento de eventos.',
    },
    {
      id: 'acc_8',
      name: 'Voluntário de Recepção e Portaria',
      email: 'portaria@macdp.com.br',
      password: 'macdp2026',
      phone: '92984509989',
      roleTitle: 'Operador de Portaria / Check-in',
      roleType: 'Voluntário',
      status: 'ativo',
      allowedModules: ['eventos_admin', 'membros'],
      canEdit: false,
      lastAccess: '27/08/2026',
      createdAt: '2024-06-20',
      notes: 'Acesso apenas leitura para credenciar participantes na entrada.',
    },
    {
      id: 'acc_mika',
      name: 'Mika Maduro',
      email: 'mikamaduro@macdp.com.br',
      password: 'macdp2026',
      phone: '92984509989',
      roleTitle: 'Gestão & Apoio',
      roleType: 'Liderança',
      status: 'ativo',
      allowedModules: [
        'dashboard',
        'membros',
        'celulas_admin',
        'ministerios_admin',
        'ensino_admin',
        'kids_admin',
        'pastoral_admin',
        'eventos_admin',
        'oracao_admin',
      ],
      canEdit: true,
      lastAccess: 'Hoje',
      createdAt: '2024-01-01',
      notes: 'Usuária do portal - botões de aplicativo mobile e teste no celular ocultados.',
    },
  ],
  churchSettings: INITIAL_CHURCH_SETTINGS,
  bankAccounts: INITIAL_BANK_ACCOUNTS,
  financialCategories: INITIAL_FINANCIAL_CATEGORIES,
  appNotifications: [],
};

export function getDatabase(): DatabaseSchema {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
      return INITIAL_DATABASE;
    }
    const parsed = JSON.parse(raw) as DatabaseSchema;
    let needsSave = false;
    if (!parsed.ministries) {
      parsed.ministries = INITIAL_DATABASE.ministries;
      needsSave = true;
    }
    if (!parsed.teachingClasses) {
      parsed.teachingClasses = INITIAL_DATABASE.teachingClasses;
      needsSave = true;
    }
    if (!parsed.teachingMaterials) {
      parsed.teachingMaterials = INITIAL_DATABASE.teachingMaterials;
      needsSave = true;
    }
    if (!parsed.teachingLogs) {
      parsed.teachingLogs = INITIAL_DATABASE.teachingLogs;
      needsSave = true;
    }
    if (!parsed.kidsChildren) {
      parsed.kidsChildren = INITIAL_DATABASE.kidsChildren;
      needsSave = true;
    }
    if (!parsed.kidsLessons) {
      parsed.kidsLessons = INITIAL_DATABASE.kidsLessons;
      needsSave = true;
    }
    if (!parsed.patrimonyAssets) {
      parsed.patrimonyAssets = INITIAL_DATABASE.patrimonyAssets;
      needsSave = true;
    }
    if (!parsed.pastoralAppointments) {
      parsed.pastoralAppointments = INITIAL_DATABASE.pastoralAppointments;
      needsSave = true;
    }
    if (!parsed.accessUsers) {
      parsed.accessUsers = INITIAL_DATABASE.accessUsers;
      needsSave = true;
    } else {
      parsed.accessUsers.forEach((u) => {
        if (!u.password) {
          u.password = 'macdp2026';
          needsSave = true;
        }
      });
      if (!parsed.accessUsers.some((u) => u.email.toLowerCase() === 'mikamaduro@macdp.com.br')) {
        parsed.accessUsers.push({
          id: 'acc_mika',
          name: 'Mika Maduro',
          email: 'mikamaduro@macdp.com.br',
          password: 'macdp2026',
          phone: '92984509989',
          roleTitle: 'Gestão & Apoio',
          roleType: 'Liderança',
          status: 'ativo',
          allowedModules: [
            'dashboard',
            'membros',
            'celulas_admin',
            'ministerios_admin',
            'ensino_admin',
            'kids_admin',
            'pastoral_admin',
            'eventos_admin',
            'oracao_admin',
          ],
          canEdit: true,
          lastAccess: 'Hoje',
          createdAt: '2024-01-01',
          notes: 'Usuária do portal - botões de aplicativo mobile e teste no celular ocultados.',
        });
        needsSave = true;
      }
    }
    if (!parsed.churchSettings) {
      parsed.churchSettings = INITIAL_CHURCH_SETTINGS;
      needsSave = true;
    } else {
      if (!parsed.churchSettings.appSettings) {
        parsed.churchSettings.appSettings = INITIAL_APP_SETTINGS;
        needsSave = true;
      }
      if (!parsed.churchSettings.mercadoPago || !parsed.churchSettings.mercadoPago.accessToken) {
        parsed.churchSettings.mercadoPago = {
          enabled: true,
          accessToken: INITIAL_CHURCH_SETTINGS.mercadoPago?.accessToken || '',
          publicKey: INITIAL_CHURCH_SETTINGS.mercadoPago?.publicKey || '',
          sandbox: false,
        };
        needsSave = true;
      }
      if (!parsed.churchSettings.emailSettings) {
        parsed.churchSettings.emailSettings = INITIAL_CHURCH_SETTINGS.emailSettings;
        needsSave = true;
      }
    }
    if (!parsed.appNotifications) {
      parsed.appNotifications = [];
      needsSave = true;
    }
    if (!parsed.prayers) {
      parsed.prayers = [];
      needsSave = true;
    }
    if (!parsed.bankAccounts) {
      parsed.bankAccounts = INITIAL_BANK_ACCOUNTS;
      needsSave = true;
    } else {
      parsed.bankAccounts.forEach((acc) => {
        if (!acc.logoUrl || acc.logoUrl.includes('wikimedia.org')) {
          acc.logoUrl = resolveBankLogo(acc.bankName || acc.name, acc.logoUrl);
          needsSave = true;
        }
      });
    }
    if (!parsed.financialCategories) {
      parsed.financialCategories = INITIAL_FINANCIAL_CATEGORIES;
      needsSave = true;
    }
    if (parsed.events) {
      parsed.events.forEach((e) => {
        // Always ensure registeredCount is strictly synced with actual registrations
        if (e.registrations) {
          if (e.registeredCount !== e.registrations.length) {
            e.registeredCount = e.registrations.length;
            needsSave = true;
          }
        }
      });
    }

    if (!parsed.schedules) {
      parsed.schedules = [];
      needsSave = true;
    }

    const { sanitized, hasChanged } = sanitizeDatabase(parsed);
    if (needsSave || hasChanged) {
      try {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(sanitized));
      } catch (e) {
        // ignore
      }
    }
    return sanitized;
  } catch (err) {
    console.error('Erro ao ler banco de dados do localStorage:', err);
    return INITIAL_DATABASE;
  }
}

export function saveDatabase(data: DatabaseSchema): void {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('igreja_db_updated'));
    // Sincroniza em segundo plano no Supabase
    pushDatabaseToSupabase(data).catch((err) => {
      console.warn('Sync com Supabase pendente:', err);
    });
  } catch (err) {
    console.error('Erro ao salvar banco de dados no localStorage:', err);
  }
}

export function resetDatabase(): DatabaseSchema {
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
  window.dispatchEvent(new CustomEvent('igreja_db_updated'));
  return INITIAL_DATABASE;
}

// Helper computations for Stats
export function calculateChurchStats(db: DatabaseSchema): ChurchStats {
  const activeMembers = db.members.filter((m) => m.status === 'ativo').length;
  const visitorsMonth = db.visitors.length;
  const avgAttendance = Math.round(
    db.members.reduce((acc, m) => acc + (m.attendanceRate || 85), 0) / Math.max(1, db.members.length)
  );

  const monthlyRevenue = db.transactions
    .filter((t) => t.type === 'entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = db.transactions
    .filter((t) => t.type === 'saida')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalActiveMembers: activeMembers,
    monthlyVisitors: visitorsMonth,
    averageAttendance: avgAttendance,
    attendanceGrowth: 0,
    monthlyRevenue,
    monthlyExpenses,
    netBalance: monthlyRevenue - monthlyExpenses,
  };
}

// Specific CRUD operations
export function addMember(member: Omit<Member, 'id'>): Member {
  const db = getDatabase();
  const newMember: Member = {
    ...member,
    id: `m_${Date.now()}`,
  };
  db.members.unshift(newMember);
  saveDatabase(db);
  return newMember;
}

export function updateMember(id: string, updates: Partial<Member>): Member | null {
  const db = getDatabase();
  const index = db.members.findIndex((m) => m.id === id);
  if (index === -1) return null;
  db.members[index] = { ...db.members[index], ...updates };
  saveDatabase(db);
  return db.members[index];
}

export function deleteMember(id: string): boolean {
  const db = getDatabase();
  const filtered = db.members.filter((m) => m.id !== id);
  if (filtered.length === db.members.length) return false;
  db.members = filtered;
  saveDatabase(db);
  return true;
}

export function addVisitor(visitor: Omit<VisitorItem, 'id'>): VisitorItem {
  const db = getDatabase();
  const newVisitor: VisitorItem = {
    ...visitor,
    id: `v_${Date.now()}`,
  };
  db.visitors.unshift(newVisitor);
  saveDatabase(db);
  return newVisitor;
}

export function updateVisitorStage(id: string, stage: VisitorItem['stage'], notes?: string): void {
  const db = getDatabase();
  const item = db.visitors.find((v) => v.id === id);
  if (item) {
    item.stage = stage;
    if (notes) item.notes = `${item.notes}\n[${new Date().toLocaleDateString('pt-BR')}]: ${notes}`;
    item.lastContactDate = new Date().toISOString().split('T')[0];
    saveDatabase(db);
  }
}

export function addTransaction(transaction: Omit<FinancialTransaction, 'id'>): FinancialTransaction {
  const db = getDatabase();
  const receiptNumber =
    transaction.type === 'entrada'
      ? `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      : `DESP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const newTx: FinancialTransaction = {
    ...transaction,
    id: `tx_${Date.now()}`,
    receiptNumber,
  };
  db.transactions.unshift(newTx);
  saveDatabase(db);
  return newTx;
}

export function deleteTransaction(id: string): void {
  const db = getDatabase();
  db.transactions = db.transactions.filter((t) => t.id !== id);
  saveDatabase(db);
}

export function updateVolunteerScheduleStatus(
  scheduleId: string,
  memberId: string,
  status: 'confirmado' | 'pendente' | 'indisponivel'
): void {
  const db = getDatabase();
  const sch = db.schedules.find((s) => s.id === scheduleId);
  if (sch) {
    const slot = sch.team.find((t) => t.memberId === memberId);
    if (slot) {
      slot.status = status;
      saveDatabase(db);
    }
  }
}

export function addPrayerRequest(prayer: Omit<PrayerRequest, 'id' | 'createdAt' | 'status'>): PrayerRequest {
  const db = getDatabase();
  const newPrayer: PrayerRequest = {
    ...prayer,
    id: `pray_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'novo',
  };
  db.prayers.unshift(newPrayer);
  saveDatabase(db);
  return newPrayer;
}

export function updatePrayerStatus(id: string, status: PrayerRequest['status'], pastoralNotes?: string): void {
  const db = getDatabase();
  const item = db.prayers.find((p) => p.id === id);
  if (item) {
    item.status = status;
    if (pastoralNotes) item.pastoralNotes = pastoralNotes;
    saveDatabase(db);
  }
}

export function addEventRegistration(
  eventId: string,
  registration: {
    name: string;
    email: string;
    phone: string;
    paymentMethod?: 'pix' | 'credit_card' | 'manual' | 'free';
    paymentStatus?: 'confirmed' | 'pending' | 'free';
    paymentNotes?: string;
    customAnswers?: Record<string, string | string[]>;
    includeShirt?: boolean;
    shirtSize?: string;
    shirtPrice?: number;
    totalPaid?: number;
    pixCode?: string;
    mercadoPagoPaymentId?: string;
    mercadoPagoStatus?: string;
  }
): EventRegistration | null {
  const db = getDatabase();
  const evt = db.events.find((e) => e.id === eventId);
  if (evt) {
    evt.registeredCount += 1;
    const shirtCost = registration.includeShirt ? (registration.shirtPrice || evt.shirtPrice || 0) : 0;
    const ticketCost = evt.isFree ? 0 : (evt.price || 0);
    const calculatedTotal = registration.totalPaid !== undefined ? registration.totalPaid : (ticketCost + shirtCost);

    const newReg: EventRegistration = {
      id: `reg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
      checkedIn: false,
      registeredAt: new Date().toISOString().split('T')[0],
      paymentMethod: registration.paymentMethod || (evt.isFree && !registration.includeShirt ? 'free' : 'pix'),
      paymentStatus: registration.paymentStatus || (evt.isFree && !registration.includeShirt ? 'free' : 'confirmed'),
      paymentNotes: registration.paymentNotes,
      customAnswers: registration.customAnswers || {},
      includeShirt: !!registration.includeShirt,
      shirtSize: registration.includeShirt ? registration.shirtSize : undefined,
      shirtPrice: registration.includeShirt ? shirtCost : undefined,
      totalPaid: calculatedTotal,
      pixCode: registration.pixCode,
      mercadoPagoPaymentId: registration.mercadoPagoPaymentId,
      mercadoPagoStatus: registration.mercadoPagoStatus,
    };
    evt.registrations.push(newReg);

    // Se a inscrição possui valor e está confirmada, alimenta automaticamente a Gestão Financeira no Caixa do Evento
    if (calculatedTotal > 0 && newReg.paymentStatus === 'confirmed') {
      const defaultAcc = (db.bankAccounts || []).find((a) => a.isDefault && a.status === 'ativo') || (db.bankAccounts || [])[0];
      const newTx: FinancialTransaction = {
        id: `tx_reg_${newReg.id}`,
        type: 'entrada',
        category: 'Inscrições de Eventos & Conferências',
        description: `Inscrição: ${newReg.name} - ${evt.title}${newReg.includeShirt ? ` (Camisa Tam ${newReg.shirtSize})` : ''}`,
        amount: calculatedTotal,
        date: newReg.registeredAt || new Date().toISOString().split('T')[0],
        paymentMethod: newReg.paymentMethod === 'credit_card' ? 'cartao' : (newReg.paymentMethod === 'manual' ? 'dinheiro' : 'pix'),
        memberOrVendor: newReg.name,
        receiptNumber: `REC-EVT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'confirmado',
        bankAccountId: defaultAcc?.id || 'acc_1',
        eventId: evt.id,
        eventName: evt.title,
        registrationId: newReg.id,
      };
      db.transactions.unshift(newTx);
    }

    saveDatabase(db);
    return newReg;
  }
  return null;
}

export function updateEventRegistrationPayment(
  eventId: string,
  registrationId: string,
  status: 'confirmed' | 'pending',
  notes?: string
): boolean {
  const db = getDatabase();
  const evt = db.events.find((e) => e.id === eventId);
  if (!evt) return false;
  const reg = evt.registrations.find((r) => r.id === registrationId);
  if (!reg) return false;
  reg.paymentStatus = status;
  if (notes) reg.paymentNotes = notes;

  const shirtCost = reg.includeShirt ? (reg.shirtPrice || evt.shirtPrice || 0) : 0;
  const ticketCost = evt.isFree ? 0 : (evt.price || 0);
  const totalAmount = reg.totalPaid !== undefined ? reg.totalPaid : (ticketCost + shirtCost);

  // Sincroniza com a Gestão Financeira no Caixa do Evento
  const existingTxIndex = db.transactions.findIndex((t) => t.registrationId === registrationId);

  if (status === 'confirmed' && totalAmount > 0) {
    if (existingTxIndex !== -1) {
      db.transactions[existingTxIndex].status = 'confirmado';
      db.transactions[existingTxIndex].amount = totalAmount;
    } else {
      const defaultAcc = (db.bankAccounts || []).find((a) => a.isDefault && a.status === 'ativo') || (db.bankAccounts || [])[0];
      const newTx: FinancialTransaction = {
        id: `tx_reg_${reg.id}`,
        type: 'entrada',
        category: 'Inscrições de Eventos & Conferências',
        description: `Inscrição: ${reg.name} - ${evt.title}${reg.includeShirt ? ` (Camisa Tam ${reg.shirtSize})` : ''}`,
        amount: totalAmount,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: reg.paymentMethod === 'credit_card' ? 'cartao' : (reg.paymentMethod === 'manual' ? 'dinheiro' : 'pix'),
        memberOrVendor: reg.name,
        receiptNumber: `REC-EVT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'confirmado',
        bankAccountId: defaultAcc?.id || 'acc_1',
        eventId: evt.id,
        eventName: evt.title,
        registrationId: reg.id,
      };
      db.transactions.unshift(newTx);
    }
  } else if (status === 'pending' && existingTxIndex !== -1) {
    db.transactions[existingTxIndex].status = 'pendente';
  }

  saveDatabase(db);
  return true;
}

export function checkInGuest(eventId: string, registrationId: string): void {
  const db = getDatabase();
  const evt = db.events.find((e) => e.id === eventId);
  if (evt) {
    const reg = evt.registrations.find((r) => r.id === registrationId);
    if (reg) {
      reg.checkedIn = !reg.checkedIn;
      saveDatabase(db);
    }
  }
}

// ==================== CÉLULAS CRUD ====================
export function addCell(cell: Omit<CellGroup, 'id'>): CellGroup {
  const db = getDatabase();
  const newCell: CellGroup = {
    ...cell,
    id: `cell_${Date.now()}`,
  };
  db.cells.unshift(newCell);
  saveDatabase(db);
  return newCell;
}

export function updateCell(id: string, updates: Partial<CellGroup>): CellGroup | null {
  const db = getDatabase();
  const index = db.cells.findIndex((c) => c.id === id);
  if (index === -1) return null;
  db.cells[index] = { ...db.cells[index], ...updates };
  saveDatabase(db);
  return db.cells[index];
}

export function deleteCell(id: string): boolean {
  const db = getDatabase();
  const filtered = db.cells.filter((c) => c.id !== id);
  if (filtered.length === db.cells.length) return false;
  db.cells = filtered;
  saveDatabase(db);
  return true;
}

// ==================== MINISTÉRIOS CRUD ====================
export function addMinistry(ministry: Omit<Ministry, 'id'>): Ministry {
  const db = getDatabase();
  const newMinistry: Ministry = {
    ...ministry,
    id: `min_${Date.now()}`,
  };
  db.ministries.unshift(newMinistry);
  saveDatabase(db);
  return newMinistry;
}

export function updateMinistry(id: string, updates: Partial<Ministry>): Ministry | null {
  const db = getDatabase();
  const index = db.ministries.findIndex((m) => m.id === id);
  if (index === -1) return null;
  db.ministries[index] = { ...db.ministries[index], ...updates };
  saveDatabase(db);
  return db.ministries[index];
}

export function deleteMinistry(id: string): boolean {
  const db = getDatabase();
  const filtered = db.ministries.filter((m) => m.id !== id);
  if (filtered.length === db.ministries.length) return false;
  db.ministries = filtered;
  saveDatabase(db);
  return true;
}

// ==================== ESCALAS CRUD ====================
export function addSchedule(schedule: Omit<MinistrySchedule, 'id'>): MinistrySchedule {
  const db = getDatabase();
  const newSchedule: MinistrySchedule = {
    ...schedule,
    id: `sch_${Date.now()}`,
  };
  db.schedules.unshift(newSchedule);
  saveDatabase(db);
  return newSchedule;
}

export function updateSchedule(id: string, updates: Partial<MinistrySchedule>): MinistrySchedule | null {
  const db = getDatabase();
  const index = db.schedules.findIndex((s) => s.id === id);
  if (index === -1) return null;
  db.schedules[index] = { ...db.schedules[index], ...updates };
  saveDatabase(db);
  return db.schedules[index];
}

export function deleteSchedule(id: string): boolean {
  const db = getDatabase();
  const filtered = db.schedules.filter((s) => s.id !== id);
  if (filtered.length === db.schedules.length) return false;
  db.schedules = filtered;
  saveDatabase(db);
  return true;
}

// ==================== EVENTOS CRUD ====================
export function addEvent(event: Omit<ChurchEvent, 'id' | 'registeredCount' | 'registrations'>): ChurchEvent {
  const db = getDatabase();
  const newEvent: ChurchEvent = {
    ...event,
    id: `evt_${Date.now()}`,
    registeredCount: 0,
    registrations: [],
  };
  db.events.unshift(newEvent);
  saveDatabase(db);
  return newEvent;
}

export function updateEvent(id: string, updates: Partial<ChurchEvent>): ChurchEvent | null {
  const db = getDatabase();
  const index = db.events.findIndex((e) => e.id === id);
  if (index === -1) return null;
  db.events[index] = { ...db.events[index], ...updates };
  saveDatabase(db);
  return db.events[index];
}

export function deleteEvent(id: string): boolean {
  const db = getDatabase();
  const filtered = db.events.filter((e) => e.id !== id);
  if (filtered.length === db.events.length) return false;
  db.events = filtered;
  saveDatabase(db);
  return true;
}

export function deleteEventRegistration(eventId: string, regId: string): boolean {
  const db = getDatabase();
  const evt = db.events.find((e) => e.id === eventId);
  if (!evt) return false;
  const initialLen = evt.registrations.length;
  evt.registrations = evt.registrations.filter((r) => r.id !== regId);
  if (evt.registrations.length < initialLen) {
    evt.registeredCount = Math.max(0, evt.registeredCount - 1);
    // Remove transação financeira vinculada à inscrição excluída
    db.transactions = db.transactions.filter((t) => t.registrationId !== regId);
    saveDatabase(db);
    return true;
  }
  return false;
}

// ==================== TRANSAÇÕES CRUD ====================
export function updateTransaction(id: string, updates: Partial<FinancialTransaction>): FinancialTransaction | null {
  const db = getDatabase();
  const index = db.transactions.findIndex((t) => t.id === id);
  if (index === -1) return null;
  db.transactions[index] = { ...db.transactions[index], ...updates };
  saveDatabase(db);
  return db.transactions[index];
}

// ==================== VISITANTES CRUD ====================
export function updateVisitor(id: string, updates: Partial<VisitorItem>): VisitorItem | null {
  const db = getDatabase();
  const index = db.visitors.findIndex((v) => v.id === id);
  if (index === -1) return null;
  db.visitors[index] = { ...db.visitors[index], ...updates };
  saveDatabase(db);
  return db.visitors[index];
}

export function deleteVisitor(id: string): boolean {
  const db = getDatabase();
  const filtered = db.visitors.filter((v) => v.id !== id);
  if (filtered.length === db.visitors.length) return false;
  db.visitors = filtered;
  saveDatabase(db);
  return true;
}

// ==================== ORAÇÃO CRUD ====================
export function updatePrayerRequest(id: string, updates: Partial<PrayerRequest>): PrayerRequest | null {
  const db = getDatabase();
  const index = db.prayers.findIndex((p) => p.id === id);
  if (index === -1) return null;
  db.prayers[index] = { ...db.prayers[index], ...updates };
  saveDatabase(db);
  return db.prayers[index];
}

export function deletePrayerRequest(id: string): boolean {
  const db = getDatabase();
  const filtered = db.prayers.filter((p) => p.id !== id);
  if (filtered.length === db.prayers.length) return false;
  db.prayers = filtered;
  saveDatabase(db);
  return true;
}

// ==================== ENSINO: TURMAS & CLASSES CRUD ====================
export function addTeachingClass(cls: Omit<TeachingClass, 'id'>): TeachingClass {
  const db = getDatabase();
  const newClass: TeachingClass = {
    ...cls,
    id: `tc_${Date.now()}`,
  };
  db.teachingClasses.unshift(newClass);
  saveDatabase(db);
  return newClass;
}

export function updateTeachingClass(id: string, updates: Partial<TeachingClass>): TeachingClass | null {
  const db = getDatabase();
  const index = db.teachingClasses.findIndex((c) => c.id === id);
  if (index === -1) return null;
  db.teachingClasses[index] = { ...db.teachingClasses[index], ...updates };
  saveDatabase(db);
  return db.teachingClasses[index];
}

export function deleteTeachingClass(id: string): boolean {
  const db = getDatabase();
  const filtered = db.teachingClasses.filter((c) => c.id !== id);
  if (filtered.length === db.teachingClasses.length) return false;
  db.teachingClasses = filtered;
  saveDatabase(db);
  return true;
}

// ==================== ENSINO: MATERIAIS DE ESTUDO CRUD ====================
export function addTeachingMaterial(mat: Omit<TeachingMaterial, 'id' | 'downloadCount'>): TeachingMaterial {
  const db = getDatabase();
  const newMaterial: TeachingMaterial = {
    ...mat,
    id: `mat_${Date.now()}`,
    downloadCount: 0,
  };
  db.teachingMaterials.unshift(newMaterial);
  saveDatabase(db);
  return newMaterial;
}

export function updateTeachingMaterial(id: string, updates: Partial<TeachingMaterial>): TeachingMaterial | null {
  const db = getDatabase();
  const index = db.teachingMaterials.findIndex((m) => m.id === id);
  if (index === -1) return null;
  db.teachingMaterials[index] = { ...db.teachingMaterials[index], ...updates };
  saveDatabase(db);
  return db.teachingMaterials[index];
}

export function deleteTeachingMaterial(id: string): boolean {
  const db = getDatabase();
  const filtered = db.teachingMaterials.filter((m) => m.id !== id);
  if (filtered.length === db.teachingMaterials.length) return false;
  db.teachingMaterials = filtered;
  saveDatabase(db);
  return true;
}

// ==================== ENSINO: DISPARO DE MENSAGENS & COMUNICADOS ====================
export function sendTeachingBroadcast(log: Omit<TeachingMessageLog, 'id' | 'sentAt' | 'status'>): TeachingMessageLog {
  const db = getDatabase();
  const newLog: TeachingMessageLog = {
    ...log,
    id: `log_${Date.now()}`,
    sentAt: new Date().toISOString(),
    status: 'enviado',
  };
  if (!db.teachingLogs) db.teachingLogs = [];
  db.teachingLogs.unshift(newLog);
  saveDatabase(db);
  return newLog;
}

// ==================== KIDS: CRIANÇAS & RESPONSÁVEIS CRUD ====================
export function addKidChild(child: Omit<KidChild, 'id' | 'checkInStatus' | 'securityCode'>): KidChild {
  const db = getDatabase();
  const codeNum = Math.floor(100 + Math.random() * 900);
  const newKid: KidChild = {
    ...child,
    id: `kid_${Date.now()}`,
    securityCode: `KID-${codeNum}`,
    checkInStatus: 'ausente',
  };
  if (!db.kidsChildren) db.kidsChildren = [];
  db.kidsChildren.unshift(newKid);
  saveDatabase(db);
  return newKid;
}

export function updateKidChild(id: string, updates: Partial<KidChild>): KidChild | null {
  const db = getDatabase();
  const index = db.kidsChildren.findIndex((k) => k.id === id);
  if (index === -1) return null;
  db.kidsChildren[index] = { ...db.kidsChildren[index], ...updates };
  saveDatabase(db);
  return db.kidsChildren[index];
}

export function deleteKidChild(id: string): boolean {
  const db = getDatabase();
  const filtered = db.kidsChildren.filter((k) => k.id !== id);
  if (filtered.length === db.kidsChildren.length) return false;
  db.kidsChildren = filtered;
  saveDatabase(db);
  return true;
}

export function checkInKidChild(id: string, code?: string): KidChild | null {
  const db = getDatabase();
  const kid = db.kidsChildren.find((k) => k.id === id);
  if (!kid) return null;
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  kid.checkInStatus = 'presente';
  kid.checkInTime = `${hours}:${minutes}`;
  kid.checkOutTime = undefined;
  if (code) kid.securityCode = code;
  saveDatabase(db);
  return kid;
}

export function checkOutKidChild(id: string): KidChild | null {
  const db = getDatabase();
  const kid = db.kidsChildren.find((k) => k.id === id);
  if (!kid) return null;
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  kid.checkInStatus = 'retirada';
  kid.checkOutTime = `${hours}:${minutes}`;
  saveDatabase(db);
  return kid;
}

// ==================== KIDS: CONTEÚDO APLICADO (EBD & EBF) CRUD ====================
export function addKidLesson(lesson: Omit<KidLesson, 'id'>): KidLesson {
  const db = getDatabase();
  const newLesson: KidLesson = {
    ...lesson,
    id: `kl_${Date.now()}`,
  };
  if (!db.kidsLessons) db.kidsLessons = [];
  db.kidsLessons.unshift(newLesson);
  saveDatabase(db);
  return newLesson;
}

export function updateKidLesson(id: string, updates: Partial<KidLesson>): KidLesson | null {
  const db = getDatabase();
  const index = db.kidsLessons.findIndex((l) => l.id === id);
  if (index === -1) return null;
  db.kidsLessons[index] = { ...db.kidsLessons[index], ...updates };
  saveDatabase(db);
  return db.kidsLessons[index];
}

export function deleteKidLesson(id: string): boolean {
  const db = getDatabase();
  const filtered = db.kidsLessons.filter((l) => l.id !== id);
  if (filtered.length === db.kidsLessons.length) return false;
  db.kidsLessons = filtered;
  saveDatabase(db);
  return true;
}

// ==================== PATRIMÔNIO: BENS & ETIQUETAS CRUD ====================
export function addPatrimonyAsset(asset: Omit<PatrimonyAsset, 'id' | 'tagNumber'>): PatrimonyAsset {
  const db = getDatabase();
  const nextNum = (db.patrimonyAssets?.length || 0) + 101;
  const tagNumber = `PAT-${String(nextNum).padStart(5, '0')}`;
  const newAsset: PatrimonyAsset = {
    ...asset,
    id: `ast_${Date.now()}`,
    tagNumber,
  };
  if (!db.patrimonyAssets) db.patrimonyAssets = [];
  db.patrimonyAssets.unshift(newAsset);
  saveDatabase(db);
  return newAsset;
}

export function updatePatrimonyAsset(id: string, updates: Partial<PatrimonyAsset>): PatrimonyAsset | null {
  const db = getDatabase();
  const index = db.patrimonyAssets.findIndex((a) => a.id === id);
  if (index === -1) return null;
  db.patrimonyAssets[index] = { ...db.patrimonyAssets[index], ...updates };
  saveDatabase(db);
  return db.patrimonyAssets[index];
}

export function deletePatrimonyAsset(id: string): boolean {
  const db = getDatabase();
  const filtered = db.patrimonyAssets.filter((a) => a.id !== id);
  if (filtered.length === db.patrimonyAssets.length) return false;
  db.patrimonyAssets = filtered;
  saveDatabase(db);
  return true;
}

// ==================== ÁREA PASTORAL: ATENDIMENTOS & AGENDA CRUD ====================
export function addPastoralAppointment(appt: Omit<PastoralAppointment, 'id'>): PastoralAppointment {
  const db = getDatabase();
  const newAppt: PastoralAppointment = {
    ...appt,
    id: `app_${Date.now()}`,
  };
  if (!db.pastoralAppointments) db.pastoralAppointments = [];
  db.pastoralAppointments.unshift(newAppt);
  saveDatabase(db);
  return newAppt;
}

export function updatePastoralAppointment(id: string, updates: Partial<PastoralAppointment>): PastoralAppointment | null {
  const db = getDatabase();
  const index = db.pastoralAppointments.findIndex((a) => a.id === id);
  if (index === -1) return null;
  db.pastoralAppointments[index] = { ...db.pastoralAppointments[index], ...updates };
  saveDatabase(db);
  return db.pastoralAppointments[index];
}

export function deletePastoralAppointment(id: string): boolean {
  const db = getDatabase();
  const filtered = db.pastoralAppointments.filter((a) => a.id !== id);
  if (filtered.length === db.pastoralAppointments.length) return false;
  db.pastoralAppointments = filtered;
  saveDatabase(db);
  return true;
}

// ==================== GESTÃO DE ACESSOS: USUÁRIOS & PERMISSÕES CRUD ====================
export function addAccessUser(user: Omit<SystemAccessUser, 'id' | 'createdAt'>): SystemAccessUser {
  const db = getDatabase();
  const newUser: SystemAccessUser = {
    ...user,
    id: `acc_${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
  };
  if (!db.accessUsers) db.accessUsers = [];
  db.accessUsers.unshift(newUser);
  saveDatabase(db);
  return newUser;
}

export function updateAccessUser(id: string, updates: Partial<SystemAccessUser>): SystemAccessUser | null {
  const db = getDatabase();
  const index = db.accessUsers.findIndex((u) => u.id === id);
  if (index === -1) return null;
  db.accessUsers[index] = { ...db.accessUsers[index], ...updates };
  saveDatabase(db);
  return db.accessUsers[index];
}

export function deleteAccessUser(id: string): boolean {
  const db = getDatabase();
  const filtered = db.accessUsers.filter((u) => u.id !== id);
  if (filtered.length === db.accessUsers.length) return false;
  db.accessUsers = filtered;
  saveDatabase(db);
  return true;
}

// ==================== CONFIGURAÇÕES DA IGREJA (NOME, LOGO, CONTATOS) ====================
export function getChurchSettings(): ChurchSettings {
  const db = getDatabase();
  const settings = db.churchSettings || INITIAL_CHURCH_SETTINGS;
  if (!settings.mercadoPago || !settings.mercadoPago.accessToken) {
    settings.mercadoPago = {
      enabled: settings.mercadoPago?.enabled ?? true,
      accessToken: settings.mercadoPago?.accessToken || INITIAL_CHURCH_SETTINGS.mercadoPago?.accessToken || '',
      publicKey: settings.mercadoPago?.publicKey || INITIAL_CHURCH_SETTINGS.mercadoPago?.publicKey || '',
      sandbox: settings.mercadoPago?.sandbox ?? false,
    };
  }
  return settings;
}

export function updateChurchSettings(settings: Partial<ChurchSettings>): ChurchSettings {
  const db = getDatabase();
  const current = db.churchSettings || INITIAL_CHURCH_SETTINGS;
  const updated: ChurchSettings = {
    ...current,
    ...settings,
    address: {
      ...current.address,
      ...(settings.address || {}),
    },
    social: {
      ...current.social,
      ...(settings.social || {}),
    },
    pix: {
      ...current.pix,
      ...(settings.pix || {}),
    },
    themeColors: {
      ...(current.themeColors || { primaryColor: '#f59e0b', secondaryColor: '#3b82f6' }),
      ...(settings.themeColors || {}),
    },
    mercadoPago: {
      ...(current.mercadoPago || { enabled: false, accessToken: '', publicKey: '', sandbox: false }),
      ...(settings.mercadoPago || {}),
    },
    regularServices:
      settings.regularServices !== undefined
        ? settings.regularServices
        : (current.regularServices || INITIAL_CHURCH_SETTINGS.regularServices || []),
  };
  db.churchSettings = updated;
  saveDatabase(db);
  return updated;
}

export function getRegularServices(): RegularServiceItem[] {
  const db = getDatabase();
  return (
    db.churchSettings?.regularServices ||
    INITIAL_CHURCH_SETTINGS.regularServices ||
    []
  );
}

export function saveRegularServices(services: RegularServiceItem[]): ChurchSettings {
  return updateChurchSettings({ regularServices: services });
}

// ==================== CONTAS BANCÁRIAS CRUD ====================
export function addBankAccount(account: Omit<BankAccount, 'id'>): BankAccount {
  const db = getDatabase();
  if (!db.bankAccounts) db.bankAccounts = [];
  if (account.isDefault) {
    db.bankAccounts.forEach((a) => { a.isDefault = false; });
  }
  const newAccount: BankAccount = {
    ...account,
    id: `acc_${Date.now()}`,
  };
  db.bankAccounts.push(newAccount);
  saveDatabase(db);
  return newAccount;
}

export function updateBankAccount(id: string, updates: Partial<BankAccount>): BankAccount | null {
  const db = getDatabase();
  if (!db.bankAccounts) db.bankAccounts = [];
  const index = db.bankAccounts.findIndex((a) => a.id === id);
  if (index === -1) return null;
  if (updates.isDefault) {
    db.bankAccounts.forEach((a) => { if (a.id !== id) a.isDefault = false; });
  }
  db.bankAccounts[index] = { ...db.bankAccounts[index], ...updates };
  saveDatabase(db);
  return db.bankAccounts[index];
}

export function deleteBankAccount(id: string): boolean {
  const db = getDatabase();
  if (!db.bankAccounts) return false;
  const initialLen = db.bankAccounts.length;
  db.bankAccounts = db.bankAccounts.filter((a) => a.id !== id);
  if (db.bankAccounts.length < initialLen) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// ==================== CATEGORIAS FINANCEIRAS CRUD ====================
export function addFinancialCategory(category: Omit<FinancialCategory, 'id'>): FinancialCategory {
  const db = getDatabase();
  if (!db.financialCategories) db.financialCategories = [];
  const newCategory: FinancialCategory = {
    ...category,
    id: `cat_${Date.now()}`,
  };
  db.financialCategories.push(newCategory);
  saveDatabase(db);
  return newCategory;
}

export function updateFinancialCategory(id: string, updates: Partial<FinancialCategory>): FinancialCategory | null {
  const db = getDatabase();
  if (!db.financialCategories) db.financialCategories = [];
  const index = db.financialCategories.findIndex((c) => c.id === id);
  if (index === -1) return null;
  db.financialCategories[index] = { ...db.financialCategories[index], ...updates };
  saveDatabase(db);
  return db.financialCategories[index];
}

export function deleteFinancialCategory(id: string): boolean {
  const db = getDatabase();
  if (!db.financialCategories) return false;
  const initialLen = db.financialCategories.length;
  db.financialCategories = db.financialCategories.filter((c) => c.id !== id);
  if (db.financialCategories.length < initialLen) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// ==================== CONFIGURAÇÕES DO APP DA IGREJA & NOTIFICAÇÕES ====================

export function updateChurchAppSettings(updates: Partial<ChurchAppSettings>): ChurchAppSettings {
  const db = getDatabase();
  if (!db.churchSettings) {
    db.churchSettings = INITIAL_CHURCH_SETTINGS;
  }
  const currentApp = db.churchSettings.appSettings || INITIAL_APP_SETTINGS;
  const updatedApp: ChurchAppSettings = {
    ...currentApp,
    ...updates,
    enabledModules: {
      ...currentApp.enabledModules,
      ...(updates.enabledModules || {}),
    },
    devotionalOfTheDay: updates.devotionalOfTheDay
      ? {
          verse: updates.devotionalOfTheDay.verse ?? currentApp.devotionalOfTheDay?.verse ?? '',
          reference: updates.devotionalOfTheDay.reference ?? currentApp.devotionalOfTheDay?.reference ?? '',
          thought: updates.devotionalOfTheDay.thought ?? currentApp.devotionalOfTheDay?.thought ?? '',
          author: updates.devotionalOfTheDay.author ?? currentApp.devotionalOfTheDay?.author ?? '',
        }
      : currentApp.devotionalOfTheDay,
  };

  db.churchSettings.appSettings = updatedApp;
  saveDatabase(db);
  return updatedApp;
}

export function getAppNotifications(): AppNotification[] {
  const db = getDatabase();
  return db.appNotifications || INITIAL_APP_NOTIFICATIONS;
}

export function sendAppNotification(
  notification: Omit<AppNotification, 'id' | 'date' | 'read'>
): AppNotification {
  const db = getDatabase();
  if (!db.appNotifications) {
    db.appNotifications = [];
  }

  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newNotif: AppNotification = {
    ...notification,
    id: `notif_${Date.now()}`,
    date: formattedDate,
    read: false,
  };

  db.appNotifications.unshift(newNotif);
  saveDatabase(db);

  // Dispara evento customizado para o app atualizar na hora
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app_notification_received', { detail: newNotif }));
  }

  return newNotif;
}

export function markAppNotificationAsRead(id: string): void {
  const db = getDatabase();
  if (!db.appNotifications) return;
  const found = db.appNotifications.find((n) => n.id === id);
  if (found) {
    found.read = true;
    saveDatabase(db);
  }
}

export function deleteAppNotification(id: string): boolean {
  const db = getDatabase();
  if (!db.appNotifications) return false;
  const initLen = db.appNotifications.length;
  db.appNotifications = db.appNotifications.filter((n) => n.id !== id);
  if (db.appNotifications.length < initLen) {
    saveDatabase(db);
    return true;
  }
  return false;
}

export function toggleAppLiveStatus(isLive: boolean, title?: string, liveUrl?: string): boolean {
  const db = getDatabase();
  if (!db.churchSettings) {
    db.churchSettings = INITIAL_CHURCH_SETTINGS;
  }
  const currentApp = db.churchSettings.appSettings || INITIAL_APP_SETTINGS;
  const updatedApp: ChurchAppSettings = {
    ...currentApp,
    isLiveNow: isLive,
    ...(title ? { liveTitle: title } : {}),
    ...(liveUrl ? { liveStreamUrl: liveUrl } : {}),
  };
  db.churchSettings.appSettings = updatedApp;
  saveDatabase(db);

  if (isLive) {
    sendAppNotification({
      title: `🔴 Culto Ao Vivo: ${updatedApp.liveTitle}`,
      message: 'A transmissão ao vivo do culto acabou de iniciar! Conecte-se agora pelo app.',
      type: 'live',
      actionUrl: '#live',
    });
  }

  return isLive;
}








