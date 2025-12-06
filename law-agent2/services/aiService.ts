
import { GoogleGenAI } from "@google/genai";
import { AIAnalysisResult, JurisprudenceSuggestion, ChatMessage } from '../types';
import { getClients } from "./clientService";
import { getCases } from "./caseService";
import { getTransactions } from "./financialService";
import { getTasks } from "./taskService";

const getAiClient = () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("GEMINI_API_KEY is missing via VITE_GEMINI_API_KEY");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

/**
 * 1. Contract Analysis (Real AI)
 */
export const analyzeContract = async (text: string, attachment?: { mimeType: string; data: string }): Promise<AIAnalysisResult> => {
    const ai = getAiClient();

    // Fallback if no key (so app doesn't crash in demo mode without key)
    if (!ai) {
        return mockAnalysis();
    }

    const prompt = `
    You are 'Law Agent', an expert legal AI assistant.
    Analyze the following Brazilian legal document (Contract, Petition, or Sentence).

    ${attachment ? 'DOCUMENT ATTACHED AS PDF/IMAGE.' : 'DOCUMENT TEXT:'}
    ${text ? text.substring(0, 30000) : ''}

    TASK:
    Return a STRICT JSON object (no markdown formatting) matching this structure:
    {
      "summary": "Executive summary in Portuguese (max 3 lines)",
      "extractedMetadata": {
        "caseNumber": "Extract CNJ number if present, else null",
        "value": 0.00 (Extract monetary value if present, else null),
        "court": "Extract court name (e.g. TJSC, STJ) if present, else null",
        "parties": [{"role": "Role (Author/Defendant/Contractor)", "name": "Name"}]
      },
      "risks": [{"severity": "high"|"medium"|"low", "description": "Description in Portuguese"}],
      "clauses": [{"title": "Clause Title", "analysis": "Brief analysis in Portuguese"}],
      "recommendations": ["Actionable suggestion 1", "Actionable suggestion 2"],
      "suggestedTasks": [{"title": "Task Title", "description": "Task details", "priority": "HIGH"|"MEDIUM"|"LOW", "deadline": "YYYY-MM-DD"}]
    }

    If data is missing, use null. For 'deadline', estimate based on standard deadlines if not explicit (e.g., 15 days for contestation).
  `;

    try {
        const parts: any[] = [{ text: prompt }];
        if (attachment) {
            parts.push({
                inlineData: {
                    mimeType: attachment.mimeType,
                    data: attachment.data // Base64 string
                }
            });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: parts,
            config: { responseMimeType: "application/json" }
        });

        const jsonText = response.text || "{}";
        return JSON.parse(jsonText) as AIAnalysisResult;
    } catch (error) {
        console.error("AI Analysis Failed, falling back to mock:", error);
        return mockAnalysis();
    }
};

/**
 * 2. Jurisprudence Search (Simulated via AI Knowledge)
 * Since we don't have a real Court API yet, we ask the LLM to find relevant precedents from its training data.
 */
export const suggestJurisprudence = async (query: string): Promise<JurisprudenceSuggestion[]> => {
    const ai = getAiClient();
    if (!ai) return mockJurisprudence();

    const prompt = `
    Atue como um pesquisador jurídico brasileiro.
    Busque 3 julgados reais ou construídos com base em entendimento consolidado (STJ/STF) relevantes para: "${query}".
    
    Retorne APENAS um JSON (Array de objetos):
    [
      {
        "id": "unique_id",
        "title": "Tribunal/Número do Recurso",
        "court": "Sigla do Tribunal",
        "summary": "Ementa resumida/Tese fixada",
        "relevance": 95 (Número de 0 a 100)
      }
    ]
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]") as JurisprudenceSuggestion[];
    } catch (error) {
        console.error("Jurisprudence Search Failed:", error);
        return mockJurisprudence();
    }
};

/**
 * 3. RAG Chat with Firm Data
 */
export const chatWithLawFirmData = async (userMessage: string, history: ChatMessage[]): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Erro: API Key do Google Gemini não configurada.";

    try {
        // Collect Context
        const [clients, cases, finance, tasks] = await Promise.all([
            getClients(),
            getCases(),
            getTransactions(),
            getTasks()
        ]);

        const context = JSON.stringify({
            clients: clients.map(c => ({ name: c.name, id: c.id })),
            cases: cases.map(c => ({ title: c.title, status: c.status, value: c.value })),
            tasks: tasks.filter(t => t.status !== 'DONE').map(t => ({ title: t.title, deadline: t.dueDate })),
            finance_summary: {
                total_income: finance.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0),
                total_expense: finance.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0)
            }
        });

        const systemPrompt = `
      Você é o 'Law Agent', assistente deste escritório.
      Responda com base nestes dados reais do escritório: ${context}
      
      Seja cordial, breve e direto.
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `${systemPrompt}\n\nUser: ${userMessage}`
        });

        return response.text || "Sem resposta.";
    } catch (error) {
        console.error("Chat Error:", error);
        return "Desculpe, tive um erro ao processar sua pergunta.";
    }
};


// --- MOCKS (Fallback) ---
const mockAnalysis = (): AIAnalysisResult => ({
    summary: "[DEMO] A API Key não foi detectada. Análise simulada.",
    extractedMetadata: { caseNumber: "5000-00", value: 10000, court: "TJ-DEMO" },
    risks: [{ severity: 'medium', description: "Configure a VITE_GEMINI_API_KEY para análise real." }],
    clauses: [],
    recommendations: ["Adicionar chave de API no .env.local"],
    suggestedTasks: []
});

const mockJurisprudence = (): JurisprudenceSuggestion[] => ([
    { id: '1', title: 'Exemplo Mock (Sem API)', court: 'TJSC', summary: 'Configure a API para ver resultados reais.', relevance: 100 }
]);
