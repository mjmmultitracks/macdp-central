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
} from '../types';
import { pushDatabaseToSupabase } from './supabaseSync';

const DB_STORAGE_KEY = 'macdp_db_data_v2';

// Seed initial data
export const INITIAL_DATABASE: DatabaseSchema = {
  members: [
    {
      id: 'm_1',
      name: 'Lucas Gabriel Oliveira',
      email: 'lucas.oliveira@email.com',
      phone: '11987654321',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
      status: 'ativo',
      roleInChurch: 'Líder de Célula & Diácono',
      birthDate: '1992-05-14',
      baptismDate: '2015-08-20',
      membershipDate: '2015-09-01',
      maritalStatus: 'Casado(a)',
      address: {
        street: 'Rua Bela Cintra, 450',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        zip: '01415-000',
      },
      ministries: ['Recepção', 'Ação Social'],
      cellGroupId: 'cell_1',
      spiritualGifts: ['Serviço', 'Hospitalidade', 'Exortação'],
      attendanceRate: 95,
      notes: 'Liderança ativa, sempre disponível para apoio em eventos grandes.',
    },
    {
      id: 'm_2',
      name: 'Mariana Costa Ferreira',
      email: 'mariana.costa@email.com',
      phone: '11976543210',
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
      status: 'ativo',
      roleInChurch: 'Ministério de Louvor (Vocal)',
      birthDate: '1996-11-22',
      baptismDate: '2018-04-12',
      membershipDate: '2018-06-01',
      maritalStatus: 'Solteiro(a)',
      address: {
        street: 'Av. Brigadeiro Luís Antônio, 1200',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        zip: '01318-001',
      },
      ministries: ['Louvor'],
      cellGroupId: 'cell_2',
      spiritualGifts: ['Música / Louvor', 'Intercessão'],
      attendanceRate: 91,
      notes: 'Vocalista principal nas noites de domingo.',
    },
    {
      id: 'm_3',
      name: 'Fernando Rocha Santos',
      email: 'fernando.rocha@email.com',
      phone: '11965432109',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
      status: 'ativo',
      roleInChurch: 'Técnico de Áudio & Mídia',
      birthDate: '1989-03-08',
      baptismDate: '2012-10-15',
      membershipDate: '2013-01-10',
      maritalStatus: 'Casado(a)',
      address: {
        street: 'Rua Teodoro Sampaio, 850',
        neighborhood: 'Pinheiros',
        city: 'São Paulo',
        zip: '05406-000',
      },
      ministries: ['Som e Mídia'],
      cellGroupId: 'cell_3',
      spiritualGifts: ['Administração', 'Apoio Técnico'],
      attendanceRate: 98,
      notes: 'Responsável pela mesa de som digital e treinamento de novos operadores.',
    },
    {
      id: 'm_4',
      name: 'Camila Albuquerque Silva',
      email: 'camila.albuquerque@email.com',
      phone: '11954321098',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
      status: 'ativo',
      roleInChurch: 'Professora do Ministério Infantil',
      birthDate: '1994-07-30',
      baptismDate: '2016-03-27',
      membershipDate: '2016-05-15',
      maritalStatus: 'Casado(a)',
      address: {
        street: 'Rua Domingos de Morais, 1500',
        neighborhood: 'Vila Mariana',
        city: 'São Paulo',
        zip: '04009-002',
      },
      ministries: ['Ministério Infantil'],
      cellGroupId: 'cell_4',
      spiritualGifts: ['Ensino', 'Misericórdia'],
      attendanceRate: 88,
      notes: 'Pedagoga por formação, lidera o berçário e maternal.',
    },
    {
      id: 'm_5',
      name: 'Roberto Mendes de Souza',
      email: 'roberto.mendes@email.com',
      phone: '11943210987',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
      status: 'ativo',
      roleInChurch: 'Conselho Fiscal & Tesoureiro Assistente',
      birthDate: '1975-09-18',
      baptismDate: '2001-06-10',
      membershipDate: '2002-02-01',
      maritalStatus: 'Casado(a)',
      address: {
        street: 'Alameda Santos, 980',
        neighborhood: 'Jardins',
        city: 'São Paulo',
        zip: '01418-100',
      },
      ministries: ['Ação Social'],
      cellGroupId: 'cell_1',
      spiritualGifts: ['Contribuição', 'Sabedoria'],
      attendanceRate: 94,
      notes: 'Contador de carreira, auxilia no fechamento contábil mensal.',
    },
    {
      id: 'm_6',
      name: 'Juliana Paes Correia',
      email: 'juliana.correia@email.com',
      phone: '11932109876',
      photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300',
      status: 'em_integracao',
      roleInChurch: 'Aluna do Curso de Membresia',
      birthDate: '2000-02-14',
      membershipDate: '2026-07-10',
      maritalStatus: 'Solteiro(a)',
      address: {
        street: 'Rua Augusta, 2100',
        neighborhood: 'Cerqueira César',
        city: 'São Paulo',
        zip: '01412-000',
      },
      ministries: [],
      cellGroupId: 'cell_2',
      spiritualGifts: ['Louvor'],
      attendanceRate: 85,
      notes: 'Decidiu-se no Culto de Jovens em maio. Em discipulado semanal.',
    },
    {
      id: 'm_7',
      name: 'André Luiz Barbosa',
      email: 'andre.barbosa@email.com',
      phone: '11921098765',
      photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300',
      status: 'ativo',
      roleInChurch: 'Músico (Baterista)',
      birthDate: '1998-12-05',
      baptismDate: '2019-11-17',
      membershipDate: '2020-01-15',
      maritalStatus: 'Solteiro(a)',
      address: {
        street: 'Rua Haddock Lobo, 600',
        neighborhood: 'Cerqueira César',
        city: 'São Paulo',
        zip: '01414-001',
      },
      ministries: ['Louvor'],
      cellGroupId: 'cell_2',
      spiritualGifts: ['Música / Louvor'],
      attendanceRate: 90,
    },
    {
      id: 'm_8',
      name: 'Tereza Cristina Neves',
      email: 'tereza.neves@email.com',
      phone: '11910987654',
      photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=300',
      status: 'ativo',
      roleInChurch: 'Líder da Intercessão',
      birthDate: '1968-04-20',
      baptismDate: '1990-09-08',
      membershipDate: '1995-03-01',
      maritalStatus: 'Viúvo(a)',
      address: {
        street: 'Rua Pamplona, 1150',
        neighborhood: 'Jardim Paulista',
        city: 'São Paulo',
        zip: '01405-001',
      },
      ministries: ['Intercessão', 'Ação Social'],
      cellGroupId: 'cell_5',
      spiritualGifts: ['Intercessão', 'Discernimento'],
      attendanceRate: 100,
      notes: 'Coordena a vigília mensal e o grupo de oração das quartas-feiras.',
    },
  ],

  visitors: [
    {
      id: 'v_1',
      name: 'Renato Siqueira Lima',
      phone: '11988887777',
      email: 'renato.siqueira@gmail.com',
      firstVisitDate: '2026-08-23',
      stage: 'primeiro_contato',
      assignedMentor: 'Lucas Gabriel Oliveira',
      lastContactDate: '2026-08-25',
      howHeard: 'Convidado por um colega de trabalho',
      notes: 'Sentou na terceira fileira, preencheu cartão de boas-vindas no domingo à noite.',
    },
    {
      id: 'v_2',
      name: 'Patrícia Prado Toledo',
      phone: '11977776666',
      email: 'patricia.toledo@yahoo.com.br',
      firstVisitDate: '2026-08-16',
      stage: 'boas_vindas',
      assignedMentor: 'Mariana Costa Ferreira',
      lastContactDate: '2026-08-20',
      howHeard: 'Instagram da Igreja',
      notes: 'Mensagem de WhatsApp enviada. Ela agradeceu muito e disse que volta este domingo.',
    },
    {
      id: 'v_3',
      name: 'Carlos Alberto Fonseca',
      phone: '11966665555',
      email: 'carlos.fonseca@outlook.com',
      firstVisitDate: '2026-08-09',
      stage: 'cafe_pastoral',
      assignedMentor: 'Pr. Carlos Eduardo',
      lastContactDate: '2026-08-24',
      howHeard: 'Google Maps / Proximidade',
      notes: 'Participou do Café com os Pastores no último sábado. Demonstrou interesse em batismo.',
    },
    {
      id: 'v_4',
      name: 'Vanessa e Gustavo Prado (Casal)',
      phone: '11955554444',
      email: 'casal.prado@gmail.com',
      firstVisitDate: '2026-07-26',
      stage: 'integrado_celula',
      assignedMentor: 'Roberto Mendes de Souza',
      lastContactDate: '2026-08-28',
      howHeard: 'Evento Dia dos Pais',
      notes: 'Inseridos na Célula de Casais Jardins. Já participaram de 3 encontros!',
    },
    {
      id: 'v_5',
      name: 'Danilo Henrique Santos',
      phone: '11944443333',
      email: 'danilo.henrique@gmail.com',
      firstVisitDate: '2026-07-05',
      stage: 'curso_membresia',
      assignedMentor: 'Pra. Helena Martins',
      lastContactDate: '2026-08-29',
      howHeard: 'Canal do YouTube',
      notes: 'Matriculado na turma de agosto da Escola de Novos Membros. Conclusão prevista para outubro.',
    },
  ],

  transactions: [
    {
      id: 'tx_1',
      type: 'entrada',
      category: 'Dízimo',
      description: 'Dízimo regular - Membro M-104',
      amount: 1200.0,
      date: '2026-08-30',
      paymentMethod: 'pix',
      memberOrVendor: 'Lucas Gabriel Oliveira',
      receiptNumber: 'REC-2026-0842',
      status: 'confirmado',
    },
    {
      id: 'tx_2',
      type: 'entrada',
      category: 'Oferta Alçada',
      description: 'Oferta do Culto da Família de Domingo',
      amount: 4850.5,
      date: '2026-08-30',
      paymentMethod: 'pix',
      memberOrVendor: 'Ofertas Diversas (Culto Domingo)',
      receiptNumber: 'REC-2026-0843',
      status: 'confirmado',
    },
    {
      id: 'tx_3',
      type: 'entrada',
      category: 'Missões Mundiais',
      description: 'Campanha de Sustento Missionário - Tribos do Norte',
      amount: 3200.0,
      date: '2026-08-29',
      paymentMethod: 'transferencia',
      memberOrVendor: 'Famílias Parceiras em Missões',
      receiptNumber: 'REC-2026-0844',
      status: 'confirmado',
    },
    {
      id: 'tx_4',
      type: 'saida',
      category: 'Contas Fixas (Água/Luz/Net)',
      description: 'Conta de Energia Elétrica - Enel SP (Templo Sede)',
      amount: 2180.45,
      date: '2026-08-28',
      paymentMethod: 'boleto',
      memberOrVendor: 'Enel Distribuição São Paulo',
      receiptNumber: 'DESP-2026-0312',
      status: 'confirmado',
    },
    {
      id: 'tx_5',
      type: 'saida',
      category: 'Ação Social',
      description: 'Compra de 60 Cestas Básicas para Comunidade Local',
      amount: 4500.0,
      date: '2026-08-27',
      paymentMethod: 'pix',
      memberOrVendor: 'Atacadão Alimentos Ltda',
      receiptNumber: 'DESP-2026-0313',
      status: 'confirmado',
    },
    {
      id: 'tx_6',
      type: 'entrada',
      category: 'Construção & Reforma',
      description: 'Doação especial para novo isolamento acústico do templo',
      amount: 10000.0,
      date: '2026-08-25',
      paymentMethod: 'transferencia',
      memberOrVendor: 'Doador Anônimo',
      receiptNumber: 'REC-2026-0845',
      status: 'confirmado',
    },
    {
      id: 'tx_7',
      type: 'saida',
      category: 'Equipamentos & Mídia',
      description: 'Manutenção de Microfones sem fio Shure e cabos de sinal',
      amount: 890.0,
      date: '2026-08-22',
      paymentMethod: 'cartao',
      memberOrVendor: 'AudioPro Sonorização Profissional',
      receiptNumber: 'DESP-2026-0314',
      status: 'confirmado',
    },
    {
      id: 'tx_8',
      type: 'saida',
      category: 'Salários & Encargos',
      description: 'Folha de Pagamento da Zeladoria e Pastoral (Adiantamento)',
      amount: 8600.0,
      date: '2026-08-20',
      paymentMethod: 'transferencia',
      memberOrVendor: 'Folha de Pagamento CLT / Pastoral',
      receiptNumber: 'DESP-2026-0315',
      status: 'confirmado',
    },
    {
      id: 'tx_9',
      type: 'entrada',
      category: 'Dízimo',
      description: 'Dízimo via Pix Instantâneo Portal',
      amount: 850.0,
      date: '2026-08-31',
      paymentMethod: 'pix',
      memberOrVendor: 'Mariana Costa Ferreira',
      receiptNumber: 'REC-2026-0846',
      status: 'confirmado',
    },
  ],

  schedules: [
    {
      id: 'sch_1',
      serviceDate: '2026-09-06',
      serviceTime: '18:30',
      serviceName: 'Culto da Família - Domingo Noite',
      ministry: 'Louvor',
      team: [
        { memberId: 'm_2', memberName: 'Mariana Costa Ferreira', role: 'Vocal Principal', status: 'confirmado' },
        { memberId: 'm_7', memberName: 'André Luiz Barbosa', role: 'Bateria', status: 'confirmado' },
        { memberId: 'm_sub1', memberName: 'Gabriel Peixoto', role: 'Violão & Voz', status: 'confirmado' },
        { memberId: 'm_sub2', memberName: 'Felipe Alencar', role: 'Teclado', status: 'pendente' },
        { memberId: 'm_sub3', memberName: 'Matheus Prado', role: 'Contrabaixo', status: 'confirmado' },
      ],
      notes: 'Ensaio geral no domingo às 17h no templo.',
    },
    {
      id: 'sch_2',
      serviceDate: '2026-09-06',
      serviceTime: '18:30',
      serviceName: 'Culto da Família - Domingo Noite',
      ministry: 'Som e Mídia',
      team: [
        { memberId: 'm_3', memberName: 'Fernando Rocha Santos', role: 'Mesa de Som (FOH)', status: 'confirmado' },
        { memberId: 'usr_voluntario', memberName: 'Beatriz Silveira', role: 'Projeção de Letras / Holyrics', status: 'confirmado' },
        { memberId: 'm_sub4', memberName: 'Rodrigo Vasconcelos', role: 'Câmera 1 / Transmissão YouTube', status: 'pendente' },
      ],
      notes: 'Checar links de transmissão ao vivo 30 min antes.',
    },
    {
      id: 'sch_3',
      serviceDate: '2026-09-06',
      serviceTime: '18:30',
      serviceName: 'Culto da Família - Domingo Noite',
      ministry: 'Recepção',
      team: [
        { memberId: 'm_1', memberName: 'Lucas Gabriel Oliveira', role: 'Recepção Porta Principal', status: 'confirmado' },
        { memberId: 'm_sub5', memberName: 'Sara Mendonça', role: 'Entrega de Boletins e Boas-Vindas', status: 'confirmado' },
        { memberId: 'm_sub6', memberName: 'Jorge Linhares', role: 'Apoio no Estacionamento', status: 'indisponivel' },
      ],
      notes: 'Atenção especial para acolher novos visitantes com crachá de identificação.',
    },
    {
      id: 'sch_4',
      serviceDate: '2026-09-06',
      serviceTime: '18:30',
      serviceName: 'Culto da Família - Domingo Noite',
      ministry: 'Ministério Infantil',
      team: [
        { memberId: 'm_4', memberName: 'Camila Albuquerque Silva', role: 'Maternal (2 a 4 anos)', status: 'confirmado' },
        { memberId: 'm_sub7', memberName: 'Ana Paula Dias', role: 'Primários (5 a 8 anos)', status: 'confirmado' },
        { memberId: 'm_sub8', memberName: 'Larissa Moura', role: 'Juniores (9 a 12 anos)', status: 'pendente' },
      ],
      notes: 'Tema da aula: A Parábola do Bom Samaritano.',
    },
    {
      id: 'sch_5',
      serviceDate: '2026-09-09',
      serviceTime: '19:30',
      serviceName: 'Culto de Oração & Doutrina - Quarta',
      ministry: 'Intercessão',
      team: [
        { memberId: 'm_8', memberName: 'Tereza Cristina Neves', role: 'Direção do Clamor', status: 'confirmado' },
        { memberId: 'm_sub9', memberName: 'Marta Ribeiro', role: 'Apoio aos Pedidos do Altar', status: 'confirmado' },
      ],
    },
  ],

  cells: [
    {
      id: 'cell_1',
      name: 'Célula Canaranas da Presença',
      leaderName: 'Lucas Gabriel & Débora Oliveira',
      leaderPhone: '92984509989',
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
      leaderName: 'Thiago Albuquerque & Mariana Costa',
      leaderPhone: '92984509989',
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
      leaderName: 'Fernando & Lúcia Rocha',
      leaderPhone: '92984509989',
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
      leaderName: 'Camila & Eduardo Silva',
      leaderPhone: '92984509989',
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
      name: 'Célula Mulheres Vitoriosas Adrianópolis',
      leaderName: 'Tereza Cristina Neves',
      leaderPhone: '92984509989',
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
      name: 'Célula Homens de Honra Aleixo',
      leaderName: 'Roberto Mendes & Marcos Vinicius',
      leaderPhone: '92984509989',
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
      leaderName: 'Thiago Albuquerque & Mariana Costa',
      leaderPhone: '92984509989',
      description: 'Músicos, cantores e ministros que conduzem a congregação à manifestação da Presença de Deus com excelência.',
      meetingSchedule: 'Ensaios: Sábados às 16h',
      membersCount: 18,
    },
    {
      id: 'min_2',
      name: 'Caçadores Kids (Infantil)',
      leaderName: 'Camila Albuquerque Silva',
      leaderPhone: '92984509989',
      description: 'Cuidado amoroso e discipulado bíblico lúdico para crianças, ensinando os pequenos a caçar a Presença.',
      meetingSchedule: 'Domingos durante os cultos',
      membersCount: 14,
    },
    {
      id: 'min_3',
      name: 'Caçadores Youth (Jovens)',
      leaderName: 'Pr. Thiago & Liderança Jovem',
      leaderPhone: '92984509989',
      description: 'Comunidade dinâmica para adolescentes e universitários viverem um avivamento autêntico e contagiante.',
      meetingSchedule: 'Sábados às 19h30',
      membersCount: 45,
    },
    {
      id: 'min_4',
      name: 'Ação Social & Amor ao Próximo',
      leaderName: 'Roberto Mendes & Tereza Neves',
      leaderPhone: '92984509989',
      description: 'Assistência social, visitas e distribuição de cestas básicas a famílias carentes da Zona Norte de Manaus.',
      meetingSchedule: 'Quinzena aos sábados às 09h',
      membersCount: 12,
    },
    {
      id: 'min_5',
      name: 'Famílias & Casais na Presença',
      leaderName: 'Pra. Midiã Gomes Maduro',
      leaderPhone: '92984509989',
      description: 'Encontros mensais, cursos e fortalecimento dos lares e casamentos à luz da Palavra e unção profética.',
      meetingSchedule: 'Última sexta do mês às 20h',
      membersCount: 30,
    },
    {
      id: 'min_6',
      name: 'Comunicação & Mídia (MACDP Oficial)',
      leaderName: 'Fernando Rocha & Beatriz Silveira',
      leaderPhone: '92984509989',
      description: 'Transmissão ao vivo para o YouTube, captação audiovisual, redes sociais (@_macdp) e som.',
      meetingSchedule: 'Domingos e Quartas durante os cultos',
      membersCount: 10,
    },
    {
      id: 'min_7',
      name: 'Intercessão & Sentinelas',
      leaderName: 'Tereza Cristina Neves',
      leaderPhone: '92984509989',
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
      videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
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
      videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
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
      videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
      summary:
        'Princípios apostólicos para blindar o casamento e abençoar a descendência debaixo da cobertura da Presença.',
      tags: ['Família', 'Aliança', 'Propósito'],
    },
    {
      id: 'srm_4',
      title: 'Geração Caçadora da Presença',
      preacher: 'Thiago Albuquerque',
      preacherRole: 'Líder de Jovens',
      date: '2026-08-09',
      series: 'Série: Fogo no Altar',
      scripture: '1 Crônicas 16:11; Salmos 24:6',
      duration: '40 min',
      videoThumbnail: '/images/fellowship.jpg',
      videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
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
      location: 'Chácara Paraiso Verde - Iranduba - AM',
      roomReserved: 'Área de Eventos & Salão Campestre',
      category: 'Conferência',
      imageUrl: '/images/hero.jpg',
      isFree: false,
      price: 60.0,
      totalCapacity: 200,
      registeredCount: 3,
      speakerName: 'Pr. Oziel Gomes Maduro & Preletores Convidados',
      detailedSchedule: 'Sexta (19h30): Abertura e Clamor Profético | Sábado (16h): Plenárias de Capacitação | Domingo (18h): Noite de Avivamento e Ministração',
      customQuestions: [
        {
          id: 'q1_1',
          label: 'Tamanho da Camiseta Oficial do Evento',
          type: 'select',
          options: ['P', 'M', 'G', 'GG', 'XGG'],
          required: true,
        },
        {
          id: 'q1_2',
          label: 'Você já participa de alguma Célula do MACDP?',
          type: 'radio',
          options: ['Sim, sou de uma célula', 'Ainda não participo de célula'],
          required: true,
        },
        {
          id: 'q1_3',
          label: 'Possui alguma restrição alimentar ou necessidade especial?',
          type: 'text',
          placeholder: 'Ex: intolerância a lactose, vegetariano, etc.',
          required: false,
        },
      ],
      registrations: [
        {
          id: 'reg_1',
          name: 'Lucas Gabriel Oliveira',
          email: 'lucas.oliveira@email.com',
          phone: '92984509989',
          checkedIn: false,
          registeredAt: '2026-08-15',
          customAnswers: {
            q1_1: 'G',
            q1_2: 'Sim, sou de uma célula',
            q1_3: 'Nenhuma',
          },
        },
        {
          id: 'reg_2',
          name: 'Mariana Costa Ferreira',
          email: 'mariana.costa@email.com',
          phone: '92984509989',
          checkedIn: false,
          registeredAt: '2026-08-16',
          customAnswers: {
            q1_1: 'M',
            q1_2: 'Ainda não participo de célula',
          },
        },
      ],
    },
    {
      id: 'evt_2',
      title: 'Retiro da Juventude Caçadores: Profundidade',
      description:
        'Um final de semana de imersão, comunhão, adoração e transformação espiritual para a juventude e novos convertidos.',
      date: '2026-11-20',
      time: '18:00',
      location: 'Sítio Recanto da Bênção - Manaus/AM',
      roomReserved: 'Ônibus de Transporte & Chalés',
      category: 'Acampamento',
      imageUrl: '/images/macdp_comunhao.jpg',
      isFree: false,
      price: 180.0,
      totalCapacity: 120,
      registeredCount: 88,
      speakerName: 'Pastores Auxiliares & Liderança de Jovens',
      detailedSchedule: 'Sexta (18h): Embarque no Templo Sede | Sábado: Dinâmicas, Trilha e Luau de Adoração | Domingo (17h): Retorno com Ceia',
      customQuestions: [
        {
          id: 'q2_1',
          label: 'Tamanho da Camiseta do Acampamento',
          type: 'select',
          options: ['PP', 'P', 'M', 'G', 'GG'],
          required: true,
        },
        {
          id: 'q2_2',
          label: 'Meio de Transporte até o Sítio',
          type: 'radio',
          options: ['Vou de ônibus oficial da igreja', 'Vou em condução própria'],
          required: true,
        },
        {
          id: 'q2_3',
          label: 'Nome e Telefone de Emergência do Responsável',
          type: 'text',
          placeholder: 'Ex: Maria Silva (Mãe) - (92) 99123-4567',
          required: true,
        },
      ],
      registrations: [
        {
          id: 'reg_3',
          name: 'Juliana Paes Correia',
          email: 'juliana.correia@email.com',
          phone: '92984509989',
          checkedIn: false,
          registeredAt: '2026-08-20',
          customAnswers: {
            q2_1: 'M',
            q2_2: 'Vou de ônibus oficial da igreja',
            q2_3: 'Claudio Correia (Pai) - 92984509989',
          },
        },
      ],
    },
    {
      id: 'evt_3',
      title: 'Seminário de Finanças Bíblicas & Generosidade',
      description:
        'Aprenda princípios bíblicos práticos para gerir seu orçamento, eliminar dívidas e prosperar com o propósito do Reino.',
      date: '2026-09-19',
      time: '09:00',
      location: 'Auditório de Ensino - Templo Sede MACDP',
      roomReserved: 'Salão Social & Sala de Vídeo',
      category: 'Capacitação',
      imageUrl: '/images/hero-section.jpeg',
      isFree: true,
      totalCapacity: 150,
      registeredCount: 112,
      speakerName: 'Marcos Vinicius Ribeiro (Diretor Financeiro)',
      detailedSchedule: 'Manhã (09h às 12h): Princípios da Mordomia Bíblica, Planilha Familiar e Saída das Dívidas',
      customQuestions: [
        {
          id: 'q3_1',
          label: 'Qual o seu principal objetivo neste seminário?',
          type: 'select',
          options: ['Planejamento Financeiro Pessoal', 'Gestão Financeira para Casais', 'Empreendedorismo Bíblico'],
          required: true,
        },
      ],
      registrations: [
        {
          id: 'reg_4',
          name: 'Carlos Alberto Fonseca',
          email: 'carlos.fonseca@outlook.com',
          phone: '92984509989',
          checkedIn: false,
          registeredAt: '2026-08-22',
        },
      ],
    },
    {
      id: 'evt_4',
      title: 'Grande Ação Social Comunitária: Caçadores de Vidas',
      description:
        'Atendimento médico voluntário, cortes de cabelo gratuitos, doação de agasalhos e cestas básicas para famílias carentes.',
      date: '2026-09-26',
      time: '08:30',
      location: 'Pátio Externo & Estacionamento MACDP',
      roomReserved: 'Pátio Externo & Salas de Apoio',
      category: 'Ação Social',
      imageUrl: '/images/macdp_comunhao.jpg',
      isFree: true,
      totalCapacity: 500,
      registeredCount: 340,
      speakerName: 'Equipe de Ação Social e Diaconia',
      customQuestions: [
        {
          id: 'q4_1',
          label: 'Você participará como voluntário em qual área?',
          type: 'select',
          options: ['Distribuição de Alimentos', 'Apoio Médico / Triagem', 'Corte de Cabelo / Barbearia', 'Acolhimento Infantil & Brinquedos'],
          required: true,
        },
      ],
      registrations: [],
    },
  ],

  prayers: [
    {
      id: 'pray_1',
      requesterName: 'Ana Lúcia Barbosa',
      isAnonymous: false,
      phone: '11982341234',
      email: 'analucia@gmail.com',
      category: 'Saúde',
      message:
        'Peço oração por minha mãe, Dona Valéria, que fará uma cirurgia delicada na próxima terça-feira no Hospital das Clínicas. Que as mãos dos médicos sejam guiadas pelo Senhor.',
      requestPastoralContact: true,
      createdAt: '2026-08-31T10:15:00Z',
      status: 'novo',
    },
    {
      id: 'pray_2',
      requesterName: 'Anônimo',
      isAnonymous: true,
      category: 'Família',
      message:
        'Por favor, orem pela restauração do meu casamento. Estamos passando por uma crise muito difícil de diálogo e perdão.',
      requestPastoralContact: false,
      createdAt: '2026-08-30T21:40:00Z',
      status: 'em_oracao',
      pastoralNotes: 'Incluído na vigília de intercessão e clamor pelas famílias.',
    },
    {
      id: 'pray_3',
      requesterName: 'Marcos Vinicius Santos',
      isAnonymous: false,
      phone: '11971239876',
      email: 'marcos.santos@email.com',
      category: 'Finanças',
      message:
        'Estou desempregado há 6 meses. Peço a intercessão da igreja pelas portas de emprego que estão em processo seletivo.',
      requestPastoralContact: true,
      createdAt: '2026-08-28T14:20:00Z',
      status: 'aconselhado',
      pastoralNotes: 'Contato realizado pelo Pastor Auxiliar. Encaminhado para vaga na empresa de um membro da igreja.',
    },
    {
      id: 'pray_4',
      requesterName: 'Clara Mendes',
      isAnonymous: false,
      phone: '11961234567',
      category: 'Gratidão',
      message:
        'Testemunho de cura! O exame do meu filho deu completamente limpo para a glória de Deus! Agradeço a toda a igreja que esteve orando conosco!',
      requestPastoralContact: false,
      createdAt: '2026-08-25T18:00:00Z',
      status: 'testemunho',
      pastoralNotes: 'Compartilhado como testemunho de vitória no culto de domingo.',
    },
  ],

  teachingClasses: [
    {
      id: 'tc_1',
      name: 'Escola de Líderes da Presença',
      teacher: 'Pr. Oziel Gomes Maduro',
      schedule: 'Domingos às 09:00',
      room: 'Sala 3 - Ensino & Discipulado',
      studentsCount: 34,
      category: 'Liderança',
      description: 'Formação de líderes e discipuladores para expansão do Reino e pastoreio das células em Manaus.',
    },
    {
      id: 'tc_2',
      name: 'Curso de Membresia & Batismo',
      teacher: 'Pra. Midiã Gomes Maduro',
      schedule: 'Terças às 19:30',
      room: 'Salão Social & Cafeteria',
      studentsCount: 22,
      category: 'Membresia',
      description: 'Fundamentos da fé bíblica, doutrina apostólica e preparação para o batismo nas águas.',
    },
    {
      id: 'tc_3',
      name: 'Maturidade Cristã & Fundamentos da Fé',
      teacher: 'Pr. Jaziel Maduro',
      schedule: 'Quartas às 19:30',
      room: 'Sala 2 - Reuniões',
      studentsCount: 28,
      category: 'Discipulado',
      description: 'Aprofundamento na Palavra de Deus, oração profética e vida cristã prática vitoriosa.',
    },
    {
      id: 'tc_4',
      name: 'Capacitação Ministerial de Louvor & Adoração',
      teacher: 'Pr. Samuel Trindade & Thiago Albuquerque',
      schedule: 'Sábados às 15:00',
      room: 'Auditório Principal (Templo)',
      studentsCount: 18,
      category: 'Teologia',
      description: 'Fundamentos bíblicos da adoração profética, sensibilidade à presença de Deus e excelência técnica musical.',
    },
    {
      id: 'tc_5',
      name: 'Discipulado Infantil & Professores Kids',
      teacher: 'Camila Albuquerque Silva',
      schedule: 'Sábados às 10:00',
      room: 'Sala 1 - Berçário & Kids',
      studentsCount: 14,
      category: 'Infantil',
      description: 'Metodologias pedagógicas lúdicas e bíblicas para ministrar ao coração dos pequenos.',
    },
  ],

  teachingMaterials: [
    {
      id: 'mat_1',
      title: 'Roteiro Semanal de Célula: Rompendo Limites na Presença',
      targetType: 'celulas',
      targetAudience: 'Todas as Células',
      author: 'Pr. Oziel Gomes Maduro',
      date: '2026-09-01',
      summary: 'Estudo para reuniões nas casas baseado em Isaías 54. Quebrando a esterilidade e alargando as tendas em Manaus.',
      weekTopic: 'Semana 01 - Ampliando a Visão',
      downloadCount: 42,
    },
    {
      id: 'mat_2',
      title: 'Manual Prático: Como Pastorear e Multiplicar sua Célula',
      targetType: 'celulas',
      targetAudience: 'Líderes de Célula',
      author: 'Pra. Midiã Gomes Maduro',
      date: '2026-08-28',
      summary: 'Diretrizes apostólicas para acompanhamento dos membros, quebra-gelo, louvor nas casas e consolidação de novos convertidos.',
      weekTopic: 'Multiplicação & Pastoreio',
      downloadCount: 29,
    },
    {
      id: 'mat_3',
      title: 'Guia de Alinhamento e Postura Espiritual para Ministérios',
      targetType: 'ministerios',
      targetAudience: 'Todos os Ministérios',
      author: 'Pr. Samuel Trindade',
      date: '2026-08-25',
      summary: 'Vida de oração, pontualidade, consagração e amor no serviço à igreja local.',
      weekTopic: 'Consagração Ministerial',
      downloadCount: 38,
    },
    {
      id: 'mat_4',
      title: 'Apostila de Cânticos Espontâneos e Adoração Profética',
      targetType: 'ministerios',
      targetAudience: 'Ministério de Louvor',
      author: 'Thiago Albuquerque',
      date: '2026-08-20',
      summary: 'Estudo das passagens dos Salmos sobre harpa e cântico novo no mover do Espírito Santo.',
      weekTopic: 'Adoração Profética',
      downloadCount: 19,
    },
  ],

  teachingLogs: [
    {
      id: 'log_1',
      targetClass: 'Escola de Líderes da Presença',
      channel: 'todos',
      subject: 'Lembrete: Aula 04 neste Domingo às 09:00',
      message: 'Paz do Senhor, amados alunos! Tragam a Bíblia e o caderno de anotações. Teremos dinâmica sobre multiplicação celular.',
      sentAt: '2026-08-30T14:30:00Z',
      recipientsCount: 34,
      status: 'enviado',
    },
    {
      id: 'log_2',
      targetClass: 'Curso de Membresia & Batismo',
      channel: 'push',
      subject: 'Material complementar anexado no App',
      message: 'A apostila da Lição 2 já está disponível para leitura no seu aplicativo.',
      sentAt: '2026-08-27T18:00:00Z',
      recipientsCount: 22,
      status: 'enviado',
    },
  ],

  kidsChildren: [
    {
      id: 'kid_1',
      name: 'Enzo Gabriel Maduro',
      birthDate: '2023-04-15',
      age: 3,
      room: 'Maternal (2 a 4 anos)',
      guardianName: 'Pra. Midiã Gomes Maduro',
      guardianPhone: '92984509989',
      guardianRelationship: 'Mãe',
      allergiesOrNotes: 'Nenhuma alergia. Bebe bastante água.',
      securityCode: 'KID-101',
      checkInStatus: 'presente',
      checkInTime: '18:25',
    },
    {
      id: 'kid_2',
      name: 'Sophia Vitória Neves',
      birthDate: '2019-08-20',
      age: 7,
      room: 'Primários (5 a 8 anos)',
      guardianName: 'Tereza Cristina Neves',
      guardianPhone: '92984509989',
      guardianRelationship: 'Mãe',
      allergiesOrNotes: 'Intolerância a lactose. Não dar derivados de leite.',
      securityCode: 'KID-204',
      checkInStatus: 'presente',
      checkInTime: '18:15',
    },
    {
      id: 'kid_3',
      name: 'Davi Lucas Silva',
      birthDate: '2016-02-10',
      age: 10,
      room: 'Juniores (9 a 12 anos)',
      guardianName: 'Eduardo Silva',
      guardianPhone: '92984509989',
      guardianRelationship: 'Pai',
      allergiesOrNotes: 'Participativo nas gincanas.',
      securityCode: 'KID-305',
      checkInStatus: 'presente',
      checkInTime: '18:30',
    },
    {
      id: 'kid_4',
      name: 'Helena Beatriz Rocha',
      birthDate: '2025-06-12',
      age: 1,
      room: 'Berçário (0 a 2 anos)',
      guardianName: 'Beatriz Silveira',
      guardianPhone: '92984509989',
      guardianRelationship: 'Mãe',
      allergiesOrNotes: 'Alergia severa a picada de insetos.',
      securityCode: 'KID-082',
      checkInStatus: 'retirada',
      checkInTime: '18:10',
      checkOutTime: '20:15',
    },
    {
      id: 'kid_5',
      name: 'Mateus Trindade',
      birthDate: '2021-11-05',
      age: 5,
      room: 'Primários (5 a 8 anos)',
      guardianName: 'Pr. Samuel Trindade',
      guardianPhone: '92984509989',
      guardianRelationship: 'Pai',
      allergiesOrNotes: 'Sem restrições.',
      securityCode: 'KID-210',
      checkInStatus: 'ausente',
    },
  ],

  kidsLessons: [
    {
      id: 'kl_1',
      title: 'A Arca de Noé: O Barco da Obediência',
      programType: 'EBD',
      date: '2026-09-06',
      targetRoom: 'Maternal & Primários',
      teacherName: 'Camila Albuquerque Silva',
      memoryVerse: 'Filhos, obedecei a vossos pais no Senhor, pois isto é justo. (Efésios 6:1)',
      activities: 'Pintura em aquarela com arco-íris de promessa, fantoches dos bichinhos e louvor com palminhas.',
      description: 'Ensinar às crianças que a obediência a Deus traz proteção para toda a família.',
    },
    {
      id: 'kl_2',
      title: 'Davi e o Gigante Golias: Coragem pela Fé',
      programType: 'EBD',
      date: '2026-08-30',
      targetRoom: 'Primários & Juniores',
      teacherName: 'Ana Paula Dias',
      memoryVerse: 'O Senhor é a minha luz e a minha salvação; a quem temerei? (Salmos 27:1)',
      activities: 'Teatro bíblico participativo, confecção da bolsinha do pastorzinho com as 5 pedrinhas da fé.',
      description: 'As crianças aprenderam que na presença de Deus nenhum gigante pode nos derrotar.',
    },
    {
      id: 'kl_3',
      title: 'EBF 2026: Expedição Caçadores da Presença na Amazônia',
      programType: 'EBF',
      date: '2026-07-20',
      targetRoom: 'Todas as Salas (Templo, Quadra & Pátio)',
      teacherName: 'Liderança Caçadores Kids',
      memoryVerse: 'Buscar-me-eis e me achareis quando me buscardes de todo o vosso coração. (Jeremias 29:13)',
      activities: 'Gincana das tribos da selva, circuito de obstáculos com cordas, lanche bíblico temático e batismo no Espírito Santo.',
      description: 'Semana inesquecível de férias escolares evangelizando e discipulando mais de 150 crianças em Manaus.',
    },
  ],

  patrimonyAssets: [
    {
      id: 'ast_1',
      tagNumber: 'PAT-00101',
      name: 'Console de Áudio Digital Yamaha TF5 (32 Canais)',
      category: 'Áudio & Instrumentos',
      location: 'Auditório Principal (Cabine de Som)',
      department: 'Louvor & Mídia',
      status: 'ativo',
      condition: 'Excelente',
      acquisitionDate: '2024-03-15',
      estimatedValue: 28500,
      serialNumber: 'YMH-TF5-99281',
      donorOrVendor: 'Importadora Manaus Áudio Pro',
      notes: 'Mesa principal de operação dos cultos e conferências.',
    },
    {
      id: 'ast_2',
      tagNumber: 'PAT-00102',
      name: 'Câmera Cinema Sony FX3 4K para Transmissão',
      category: 'Vídeo & Iluminação',
      location: 'Auditório Principal (Torre Central)',
      department: 'Comunicação & Mídia',
      status: 'ativo',
      condition: 'Excelente',
      acquisitionDate: '2024-08-10',
      estimatedValue: 22000,
      serialNumber: 'SNY-FX3-88210',
      donorOrVendor: 'Equipamentos Audiovisuais AM',
      notes: 'Câmera principal do YouTube oficial do MACDP.',
    },
    {
      id: 'ast_3',
      tagNumber: 'PAT-00103',
      name: 'Sistema de Caixas Line Array Ativo (Par)',
      category: 'Áudio & Instrumentos',
      location: 'Auditório Principal (Altar Frontal)',
      department: 'Louvor & Mídia',
      status: 'ativo',
      condition: 'Bom',
      acquisitionDate: '2023-11-20',
      estimatedValue: 34000,
      serialNumber: 'RCF-LA-1029',
      donorOrVendor: 'Áudio Norte Distribuidora',
      notes: 'Sonorização de alta pressão acústica da nave do templo.',
    },
    {
      id: 'ast_4',
      tagNumber: 'PAT-00104',
      name: 'Projetor Laser 6000 Lumens Full HD Epson',
      category: 'Vídeo & Iluminação',
      location: 'Auditório Principal (Teto Central)',
      department: 'Comunicação & Mídia',
      status: 'ativo',
      condition: 'Bom',
      acquisitionDate: '2023-06-05',
      estimatedValue: 16500,
      serialNumber: 'EPS-EB-7731',
      donorOrVendor: 'Info Manaus Tech',
      notes: 'Projeção das letras de louvor e transmissão do altar.',
    },
    {
      id: 'ast_5',
      tagNumber: 'PAT-00105',
      name: 'Ar Condicionado Split Inverter 60.000 BTUs',
      category: 'Climatização',
      location: 'Auditório Principal (Lateral Esquerda)',
      department: 'Administração & Manutenção',
      status: 'ativo',
      condition: 'Excelente',
      acquisitionDate: '2025-01-18',
      estimatedValue: 9800,
      serialNumber: 'CAR-60K-4412',
      donorOrVendor: 'Climatiza Manaus Refrigeração',
      notes: 'Revisão periódica programada para cada 6 meses.',
    },
    {
      id: 'ast_6',
      tagNumber: 'PAT-00106',
      name: 'Kit 4 Microfones Sem Fio Shure BLX24/B58',
      category: 'Áudio & Instrumentos',
      location: 'Cabine de Som / Altar',
      department: 'Louvor & Mídia',
      status: 'em_manutencao',
      condition: 'Regular',
      acquisitionDate: '2023-04-12',
      estimatedValue: 7200,
      serialNumber: 'SHR-B58-4X',
      donorOrVendor: 'Loja Gospel Som',
      notes: 'Cápsula do microfone 3 enviada para assistência técnica.',
    },
    {
      id: 'ast_7',
      tagNumber: 'PAT-00107',
      name: 'Lote 150 Cadeiras Estofadas Longarinas',
      category: 'Mobiliário',
      location: 'Auditório Principal',
      department: 'Patrimônio Geral',
      status: 'ativo',
      condition: 'Excelente',
      acquisitionDate: '2024-02-10',
      estimatedValue: 45000,
      serialNumber: 'CAD-LONG-150X',
      donorOrVendor: 'Móveis Corporativos Manaus',
      notes: 'Cadeiras acolchoadas em tecido azul royal com porta-bíblia.',
    },
    {
      id: 'ast_8',
      tagNumber: 'PAT-00108',
      name: 'Smart TV 65 Polegadas 4K para Retorno de Púlpito',
      category: 'Vídeo & Iluminação',
      location: 'Auditório Principal (Fundo da Nave)',
      department: 'Comunicação & Mídia',
      status: 'ativo',
      condition: 'Excelente',
      acquisitionDate: '2024-09-01',
      estimatedValue: 3900,
      serialNumber: 'LG-65UR-5501',
      donorOrVendor: 'Doação Família Maduro',
      notes: 'Display de retorno para os pregadores e cronômetro de mensagens.',
    },
  ],

  pastoralAppointments: [
    {
      id: 'app_1',
      personName: 'Carlos Eduardo Neves & Tereza Cristina',
      personPhone: '92984509989',
      personType: 'Membro',
      assignedPastor: 'Pr. Oziel Gomes Maduro & Pra. Midiã Gomes Maduro',
      appointmentType: 'Aconselhamento Matrimonial',
      date: '2026-09-03',
      time: '15:00',
      location: 'Gabinete Pastoral (Templo Central)',
      status: 'agendado',
      reason: 'Alinhamento da vida conjugal, sacerdócio familiar e oração pelo lar.',
      confidentialNotes: 'Casal com 12 anos de matrimônio, desejam renovação da comunhão e oração pelos filhos.',
    },
    {
      id: 'app_2',
      personName: 'Dona Valéria Barbosa',
      personPhone: '92984509989',
      personType: 'Membro',
      assignedPastor: 'Pr. Jaziel Maduro & Pra. Abda Maduro',
      appointmentType: 'Visita Hospitalar',
      date: '2026-09-02',
      time: '10:30',
      location: 'Hospital e Pronto-Socorro 28 de Agosto (Leito 402)',
      status: 'confirmado',
      reason: 'Unção com óleo e oração de fé antes de procedimento cirúrgico ortopédico.',
      confidentialNotes: 'Membro antiga do ministério. Levar azeite e ministrar a ceia do Senhor.',
    },
    {
      id: 'app_3',
      personName: 'Felipe Vasconcelos',
      personPhone: '92984509989',
      personType: 'Líder',
      assignedPastor: 'Pr. Samuel Trindade & Pra. Daniely Trindade',
      appointmentType: 'Gabinete Presencial',
      date: '2026-09-04',
      time: '17:00',
      location: 'Gabinete Pastoral (Templo Central)',
      status: 'agendado',
      reason: 'Orientação vocacional e direcionamento para expansão da Célula Jovens da Presença.',
      confidentialNotes: 'Líder jovem com grande potencial evangelístico. Aconselhamento sobre conciliar faculdade e chamado.',
    },
    {
      id: 'app_4',
      personName: 'Família Mendonça (Marcos e Letícia)',
      personPhone: '92984509989',
      personType: 'Visitante',
      assignedPastor: 'Pr. Oziel Gomes Maduro',
      appointmentType: 'Visita Domiciliar',
      date: '2026-09-05',
      time: '19:30',
      location: 'Residência da Família (Bairro Cidade Nova - Conj. Canaranas)',
      status: 'agendado',
      reason: 'Visita pastoral de acolhimento aos novos convertidos do último culto de celebração.',
      confidentialNotes: 'Aceitaram a Cristo no domingo à noite. Desejam consagrar a casa ao Senhor.',
    },
    {
      id: 'app_5',
      personName: 'Roberto Albuquerque',
      personPhone: '92984509989',
      personType: 'Membro',
      assignedPastor: 'Pr. Jaziel Maduro',
      appointmentType: 'Online / Chamada',
      date: '2026-08-29',
      time: '14:00',
      location: 'Chamada de Vídeo / WhatsApp',
      status: 'realizado',
      reason: 'Oração por recolocação profissional no Polo Industrial de Manaus.',
      confidentialNotes: 'Atendimento realizado. Roberto foi contratado como supervisor na terça-feira. Glória a Deus!',
    },
  ],

  accessUsers: [
    {
      id: 'acc_1',
      name: 'Pr. Oziel Gomes Maduro',
      email: 'oziel.maduro@macdp.com.br',
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
  ],
};

export function getDatabase(): DatabaseSchema {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
      return INITIAL_DATABASE;
    }
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (!parsed.ministries || parsed.ministries.length === 0) {
      parsed.ministries = INITIAL_DATABASE.ministries;
      saveDatabase(parsed);
    }
    if (!parsed.teachingClasses || parsed.teachingClasses.length === 0) {
      parsed.teachingClasses = INITIAL_DATABASE.teachingClasses;
      saveDatabase(parsed);
    }
    if (!parsed.teachingMaterials || parsed.teachingMaterials.length === 0) {
      parsed.teachingMaterials = INITIAL_DATABASE.teachingMaterials;
      saveDatabase(parsed);
    }
    if (!parsed.teachingLogs) {
      parsed.teachingLogs = INITIAL_DATABASE.teachingLogs;
      saveDatabase(parsed);
    }
    if (!parsed.kidsChildren || parsed.kidsChildren.length === 0) {
      parsed.kidsChildren = INITIAL_DATABASE.kidsChildren;
      saveDatabase(parsed);
    }
    if (!parsed.kidsLessons || parsed.kidsLessons.length === 0) {
      parsed.kidsLessons = INITIAL_DATABASE.kidsLessons;
      saveDatabase(parsed);
    }
    if (!parsed.patrimonyAssets || parsed.patrimonyAssets.length === 0) {
      parsed.patrimonyAssets = INITIAL_DATABASE.patrimonyAssets;
      saveDatabase(parsed);
    }
    if (!parsed.pastoralAppointments || parsed.pastoralAppointments.length === 0) {
      parsed.pastoralAppointments = INITIAL_DATABASE.pastoralAppointments;
      saveDatabase(parsed);
    }
    if (!parsed.accessUsers || parsed.accessUsers.length === 0) {
      parsed.accessUsers = INITIAL_DATABASE.accessUsers;
      saveDatabase(parsed);
    }
    if (parsed.events) {
      let updatedEvts = false;
      parsed.events.forEach((e) => {
        const initEvt = INITIAL_DATABASE.events.find((ie) => ie.id === e.id);
        if (initEvt) {
          if (e.id === 'evt_1') {
            if (
              e.date !== '2026-11-13' ||
              e.endDate !== '2026-11-15' ||
              e.location !== 'Chácara Paraiso Verde - Iranduba - AM' ||
              e.totalCapacity !== 200
            ) {
              e.date = '2026-11-13';
              e.endDate = '2026-11-15';
              e.title = 'Conferência Caçadores da Presença 2026';
              e.location = 'Chácara Paraiso Verde - Iranduba - AM';
              e.roomReserved = 'Área de Eventos & Salão Campestre';
              e.totalCapacity = 200;
              e.description = 'Três dias inesquecíveis de louvor profético, ministração da Palavra e capacitação espiritual para toda a família na Chácara Paraiso Verde.';
              updatedEvts = true;
            }
          }
          if (initEvt.endDate && !e.endDate) {
            e.endDate = initEvt.endDate;
            updatedEvts = true;
          }
          if (!e.customQuestions || e.customQuestions.length === 0) {
            e.customQuestions = initEvt.customQuestions;
            e.speakerName = e.speakerName || initEvt.speakerName;
            e.detailedSchedule = e.detailedSchedule || initEvt.detailedSchedule;
            updatedEvts = true;
          }
        }
        // Always ensure registeredCount is strictly synced with actual registrations
        if (e.registrations) {
          if (e.registeredCount !== e.registrations.length) {
            e.registeredCount = e.registrations.length;
            updatedEvts = true;
          }
        }
      });
      if (updatedEvts) saveDatabase(parsed);
    }
    return parsed;
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
    totalActiveMembers: activeMembers * 150 + 70, // Multiplicador para representação realista de congregação (~1.270 membros)
    monthlyVisitors: visitorsMonth * 12 + 8,
    averageAttendance: avgAttendance,
    attendanceGrowth: 8.4,
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
  }
): EventRegistration | null {
  const db = getDatabase();
  const evt = db.events.find((e) => e.id === eventId);
  if (evt) {
    evt.registeredCount += 1;
    const newReg: EventRegistration = {
      id: `reg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
      checkedIn: false,
      registeredAt: new Date().toISOString().split('T')[0],
      paymentMethod: registration.paymentMethod || (evt.isFree ? 'free' : 'pix'),
      paymentStatus: registration.paymentStatus || (evt.isFree ? 'free' : 'confirmed'),
      paymentNotes: registration.paymentNotes,
      customAnswers: registration.customAnswers || {},
    };
    evt.registrations.push(newReg);
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







