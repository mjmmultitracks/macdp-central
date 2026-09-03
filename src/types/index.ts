export type UserRole = 'admin' | 'pastor' | 'lider' | 'tesouraria' | 'voluntario';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatarUrl: string;
}

export type MemberStatus = 'ativo' | 'visitante' | 'em_integracao' | 'afastado';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  status: MemberStatus;
  roleInChurch: string;
  birthDate: string;
  baptismDate?: string;
  membershipDate: string;
  maritalStatus: 'Solteiro(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viúvo(a)';
  address: {
    street: string;
    neighborhood: string;
    city: string;
    zip: string;
  };
  ministries: string[];
  cellGroupId?: string;
  spiritualGifts: string[];
  attendanceRate: number; // 0 a 100%
  notes?: string;
}

export type VisitorStage =
  | 'primeiro_contato'
  | 'boas_vindas'
  | 'cafe_pastoral'
  | 'integrado_celula'
  | 'curso_membresia';

export interface VisitorItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  firstVisitDate: string;
  stage: VisitorStage;
  assignedMentor: string;
  lastContactDate: string;
  howHeard: string;
  notes: string;
}

export type TransactionType = 'entrada' | 'saida';
export type TransactionCategory =
  | 'Dízimo'
  | 'Oferta Alçada'
  | 'Missões Mundiais'
  | 'Ação Social'
  | 'Construção & Reforma'
  | 'Salários & Encargos'
  | 'Contas Fixas (Água/Luz/Net)'
  | 'Manutenção Predial'
  | 'Equipamentos & Mídia'
  | 'Eventos & Conferências';

export type PaymentMethod = 'pix' | 'cartao' | 'dinheiro' | 'boleto' | 'transferencia';

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  memberOrVendor: string;
  receiptNumber?: string;
  status: 'confirmado' | 'pendente';
}

export type VolunteerStatus = 'confirmado' | 'pendente' | 'indisponivel';

export interface VolunteerSlot {
  memberId: string;
  memberName: string;
  role: string;
  status: VolunteerStatus;
}

export interface MinistrySchedule {
  id: string;
  serviceDate: string; // YYYY-MM-DD
  serviceTime: string; // HH:mm
  serviceName: string; // Ex: Culto da Família
  ministry: 'Louvor' | 'Som e Mídia' | 'Recepção' | 'Ministério Infantil' | 'Intercessão';
  team: VolunteerSlot[];
  notes?: string;
}

export interface CellGroup {
  id: string;
  name: string;
  leaderName: string;
  leaderPhone: string;
  neighborhood: string;
  address: string;
  dayOfWeek: string;
  time: string;
  targetAudience: 'Mista' | 'Jovens' | 'Casais' | 'Mulheres' | 'Homens';
  membersCount: number;
  latitude: number;
  longitude: number;
}

export interface Ministry {
  id: string;
  name: string;
  leaderName: string;
  leaderPhone: string;
  leaderEmail?: string;
  description: string;
  meetingSchedule?: string;
  membersCount?: number;
}

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  preacherRole: string;
  date: string;
  series: string;
  scripture: string;
  duration: string;
  videoThumbnail: string;
  videoEmbedUrl: string;
  audioUrl?: string;
  summary: string;
  tags: string[];
}

export type EventQuestionType = 'text' | 'select' | 'radio' | 'checkbox' | 'number' | 'date';

export interface EventCustomQuestion {
  id: string;
  label: string;
  type: EventQuestionType;
  options?: string[]; // Para select, radio e checkbox (ex: ['P', 'M', 'G', 'GG'])
  required: boolean;
  placeholder?: string;
  helpText?: string;
}

export interface EventRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  checkedIn: boolean;
  registeredAt: string;
  paymentMethod?: 'pix' | 'credit_card' | 'manual' | 'free';
  paymentStatus?: 'confirmed' | 'pending' | 'free';
  paymentNotes?: string;
  customAnswers?: Record<string, string | string[]>;
  includeShirt?: boolean;
  shirtSize?: string;
  shirtPrice?: number;
  totalPaid?: number;
}

export interface EventLocationDetails {
  placeName?: string;
  formattedAddress: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
}

export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  date: string; // Data de início
  endDate?: string; // Data de término
  time: string;
  endTime?: string;
  location: string;
  locationDetails?: EventLocationDetails;
  roomReserved: string;
  category: 'Conferência' | 'Culto Especial' | 'Acampamento' | 'Capacitação' | 'Ação Social';
  imageUrl: string;
  isFree: boolean;
  price?: number;
  hasShirt?: boolean; // Opção de venda de camisa oficial
  shirtPrice?: number; // Valor unitário da camisa (R$)
  shirtSizes?: string[]; // Tamanhos disponíveis (ex: ['PP', 'P', 'M', 'G', 'GG', 'XGG'])
  totalCapacity: number;
  registeredCount: number;
  speakerName?: string;
  detailedSchedule?: string;
  customQuestions?: EventCustomQuestion[];
  registrations: EventRegistration[];
}

export type PrayerCategory = 'Saúde' | 'Família' | 'Finanças' | 'Espiritual' | 'Libertação' | 'Gratidão' | 'Outros';
export type PrayerStatus = 'novo' | 'em_oracao' | 'aconselhado' | 'testemunho' | 'atendido';

export interface PrayerRequest {
  id: string;
  requesterName: string;
  isAnonymous: boolean;
  isPrivate?: boolean;
  phone?: string;
  email?: string;
  category: PrayerCategory;
  message: string;
  requestPastoralContact: boolean;
  createdAt: string;
  status: PrayerStatus;
  pastoralNotes?: string;
}

export interface ChurchStats {
  totalActiveMembers: number;
  monthlyVisitors: number;
  averageAttendance: number;
  attendanceGrowth: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  netBalance: number;
}

export interface TeachingClass {
  id: string;
  name: string;
  teacher: string;
  schedule: string;
  room: string;
  studentsCount: number;
  category: 'Membresia' | 'Liderança' | 'Teologia' | 'Discipulado' | 'Infantil';
  description: string;
}

export interface TeachingMaterial {
  id: string;
  title: string;
  targetType: 'celulas' | 'ministerios' | 'ambos';
  targetAudience?: string; // ex: 'Todas as Células' ou 'Louvor'
  author: string;
  date: string;
  fileUrl?: string;
  summary: string;
  weekTopic?: string;
  downloadCount: number;
}

export interface TeachingMessageLog {
  id: string;
  targetClass: string;
  channel: 'email' | 'sms' | 'push' | 'todos';
  subject: string;
  message: string;
  sentAt: string;
  recipientsCount: number;
  status: 'enviado' | 'falha' | 'agendado';
}

export interface KidChild {
  id: string;
  name: string;
  birthDate: string;
  age: number;
  room: 'Berçário (0 a 2 anos)' | 'Maternal (2 a 4 anos)' | 'Primários (5 a 8 anos)' | 'Juniores (9 a 12 anos)';
  guardianName: string;
  guardianPhone: string;
  guardianRelationship: string;
  allergiesOrNotes?: string;
  securityCode: string;
  checkInStatus: 'presente' | 'ausente' | 'retirada';
  checkInTime?: string;
  checkOutTime?: string;
}

export interface KidLesson {
  id: string;
  title: string;
  programType: 'EBD' | 'EBF';
  date: string;
  targetRoom: string;
  teacherName: string;
  memoryVerse: string;
  activities: string;
  description: string;
}

export interface PatrimonyAsset {
  id: string;
  tagNumber: string; // ex: 'PAT-00142'
  name: string; // ex: 'Mesa de Som Digital Yamaha TF5'
  category: 'Áudio & Instrumentos' | 'Vídeo & Iluminação' | 'Informática & TI' | 'Mobiliário' | 'Climatização' | 'Estrutura & Outros';
  location: string; // ex: 'Auditório Principal (Cabine de Som)'
  department: string; // ex: 'Mídia & Som'
  status: 'ativo' | 'em_manutencao' | 'inativo' | 'baixado';
  condition: 'Excelente' | 'Bom' | 'Regular' | 'Danificado';
  acquisitionDate: string;
  estimatedValue: number;
  serialNumber?: string;
  donorOrVendor?: string;
  notes?: string;
}

export interface PastoralAppointment {
  id: string;
  personName: string;
  personPhone: string;
  personType: 'Membro' | 'Visitante' | 'Líder';
  assignedPastor: string;
  appointmentType: 'Gabinete Presencial' | 'Visita Domiciliar' | 'Visita Hospitalar' | 'Aconselhamento Matrimonial' | 'Online / Chamada';
  date: string;
  time: string;
  location: string;
  status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado';
  reason: string;
  confidentialNotes?: string;
}

export type PanelModuleId =
  | 'dashboard'
  | 'membros'
  | 'celulas_admin'
  | 'ministerios_admin'
  | 'ensino_admin'
  | 'kids_admin'
  | 'patrimonio_admin'
  | 'pastoral_admin'
  | 'financeiro'
  | 'eventos_admin'
  | 'oracao_admin'
  | 'acessos_admin'
  | 'config_igreja';

export interface SystemAccessUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roleTitle: string;
  roleType: 'Administrador' | 'Pastor' | 'Secretaria' | 'Liderança' | 'Tesouraria' | 'Voluntário';
  status: 'ativo' | 'bloqueado';
  allowedModules: PanelModuleId[];
  canEdit: boolean;
  lastAccess?: string;
  createdAt: string;
  notes?: string;
}

export interface ChurchSettings {
  name: string; // Nome oficial completo (Ex: Ministério Apostólico Caçadores da Presença)
  shortName: string; // Sigla / Nome Curto (Ex: MACDP Central)
  subtitle: string; // Subtítulo / Segmento (Ex: Ministério Apostólico)
  slogan: string; // Lema da igreja (Ex: "Proibido a Entrada de Pessoas Perfeitas.")
  description: string; // Resumo institucional da visão
  logoUrl: string; // URL ou Base64 do logotipo oficial
  pastorPresident: string; // Nome dos Pastores Presidentes
  cnpj?: string; // CNPJ eclesiástico
  phone: string; // Telefone oficial / Secretaria
  whatsapp: string; // WhatsApp oficial com DDD (números)
  email: string; // E-mail institucional de contato
  address: {
    street: string; // Rua e número
    neighborhood: string; // Bairro
    city: string; // Cidade
    state: string; // Estado / UF (Ex: AM)
    zip: string; // CEP
  };
  social: {
    instagram: string; // Link do Instagram
    instagramHandle: string; // Ex: @_macdp
    youtube: string; // Link do canal do YouTube
    facebook?: string; // Link da página do Facebook
  };
  pix: {
    key: string; // Chave PIX
    receiver: string; // Nome do favorecido
    bank?: string; // Banco / Instituição
  };
  themeColors?: {
    primaryColor: string; // Cor primária (ex: #f59e0b)
    secondaryColor: string; // Cor secundária (ex: #3b82f6)
  };
}

export interface DatabaseSchema {
  members: Member[];
  visitors: VisitorItem[];
  transactions: FinancialTransaction[];
  schedules: MinistrySchedule[];
  cells: CellGroup[];
  ministries: Ministry[];
  sermons: Sermon[];
  events: ChurchEvent[];
  prayers: PrayerRequest[];
  teachingClasses: TeachingClass[];
  teachingMaterials: TeachingMaterial[];
  teachingLogs: TeachingMessageLog[];
  kidsChildren: KidChild[];
  kidsLessons: KidLesson[];
  patrimonyAssets: PatrimonyAsset[];
  pastoralAppointments: PastoralAppointment[];
  accessUsers: SystemAccessUser[];
  churchSettings?: ChurchSettings;
}





