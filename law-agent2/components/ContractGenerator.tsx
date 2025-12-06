
import React from 'react';
import { X, Printer, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { ContractDocument } from './ContractDocument';
import { ClientData, OABServiceItem, CalculationResult, UserSettings } from '../types';

interface ContractGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    serviceEntry: OABServiceItem;
    clientData: ClientData;
    calculationResult: CalculationResult;
    lawyerSettings?: UserSettings;
  } | null;
}

export const ContractGenerator: React.FC<ContractGeneratorProps> = ({ isOpen, onClose, data }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    const contractElement = document.getElementById('contract-content');
    if (!contractElement) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Contrato de Honorários</title>
            <style>
              @page {
                margin: 15mm;
                size: A4;
              }
              * {
                color: #000 !important;
                background-color: transparent !important;
              }
              html, body { 
                font-family: 'Times New Roman', Georgia, serif; 
                padding: 20px; 
                max-width: 210mm; 
                margin: 0 auto;
                color: #000 !important;
                background-color: #fff !important;
                line-height: 1.6;
              }
              @media print { 
                body { padding: 0; margin: 0; }
                @page { margin: 15mm; }
              }
              h1, h2, h3, p, span, div, strong { color: #000 !important; }
              .font-bold, strong { font-weight: bold; }
              .text-center { text-align: center; }
              .text-justify { text-align: justify; }
              .uppercase { text-transform: uppercase; }
              .underline { text-decoration: underline; }
              .italic { font-style: italic; }
              .mb-2 { margin-bottom: 0.5rem; }
              .mb-6 { margin-bottom: 1.5rem; }
              .mb-8 { margin-bottom: 2rem; }
              .mt-8 { margin-top: 2rem; }
              .mt-16 { margin-top: 4rem; }
              .ml-4 { margin-left: 1rem; }
              .ml-5 { margin-left: 1.25rem; }
              .p-2 { padding: 0.5rem; }
              .p-3 { padding: 0.75rem; }
              .pb-4 { padding-bottom: 1rem; }
              .pt-2 { padding-top: 0.5rem; }
              .text-xl { font-size: 1.25rem; }
              .text-lg { font-size: 1.125rem; }
              .text-base { font-size: 1rem; }
              .text-sm { font-size: 0.875rem; }
              .text-xs { font-size: 0.75rem; }
              .border-b-2 { border-bottom: 2px solid #000; }
              .border-t { border-top: 1px solid #000; }
              .border-l-4 { border-left: 4px solid #000; }
              .border { border: 1px solid #ccc; }
              .bg-gray-50 { background-color: #f9fafb !important; }
              .text-gray-600 { color: #4b5563 !important; }
              .text-gray-500 { color: #6b7280 !important; }
              .text-gray-400 { color: #9ca3af !important; }
              .list-disc { list-style-type: disc; }
              .space-y-1 > * + * { margin-top: 0.25rem; }
              .grid { display: grid; }
              .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
              .gap-12 { gap: 3rem; }
            </style>
          </head>
          <body>
            ${contractElement.innerHTML}
            <script>window.print();window.onafterprint=function(){window.close();}</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleCopy = () => {
    const contractElement = document.getElementById('contract-content');
    if (contractElement) {
      navigator.clipboard.writeText(contractElement.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static contract-print-safe">
      <div className="contract-print-safe bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col print:shadow-none print:w-full print:max-w-none print:h-auto print:rounded-none">

        {/* Header (Hidden on Print) */}
        <div className="contract-print-safe flex justify-between items-center p-4 border-b border-slate-200 print:hidden">
          <h2 className="contract-print-safe text-lg font-bold text-slate-800 flex items-center gap-2">
            Minuta de Contrato
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Printer size={18} /> Imprimir / Salvar PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Document Preview */}
        <div id="contract-content" className="contract-print-safe overflow-y-auto flex-1 bg-slate-100 p-4 print:p-0 print:bg-white print:overflow-visible">
          <ContractDocument
            clientData={data.clientData}
            serviceEntry={data.serviceEntry}
            calculationResult={data.calculationResult}
            lawyerName={data.lawyerSettings?.lawyerName}
            lawyerOAB={data.lawyerSettings?.oabNumber}
            officeAddress={data.lawyerSettings?.officeAddress}
          />
        </div>
      </div>
    </div>
  );
};
