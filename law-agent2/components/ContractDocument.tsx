
import React from 'react';
import { ClientData, OABServiceItem, CalculationResult } from '../types';
import { formatCurrency } from '../services/feeEngine';

interface ContractDocumentProps {
  lawyerName?: string;
  lawyerOAB?: string;
  officeAddress?: string;
  clientData: ClientData;
  serviceEntry: OABServiceItem;
  calculationResult: CalculationResult;
}

export const ContractDocument: React.FC<ContractDocumentProps> = ({
  lawyerName = "DR. ADVOGADO",
  lawyerOAB = "OAB/SC 00.000",
  officeAddress = "__________________________________________",
  clientData,
  serviceEntry,
  calculationResult
}) => {
  const { paymentTerms } = clientData;
  const total = paymentTerms?.finalTotal || calculationResult.totalFee;
  const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div
      className="contract-print-safe bg-white mx-auto shadow-2xl my-8 print:shadow-none print:my-0 font-serif text-sm leading-relaxed"
      style={{
        color: '#000',
        backgroundColor: '#fff',
        width: '210mm',
        minHeight: '297mm',
        padding: '25mm',
        boxSizing: 'border-box'
      }}
    >

      {/* CABEÇALHO */}
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-xl font-bold uppercase">{lawyerName}</h1>
        <p className="text-xs text-gray-600">Advocacia e Consultoria Jurídica</p>
        <p className="text-xs text-gray-600">{lawyerOAB}</p>
      </div>

      <h2 className="text-lg font-bold text-center mb-6 uppercase underline">Contrato de Honorários Advocatícios</h2>

      {/* 1. PARTES */}
      <div className="mb-6">
        <h3 className="font-bold text-base mb-2">1. DAS PARTES</h3>
        <p className="text-justify mb-2">
          <strong>CONTRATANTE:</strong> <strong>{clientData.name.toUpperCase()}</strong>,
          portador(a) do documento {clientData.document || clientData.inputs['document'] || '_________________'},
          residente e domiciliado(a) em {clientData.address ? `${clientData.address.street}, ${clientData.address.number}, ${clientData.address.city}/${clientData.address.state}` : '__________________________________________'}.
        </p>
        <p className="text-justify">
          <strong>CONTRATADO:</strong> <strong>{lawyerName}</strong>, inscrito na {lawyerOAB},
          com escritório profissional em {officeAddress || '__________________________________________'}.
        </p>
      </div>

      {/* 2. OBJETO */}
      <div className="mb-6">
        <h3 className="font-bold text-base mb-2">2. DO OBJETO</h3>
        <p className="text-justify">
          O presente contrato tem como objeto a prestação de serviços advocatícios para defesa dos interesses do(a)
          CONTRATANTE na seguinte demanda:
        </p>
        <div className="bg-gray-50 border border-gray-200 p-3 my-2 italic">
          {serviceEntry.description} ({serviceEntry.subCategory} - {serviceEntry.category})
        </div>
        <p className="text-justify text-xs text-gray-500">
          Inclui todas as diligências necessárias em primeira instância. Recursos para tribunais superiores ou incidentes processuais não previstos serão objeto de novo ajuste.
        </p>
      </div>

      {/* 3. HONORÁRIOS */}
      <div className="mb-6">
        <h3 className="font-bold text-base mb-2">3. DOS HONORÁRIOS</h3>
        <p className="text-justify mb-2">
          Pelos serviços prestados, o(a) CONTRATANTE pagará ao CONTRATADO o valor total líquido de
          <strong> {formatCurrency(total)}</strong>.
        </p>

        {paymentTerms && (
          <div className="ml-4 mb-2">
            <p><strong>Forma de Pagamento:</strong></p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              {Math.abs(paymentTerms.entryAmount - total) < 0.01 ? (
                <li>
                  Valor à Vista: <strong>{formatCurrency(total)}</strong> (pagável na assinatura deste instrumento).
                </li>
              ) : (
                <>
                  <li>
                    Entrada/Sinal: <strong>{formatCurrency(paymentTerms.entryAmount)}</strong>
                    {paymentTerms.entryAmount > 0 ? ' (pagável na assinatura deste instrumento).' : '.'}
                  </li>
                  {paymentTerms.installments > 0 && (
                    <li>
                      Saldo Restante: <strong>{paymentTerms.installments} parcelas mensais</strong> de
                      <strong> {formatCurrency(paymentTerms.installmentAmount)}</strong>.
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
        )}

        {paymentTerms?.riskPercentage ? (
          <div className="mt-3 bg-gray-50 p-2 border-l-4 border-black">
            <p className="text-justify">
              <strong>3.1. CLÁUSULA AD EXITUM:</strong> Além do valor fixo acima, o(a) CONTRATANTE pagará,
              a título de honorários de êxito, o percentual de <strong>{paymentTerms.riskPercentage}%</strong>
              sobre o proveito econômico efetivo da causa ao final do processo.
            </p>
            {paymentTerms.deductFromRisk && (
              <p className="text-justify mt-1 text-xs">
                * As partes ajustam que os valores pagos a título de honorários iniciais (Cláusula 3)
                <strong> SERÃO DEDUZIDOS</strong> do montante final devido a título de êxito.
              </p>
            )}
          </div>
        ) : null}
      </div>

      {/* 4. OBRIGAÇÕES e FORO */}
      <div className="mb-8">
        <p className="text-justify mb-2">
          <strong>4. DAS DESPESAS:</strong> Todas as despesas processuais, custas, emolumentos e peritos correrão por conta exclusiva do(a) CONTRATANTE.
        </p>
        <p className="text-justify">
          <strong>5. DO FORO:</strong> As partes elegem o foro da comarca de {clientData.address?.city && clientData.address?.state ? `${clientData.address.city}/${clientData.address.state}` : '__________________'} para dirimir quaisquer dúvidas.
        </p>
      </div>

      {/* ASSINATURAS */}
      <div className="mt-16 grid grid-cols-2 gap-12 text-center">
        <div className="border-t border-black pt-2">
          <p className="font-bold">{clientData.name}</p>
          <p className="text-xs">Contratante</p>
        </div>
        <div className="border-t border-black pt-2">
          <p className="font-bold">{lawyerName}</p>
          <p className="text-xs">Contratado</p>
        </div>
      </div>

      <div className="mt-8 text-center text-sm" style={{ color: '#1e293b' }}>
        <span contentEditable suppressContentEditableWarning style={{ borderBottom: '1px solid #000', padding: '0 4px' }}>
          {clientData.address?.city || '_______________________'}
        </span>
        , {today}.
      </div>

    </div>
  );
};
