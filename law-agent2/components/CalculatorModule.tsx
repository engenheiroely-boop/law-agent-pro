
import React, { useState, useEffect, useRef } from 'react';
import { Search, Calculator, FileText, CheckCircle, AlertTriangle, Wand2, Save, Printer, DollarSign, ChevronDown, ChevronRight, ArrowLeft, Lock, Info, Share2 } from 'lucide-react';
import { OABServiceItem, CalculationResult, CalculationInputs, PaymentTerms, AppRoute, ServiceCategory, Client, CalculationType } from '../types';
import { loadFeesForState, getServicesByStateAreaAndSpecialty, getAvailableCategoriesByState, getSpecialtiesByStateAndArea, getSupportedStates } from '../services/feeService';
import { calculateFee, formatCurrency } from '../services/feeEngine';
import { generateProposalDraft } from '../services/geminiService';
import { getClients } from '../services/clientService';
import { createProposal } from '../services/proposalService';
import { generateFinancialsFromProposal } from '../services/financialService';
import { getSettings } from '../services/settingsService';
import { ContractGenerator } from './ContractGenerator';
import { LoadingState, EmptyState } from './ui/States';
import { Tooltip } from './ui/Tooltip'; // Importar Tooltip
import { LEGAL_GLOSSARY } from '../constants'; // Importar Glossário
import { ClientData } from '../types';

// --- Componente Interno: Currency Input (Máscara R$) ---
const CurrencyInputField = ({ value, onChange }: { value: number | undefined, onChange: (val: number) => void }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numberValue = rawValue ? parseInt(rawValue, 10) / 100 : 0;
    onChange(numberValue);
  };

  const displayValue = value
    ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '';

  return (
    <div className="relative">
      <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-medium">R$</span>
      <input
        type="text"
        className="w-full pl-10 p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent/20 outline-none font-mono text-slate-700"
        placeholder="0,00"
        value={displayValue}
        onChange={handleChange}
      />
    </div>
  );
};

interface CalculatorModuleProps {
  initialParams?: any;
  onNavigate?: (route: AppRoute) => void;
}

export const CalculatorModule: React.FC<CalculatorModuleProps> = ({ initialParams, onNavigate }) => {
  // State: Navigation & Data
  const [currentState, setCurrentState] = useState('SC');
  const [currentCategory, setCurrentCategory] = useState<ServiceCategory | ''>('');
  const [currentSpecialty, setCurrentSpecialty] = useState('');
  const [services, setServices] = useState<OABServiceItem[]>([]);

  // State: Selection & Search
  const [selectedEntry, setSelectedEntry] = useState<OABServiceItem | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState<OABServiceItem[]>([]);

  // State: Client
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [customClientName, setCustomClientName] = useState('');

  // State: Calculation
  const [inputs, setInputs] = useState<CalculationInputs>({});
  const [result, setResult] = useState<CalculationResult | null>(null);

  // State: Payment Terms & Negotiation
  const [isDiscountActive, setIsDiscountActive] = useState(false);
  const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENTAGE'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(0);
  const [deductFromRisk, setDeductFromRisk] = useState(false);
  const [isCashPayment, setIsCashPayment] = useState(false); // Novo estado: À Vista

  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>({
    entryType: 'FIXED',
    entryValue: 0,
    entryAmount: 0,
    installments: 1,
    installmentAmount: 0,
    riskPercentage: 0,
    riskBasis: 0,
    deductFromRisk: false,
    discountType: 'PERCENTAGE',
    discountValue: 0,
    finalTotal: 0
  });

  // State: Proposal & Actions
  const [proposal, setProposal] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);

  // Lists for steps
  const availableCategories = getAvailableCategoriesByState(currentState);
  const availableSpecialties = React.useMemo(() =>
    currentCategory ? getSpecialtiesByStateAndArea(currentState, currentCategory as ServiceCategory) : [],
    [currentState, currentCategory]);

  // Load Initial Data
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadFeesForState(currentState);
      const clientsData = await getClients();
      setClients(clientsData);
      setLoading(false);

      if (initialParams) {
        if (initialParams.state) setCurrentState(initialParams.state);
        if (initialParams.clientName) setCustomClientName(initialParams.clientName);
        if (initialParams.category) {
          setCurrentCategory(initialParams.category);
          setStep(3); // Go to Specialties
        }
      }
    };
    init();
  }, [currentState, initialParams]);

  // Filter Services
  useEffect(() => {
    if (currentCategory && currentSpecialty) {
      const all = getServicesByStateAreaAndSpecialty(currentState, currentCategory as ServiceCategory, currentSpecialty);

      const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const query = normalize(searchQuery);

      const filtered = all.filter(s =>
        normalize(s.description).includes(query) ||
        (s.tableCode && normalize(s.tableCode).includes(query))
      ).sort((a, b) => a.description.localeCompare(b.description));

      setFilteredServices(filtered);
    }
  }, [currentState, currentCategory, currentSpecialty, searchQuery]);

  // Logic: Final Total Calculation
  const calculateFinalTotal = (baseTotal: number) => {
    if (!isDiscountActive) return baseTotal;

    let discountAmount = 0;
    if (discountType === 'PERCENTAGE') {
      discountAmount = (baseTotal * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }
    return Math.max(0, baseTotal - discountAmount);
  };

  // Effect: Handle Cash Payment Toggle logic
  useEffect(() => {
    if (isCashPayment) {
      setPaymentTerms(prev => ({
        ...prev,
        entryType: 'PERCENTAGE',
        entryValue: 100,
        installments: 1
      }));
    } else if (paymentTerms.entryValue === 100 && paymentTerms.entryType === 'PERCENTAGE') {
      // Reset to default if untoggling from 100%
      setPaymentTerms(prev => ({
        ...prev,
        entryValue: 30
      }));
    }
  }, [isCashPayment]);


  // Effect: Update Payment Terms when Negotiation changes
  useEffect(() => {
    if (result) {
      const finalTotal = calculateFinalTotal(result.totalFee);

      // Recalculate Entry
      let entryAmt = paymentTerms.entryAmount;
      if (paymentTerms.entryType === 'PERCENTAGE') {
        entryAmt = (finalTotal * paymentTerms.entryValue) / 100;
      } else {
        // If fixed, ensure it doesn't exceed total
        entryAmt = Math.min(paymentTerms.entryValue, finalTotal);
      }

      // Recalculate Installments
      const remainder = Math.max(0, finalTotal - entryAmt);

      // Regra de Negócio: Parcela Mínima de R$ 200,00
      const MIN_INSTALLMENT_VALUE = 200;
      const maxPossibleInstallments = remainder > 0 ? Math.floor(remainder / MIN_INSTALLMENT_VALUE) : 1;
      const allowedInstallments = Math.min(24, Math.max(1, maxPossibleInstallments));

      // Adjust current installments if it exceeds allowed
      let currentInstallments = isCashPayment ? 1 : paymentTerms.installments;
      if (currentInstallments > allowedInstallments && !isCashPayment) {
        currentInstallments = allowedInstallments;
      }

      const instAmt = currentInstallments > 0 ? remainder / currentInstallments : 0;

      setPaymentTerms(prev => ({
        ...prev,
        finalTotal,
        entryAmount: entryAmt,
        installments: currentInstallments,
        installmentAmount: instAmt,
        discountType: isDiscountActive ? discountType : undefined,
        discountValue: isDiscountActive ? discountValue : 0,
        deductFromRisk
      }));
    }
  }, [result, isDiscountActive, discountType, discountValue, paymentTerms.entryType, paymentTerms.entryValue, deductFromRisk, isCashPayment, paymentTerms.installments]);

  // Handlers
  const handleSelectService = (service: OABServiceItem) => {
    setSelectedEntry(service);
    setStep(5);
    setInputs({});
  };

  const handleCalculate = () => {
    if (!selectedEntry) return;
    const res = calculateFee(selectedEntry, inputs);
    setResult(res);

    // Reset Payment Terms on new calculation
    setPaymentTerms({
      entryType: 'PERCENTAGE',
      entryValue: 30, // Default 30% entry
      entryAmount: (res.totalFee * 30) / 100,
      installments: 1,
      installmentAmount: (res.totalFee * 70) / 100,
      riskPercentage: 0,
      riskBasis: inputs.benefitValue || inputs.caseValue || inputs.estateValue || 0,
      deductFromRisk: false,
      finalTotal: res.totalFee
    });
    setIsCashPayment(false); // Reset cash payment

    setStep(6);
  };

  const getSelectedClientName = () => {
    if (selectedClientId) {
      return clients.find(c => c.id === selectedClientId)?.name || customClientName || 'Cliente';
    }
    return customClientName || 'Cliente';
  };

  const handleGenerateAi = async () => {
    if (!selectedEntry || !result) return;
    setGeneratingAi(true);

    const clientData = {
      name: getSelectedClientName(),
      inputs: inputs,
      paymentTerms: paymentTerms
    };

    const draft = await generateProposalDraft(selectedEntry, clientData, paymentTerms.finalTotal || result.totalFee);
    setProposal(draft);
    setGeneratingAi(false);
  };

  const handleSaveProposal = async () => {
    if (!selectedEntry || !result) return;
    const name = getSelectedClientName();

    if (!name) {
      alert("Identifique o cliente antes de salvar.");
      return;
    }

    setIsSaving(true);
    try {
      const newProposal = await createProposal({
        clientId: selectedClientId || 'avulso',
        clientName: name,
        serviceId: selectedEntry.id,
        serviceDescription: selectedEntry.description,
        totalValue: paymentTerms.finalTotal || result.totalFee,
        calculationDetails: result,
        paymentTerms: paymentTerms,
        aiProposalText: proposal
      });

      await generateFinancialsFromProposal(newProposal);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar proposta.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleWhatsApp = () => {
    if (!result) return;
    const total = formatCurrency(paymentTerms.finalTotal || result.totalFee);
    const entry = formatCurrency(paymentTerms.entryAmount);
    const text = `Olá, segue resumo da proposta de honorários para *${selectedEntry?.description}*:%0A%0A*Investimento:* ${total}%0A*Entrada:* ${entry}%0A*Saldo:* ${paymentTerms.installments}x de ${formatCurrency(paymentTerms.installmentAmount)}%0A%0ADúvidas à disposição.`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // --- RENDERS ---

  const renderStep1_State = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">1. Onde será prestado o serviço?</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {getSupportedStates().map(uf => (
          <button
            key={uf}
            onClick={() => { setCurrentState(uf); setStep(2); }}
            className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 hover:shadow-md
              ${currentState === uf ? 'border-accent bg-sky-50' : 'border-slate-100 bg-white hover:border-sky-200'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentState === uf ? 'bg-accent text-white' : 'bg-slate-100 text-slate-400'}`}>
              <span className="font-bold">{uf}</span>
            </div>
            <span className="font-medium text-slate-700">
              {uf === 'SC' ? 'Santa Catarina' : uf === 'SP' ? 'São Paulo' : uf === 'RS' ? 'Rio Grande do Sul' : uf === 'MS' ? 'Mato Grosso do Sul' : uf}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2_Category = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <button onClick={() => setStep(1)} className="text-sm text-slate-500 hover:text-accent flex items-center gap-1 mb-6">
        &larr; Voltar para Estado
      </button>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">2. Qual a área de atuação?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {availableCategories.map(cat => (
          <button
            key={cat}
            onClick={() => { setCurrentCategory(cat); setStep(3); }}
            className="p-6 rounded-xl border border-slate-200 bg-white hover:border-accent hover:shadow-md transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-500 group-hover:bg-sky-50 group-hover:text-accent flex items-center justify-center mb-4 transition-colors">
              {cat === 'Consultivo' ? <FileText /> : cat === 'Contencioso' ? <Calculator /> : cat === 'Extrajudicial' ? <Wand2 /> : <FileText />}
            </div>
            <h3 className="font-bold text-slate-800 text-lg">{cat}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {cat === 'Consultivo' ? 'Pareceres e Consultas' :
                cat === 'Contencioso' ? 'Judicial e Processos' :
                  cat === 'Extrajudicial' ? 'Cartórios e Adm.' : 'Órgãos Públicos'}
            </p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3_Specialty = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <button onClick={() => setStep(2)} className="text-sm text-slate-500 hover:text-accent flex items-center gap-1 mb-6">
        &larr; Voltar para Área
      </button>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">3. Qual a especialidade?</h2>
      <p className="text-slate-500 mb-6">Selecione o capítulo da tabela.</p>

      {availableSpecialties.length === 0 ? (
        <EmptyState title="Sem especialidades" description="Tente mudar a categoria ou o estado." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableSpecialties.map((spec) => (
            <button
              key={spec}
              onClick={() => { setCurrentSpecialty(spec); setStep(4); setSearchQuery(''); }}
              className="text-left px-5 py-4 bg-white border border-slate-200 rounded-lg hover:border-accent hover:bg-slate-50 transition-all font-medium text-slate-700 flex justify-between items-center group"
            >
              <span className="line-clamp-1">{spec}</span>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-accent shrink-0 ml-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep4_Services = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <button onClick={() => setStep(3)} className="text-sm text-slate-500 hover:text-accent flex items-center gap-1 mb-6">
        &larr; Voltar para Especialidades
      </button>

      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">4. Selecione o serviço</h2>
          <p className="text-slate-500 text-sm mt-1">{currentCategory} &gt; {currentSpecialty}</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar serviço..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-accent outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredServices.map(service => (
          <button
            key={service.id}
            onClick={() => handleSelectService(service)}
            className="w-full text-left p-5 rounded-xl border border-slate-200 bg-white hover:border-accent hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="inline-block bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded mb-2">
                  {service.tableCode}
                </span>
                <h3 className="font-semibold text-slate-800 text-lg group-hover:text-accent mb-1">
                  {service.description}
                </h3>

                {/* Explicação Visual da Regra */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1.5 bg-sky-50 text-sky-700 px-2.5 py-1 rounded-md text-xs font-medium border border-sky-100">
                    <Info size={12} />
                    {service.rule.description || (service.rule.type === 'FIXED' ? 'Valor Fixo' : `${service.rule.percentage}% sobre o valor`)}
                  </div>
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-accent mt-2" />
            </div>
          </button>
        ))}
        {filteredServices.length === 0 && (
          <EmptyState title="Nenhum serviço encontrado" description={`Não achamos nada para "${searchQuery}".`} icon={Search} />
        )}
      </div>
    </div>
  );

  const renderStep5_Params = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 max-w-2xl mx-auto">
      <button onClick={() => setStep(4)} className="text-sm text-slate-500 hover:text-accent flex items-center gap-1 mb-6">
        &larr; Voltar para Serviços
      </button>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-lg">
        <div className="mb-8 text-center">
          <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            {selectedEntry?.tableCode}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-4 mb-2">{selectedEntry?.description}</h2>
          <p className="text-slate-500 text-sm">{selectedEntry?.rule.description}</p>
        </div>

        <div className="space-y-6">
          {selectedEntry?.requiredInputs.map(req => (
            <div key={req.fieldKey}>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                {req.label}
                {req.required && <span className="text-red-500 ml-1">*</span>}
                {/* Tooltip Integration */}
                {LEGAL_GLOSSARY[req.label] && <Tooltip text={LEGAL_GLOSSARY[req.label]} />}
              </label>
              <CurrencyInputField
                value={inputs[req.fieldKey]}
                onChange={(val) => setInputs({ ...inputs, [req.fieldKey]: val })}
              />
              {req.hint && <p className="text-xs text-slate-400 mt-1 ml-1">{req.hint}</p>}
            </div>
          ))}

          {selectedEntry?.requiredInputs.length === 0 && (
            <div className="bg-slate-50 p-4 rounded-lg text-center text-slate-500 text-sm">
              Este serviço possui valor tabelado fixo. Não são necessários parâmetros adicionais.
            </div>
          )}
        </div>

        <button
          onClick={handleCalculate}
          disabled={selectedEntry?.requiredInputs.some(r => r.required && !inputs[r.fieldKey])}
          className="mt-8 w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200"
        >
          <Calculator size={24} /> Calcular Honorários
        </button>
      </div>
    </div>
  );

  const renderStep6_Negotiation = () => (
    <div className="animate-in zoom-in-95 duration-300 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT: Negotiation Controls */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setStep(5)} className="text-sm text-slate-500 hover:text-accent flex items-center gap-1">
            <ArrowLeft size={16} /> Refazer Cálculo
          </button>
        </div>

        {/* 1. Identification */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-900"></div> Identificação
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Selecionar da Carteira</label>
              <select
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50"
                value={selectedClientId}
                onChange={(e) => { setSelectedClientId(e.target.value); if (e.target.value) setCustomClientName(''); }}
              >
                <option value="">Cliente Avulso / Novo</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nome (Avulso)</label>
              <input
                type="text"
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                placeholder="Nome do Cliente"
                value={customClientName}
                onChange={(e) => setCustomClientName(e.target.value)}
                disabled={!!selectedClientId}
              />
            </div>
          </div>
        </div>

        {/* 2. Discount (New Feature) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div> Desconto Comercial
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">{isDiscountActive ? 'Ativado' : 'Desativado'}</span>
              <button
                onClick={() => setIsDiscountActive(!isDiscountActive)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center p-1 ${isDiscountActive ? 'bg-amber-500' : 'bg-slate-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isDiscountActive ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {isDiscountActive && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tipo de Desconto</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setDiscountType('PERCENTAGE')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${discountType === 'PERCENTAGE' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>%</button>
                  <button onClick={() => setDiscountType('FIXED')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${discountType === 'FIXED' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>R$</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Valor do Desconto</label>
                {discountType === 'FIXED' ? (
                  <CurrencyInputField value={discountValue} onChange={setDiscountValue} />
                ) : (
                  <div className="relative">
                    <input type="number" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} />
                    <span className="absolute right-3 top-2.5 text-slate-400">%</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Payment Terms */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Condições de Pagamento
          </h3>

          <div className="bg-slate-50 p-4 rounded-lg mb-6 flex justify-between items-center">
            <span className="text-sm text-slate-600 font-medium">Total a Negociar:</span>
            <span className="text-lg font-bold text-slate-900">{formatCurrency(paymentTerms.finalTotal || result?.totalFee || 0)}</span>
          </div>

          <div className="space-y-6">

            {/* Pagamento à Vista Toggle */}
            <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  onClick={() => setIsCashPayment(!isCashPayment)}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center p-1 ${isCashPayment ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isCashPayment ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm font-medium text-slate-700">Pagamento à Vista</span>
              </label>
              {isCashPayment && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">100% na Entrada</span>}
            </div>

            {/* Entry */}
            <div className={`p-4 border border-slate-100 rounded-lg transition-opacity ${isCashPayment ? 'opacity-60 pointer-events-none' : ''}`}>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Valor de Entrada</label>
                <div className="flex bg-slate-100 p-0.5 rounded text-xs">
                  <button onClick={() => setPaymentTerms(p => ({ ...p, entryType: 'PERCENTAGE' }))} className={`px-2 py-0.5 rounded ${paymentTerms.entryType === 'PERCENTAGE' ? 'bg-white shadow' : ''}`}>%</button>
                  <button onClick={() => setPaymentTerms(p => ({ ...p, entryType: 'FIXED' }))} className={`px-2 py-0.5 rounded ${paymentTerms.entryType === 'FIXED' ? 'bg-white shadow' : ''}`}>R$</button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32">
                  {paymentTerms.entryType === 'FIXED' ? (
                    <CurrencyInputField value={paymentTerms.entryValue} onChange={v => setPaymentTerms(p => ({ ...p, entryValue: v }))} />
                  ) : (
                    <div className="relative">
                      <input type="number" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" value={paymentTerms.entryValue} onChange={e => setPaymentTerms(p => ({ ...p, entryValue: Number(e.target.value) }))} />
                      <span className="absolute right-3 top-2.5 text-slate-400">%</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-right">
                  <p className="text-xs text-slate-400">Valor da Entrada</p>
                  <p className="text-emerald-600 font-bold">{formatCurrency(paymentTerms.entryAmount)}</p>
                </div>
              </div>
            </div>

            {/* Installments */}
            <div className={`p-4 border border-slate-100 rounded-lg transition-opacity ${isCashPayment ? 'opacity-60 pointer-events-none' : ''}`}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 block">Parcelamento do Saldo</label>
                {paymentTerms.installmentAmount > 0 && paymentTerms.installments > 0 && (
                  <span className="text-[10px] text-slate-400">Mínimo R$ 200,00/parcela</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range" min="1" max="24"
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent"
                  value={paymentTerms.installments}
                  onChange={(e) => setPaymentTerms(p => ({ ...p, installments: Number(e.target.value) }))}
                  disabled={isCashPayment}
                />
                <div className="w-16 text-center border p-1 rounded text-sm font-bold bg-white">
                  {paymentTerms.installments}x
                </div>
              </div>
              <div className="text-right mt-2">
                <p className="text-xs text-slate-400">{paymentTerms.installments}x de {formatCurrency(paymentTerms.installmentAmount)}</p>
              </div>
            </div>

            {/* Risk Fee (Ad Exitum) */}
            <div className="p-4 border border-slate-100 rounded-lg bg-slate-50/50">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">Honorários de Êxito (Ad Exitum)</label>
                {!paymentTerms.riskBasis && (
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <Lock size={10} /> Requer Valor Causa
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-32">
                  <input
                    type="number"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:text-slate-400"
                    value={paymentTerms.riskPercentage}
                    onChange={e => setPaymentTerms(p => ({ ...p, riskPercentage: Number(e.target.value) }))}
                    disabled={!paymentTerms.riskBasis}
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">%</span>
                </div>
                {paymentTerms.riskBasis ? (
                  <div className="flex-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={paymentTerms.deductFromRisk} onChange={e => setPaymentTerms(p => ({ ...p, deductFromRisk: e.target.checked }))} className="rounded border-slate-300 text-accent focus:ring-accent" />
                      <span className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors">Abater honorários iniciais do êxito?</span>
                    </label>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 flex-1">Informe o valor da causa para projetar o êxito.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Financial Summary */}
      <div className="space-y-6">
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-xl sticky top-6">
          <div className="mb-6 border-b border-slate-700 pb-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Resumo da Proposta</p>

            {isDiscountActive && (
              <p className="text-sm text-slate-400 line-through mb-1 decoration-red-500 decoration-2">{formatCurrency(result?.totalFee || 0)}</p>
            )}

            <div className="text-3xl font-bold text-emerald-400 mb-2">
              {formatCurrency(paymentTerms.finalTotal || 0)}
            </div>

            <div className="flex justify-between text-xs text-slate-300 mt-4">
              <span>Entrada:</span>
              <span className="font-mono text-white">{formatCurrency(paymentTerms.entryAmount)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-300 mt-1">
              <span>Parcelamento:</span>
              <span className="font-mono text-white">{paymentTerms.installments}x {formatCurrency(paymentTerms.installmentAmount)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setContractModalOpen(true)}
              className="w-full bg-white text-slate-900 py-3 rounded-lg font-bold hover:bg-slate-100 transition-all flex justify-center items-center gap-2"
            >
              <FileText size={18} /> Gerar Contrato
            </button>

            <button
              onClick={handleSaveProposal}
              disabled={isSaving || saveSuccess}
              className={`w-full py-3 rounded-lg font-medium transition-all flex justify-center items-center gap-2 border ${saveSuccess ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600 hover:bg-slate-800 text-slate-300'}`}
            >
              {saveSuccess ? <CheckCircle size={18} /> : <Save size={18} />}
              {saveSuccess ? 'Salvo!' : 'Salvar Proposta'}
            </button>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button onClick={handleWhatsApp} className="bg-[#25D366] hover:bg-[#128C7E] text-white py-2 rounded-lg flex justify-center items-center transition-colors">
                <Share2 size={18} />
              </button>
              <button onClick={() => window.print()} className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg flex justify-center items-center transition-colors">
                <Printer size={18} />
              </button>
            </div>

            <button
              onClick={handleGenerateAi}
              disabled={generatingAi}
              className="w-full mt-2 text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 py-2"
            >
              <Wand2 size={12} /> {generatingAi ? 'Escrevendo...' : 'Gerar carta proposta com IA'}
            </button>
          </div>
        </div>

        {/* AI Preview */}
        {proposal && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-600 max-h-64 overflow-y-auto">
            <h4 className="font-bold text-slate-800 mb-2">Carta Proposta (IA)</h4>
            <div className="whitespace-pre-wrap font-serif">{proposal}</div>
          </div>
        )}
      </div>
    </div>
  );

  // Status Bar (Progress)
  const ProgressBar = () => (
    <div className="w-full h-1 bg-slate-100 fixed top-16 left-0 z-10 md:relative md:top-0 md:h-2 md:rounded-full md:mb-8 overflow-hidden">
      <div
        className="h-full bg-accent transition-all duration-500 ease-out"
        style={{ width: `${(step / 6) * 100}%` }}
      />
    </div>
  );

  if (loading) return <LoadingState message="Carregando dados..." />;

  return (
    <div className="pb-20 md:pb-0">
      <ProgressBar />

      {step === 1 && renderStep1_State()}
      {step === 2 && renderStep2_Category()}
      {step === 3 && renderStep3_Specialty()}
      {step === 4 && renderStep4_Services()}
      {step === 5 && renderStep5_Params()}
      {step === 6 && renderStep6_Negotiation()}

      {/* Contract Modal */}
      <ContractGenerator
        isOpen={contractModalOpen}
        onClose={() => setContractModalOpen(false)}
        data={selectedEntry && result ? {
          serviceEntry: selectedEntry,
          clientData: (() => {
            const selectedClient = clients.find(c => c.id === selectedClientId);
            return {
              name: getSelectedClientName(),
              inputs: { ...inputs },
              paymentTerms: paymentTerms,
              document: selectedClient?.document,
              address: selectedClient?.address
            };
          })(),
          calculationResult: result,
          lawyerSettings: getSettings()
        } : null}
      />
    </div>
  );
};
