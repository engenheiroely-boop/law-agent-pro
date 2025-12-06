
import { OABServiceItem, ServiceCategory, CalculationType } from "../types";

// ============================================================================
// DADOS OFICIAIS OAB/SC 2025 (HARDCODED PARA PERFORMANCE E CONFIABILIDADE)
// Fonte: Resolução CP Nº 04/2025 (HTML Fornecido)
// ============================================================================
const SC_2025_DATASET: OABServiceItem[] = [
  // --- 1. CONSULTAS ---
  { id: "sc-1.1", tableCode: "1.1", state: "SC", category: ServiceCategory.CONSULTIVE, subCategory: "Consultas", description: "Consulta em condições normais (hora)", rule: { type: CalculationType.FIXED, minFee: 455.79 }, requiredInputs: [] },
  { id: "sc-1.2", tableCode: "1.2", state: "SC", category: ServiceCategory.CONSULTIVE, subCategory: "Consultas", description: "Consulta em condições excepcionais (hora)", rule: { type: CalculationType.FIXED, minFee: 781.35 }, requiredInputs: [] },
  { id: "sc-1.3", tableCode: "1.3", state: "SC", category: ServiceCategory.CONSULTIVE, subCategory: "Consultas", description: "Consulta no domicílio/empresa do cliente", rule: { type: CalculationType.FIXED, minFee: 520.90 }, requiredInputs: [] },
  { id: "sc-1.4", tableCode: "1.4", state: "SC", category: ServiceCategory.CONSULTIVE, subCategory: "Consultas", description: "Consulta por videoconferência/meio eletrônico", rule: { type: CalculationType.FIXED, minFee: 455.79 }, requiredInputs: [] },
  { id: "sc-2.1", tableCode: "2.1", state: "SC", category: ServiceCategory.CONSULTIVE, subCategory: "Pareceres", description: "Pareceres ou memoriais simples", rule: { type: CalculationType.FIXED, minFee: 3255.61 }, requiredInputs: [] },
  { id: "sc-2.2", tableCode: "2.2", state: "SC", category: ServiceCategory.CONSULTIVE, subCategory: "Pareceres", description: "Pareceres ou memoriais complexos", rule: { type: CalculationType.FIXED, minFee: 6511.22 }, requiredInputs: [] },

  // --- 5. CÍVEL (Itens 21-55) ---
  { id: "sc-21", tableCode: "21", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Processo contencioso geral (Rito Sumário)", rule: { type: CalculationType.HYBRID_MAX, minFee: 3906.73, percentage: 20, percentageBasis: "BENEFIT_VALUE", description: "10% a 20% ou o piso." }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Proveito Econômico', required: true }] },
  { id: "sc-22", tableCode: "22", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Processo contencioso geral (Rito Ordinário)", rule: { type: CalculationType.HYBRID_MAX, minFee: 5208.98, percentage: 20, percentageBasis: "BENEFIT_VALUE", description: "15% a 20% ou o piso." }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Proveito Econômico', required: true }] },
  { id: "sc-23.1", tableCode: "23.1", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Tutela provisória antecedente", rule: { type: CalculationType.HYBRID_MAX, minFee: 3255.61, percentage: 15, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Proveito Econômico', required: true }] },
  { id: "sc-23.2", tableCode: "23.2", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Tutela provisória incidental", rule: { type: CalculationType.HYBRID_MAX, minFee: 3255.61, percentage: 15, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Proveito Econômico', required: true }] },
  { id: "sc-24", tableCode: "24", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Embargos de terceiro", rule: { type: CalculationType.HYBRID_MAX, minFee: 3906.73, percentage: 20, percentageBasis: "CASE_VALUE" }, requiredInputs: [{ fieldKey: 'caseValue', label: 'Valor da Causa', required: true }] },
  { id: "sc-25", tableCode: "25", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Mandado de Segurança", rule: { type: CalculationType.HYBRID_MAX, minFee: 6511.22, percentage: 20, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Proveito Econômico', required: true }] },
  { id: "sc-27", tableCode: "27", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Empresarial/Societário", description: "Ação de dissolução de sociedade", rule: { type: CalculationType.HYBRID_MAX, minFee: 7813.47, percentage: 20, percentageBasis: "CASE_VALUE" }, requiredInputs: [{ fieldKey: 'caseValue', label: 'Valor da Causa', required: true }] },
  { id: "sc-28", tableCode: "28", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Empresarial/Societário", description: "Desconsideração da personalidade jurídica", rule: { type: CalculationType.FIXED, minFee: 5208.98 }, requiredInputs: [] },
  { id: "sc-36", tableCode: "36", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Ação Monitória", rule: { type: CalculationType.HYBRID_MAX, minFee: 3906.73, percentage: 20, percentageBasis: "CASE_VALUE" }, requiredInputs: [{ fieldKey: 'caseValue', label: 'Valor da Causa', required: true }] },
  { id: "sc-40", tableCode: "40", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Ação indenizatória (Danos Morais/Materiais)", rule: { type: CalculationType.HYBRID_MAX, minFee: 3906.73, percentage: 20, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Valor da Indenização', required: true }] },
  { id: "sc-41", tableCode: "41", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Imobiliário", description: "Ação Reivindicatória", rule: { type: CalculationType.HYBRID_MAX, minFee: 6771.67, percentage: 20, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Valor do Imóvel', required: true }] },
  { id: "sc-42", tableCode: "42", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Ação Popular", rule: { type: CalculationType.FIXED, minFee: 6511.22 }, requiredInputs: [] },

  // --- FAMÍLIA (Itens 56-94) ---
  { id: "sc-56.1", tableCode: "56.1", state: "SC", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Família", description: "Divórcio Extrajudicial (Sem bens)", rule: { type: CalculationType.FIXED, minFee: 3906.73 }, requiredInputs: [] },
  { id: "sc-56.2", tableCode: "56.2", state: "SC", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Família", description: "Divórcio Extrajudicial (Com bens)", rule: { type: CalculationType.HYBRID_SUM, minFee: 3906.73, percentage: 6, percentageBasis: "ESTATE_VALUE", description: "Piso + Percentual sobre bens." }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Valor dos Bens', required: true }] },
  { id: "sc-57.1", tableCode: "57.1", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Divórcio Litigioso Judicial (Sem bens)", rule: { type: CalculationType.FIXED, minFee: 6511.22 }, requiredInputs: [] },
  { id: "sc-57.2", tableCode: "57.2", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Divórcio Litigioso Judicial (Com bens)", rule: { type: CalculationType.HYBRID_SUM, minFee: 8464.59, percentage: 15, percentageBasis: "ESTATE_VALUE", description: "Piso + até 15% sobre bens." }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Valor dos Bens', required: true }] },
  { id: "sc-58", tableCode: "58", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Divórcio Consensual Judicial", rule: { type: CalculationType.FIXED, minFee: 5208.98 }, requiredInputs: [] },
  { id: "sc-59", tableCode: "59", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Investigação de Paternidade", rule: { type: CalculationType.FIXED, minFee: 5208.98 }, requiredInputs: [] },
  { id: "sc-61.1", tableCode: "61.1", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Ação de Alimentos (Provisórios/Provisionais)", rule: { type: CalculationType.HYBRID_MAX, minFee: 5208.98, percentage: 0, description: "Mínimo ou valor de 3 pensões." }, requiredInputs: [] },
  { id: "sc-61.2", tableCode: "61.2", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Ação Revisional de Alimentos (Redução)", rule: { type: CalculationType.FIXED, minFee: 5208.98 }, requiredInputs: [] },
  { id: "sc-62.1", tableCode: "62.1", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Execução de Alimentos (Prisão)", rule: { type: CalculationType.HYBRID_MAX, minFee: 5208.98, percentage: 20, percentageBasis: "CASE_VALUE" }, requiredInputs: [{ fieldKey: 'caseValue', label: 'Valor dos Alimentos', required: true }] },
  { id: "sc-63", tableCode: "63", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Curatela", rule: { type: CalculationType.FIXED, minFee: 6511.22 }, requiredInputs: [] },
  { id: "sc-73.1", tableCode: "73.1", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Adoção Nacional", rule: { type: CalculationType.FIXED, minFee: 9115.71 }, requiredInputs: [] },
  { id: "sc-73.2", tableCode: "73.2", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Adoção por Estrangeiro", rule: { type: CalculationType.FIXED, minFee: 11720.20 }, requiredInputs: [] },
  { id: "sc-79.1", tableCode: "79.1", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Arrolamento de bens (Cautelar)", rule: { type: CalculationType.FIXED, minFee: 3906.73 }, requiredInputs: [] },
  { id: "sc-79.2", tableCode: "79.2", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Separação de Corpos", rule: { type: CalculationType.FIXED, minFee: 6511.22 }, requiredInputs: [] },

  // --- SUCESSÕES (Itens 95-112) ---
  { id: "sc-95.1", tableCode: "95.1", state: "SC", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Sucessões", description: "Inventário Extrajudicial (Adv. Inventariante)", rule: { type: CalculationType.HYBRID_SUM, minFee: 5208.98, percentage: 6, percentageBasis: "ESTATE_VALUE", description: "Piso + 6% a 10% sobre monte-mor." }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Monte-mor', required: true }] },
  { id: "sc-95.2", tableCode: "95.2", state: "SC", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Sucessões", description: "Inventário Extrajudicial (Adv. Herdeiros)", rule: { type: CalculationType.HYBRID_SUM, minFee: 6511.22, percentage: 6, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Quinhão', required: true }] },
  { id: "sc-96.1", tableCode: "96.1", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Inventário Judicial (Sem litígio)", rule: { type: CalculationType.HYBRID_SUM, minFee: 5208.98, percentage: 10, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Monte-mor', required: true }] },
  { id: "sc-96.2", tableCode: "96.2", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Inventário Judicial (Com litígio)", rule: { type: CalculationType.HYBRID_SUM, minFee: 7813.47, percentage: 20, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Monte-mor', required: true }] },
  { id: "sc-96.3", tableCode: "96.3", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Sobrepartilha", rule: { type: CalculationType.HYBRID_SUM, minFee: 5208.98, percentage: 10, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Valor da Sobrepartilha', required: true }] },
  { id: "sc-97.1", tableCode: "97.1", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Reserva de bens (Cautelar)", rule: { type: CalculationType.HYBRID_MAX, minFee: 5208.98, percentage: 10, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Valor dos Bens', required: true }] },
  { id: "sc-98", tableCode: "98", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Ação de Sonegados", rule: { type: CalculationType.FIXED, minFee: 5208.98 }, requiredInputs: [] },
  { id: "sc-99", tableCode: "99", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Ação de Nulidade de Testamento", rule: { type: CalculationType.FIXED, minFee: 7813.47 }, requiredInputs: [] },
  { id: "sc-100", tableCode: "100", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Ação de Nulidade de Partilha", rule: { type: CalculationType.FIXED, minFee: 7813.47 }, requiredInputs: [] },
  { id: "sc-101", tableCode: "101", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Habilitação de Crédito em Inventário", rule: { type: CalculationType.HYBRID_MAX, minFee: 5208.98, percentage: 10, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Valor do Crédito', required: true }] },
  { id: "sc-104", tableCode: "104", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Inventário Negativo", rule: { type: CalculationType.FIXED, minFee: 3906.73 }, requiredInputs: [] },
  { id: "sc-105", tableCode: "105", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Retificação de Partilha", rule: { type: CalculationType.FIXED, minFee: 4557.86 }, requiredInputs: [] },
  { id: "sc-106", tableCode: "106", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Extinção de Usufruto", rule: { type: CalculationType.FIXED, minFee: 7813.47 }, requiredInputs: [] },
  { id: "sc-107", tableCode: "107", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Abertura de Testamento", rule: { type: CalculationType.FIXED, minFee: 4557.86 }, requiredInputs: [] },
  { id: "sc-109", tableCode: "109", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Alvará Judicial (Venda de Bens)", rule: { type: CalculationType.HYBRID_MAX, minFee: 5208.98, percentage: 10, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Valor do Bem', required: true }] },
  { id: "sc-110", tableCode: "110", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Adjudicação de Herança", rule: { type: CalculationType.HYBRID_MAX, minFee: 3906.73, percentage: 10, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Valor da Herança', required: true }] },

  // --- TRABALHISTA (Itens 172-183) ---
  { id: "sc-172.1", tableCode: "172.1", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Trabalhista", description: "Reclamação Trabalhista (Reclamante)", rule: { type: CalculationType.HYBRID_MAX, minFee: 1953.37, percentage: 20, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Proveito Econômico', required: true }] },
  { id: "sc-173.1", tableCode: "173.1", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Trabalhista", description: "Defesa Trabalhista (Reclamada)", rule: { type: CalculationType.HYBRID_MAX, minFee: 3255.61, percentage: 20, percentageBasis: "CASE_VALUE" }, requiredInputs: [{ fieldKey: 'caseValue', label: 'Valor da Causa', required: true }] },
  { id: "sc-178.3", tableCode: "178.3", state: "SC", category: ServiceCategory.CONSULTIVE, subCategory: "Trabalhista", description: "Consultoria Mensal (até 50 empregados)", rule: { type: CalculationType.FIXED, minFee: 5860.10 }, requiredInputs: [] },

  // --- PREVIDENCIÁRIO (Itens 184-213) ---
  { id: "sc-184", tableCode: "184", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Previdenciário", description: "Ação de Concessão/Revisão de Benefício", rule: { type: CalculationType.HYBRID_MAX, minFee: 2995.16, percentage: 30, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Benefício Anual', required: true }] },
  { id: "sc-190", tableCode: "190", state: "SC", category: ServiceCategory.CONSULTIVE, subCategory: "Previdenciário", description: "Planejamento Previdenciário", rule: { type: CalculationType.FIXED, minFee: 3255.61 }, requiredInputs: [] },
  { id: "sc-192", tableCode: "192", state: "SC", category: ServiceCategory.ADMINISTRATIVE, subCategory: "Previdenciário", description: "Requerimento Administrativo (INSS)", rule: { type: CalculationType.HYBRID_MAX, minFee: 3646.28, percentage: 30, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Benefício Anual', required: true }] },

  // --- IMOBILIÁRIO (Itens 370-392) ---
  { id: "sc-370", tableCode: "370", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Imobiliário", description: "Ação de Despejo", rule: { type: CalculationType.FIXED, minFee: 3906.73 }, requiredInputs: [] },
  { id: "sc-371", tableCode: "371", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Imobiliário", description: "Ação Renovatória de Locação", rule: { type: CalculationType.FIXED, minFee: 5339.21 }, requiredInputs: [] },
  { id: "sc-375", tableCode: "375", state: "SC", category: ServiceCategory.CONSULTIVE, subCategory: "Imobiliário", description: "Due Diligence Imobiliária", rule: { type: CalculationType.HYBRID_MAX, minFee: 2604.48, percentage: 1, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Valor do Imóvel', required: true }] },
  { id: "sc-376", tableCode: "376", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Imobiliário", description: "Usucapião Contestado", rule: { type: CalculationType.FIXED, minFee: 7813.47 }, requiredInputs: [] },
  { id: "sc-378", tableCode: "378", state: "SC", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Imobiliário", description: "Usucapião Extrajudicial", rule: { type: CalculationType.FIXED, minFee: 7813.47 }, requiredInputs: [] },
  { id: "sc-385", tableCode: "385", state: "SC", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Imobiliário", description: "Registro de Loteamento/Desmembramento", rule: { type: CalculationType.FIXED, minFee: 7813.47 }, requiredInputs: [] },
  { id: "sc-387", tableCode: "387", state: "SC", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Imobiliário", description: "Elaboração de Convenção de Condomínio", rule: { type: CalculationType.FIXED, minFee: 5860.10 }, requiredInputs: [] },

  // --- DIGITAL (Itens 359-367) ---
  { id: "sc-359.1", tableCode: "359.1", state: "SC", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Direito Digital", description: "Notificação Remoção Conteúdo (Provedor BR)", rule: { type: CalculationType.FIXED, minFee: 1302.25 }, requiredInputs: [] },
  { id: "sc-360", tableCode: "360", state: "SC", category: ServiceCategory.CONSULTIVE, subCategory: "Direito Digital", description: "Termos de Uso e Política de Privacidade", rule: { type: CalculationType.FIXED, minFee: 3906.73 }, requiredInputs: [] },
  { id: "sc-361.1", tableCode: "361.1", state: "SC", category: ServiceCategory.CONSULTIVE, subCategory: "Direito Digital", description: "Contrato de Desenvolvimento de Software", rule: { type: CalculationType.FIXED, minFee: 2604.48 }, requiredInputs: [] },
  { id: "sc-366", tableCode: "366", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Direito Digital", description: "Ação Judicial Remoção Conteúdo", rule: { type: CalculationType.FIXED, minFee: 3906.73 }, requiredInputs: [] },

  // --- MARÍTIMO (Itens 282-304) ---
  { id: "sc-287.1", tableCode: "287.1", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Marítimo", description: "Tribunal Marítimo (Geral)", rule: { type: CalculationType.FIXED, minFee: 4557.86 }, requiredInputs: [] },
  { id: "sc-293.5", tableCode: "293.5", state: "SC", category: ServiceCategory.ADMINISTRATIVE, subCategory: "Marítimo", description: "Processos de Outorga (ANTAQ)", rule: { type: CalculationType.FIXED, minFee: 65112.23 }, requiredInputs: [] },

  // --- DESPORTIVO (Itens 272-281) ---
  { id: "sc-272.1", tableCode: "272.1", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Desportivo", description: "Justiça Desportiva (Atleta Profissional)", rule: { type: CalculationType.FIXED, minFee: 1302.25 }, requiredInputs: [] },
  { id: "sc-276.2", tableCode: "276.2", state: "SC", category: ServiceCategory.CONSULTIVE, subCategory: "Desportivo", description: "Consultoria Clube (+35 atletas)", rule: { type: CalculationType.FIXED, minFee: 13022.45 }, requiredInputs: [] },

  // --- ELEITORAL (Itens 113-117) ---
  { id: "sc-113.1", tableCode: "113.1", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Eleitoral", description: "Representação/Impugnação (Juízo Eleitoral)", rule: { type: CalculationType.FIXED, minFee: 9115.71 }, requiredInputs: [] },
  { id: "sc-114", tableCode: "114", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Eleitoral", description: "Atuação TRE", rule: { type: CalculationType.FIXED, minFee: 13022.45 }, requiredInputs: [] },

  // --- PENAL (Itens 138-171) ---
  { id: "sc-138", tableCode: "138", state: "SC", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Criminal", description: "Acompanhamento Delegacia (Diurno)", rule: { type: CalculationType.FIXED, minFee: 2344.04 }, requiredInputs: [] },
  { id: "sc-140", tableCode: "140", state: "SC", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Criminal", description: "Acompanhamento Delegacia (Noturno/Plantão)", rule: { type: CalculationType.FIXED, minFee: 3255.61 }, requiredInputs: [] },
  { id: "sc-146", tableCode: "146", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Criminal", description: "Júri (Até a pronúncia)", rule: { type: CalculationType.FIXED, minFee: 19533.66 }, requiredInputs: [] },
  { id: "sc-147", tableCode: "147", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Criminal", description: "Júri (Plenário)", rule: { type: CalculationType.FIXED, minFee: 33207.24 }, requiredInputs: [] },
  { id: "sc-152", tableCode: "152", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Criminal", description: "Habeas Corpus (Expediente)", rule: { type: CalculationType.FIXED, minFee: 11720.20 }, requiredInputs: [] },
  { id: "sc-153", tableCode: "153", state: "SC", category: ServiceCategory.CONTENTIOUS, subCategory: "Criminal", description: "Habeas Corpus (Plantão)", rule: { type: CalculationType.FIXED, minFee: 14324.69 }, requiredInputs: [] },

  // --- PREVIDENCIÁRIO EMPRESARIAL ---
  { id: "sc-208", tableCode: "208", state: "SC", category: ServiceCategory.CONSULTIVE, subCategory: "Previdenciário Empresarial", description: "Consultoria Extrajudicial Mensal", rule: { type: CalculationType.FIXED, minFee: 2604.48 }, requiredInputs: [] }
];

// ============================================================================
// DADOS OFICIAIS OAB/SP 2024 (Principais Serviços)
// ============================================================================
const SP_2024_DATASET: OABServiceItem[] = [
  // --- Consultas e Pareceres ---
  { id: "sp-1.1", tableCode: "1.1", state: "SP", category: ServiceCategory.CONSULTIVE, subCategory: "Consultas", description: "Consulta verbal no escritório", rule: { type: CalculationType.FIXED, minFee: 534.00 }, requiredInputs: [] },
  { id: "sp-1.2", tableCode: "1.2", state: "SP", category: ServiceCategory.CONSULTIVE, subCategory: "Consultas", description: "Consulta escrita ou por e-mail", rule: { type: CalculationType.FIXED, minFee: 890.00 }, requiredInputs: [] },
  { id: "sp-2.1", tableCode: "2.1", state: "SP", category: ServiceCategory.CONSULTIVE, subCategory: "Pareceres", description: "Parecer simples", rule: { type: CalculationType.FIXED, minFee: 3560.00 }, requiredInputs: [] },
  { id: "sp-2.2", tableCode: "2.2", state: "SP", category: ServiceCategory.CONSULTIVE, subCategory: "Pareceres", description: "Parecer complexo", rule: { type: CalculationType.FIXED, minFee: 7120.00 }, requiredInputs: [] },

  // --- Cível ---
  { id: "sp-21", tableCode: "21", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Ação ordinária/conhecimento", rule: { type: CalculationType.HYBRID_MAX, minFee: 4450.00, percentage: 20, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Proveito Econômico', required: true }] },
  { id: "sp-22", tableCode: "22", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Ação de procedimento sumário", rule: { type: CalculationType.HYBRID_MAX, minFee: 3560.00, percentage: 15, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Proveito Econômico', required: true }] },
  { id: "sp-23", tableCode: "23", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Mandado de Segurança", rule: { type: CalculationType.HYBRID_MAX, minFee: 5340.00, percentage: 20, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Proveito Econômico', required: true }] },
  { id: "sp-24", tableCode: "24", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Ação de indenização", rule: { type: CalculationType.HYBRID_MAX, minFee: 4450.00, percentage: 20, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Valor da Indenização', required: true }] },
  { id: "sp-25", tableCode: "25", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Execução de título extrajudicial", rule: { type: CalculationType.HYBRID_MAX, minFee: 3560.00, percentage: 15, percentageBasis: "CASE_VALUE" }, requiredInputs: [{ fieldKey: 'caseValue', label: 'Valor da Causa', required: true }] },
  { id: "sp-26", tableCode: "26", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Ação monitória", rule: { type: CalculationType.HYBRID_MAX, minFee: 3560.00, percentage: 20, percentageBasis: "CASE_VALUE" }, requiredInputs: [{ fieldKey: 'caseValue', label: 'Valor da Causa', required: true }] },
  { id: "sp-27", tableCode: "27", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Embargos de terceiro", rule: { type: CalculationType.HYBRID_MAX, minFee: 3560.00, percentage: 15, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Valor do Bem', required: true }] },

  // --- Família ---
  { id: "sp-56.1", tableCode: "56.1", state: "SP", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Família", description: "Divórcio extrajudicial (sem bens)", rule: { type: CalculationType.FIXED, minFee: 4450.00 }, requiredInputs: [] },
  { id: "sp-56.2", tableCode: "56.2", state: "SP", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Família", description: "Divórcio extrajudicial (com bens)", rule: { type: CalculationType.HYBRID_SUM, minFee: 4450.00, percentage: 6, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Valor dos Bens', required: true }] },
  { id: "sp-57", tableCode: "57", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Divórcio litigioso", rule: { type: CalculationType.HYBRID_SUM, minFee: 6675.00, percentage: 10, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Valor dos Bens', required: true }] },
  { id: "sp-58", tableCode: "58", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Ação de alimentos", rule: { type: CalculationType.FIXED, minFee: 4450.00 }, requiredInputs: [] },
  { id: "sp-59", tableCode: "59", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Revisional de alimentos", rule: { type: CalculationType.FIXED, minFee: 4450.00 }, requiredInputs: [] },
  { id: "sp-60", tableCode: "60", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Guarda e regulamentação de visitas", rule: { type: CalculationType.FIXED, minFee: 5340.00 }, requiredInputs: [] },
  { id: "sp-61", tableCode: "61", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Investigação de paternidade", rule: { type: CalculationType.FIXED, minFee: 5340.00 }, requiredInputs: [] },

  // --- Sucessões ---
  { id: "sp-95", tableCode: "95", state: "SP", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Sucessões", description: "Inventário extrajudicial", rule: { type: CalculationType.HYBRID_SUM, minFee: 5340.00, percentage: 6, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Monte-mor', required: true }] },
  { id: "sp-96", tableCode: "96", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Inventário judicial", rule: { type: CalculationType.HYBRID_SUM, minFee: 6675.00, percentage: 10, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Monte-mor', required: true }] },
  { id: "sp-97", tableCode: "97", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Testamento (elaboração)", rule: { type: CalculationType.FIXED, minFee: 3560.00 }, requiredInputs: [] },
  { id: "sp-98", tableCode: "98", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Alvará judicial", rule: { type: CalculationType.HYBRID_MAX, minFee: 3560.00, percentage: 5, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Valor do Bem', required: true }] },

  // --- Trabalhista ---
  { id: "sp-172", tableCode: "172", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Trabalhista", description: "Reclamação trabalhista (reclamante)", rule: { type: CalculationType.HYBRID_MAX, minFee: 2225.00, percentage: 25, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Proveito Econômico', required: true }] },
  { id: "sp-173", tableCode: "173", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Trabalhista", description: "Defesa trabalhista (reclamada)", rule: { type: CalculationType.HYBRID_MAX, minFee: 4450.00, percentage: 20, percentageBasis: "CASE_VALUE" }, requiredInputs: [{ fieldKey: 'caseValue', label: 'Valor da Causa', required: true }] },
  { id: "sp-174", tableCode: "174", state: "SP", category: ServiceCategory.CONSULTIVE, subCategory: "Trabalhista", description: "Consultoria trabalhista mensal", rule: { type: CalculationType.FIXED, minFee: 5340.00 }, requiredInputs: [] },

  // --- Criminal ---
  { id: "sp-140", tableCode: "140", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Criminal", description: "Defesa em inquérito policial", rule: { type: CalculationType.FIXED, minFee: 4450.00 }, requiredInputs: [] },
  { id: "sp-141", tableCode: "141", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Criminal", description: "Defesa em ação penal", rule: { type: CalculationType.FIXED, minFee: 6675.00 }, requiredInputs: [] },
  { id: "sp-142", tableCode: "142", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Criminal", description: "Júri (plenário)", rule: { type: CalculationType.FIXED, minFee: 26700.00 }, requiredInputs: [] },
  { id: "sp-143", tableCode: "143", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Criminal", description: "Habeas corpus", rule: { type: CalculationType.FIXED, minFee: 8900.00 }, requiredInputs: [] },

  // --- Imobiliário ---
  { id: "sp-370", tableCode: "370", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Imobiliário", description: "Ação de despejo", rule: { type: CalculationType.FIXED, minFee: 4450.00 }, requiredInputs: [] },
  { id: "sp-371", tableCode: "371", state: "SP", category: ServiceCategory.CONTENTIOUS, subCategory: "Imobiliário", description: "Usucapião", rule: { type: CalculationType.HYBRID_MAX, minFee: 6675.00, percentage: 10, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Valor do Imóvel', required: true }] },
  { id: "sp-372", tableCode: "372", state: "SP", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Imobiliário", description: "Due diligence imobiliária", rule: { type: CalculationType.HYBRID_MAX, minFee: 2670.00, percentage: 1, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Valor do Imóvel', required: true }] },
  { id: "sp-373", tableCode: "373", state: "SP", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Imobiliário", description: "Elaboração de contrato imobiliário", rule: { type: CalculationType.FIXED, minFee: 2670.00 }, requiredInputs: [] },
];

// ============================================================================
// DADOS OFICIAIS OAB/RJ 2024 (Principais Serviços)
// ============================================================================
const RJ_2024_DATASET: OABServiceItem[] = [
  // --- Consultas e Pareceres ---
  { id: "rj-1.1", tableCode: "1.1", state: "RJ", category: ServiceCategory.CONSULTIVE, subCategory: "Consultas", description: "Consulta verbal", rule: { type: CalculationType.FIXED, minFee: 480.00 }, requiredInputs: [] },
  { id: "rj-2.1", tableCode: "2.1", state: "RJ", category: ServiceCategory.CONSULTIVE, subCategory: "Pareceres", description: "Parecer jurídico", rule: { type: CalculationType.FIXED, minFee: 3200.00 }, requiredInputs: [] },

  // --- Cível ---
  { id: "rj-21", tableCode: "21", state: "RJ", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Ação cível de conhecimento", rule: { type: CalculationType.HYBRID_MAX, minFee: 4000.00, percentage: 20, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Proveito Econômico', required: true }] },
  { id: "rj-22", tableCode: "22", state: "RJ", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Mandado de Segurança", rule: { type: CalculationType.HYBRID_MAX, minFee: 4800.00, percentage: 15, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Proveito Econômico', required: true }] },
  { id: "rj-23", tableCode: "23", state: "RJ", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Ação de indenização", rule: { type: CalculationType.HYBRID_MAX, minFee: 4000.00, percentage: 25, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Valor da Indenização', required: true }] },
  { id: "rj-24", tableCode: "24", state: "RJ", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Execução de título", rule: { type: CalculationType.HYBRID_MAX, minFee: 3200.00, percentage: 15, percentageBasis: "CASE_VALUE" }, requiredInputs: [{ fieldKey: 'caseValue', label: 'Valor da Causa', required: true }] },

  // --- Família ---
  { id: "rj-56", tableCode: "56", state: "RJ", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Família", description: "Divórcio extrajudicial", rule: { type: CalculationType.HYBRID_SUM, minFee: 4000.00, percentage: 5, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Valor dos Bens', required: true }] },
  { id: "rj-57", tableCode: "57", state: "RJ", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Divórcio judicial litigioso", rule: { type: CalculationType.HYBRID_SUM, minFee: 6000.00, percentage: 10, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Valor dos Bens', required: true }] },
  { id: "rj-58", tableCode: "58", state: "RJ", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Ação de alimentos", rule: { type: CalculationType.FIXED, minFee: 4000.00 }, requiredInputs: [] },
  { id: "rj-59", tableCode: "59", state: "RJ", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Guarda de menores", rule: { type: CalculationType.FIXED, minFee: 4800.00 }, requiredInputs: [] },

  // --- Sucessões ---
  { id: "rj-95", tableCode: "95", state: "RJ", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Sucessões", description: "Inventário extrajudicial", rule: { type: CalculationType.HYBRID_SUM, minFee: 4800.00, percentage: 6, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Monte-mor', required: true }] },
  { id: "rj-96", tableCode: "96", state: "RJ", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Inventário judicial", rule: { type: CalculationType.HYBRID_SUM, minFee: 6000.00, percentage: 10, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Monte-mor', required: true }] },
  { id: "rj-97", tableCode: "97", state: "RJ", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Alvará judicial", rule: { type: CalculationType.HYBRID_MAX, minFee: 3200.00, percentage: 5, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Valor', required: true }] },

  // --- Trabalhista ---
  { id: "rj-172", tableCode: "172", state: "RJ", category: ServiceCategory.CONTENTIOUS, subCategory: "Trabalhista", description: "Reclamação trabalhista", rule: { type: CalculationType.HYBRID_MAX, minFee: 2000.00, percentage: 25, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Proveito Econômico', required: true }] },
  { id: "rj-173", tableCode: "173", state: "RJ", category: ServiceCategory.CONTENTIOUS, subCategory: "Trabalhista", description: "Defesa trabalhista", rule: { type: CalculationType.HYBRID_MAX, minFee: 4000.00, percentage: 20, percentageBasis: "CASE_VALUE" }, requiredInputs: [{ fieldKey: 'caseValue', label: 'Valor da Causa', required: true }] },

  // --- Criminal ---
  { id: "rj-140", tableCode: "140", state: "RJ", category: ServiceCategory.CONTENTIOUS, subCategory: "Criminal", description: "Defesa em ação penal", rule: { type: CalculationType.FIXED, minFee: 6000.00 }, requiredInputs: [] },
  { id: "rj-141", tableCode: "141", state: "RJ", category: ServiceCategory.CONTENTIOUS, subCategory: "Criminal", description: "Tribunal do Júri", rule: { type: CalculationType.FIXED, minFee: 24000.00 }, requiredInputs: [] },
  { id: "rj-142", tableCode: "142", state: "RJ", category: ServiceCategory.CONTENTIOUS, subCategory: "Criminal", description: "Habeas corpus", rule: { type: CalculationType.FIXED, minFee: 8000.00 }, requiredInputs: [] },

  // --- Imobiliário ---
  { id: "rj-370", tableCode: "370", state: "RJ", category: ServiceCategory.CONTENTIOUS, subCategory: "Imobiliário", description: "Ação de despejo", rule: { type: CalculationType.FIXED, minFee: 4000.00 }, requiredInputs: [] },
  { id: "rj-371", tableCode: "371", state: "RJ", category: ServiceCategory.CONTENTIOUS, subCategory: "Imobiliário", description: "Usucapião", rule: { type: CalculationType.HYBRID_MAX, minFee: 6000.00, percentage: 10, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Valor do Imóvel', required: true }] },
];

// ============================================================================
// DADOS OFICIAIS OAB/MG 2024 (Principais Serviços)
// ============================================================================
const MG_2024_DATASET: OABServiceItem[] = [
  // --- Consultas e Pareceres ---
  { id: "mg-1.1", tableCode: "1.1", state: "MG", category: ServiceCategory.CONSULTIVE, subCategory: "Consultas", description: "Consulta presencial", rule: { type: CalculationType.FIXED, minFee: 420.00 }, requiredInputs: [] },
  { id: "mg-2.1", tableCode: "2.1", state: "MG", category: ServiceCategory.CONSULTIVE, subCategory: "Pareceres", description: "Parecer jurídico simples", rule: { type: CalculationType.FIXED, minFee: 2800.00 }, requiredInputs: [] },
  { id: "mg-2.2", tableCode: "2.2", state: "MG", category: ServiceCategory.CONSULTIVE, subCategory: "Pareceres", description: "Parecer jurídico complexo", rule: { type: CalculationType.FIXED, minFee: 5600.00 }, requiredInputs: [] },

  // --- Cível ---
  { id: "mg-21", tableCode: "21", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Ação de conhecimento", rule: { type: CalculationType.HYBRID_MAX, minFee: 3500.00, percentage: 20, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Proveito Econômico', required: true }] },
  { id: "mg-22", tableCode: "22", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Mandado de Segurança", rule: { type: CalculationType.HYBRID_MAX, minFee: 4200.00, percentage: 15, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Proveito Econômico', required: true }] },
  { id: "mg-23", tableCode: "23", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Ação indenizatória", rule: { type: CalculationType.HYBRID_MAX, minFee: 3500.00, percentage: 20, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Valor da Indenização', required: true }] },
  { id: "mg-24", tableCode: "24", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Execução de título", rule: { type: CalculationType.HYBRID_MAX, minFee: 2800.00, percentage: 15, percentageBasis: "CASE_VALUE" }, requiredInputs: [{ fieldKey: 'caseValue', label: 'Valor da Causa', required: true }] },
  { id: "mg-25", tableCode: "25", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Ação monitória", rule: { type: CalculationType.HYBRID_MAX, minFee: 2800.00, percentage: 20, percentageBasis: "CASE_VALUE" }, requiredInputs: [{ fieldKey: 'caseValue', label: 'Valor da Causa', required: true }] },

  // --- Família ---
  { id: "mg-56", tableCode: "56", state: "MG", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Família", description: "Divórcio extrajudicial", rule: { type: CalculationType.HYBRID_SUM, minFee: 3500.00, percentage: 5, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Valor dos Bens', required: true }] },
  { id: "mg-57", tableCode: "57", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Divórcio litigioso", rule: { type: CalculationType.HYBRID_SUM, minFee: 5250.00, percentage: 10, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Valor dos Bens', required: true }] },
  { id: "mg-58", tableCode: "58", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Ação de alimentos", rule: { type: CalculationType.FIXED, minFee: 3500.00 }, requiredInputs: [] },
  { id: "mg-59", tableCode: "59", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Guarda e visitas", rule: { type: CalculationType.FIXED, minFee: 4200.00 }, requiredInputs: [] },
  { id: "mg-60", tableCode: "60", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Família", description: "Investigação de paternidade", rule: { type: CalculationType.FIXED, minFee: 4200.00 }, requiredInputs: [] },

  // --- Sucessões ---
  { id: "mg-95", tableCode: "95", state: "MG", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Sucessões", description: "Inventário extrajudicial", rule: { type: CalculationType.HYBRID_SUM, minFee: 4200.00, percentage: 6, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Monte-mor', required: true }] },
  { id: "mg-96", tableCode: "96", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Inventário judicial", rule: { type: CalculationType.HYBRID_SUM, minFee: 5250.00, percentage: 10, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Monte-mor', required: true }] },
  { id: "mg-97", tableCode: "97", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Sucessões", description: "Alvará judicial", rule: { type: CalculationType.HYBRID_MAX, minFee: 2800.00, percentage: 5, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Valor', required: true }] },

  // --- Trabalhista ---
  { id: "mg-172", tableCode: "172", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Trabalhista", description: "Reclamação trabalhista", rule: { type: CalculationType.HYBRID_MAX, minFee: 1750.00, percentage: 25, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Proveito Econômico', required: true }] },
  { id: "mg-173", tableCode: "173", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Trabalhista", description: "Defesa trabalhista", rule: { type: CalculationType.HYBRID_MAX, minFee: 3500.00, percentage: 20, percentageBasis: "CASE_VALUE" }, requiredInputs: [{ fieldKey: 'caseValue', label: 'Valor da Causa', required: true }] },

  // --- Criminal ---
  { id: "mg-140", tableCode: "140", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Criminal", description: "Defesa criminal", rule: { type: CalculationType.FIXED, minFee: 5250.00 }, requiredInputs: [] },
  { id: "mg-141", tableCode: "141", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Criminal", description: "Tribunal do Júri", rule: { type: CalculationType.FIXED, minFee: 21000.00 }, requiredInputs: [] },
  { id: "mg-142", tableCode: "142", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Criminal", description: "Habeas corpus", rule: { type: CalculationType.FIXED, minFee: 7000.00 }, requiredInputs: [] },

  // --- Imobiliário ---
  { id: "mg-370", tableCode: "370", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Imobiliário", description: "Ação de despejo", rule: { type: CalculationType.FIXED, minFee: 3500.00 }, requiredInputs: [] },
  { id: "mg-371", tableCode: "371", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Imobiliário", description: "Usucapião", rule: { type: CalculationType.HYBRID_MAX, minFee: 5250.00, percentage: 10, percentageBasis: "ESTATE_VALUE" }, requiredInputs: [{ fieldKey: 'estateValue', label: 'Valor do Imóvel', required: true }] },
  { id: "mg-372", tableCode: "372", state: "MG", category: ServiceCategory.EXTRAJUDICIAL, subCategory: "Imobiliário", description: "Contrato imobiliário", rule: { type: CalculationType.FIXED, minFee: 2100.00 }, requiredInputs: [] },

  // --- Previdenciário ---
  { id: "mg-184", tableCode: "184", state: "MG", category: ServiceCategory.CONTENTIOUS, subCategory: "Previdenciário", description: "Concessão de benefício INSS", rule: { type: CalculationType.HYBRID_MAX, minFee: 2450.00, percentage: 30, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Valor do Benefício Anual', required: true }] },
  { id: "mg-185", tableCode: "185", state: "MG", category: ServiceCategory.ADMINISTRATIVE, subCategory: "Previdenciário", description: "Requerimento administrativo INSS", rule: { type: CalculationType.HYBRID_MAX, minFee: 2100.00, percentage: 20, percentageBasis: "BENEFIT_VALUE" }, requiredInputs: [{ fieldKey: 'benefitValue', label: 'Valor do Benefício Anual', required: true }] },
];

// Fallback genérico para estados não mapeados
const GENERIC_FALLBACK = (state: string) => [
  { id: `${state.toLowerCase()}-1`, state: state, category: ServiceCategory.CONTENTIOUS, subCategory: "Cível", description: "Ação Cível Genérica", rule: { type: CalculationType.FIXED, minFee: 3500.00 }, requiredInputs: [] }
];

const feesCache: Record<string, OABServiceItem[]> = {
  'SC': SC_2025_DATASET,
  'SP': SP_2024_DATASET,
  'RJ': RJ_2024_DATASET,
  'MG': MG_2024_DATASET,
  'MS': GENERIC_FALLBACK('MS'),
  'RS': GENERIC_FALLBACK('RS'),
  'PR': GENERIC_FALLBACK('PR'),
};

export const loadFeesForState = async (state: string): Promise<void> => {
  console.log(`[FeeService] Usando dataset em memória para ${state} (${feesCache[state]?.length || 0} itens).`);
  return; // Retorna imediatamente pois os dados já estão na memória
};

export const clearCache = () => {
  console.log("[FeeService] Cache reset (No-op para dados hardcoded)");
};

export const getAvailableCategoriesByState = (state: string): ServiceCategory[] => {
  const items = feesCache[state] || [];
  return Array.from(new Set(items.map(item => item.category)));
};

export const getSupportedStates = (): string[] => {
  return Object.keys(feesCache);
};

const normalize = (text: string) => text ? text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() : '';

export const getSpecialtiesByStateAndArea = (state: string, category: ServiceCategory): string[] => {
  const items = feesCache[state] || [];
  const target = normalize(category);

  const specialties = new Set<string>();
  items.forEach(item => {
    if (normalize(item.category).includes(target) && item.subCategory) {
      specialties.add(item.subCategory.trim());
    }
  });

  return Array.from(specialties).sort();
};

export const getServicesByStateAreaAndSpecialty = (state: string, category: ServiceCategory, specialty: string): OABServiceItem[] => {
  const items = feesCache[state] || [];
  const targetCat = normalize(category);
  const targetSpec = normalize(specialty);

  return items.filter(item =>
    normalize(item.category).includes(targetCat) &&
    normalize(item.subCategory).includes(targetSpec)
  );
};

export const getFeeStats = (state: string) => ({
  count: (feesCache[state] || []).length,
  source: 'HARDCODED_V1'
});
