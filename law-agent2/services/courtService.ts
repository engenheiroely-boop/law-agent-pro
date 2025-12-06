
export interface Movement {
    date: string;
    description: string;
    type: 'DECISION' | 'dispatch' | 'hearing' | 'filing' | 'publication' | 'other';
}

export interface Lawsuit {
    id: string;
    number: string;
    court: string; // e.g., "TJSC", "TRF4"
    status: 'active' | 'archived' | 'suspended';
    parties: {
        plaintiff: string;
        defendant: string;
    };
    lastUpdate: string;
    movements: Movement[];
}

// Dados simulados (Mock Data)
const MOCK_LAWSUITS: Lawsuit[] = [
    {
        id: '1',
        number: '5001234-56.2024.8.24.0023',
        court: 'TJSC',
        status: 'active',
        parties: {
            plaintiff: 'Silva & Silva Ltda',
            defendant: 'Banco Exemplo S.A.',
        },
        lastUpdate: '2024-05-15',
        movements: [
            {
                date: '2024-05-15',
                description: 'Expedição de Alvará',
                type: 'dispatch',
            },
            {
                date: '2024-05-10',
                description: 'Juntada de Petição de Cumprimento de Sentença',
                type: 'filing',
            },
            {
                date: '2024-04-20',
                description: 'Trânsito em Julgado',
                type: 'DECISION',
            },
            {
                date: '2024-03-01',
                description: 'Sentença Julgada Procedente',
                type: 'DECISION',
            }
        ],
    },
    {
        id: '2',
        number: '0004321-87.2023.8.24.0064',
        court: 'TJSC',
        status: 'suspended',
        parties: {
            plaintiff: 'Maria da Silva',
            defendant: 'Condomínio Solar',
        },
        lastUpdate: '2023-11-20',
        movements: [
            {
                date: '2023-11-20',
                description: 'Suspensão do Processo por Prazo Indeterminado',
                type: 'dispatch',
            },
            {
                date: '2023-10-05',
                description: 'Audiência de Conciliação Infrutífera',
                type: 'hearing',
            },
        ],
    },
    {
        id: '3',
        number: '5012345-67.2024.4.04.7200',
        court: 'TRF4',
        status: 'active',
        parties: {
            plaintiff: 'João Pereira',
            defendant: 'INSS - Instituto Nacional do Seguro Social',
        },
        lastUpdate: '2024-05-18',
        movements: [
            {
                date: '2024-05-18',
                description: 'Conclusos para Despacho/Decisão',
                type: 'other',
            },
            {
                date: '2024-05-01',
                description: 'Contestação Apresentada',
                type: 'filing',
            },
        ],
    },
];

export const searchLawsuits = async (query: string): Promise<Lawsuit[]> => {
    // Simula delay de rede
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!query) return MOCK_LAWSUITS;

    const lowerQuery = query.toLowerCase();
    return MOCK_LAWSUITS.filter(
        (lawsuit) =>
            lawsuit.number.includes(query) ||
            lawsuit.parties.plaintiff.toLowerCase().includes(lowerQuery) ||
            lawsuit.parties.defendant.toLowerCase().includes(lowerQuery)
    );
};

export const getLawsuitById = async (id: string): Promise<Lawsuit | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_LAWSUITS.find(l => l.id === id);
}
