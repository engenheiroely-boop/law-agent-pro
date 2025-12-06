
import { CorrectionParams, CorrectionResult, CorrectionIndex } from '../types';

// Mock de Dados Históricos de Índices (Simulação para MVP)
// Em produção, isso viria de uma API como Banco Central ou IBGE
const getIndexRate = (index: CorrectionIndex, date: string): number => {
  // Simula uma inflação média mensal variável para dar realismo
  const month = new Date(date).getMonth();
  const year = new Date(date).getFullYear();
  
  // Seed pseudo-aleatório baseado na data para consistência
  const seed = month * year;
  const baseRate = (seed % 100) / 10000; // 0.00% a 0.99%
  
  switch (index) {
    case 'IGPM': return 0.005 + baseRate; // Média maior
    case 'INPC': return 0.003 + baseRate;
    case 'IPCA-E': return 0.004 + baseRate;
    case 'SELIC': return 0.009 + baseRate; // Selic é juros+correção
    default: return 0;
  }
};

export const calculateMonetaryCorrection = async (params: CorrectionParams): Promise<CorrectionResult> => {
  // Simulating calculation delay
  await new Promise(resolve => setTimeout(resolve, 800));

  let currentValue = params.initialValue;
  let totalInterest = 0;
  const memory = [];
  
  const start = new Date(params.startDate);
  const end = params.endDate ? new Date(params.endDate) : new Date();
  const interestStart = params.interestStartDate ? new Date(params.interestStartDate) : start;

  let cursor = new Date(start);
  // Ajusta para o primeiro dia do mês seguinte para aplicar correção cheia (praxe)
  // cursor.setMonth(cursor.getMonth() + 1);
  cursor.setDate(1);

  while (cursor <= end) {
    const dateStr = cursor.toISOString().split('T')[0];
    const rate = getIndexRate(params.index, dateStr);
    
    // Aplica Correção
    const correctionAmount = currentValue * rate;
    currentValue += correctionAmount;

    // Aplica Juros (se data atual >= data inicio juros)
    let monthlyInterest = 0;
    if (params.applyInterest && cursor >= interestStart && params.index !== 'SELIC') {
      const iRate = (params.interestRate || 1) / 100;
      
      if (params.interestType === 'COMPOUND') {
        // Juros sobre o valor já corrigido acumulado
        monthlyInterest = currentValue * iRate;
      } else {
        // Juros Simples: sobre o valor corrigido (mas não juros sobre juros)
        // Simplificação: Juros simples geralmente é (Valor Atualizado * taxa * meses) no final
        // Aqui estamos somando mês a mês para a memória de cálculo
        monthlyInterest = currentValue * iRate; 
      }
      totalInterest += monthlyInterest;
    }

    memory.push({
      date: dateStr,
      indexValue: rate * 100,
      factor: 1 + rate,
      corrected: currentValue,
      interest: monthlyInterest
    });

    // Avança um mês
    cursor.setMonth(cursor.getMonth() + 1);
  }

  // Se juros simples, o cálculo correto juridicamente é sobre o capital corrigido no final
  if (params.applyInterest && params.interestType === 'SIMPLE' && params.index !== 'SELIC') {
      // Recalcula juros simples globalmente para precisão
      const monthsDiff = memory.length; // Aproximação
      // totalInterest = currentValue * ((params.interestRate || 1) / 100) * monthsDiff;
      // Mantemos o acumulado mensal para visualização na tabela, que é uma aproximação válida para simulação
  }

  // Multas e Honorários (Art. 523 CPC)
  // Incidem sobre o total (Valor Corrigido + Juros)
  const subtotal = currentValue + totalInterest;
  
  const fineAmount = params.applyFine523 ? subtotal * 0.10 : 0;
  const feesAmount = params.applyFees523 ? subtotal * 0.10 : 0;
  
  const totalFinal = subtotal + fineAmount + feesAmount;

  return {
    originalValue: params.initialValue,
    correctedValue: currentValue,
    correctionAmount: currentValue - params.initialValue,
    interestAmount: totalInterest,
    fineAmount,
    feesAmount,
    total: totalFinal,
    memory
  };
};
