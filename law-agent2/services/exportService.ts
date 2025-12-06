/**
 * CSV Export Utility
 * Provides functions to export data to CSV format
 */

export interface ExportColumn {
    header: string;
    field: string;
    transform?: (value: any) => string;
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: any[], columns: ExportColumn[]): string {
    if (data.length === 0) return '';

    // Headers
    const headers = columns.map(col => col.header).join(',');

    // Rows
    const rows = data.map(item => {
        return columns.map(col => {
            let value = item[col.field];

            // Apply transform if exists
            if (col.transform) {
                value = col.transform(value);
            }

            // Handle nulls and undefined
            if (value === null || value === undefined) {
                value = '';
            }

            // Escape commas and quotes
            value = String(value);
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                value = `"${value.replace(/"/g, '""')}"`;
            }

            return value;
        }).join(',');
    });

    return [headers, ...rows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string) {
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel UTF-8
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export clients to CSV
 */
export function exportClientsToCSV(clients: any[]) {
    const columns: ExportColumn[] = [
        { header: 'Nome', field: 'name' },
        { header: 'Email', field: 'email' },
        { header: 'Telefone', field: 'phone' },
        { header: 'CPF/CNPJ', field: 'cpf' },
        { header: 'Endereço', field: 'address' },
        { header: 'Data Cadastro', field: 'createdAt', transform: (val) => val ? new Date(val).toLocaleDateString('pt-BR') : '' }
    ];

    const csv = arrayToCSV(clients, columns);
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `clientes_${date}.csv`);
}

/**
 * Export cases to CSV
 */
export function exportCasesToCSV(cases: any[], clientsMap: Record<string, string>) {
    const columns: ExportColumn[] = [
        { header: 'Título', field: 'title' },
        { header: 'Cliente', field: 'clientId', transform: (id) => clientsMap[id] || 'Desconhecido' },
        { header: 'CNJ', field: 'cnjNumber' },
        { header: 'Área', field: 'area' },
        { header: 'Estado', field: 'state' },
        { header: 'Status', field: 'status' },
        { header: 'Valor Causa', field: 'value', transform: (val) => val ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00' },
        { header: 'Tribunal', field: 'court' },
        { header: 'Ano', field: 'year' }
    ];

    const csv = arrayToCSV(cases, columns);
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `processos_${date}.csv`);
}

/**
 * Export financial transactions to CSV
 */
export function exportTransactionsToCSV(transactions: any[], clientsMap: Record<string, string>) {
    const columns: ExportColumn[] = [
        { header: 'Descrição', field: 'description' },
        { header: 'Cliente', field: 'clientId', transform: (id) => clientsMap[id] || 'Avulso' },
        { header: 'Valor', field: 'amount', transform: (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
        { header: 'Vencimento', field: 'dueDate', transform: (val) => new Date(val).toLocaleDateString('pt-BR') },
        { header: 'Status', field: 'status', transform: (val) => val === 'PAID' ? 'PAGO' : val === 'PENDING' ? 'PENDENTE' : 'VENCIDO' },
        { header: 'Tipo', field: 'type', transform: (val) => val === 'INCOME' ? 'RECEITA' : 'DESPESA' }
    ];

    const csv = arrayToCSV(transactions, columns);
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `financeiro_${date}.csv`);
}

/**
 * Export proposals to CSV
 */
export function exportProposalsToCSV(proposals: any[]) {
    const columns: ExportColumn[] = [
        { header: 'Cliente', field: 'clientName' },
        { header: 'Serviço', field: 'serviceDescription' },
        { header: 'Valor Total', field: 'totalValue', transform: (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
        { header: 'Entrada', field: 'paymentTerms', transform: (terms) => terms?.entryAmount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00' },
        { header: 'Parcelas', field: 'paymentTerms', transform: (terms) => `${terms?.installments || 0}x` },
        { header: 'Status', field: 'status' },
        { header: 'Data', field: 'createdAt', transform: (val) => new Date(val).toLocaleDateString('pt-BR') }
    ];

    const csv = arrayToCSV(proposals, columns);
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `propostas_${date}.csv`);
}
