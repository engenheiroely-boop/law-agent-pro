# Law Agent - Módulo de Cálculo de Honorários

Este projeto é a primeira fase do **Law Agent**, uma plataforma de backoffice inteligente para advogados.

## 📋 Escopo da Fase 1
Implementação do cálculo de honorários baseado na tabela da OAB (foco inicial em SC), suportando serviços judiciais e extrajudiciais, com integração de IA para geração de propostas e consulta de dúvidas.

## 🏗 Arquitetura Conceitual

Embora este MVP seja um SPA (Single Page Application) rodando majoritariamente no cliente, a arquitetura planejada para a versão completa (SaaS) é:

### Backend (Node.js/NestJS)
1.  **FeeController**: Endpoints para consulta de tabelas (`GET /fees/table/:state`) e registro de cálculos (`POST /calculations`).
2.  **FeeService**: Regras de negócio complexas, versionamento de tabelas anuais da OAB.
3.  **AIService**: Wrapper seguro para a API Gemini, injetando contexto jurídico nos prompts.
4.  **Database (PostgreSQL)**:
    *   `fee_tables` (id, state, year, data_json)
    *   `calculations` (id, user_id, input_params, result_value, created_at)
    *   `proposals` (id, calculation_id, draft_text)

### Frontend (React)
1.  **State Management**: Context API ou Zustand para gerenciar o estado global do "Wizard" de cálculo.
2.  **Components**: Biblioteca de componentes UI reutilizáveis (Botões, Cards, Inputs) com Tailwind.
3.  **Services**: Camada de abstração para chamadas API (no MVP, usamos dados mockados em `constants.ts`).

## 🚀 Plano de Implementação (Executado neste código)

1.  **Estrutura Base**: Configuração do React + TypeScript + Tailwind.
2.  **Modelagem de Dados**: Definição das interfaces TypeScript (`OABFeeEntry`) que espelham a realidade jurídica.
3.  **Motor de Cálculo**: Lógica no frontend que processa valores mínimos vs. percentuais de risco.
4.  **Integração IA**: Uso do Google GenAI SDK (Gemini 2.5) para:
    *   Gerar minutas de proposta baseadas no valor calculado.
    *   Tirar dúvidas sobre regras da tabela (Chat).
5.  **UX/UI**: Interface "Wizard" (passo-a-passo) para facilitar a entrada de dados pelo advogado.

## 🔑 Configuração
Para testar as funcionalidades de IA, certifique-se de que a variável de ambiente `API_KEY` esteja configurada com uma chave válida da API Gemini.
