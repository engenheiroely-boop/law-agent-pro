
import { 
  CalculationInputs, 
  CalculationResult, 
  OABServiceItem, 
  CalculationType 
} from "../types";

/**
 * Motor de Cálculo de Honorários "Law Agent"
 * Responsável por interpretar a regra do serviço e aplicar a fórmula correta.
 * Não depende de UI, apenas de dados puros.
 */
export const calculateFee = (
  item: OABServiceItem, 
  inputs: CalculationInputs
): CalculationResult => {
  
  const { rule } = item;
  const complexity = inputs.complexity || 1.0;
  
  let total = 0;
  let base = 0;
  let variable = 0;
  let description = '';

  // Helpers para extrair valores seguros
  const getBasisValue = (basis?: string): number => {
    switch(basis) {
      case 'CASE_VALUE': return inputs.caseValue || 0;
      case 'BENEFIT_VALUE': return inputs.benefitValue || 0;
      case 'ESTATE_VALUE': return inputs.estateValue || 0;
      case 'MONTHLY_FEE': return inputs.monthlyFee || 0;
      default: return 0;
    }
  };

  switch (rule.type) {
    case CalculationType.FIXED:
      base = (rule.minFee || 0);
      total = base * complexity;
      description = complexity > 1 
        ? `Valor fixo de tabela (R$ ${base}) ajustado por complexidade (${((complexity-1)*100).toFixed(0)}%)`
        : `Valor fixo mínimo de tabela.`;
      break;

    case CalculationType.HOURLY:
      const hours = inputs.hours || 0;
      const rate = (rule.hourlyRate || 0);
      base = rate * hours;
      total = base * complexity;
      description = `${hours}h estimadas x R$ ${rate}/h.`;
      break;

    case CalculationType.PERCENTAGE:
      const pValue = getBasisValue(rule.percentageBasis);
      variable = (pValue * (rule.percentage || 0)) / 100;
      // Garante que respeita o mínimo se houver, mesmo sendo puramente percentual
      base = rule.minFee || 0;
      total = Math.max(variable, base) * complexity;
      description = `${rule.percentage}% sobre a base de cálculo (R$ ${pValue.toLocaleString('pt-BR')}).`;
      if (variable < base) description += " (Aplicado valor mínimo de piso da tabela).";
      break;

    case CalculationType.HYBRID_MAX:
      // O clássico "20% ou o mínimo da tabela, o que for maior"
      const hBase = rule.minFee || 0;
      const hBasisVal = getBasisValue(rule.percentageBasis);
      const hPercentVal = (hBasisVal * (rule.percentage || 0)) / 100;
      
      base = hBase;
      variable = hPercentVal;
      
      const rawTotalMax = Math.max(hBase, hPercentVal);
      total = rawTotalMax * complexity;
      
      if (hPercentVal > hBase) {
        description = `Aplicação de ${rule.percentage}% sobre o valor (R$ ${hBasisVal.toLocaleString('pt-BR')}) pois supera o mínimo.`;
      } else {
        description = `Aplicação do valor mínimo de tabela, pois o percentual (${rule.percentage}%) não atinge o piso.`;
      }
      break;

    case CalculationType.HYBRID_SUM:
      // Ex: R$ 5.000 de entrada + 10% do êxito
      base = rule.minFee || 0; // Parte fixa (Pro labore)
      const sBasisVal = getBasisValue(rule.percentageBasis);
      variable = (sBasisVal * (rule.percentage || 0)) / 100; // Parte variável (Ad exitum)
      
      total = (base + variable) * complexity;
      description = `Combinação: R$ ${base.toLocaleString('pt-BR')} (Fixo) + ${rule.percentage}% de êxito/risco.`;
      break;

    default:
      total = 0;
      description = "Tipo de cálculo não suportado.";
  }

  return {
    totalFee: total,
    baseFee: base,
    variableFee: variable,
    formulaDescription: description,
    isEstimate: true
  };
};

/**
 * Formata o valor monetário para o padrão BRL
 */
export const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
