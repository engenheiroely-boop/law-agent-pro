
import { CompanyData } from '../types';

// Simulação de um banco de dados da Receita Federal
const MOCK_COMPANIES: Record<string, CompanyData> = {
  '12345678000199': {
    name: 'LINCE TECNOLOGIA LTDA',
    fantasyName: 'Lince Tech',
    address: { street: 'Av. Paulista', number: '1000', city: 'São Paulo', state: 'SP' },
    phone: '(11) 99999-0000'
  },
  '33000167000101': {
    name: 'PETROLEO BRASILEIRO S.A. PETROBRAS',
    fantasyName: 'Petrobras',
    address: { street: 'Av. República do Chile', number: '65', city: 'Rio de Janeiro', state: 'RJ' },
    phone: '(21) 3224-4477'
  }
};

// Simula uma chamada de API para buscar dados de empresa pelo CNPJ
export const fetchCompanyData = async (cnpj: string): Promise<CompanyData | null> => {
  const cleanCnpj = cnpj.replace(/\D/g, '');
  
  // Simulating network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (MOCK_COMPANIES[cleanCnpj]) {
    return MOCK_COMPANIES[cleanCnpj];
  }

  // Se não achar no mock específico, retorna um genérico se for um CNPJ válido (14 dígitos)
  if (cleanCnpj.length === 14) {
    return {
      name: 'EMPRESA MODELO S.A.',
      address: { street: 'Rua do Comércio', number: '123', city: 'Florianópolis', state: 'SC' },
      phone: '(48) 3333-3333'
    };
  }

  return null;
};

/**
 * Analisa um número CNJ (Numeração Única) e extrai metadados.
 * Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
 */
export const parseCNJ = (cnj: string) => {
  const clean = cnj.replace(/\D/g, '');
  
  if (clean.length !== 20) return null;

  const year = parseInt(clean.substring(9, 13));
  const judiciary = parseInt(clean.substring(13, 14));
  const tribunal = parseInt(clean.substring(14, 16));
  
  let courtName = '';
  let state = '';

  // Lógica simplificada de Tribunais
  if (judiciary === 8) { // Justiça Estadual
    courtName = `TJ${getTribunalState(tribunal)}`;
    state = getTribunalState(tribunal);
  } else if (judiciary === 5) { // Justiça Federal
    courtName = `TRF-${tribunal}`;
    state = 'Federal';
  } else if (judiciary === 4) { // Justiça do Trabalho
    courtName = `TRT-${tribunal}`;
    state = 'Trabalhista';
  }

  return {
    year,
    court: courtName,
    state,
    valid: true
  };
};

const getTribunalState = (code: number): string => {
  const map: Record<number, string> = {
    24: 'SC', 12: 'MS', 26: 'SP', 19: 'RJ', 13: 'MG', 16: 'PR', 21: 'RS'
  };
  return map[code] || 'BR';
};
