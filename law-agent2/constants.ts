
import { OABServiceItem, ServiceCategory, CalculationType } from './types';

export const BRAZIL_STATES = [
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PR', name: 'Paraná' },
  { code: 'RS', name: 'Rio Grande do Sul' },
];

/**
 * GLOSSÁRIO JURÍDICO
 * Definições para tooltips de ajuda na interface
 */
export const LEGAL_GLOSSARY: Record<string, string> = {
  'Monte-mor': 'Soma total dos bens e direitos deixados pelo falecido, antes de descontar dívidas ou dividir entre herdeiros.',
  'Proveito Econômico': 'O ganho financeiro real ou a economia que o cliente terá com o êxito da ação.',
  'Valor da Causa': 'Valor atribuído à ação judicial para fins processuais, fiscais e de alçada.',
  'Quinhão': 'A parte específica da herança ou patrimônio que cabe a cada herdeiro ou parte individualmente.',
  'Valor dos Bens': 'Avaliação de mercado atualizada dos bens envolvidos no litígio ou transação.',
  'Benefício Anual': 'Soma das 12 parcelas mensais do benefício previdenciário + 13º salário.',
  'Valor da Indenização': 'Montante total pleiteado a título de danos morais, materiais ou estéticos.',
  'Valor do Contrato': 'Valor total envolvido na transação comercial ou imobiliária.',
  'Valor do Crédito': 'Quantia exata que se pretende recuperar ou habilitar no processo.',
  'Valor da Arrematação': 'Preço pago pelo bem em leilão ou hasta pública.',
  'Honorários de Êxito': 'Também chamados de "Ad Exitum". Valor pago apenas se a ação for vencida.',
  'Entrada': 'Valor pago no início do contrato (Pro-labore) para cobrir custos iniciais e estudo do caso.'
};

/**
 * BANCO DE DADOS EM MEMÓRIA (MOCK)
 * Mantido para referência de tipagem, mas o app usa o feeService.ts
 */
export const MOCK_OAB_DATA: OABServiceItem[] = [];
