
import { GoogleGenAI } from "@google/genai";
import { OABServiceItem, ClientData } from "../types";

// ============================================================================
// CONFIGURAÇÕES DE SERVIÇO IA
// ============================================================================
const AI_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  TIMEOUT_MS: 30000,
  MODEL: 'gemini-2.5-flash'
};

// Inicialização segura do cliente
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY não encontrada. Funcionalidades de IA estarão limitadas.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Delay helper para retry
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Wrapper com retry logic
const withRetry = async <T>(
  operation: () => Promise<T>,
  retries: number = AI_CONFIG.MAX_RETRIES
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.warn(`[GeminiService] Tentativa ${attempt + 1}/${retries} falhou:`, error.message);

      // Se for erro de quota ou rate limit, espera mais tempo
      const isRateLimited = error.message?.includes('quota') || error.message?.includes('rate');
      const waitTime = isRateLimited
        ? AI_CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt + 1)
        : AI_CONFIG.RETRY_DELAY_MS * (attempt + 1);

      if (attempt < retries - 1) {
        console.log(`[GeminiService] Aguardando ${waitTime}ms antes de retry...`);
        await delay(waitTime);
      }
    }
  }

  throw lastError || new Error('Operação falhou após todas as tentativas');
};

export const generateProposalDraft = async (
  feeEntry: OABServiceItem,
  clientData: ClientData,
  calculatedValue: number
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return "⚠️ Chave de API não configurada.\n\nPara usar o assistente de IA, configure a variável API_KEY nas configurações do ambiente.";
  }

  try {
    const inputs = clientData.inputs;
    const payment = clientData.paymentTerms;
    const rule = feeEntry.rule;
    const refValue = inputs.caseValue || inputs.benefitValue || inputs.estateValue;

    let paymentText = "À vista ou conforme combinado.";
    if (payment) {
      paymentText = `
        - Entrada: R$ ${payment.entryAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        - Saldo: ${payment.installments}x de R$ ${payment.installmentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        ${payment.riskPercentage > 0 ? `- Honorários de Êxito (Ad Exitum): ${payment.riskPercentage}% ao final do processo.` : ''}
        `;
    }

    const prompt = `
      Você é um assistente jurídico sênior do sistema 'Law Agent'.
      Escreva uma minuta de proposta de honorários advocatícios profissional, ética e persuasiva.
      
      DADOS DO CLIENTE:
      Nome: ${clientData.name}
      ${refValue ? `Valor da Causa/Bem Envolvido: R$ ${refValue.toLocaleString('pt-BR')}` : ''}

      SERVIÇO:
      Categoria: ${feeEntry.category}
      Especialidade: ${feeEntry.subCategory}
      Descrição: ${feeEntry.description}
      
      REFERÊNCIA OAB (${feeEntry.state}): 
      R$ ${rule.minFee || 0} (Piso) ${rule.percentage ? `ou ${rule.percentage}%` : ''}

      VALOR TOTAL DOS HONORÁRIOS (Pro-labore):
      R$ ${calculatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      
      CONDIÇÕES DE PAGAMENTO SUGERIDAS:
      ${paymentText}

      INSTRUÇÕES DE REDAÇÃO:
      1. Comece com uma saudação formal.
      2. Descreva o escopo do serviço de forma clara e técnica.
      3. Apresente o valor e as condições de pagamento de forma destacada.
      4. Justifique o investimento citando a complexidade, a responsabilidade técnica e a conformidade com a Tabela da OAB/${feeEntry.state}.
      5. Se houver honorários de êxito (ad exitum), explique que estes são devidos apenas em caso de sucesso, conforme praxe advocatícia.
      6. Retorne APENAS o texto da proposta (corpo do email/documento), formatado em Markdown.
    `;

    const result = await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: AI_CONFIG.MODEL,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      return response.text || "";
    });

    return result || "Não foi possível gerar a proposta. Tente novamente.";
  } catch (error: any) {
    console.error("[GeminiService] Erro ao gerar proposta:", error);

    // Mensagens de erro amigáveis
    if (error.message?.includes('quota')) {
      return "⚠️ Limite de requisições atingido.\n\nAguarde alguns minutos e tente novamente. Considere verificar sua quota de API no Google Cloud Console.";
    }
    if (error.message?.includes('timeout') || error.message?.includes('network')) {
      return "⚠️ Problema de conexão.\n\nVerifique sua conexão com a internet e tente novamente.";
    }
    if (error.message?.includes('invalid') || error.message?.includes('key')) {
      return "⚠️ Chave de API inválida.\n\nVerifique se a API_KEY está configurada corretamente.";
    }

    return "Houve um erro ao conectar com o assistente inteligente. Tente novamente em alguns instantes.";
  }
};

export const askOABQuestion = async (
  question: string,
  state: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return "Erro: Chave de API não configurada.";
  }

  try {
    const prompt = `
      Você é um especialista em ética e tabelas de honorários da OAB (Ordem dos Advogados do Brasil).
      Estado: ${state}.
      Pergunta do advogado: "${question}"
      
      Responda de forma concisa, citando princípios éticos se relevante.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Sem resposta.";
  } catch (error) {
    return "Erro ao consultar IA.";
  }
}
