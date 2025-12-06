
// Definição de Tipos Globais - Law Agent Architecture V2.1

// Categorias macro de serviço (Áreas de Atuação)
export enum ServiceCategory {
  CONSULTIVE = 'Consultivo',
  CONTENTIOUS = 'Contencioso',
  ADMINISTRATIVE = 'Administrativo',
  EXTRAJUDICIAL = 'Extrajudicial'
}

// Tipos de Algoritmos de Cálculo Suportados
export enum CalculationType {
  FIXED = 'FIXED',                 // Valor fixo tabelado (ex: Parecer R$ 2.000)
  PERCENTAGE = 'PERCENTAGE',       // % sobre uma base (ex: 20% do êxito)
  HOURLY = 'HOURLY',               // Valor por hora (ex: R$ 450/hora)
  HYBRID_MAX = 'HYBRID_MAX',       // O maior entre Fixo e Percentual (ex: Min R$ 2k OU 10%)
  HYBRID_SUM = 'HYBRID_SUM',       // Soma de Fixo + Percentual (ex: Entrada R$ 2k + 10% final)
  RANGE = 'RANGE'                  // Faixa de valores (Min - Max)
}

// Bases de incidência para cálculos percentuais
export type PercentageBasis = 'CASE_VALUE' | 'BENEFIT_VALUE' | 'ESTATE_VALUE' | 'MONTHLY_FEE';

// Metadados sobre quais campos o usuário precisa preencher
export interface InputRequirement {
  fieldKey: keyof CalculationInputs;
  label: string;
  required: boolean;
  hint?: string;
}

// --- TIPOS AUTENTICAÇÃO ---
export type UserRole = 'ADMIN' | 'LAWYER' | 'ASSISTANT' | 'SECRETARY';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  oab?: string;
}

// A Regra de Cálculo em si (O "Cérebro" do item)
export interface CalculationRule {
  type: CalculationType;           // A chave principal da lógica (Strategy Pattern)
  minFee?: number;                 // Honorário Mínimo / Piso
  maxFee?: number;                 // Teto (se houver)
  percentage?: number;             // Alíquota (ex: 20 para 20%)
  percentageBasis?: PercentageBasis; // Sobre o que incide
  hourlyRate?: number;             // Para serviços por hora
  description?: string;            // Explicação textual da regra (para mostrar ao usuário)
}

// Item de Tabela Definitivo (Espelho da Tabela OAB)
export interface OABServiceItem {
  id: string;              // UUID ou identificador único do sistema
  tableCode?: string;      // Código original na tabela OAB (ex: "1.2", "X.1")
  state: string;           // UF da tabela (SC, SP, etc.)

  category: ServiceCategory; // Área Macro (Consultivo, Contencioso...)
  subCategory: string;       // Agrupador visual (Cível, Família, Previdenciário...)

  description: string;       // Nome do serviço (ex: Divórcio Litigioso)
  explanation?: string;      // Explicação didática curta do serviço

  // A lógica de cálculo associada a este serviço
  rule: CalculationRule;

  // Configuração de Inputs: O que este serviço exige do usuário?
  requiredInputs: InputRequirement[];

  notes?: string;            // Notas de rodapé da tabela original
}

// DTO de Entrada para o Motor de Cálculo
export interface CalculationInputs {
  caseValue?: number;      // Valor da Causa
  benefitValue?: number;   // Proveito Econômico
  estateValue?: number;    // Valor dos Bens (Monte Mor)
  hours?: number;          // Horas estimadas
  complexity?: number;     // Fator de complexidade (1.0 = normal)
  monthlyFee?: number;     // Para contratos mensais
  [key: string]: any;
}

// Resultado do Cálculo
export interface CalculationResult {
  totalFee: number;            // Valor final calculado
  baseFee: number;             // Valor base (mínimo da tabela)
  variableFee: number;         // Parte variável (risco/êxito)
  formulaDescription: string;  // Explicação de como chegou no valor
  isEstimate: boolean;         // Se é um valor exato ou estimado
}

export interface PaymentTerms {
  entryType: 'FIXED' | 'PERCENTAGE';
  entryValue: number;     // Valor digitado (R$ ou %)
  entryAmount: number;    // Valor calculado da entrada em R$
  installments: number;   // Número de parcelas do saldo
  installmentAmount: number; // Valor de cada parcela
  riskPercentage: number; // % Ad Exitum
  riskBasis?: number;     // Base de cálculo do risco (Valor da Causa)

  // Novos campos de Desconto e Dedução
  discountType?: 'FIXED' | 'PERCENTAGE';
  discountValue?: number;
  finalTotal?: number; // Total após desconto
  deductFromRisk?: boolean; // Se o valor pago abate do êxito
  isCash?: boolean; // Pagamento à vista
}

export interface ClientData {
  name: string;
  inputs: CalculationInputs;
  paymentTerms?: PaymentTerms;
  // Dados extras do cliente para contratos
  document?: string;
  address?: {
    street: string;
    number: string;
    city: string;
    state: string;
  };
}

export type AppRoute = {
  module: 'calculator' | 'clients' | 'cases' | 'courts' | 'admin-oab' | 'dashboard' | 'finance' | 'tasks' | 'portal' | 'documents' | 'settings' | 'intelligence' | 'calendar' | 'calculators';
  params?: any;
};

export interface Client {
  id: string;
  user_id?: string; // Supabase owner
  type: 'PF' | 'PJ';
  name: string;
  document: string;
  email?: string;
  phone?: string;
  address: {
    street: string;
    number: string;
    city: string;
    state: string;
  };
  createdAt?: Date;
  // Portal Access
  portalToken?: string; // Token único de acesso
  portalAccessEnabled?: boolean;
}

export enum CaseStatus {
  ACTIVE = 'Ativo',
  ARCHIVED = 'Arquivado',
  SUSPENDED = 'Suspenso'
}

export interface CaseEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  type: 'MOVEMENT' | 'HEARING' | 'DEADLINE' | 'DOCUMENT';
}

export interface LegalCase {
  id: string;
  user_id?: string; // Supabase owner
  title: string;
  clientId: string;
  cnjNumber?: string;
  value?: number;
  state: string;
  area: string;
  status: CaseStatus;
  relatedFeeCalculationId?: string;
  timeline?: CaseEvent[]; // Histórico de andamentos

  // Metadados extraídos do CNJ
  court?: string; // Tribunal (TJSC, TRF4)
  year?: number;
}

export type ProposalStatus = 'RASCUNHO' | 'ENVIADA' | 'ACEITA' | 'REJEITADA';

export interface Proposal {
  id: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceDescription: string;
  totalValue: number;
  calculationDetails: CalculationResult;
  paymentTerms?: PaymentTerms;
  aiProposalText?: string;
  createdAt: string;
  status: ProposalStatus;
}

export interface ImportReport {
  validItems: number;
  itemsWithWarnings: number;
}

export interface ImportHistoryEntry {
  date: string;
  success: boolean;
  report?: ImportReport;
}

export interface OABTableStatus {
  uf: string;
  lastImportDate?: string;
  lastReport?: ImportReport;
  history?: ImportHistoryEntry[];
}

// --- TIPOS FINANCEIROS ---
export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface FinancialTransaction {
  id: string;
  clientId?: string;
  proposalId?: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  type: TransactionType;
  status: TransactionStatus;
  category: string; // "Honorários", "Custas", "Reembolso"
}

// --- TIPOS TAREFAS (KANBAN) ---
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'WAITING' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  user_id?: string; // Supabase owner
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  clientId?: string;
  caseId?: string;
  createdAt: string;
}

// --- TIPOS ENRICHMENT ---
export interface CompanyData {
  name: string;
  fantasyName?: string;
  address: {
    street: string;
    number: string;
    city: string;
    state: string;
  };
  phone?: string;
}

// --- TIPOS DOCUMENTOS (GED) ---
export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  content: string; // HTML/Rich Text com placeholders
}

// --- TIPOS CONFIGURAÇÕES (MICROSAAS) ---
export type AppTheme = 'slate' | 'blue' | 'violet' | 'emerald';

export interface UserSettings {
  // Perfil Profissional
  lawyerName: string;
  oabNumber: string;
  officeName: string;
  officeAddress: string;
  logoBase64?: string; // Logo em Base64

  // Aparência
  theme: AppTheme;

  // IA
  aiTone: 'formal' | 'modern' | 'empathetic';
}

export interface BackupData {
  version: string;
  date: string;
  clients: Client[];
  cases: LegalCase[];
  proposals: Proposal[];
  transactions: FinancialTransaction[];
  tasks: Task[];
  settings: UserSettings;
}

// --- TIPOS INTELIGÊNCIA (DEEP AI) ---
export interface JurisprudenceSuggestion {
  id: string;
  title: string;
  court: string;
  summary: string;
  relevance: number; // 0-100
}

export interface AIAnalysisResult {
  summary: string;
  // Metadata extracted from documents (Petitions, Sentences)
  extractedMetadata?: {
    caseNumber?: string;
    parties?: { role: string; name: string }[];
    value?: number;
    court?: string;
  };
  // Contract Analysis Specifics
  risks?: {
    severity: 'high' | 'medium' | 'low';
    description: string
  }[];
  clauses?: {
    title: string;
    analysis: string
  }[];
  // Actionable Suggestions
  suggestedTasks?: {
    title: string;
    description: string;
    priority: Priority;
    deadline?: string;
  }[];
  // General improvement suggestions (simple list)
  recommendations?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'system' | 'assistant';
  content: string;
  timestamp: Date;
}

// --- TIPOS CALCULADORAS JUDICIAIS ---
export type CorrectionIndex = 'IGPM' | 'INPC' | 'IPCA-E' | 'SELIC';

export interface CorrectionParams {
  initialValue: number;
  startDate: string;
  endDate: string;
  index: CorrectionIndex;
  applyInterest: boolean;
  interestType?: 'SIMPLE' | 'COMPOUND';
  interestRate?: number; // % ao mês
  interestStartDate?: string;
  applyFine523?: boolean; // Multa 10% Art. 523
  applyFees523?: boolean; // Honorários 10% Art. 523
}

export interface CorrectionResult {
  originalValue: number;
  correctedValue: number;
  correctionAmount: number;
  interestAmount: number;
  fineAmount: number;
  feesAmount: number;
  total: number;
  memory: {
    date: string;
    indexValue: number;
    factor: number;
    corrected: number;
    interest: number;
  }[];
}
