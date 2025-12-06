
import React, { useState, useEffect, useRef } from 'react';
import { User, Palette, Shield, Save, Upload, Download, RefreshCw, Trash2, Sparkles } from 'lucide-react';
import { UserSettings, AppTheme, BackupData } from '../types';
import { saveSettings, getSettings, createBackup, restoreBackup, clearAllData } from '../services/settingsService';
import { LoadingState } from './ui/States';
import { useTheme } from './ThemeContext';

export const SettingsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'THEME' | 'DATA'>('PROFILE');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { theme: appTheme, setTheme: setAppTheme } = useTheme();

  const [settings, setSettings] = useState<UserSettings>({
    lawyerName: '',
    oabNumber: '',
    officeName: '',
    officeAddress: '',
    theme: 'slate',
    aiTone: 'formal'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const current = getSettings();
    if (current) setSettings(current);
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setMessage('Configurações salvas com sucesso!');
    setTimeout(() => setMessage(''), 3000);
    // Dispatch event to update layout immediately
    window.dispatchEvent(new Event('settings-updated'));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logoBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackup = async () => {
    const data = await createBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lawagent_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (confirm('ATENÇÃO: Isso substituirá todos os dados atuais pelos do backup. Deseja continuar?')) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          await restoreBackup(json);
          alert('Dados restaurados com sucesso! A página será recarregada.');
          window.location.reload();
        } catch (error) {
          alert('Erro ao restaurar backup. Arquivo inválido.');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (prompt('Digite "DELETAR" para confirmar a exclusão de TODOS os dados do sistema:') === 'DELETAR') {
      clearAllData();
      window.location.reload();
    }
  };

  if (loading) return <LoadingState message="Processando dados..." />;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Configurações</h1>
      <p className="text-slate-500 mb-8">Personalize seu sistema e gerencie seus dados.</p>

      {message && (
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg mb-6 flex items-center gap-2 animate-in slide-in-from-top-2">
          <Save size={18} /> {message}
        </div>
      )}

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-2">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'PROFILE' ? 'bg-white shadow text-accent' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <User size={18} /> Perfil e Marca
          </button>
          <button
            onClick={() => setActiveTab('THEME')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'THEME' ? 'bg-white shadow text-accent' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <Palette size={18} /> Aparência
          </button>
          <button
            onClick={() => setActiveTab('DATA')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'DATA' ? 'bg-white shadow text-accent' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <Shield size={18} /> Segurança e Dados
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">

          {activeTab === 'PROFILE' && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Identidade Profissional</h2>

              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                  {settings.logoBase64 ? (
                    <img src={settings.logoBase64} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-400 text-center px-2">Sem Logo</span>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer text-white text-xs font-bold flex flex-col items-center">
                      <Upload size={16} className="mb-1" /> Alterar
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Logotipo do Escritório</p>
                  <p className="text-xs text-slate-500 mt-1">Será usado no cabeçalho de contratos e propostas. Recomendado: PNG transparente.</p>
                  {settings.logoBase64 && (
                    <button onClick={() => setSettings(s => ({ ...s, logoBase64: undefined }))} className="text-xs text-red-500 hover:underline mt-2">Remover Logo</button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Advogado(a)</label>
                  <input type="text" className="w-full border p-2 rounded" value={settings.lawyerName} onChange={e => setSettings({ ...settings, lawyerName: e.target.value })} placeholder="Dr. Fulano de Tal" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">OAB</label>
                  <input type="text" className="w-full border p-2 rounded" value={settings.oabNumber} onChange={e => setSettings({ ...settings, oabNumber: e.target.value })} placeholder="OAB/UF 00.000" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Escritório</label>
                  <input type="text" className="w-full border p-2 rounded" value={settings.officeName} onChange={e => setSettings({ ...settings, officeName: e.target.value })} placeholder="Advocacia & Associados" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
                  <input type="text" className="w-full border p-2 rounded" value={settings.officeAddress} onChange={e => setSettings({ ...settings, officeAddress: e.target.value })} placeholder="Rua, Número, Cidade - UF" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'THEME' && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Personalização Visual</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Tema de Cores</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sky Theme */}
                  <button
                    onClick={() => setAppTheme('sky')}
                    className={`group relative p-6 rounded-xl border-2 transition-all overflow-hidden
                        ${appTheme === 'sky' ? 'border-sky-500 bg-sky-50 shadow-lg shadow-sky-100' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-900">Sky</h3>
                        {appTheme === 'sky' && (
                          <div className="bg-sky-500 text-white px-2 py-0.5 rounded text-xs font-bold">ATIVO</div>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-4">Tema claro e profissional com azul céu</p>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-sky-500" title="Accent"></div>
                        <div className="w-8 h-8 rounded-full bg-slate-900" title="Primary"></div>
                        <div className="w-8 h-8 rounded-full bg-slate-100" title="Background"></div>
                      </div>
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent transition-opacity ${appTheme === 'sky' ? 'opacity-100' : 'opacity-0'}`}></div>
                  </button>

                  {/* Gold Theme */}
                  <button
                    onClick={() => setAppTheme('gold')}
                    className={`group relative p-6 rounded-xl border-2 transition-all overflow-hidden
                        ${appTheme === 'gold' ? 'border-amber-600 bg-amber-50 shadow-lg shadow-amber-100' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900">Gold</h3>
                          <Sparkles size={16} className="text-amber-600" />
                        </div>
                        {appTheme === 'gold' && (
                          <div className="bg-amber-600 text-white px-2 py-0.5 rounded text-xs font-bold">ATIVO</div>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-4">Tema clássico preto e dourado de advocacia</p>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-600" title="Accent Gold"></div>
                        <div className="w-8 h-8 rounded-full bg-black" title="Black"></div>
                        <div className="w-8 h-8 rounded-full bg-zinc-50 border border-slate-200" title="Background"></div>
                      </div>
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-br from-amber-600/5 to-transparent transition-opacity ${appTheme === 'gold' ? 'opacity-100' : 'opacity-0'}`}></div>
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-3">O tema é aplicado imediatamente em todo o sistema e salvo automaticamente.</p>
              </div>
            </div>
          )}

          {activeTab === 'DATA' && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Gerenciamento de Dados</h2>

              <div className="bg-sky-50 border border-sky-100 rounded-lg p-4">
                <h3 className="font-bold text-sky-800 flex items-center gap-2 mb-2"><Download size={18} /> Backup (Exportar)</h3>
                <p className="text-sm text-sky-700 mb-3">Baixe uma cópia de todos os seus clientes, processos e configurações para o seu computador.</p>
                <button onClick={handleBackup} className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors">
                  Fazer Backup Agora
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-2"><Upload size={18} /> Restaurar (Importar)</h3>
                <p className="text-sm text-amber-700 mb-3">Recupere seus dados a partir de um arquivo de backup anterior.</p>
                <label className="bg-white border border-amber-300 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors cursor-pointer inline-block">
                  Selecionar Arquivo JSON
                  <input type="file" className="hidden" accept=".json" onChange={handleRestore} />
                </label>
              </div>

              <div className="border-t pt-6 mt-6">
                <h3 className="font-bold text-red-600 flex items-center gap-2 mb-2"><Trash2 size={18} /> Zona de Perigo</h3>
                <p className="text-sm text-slate-500 mb-3">Apagar permanentemente todos os dados do navegador.</p>
                <button onClick={handleReset} className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                  Resetar Fábrica
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
            >
              <Save size={18} /> Salvar Alterações
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
