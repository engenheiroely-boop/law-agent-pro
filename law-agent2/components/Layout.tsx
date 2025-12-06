import React, { useState, useEffect } from 'react';
import { MessageSquare, Scale, Home, Calculator, Users, FileText, Settings, Menu, DollarSign, RefreshCw, CheckSquare, Search, Files, Brain, CalendarDays, DivideSquare, Landmark } from 'lucide-react';
import { AppRoute, UserSettings } from '../types';
import { GlobalSearch } from './GlobalSearch';
import { getSettings } from '../services/settingsService';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { useAuth } from './AuthContext';
import { FeedbackModal } from './FeedbackModal';

interface LayoutProps {
  children: React.ReactNode;
  activeModule: string;
  onNavigate?: (route: AppRoute) => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, isSearch }: { icon: any, label: string, active?: boolean, onClick?: () => void, isSearch?: boolean }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg mb-1
      ${active
        ? 'bg-accent/10 text-accent'
        : isSearch
          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeModule, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    const loadSettings = () => {
      const s = getSettings();
      if (s) setUserSettings(s);
    };
    loadSettings();
    // Listen to custom event for settings update
    window.addEventListener('settings-updated', loadSettings);
    return () => window.removeEventListener('settings-updated', loadSettings);
  }, []);

  const handleNav = (module: string) => {
    if (onNavigate) {
      onNavigate({ module: module as any });
      setIsMobileMenuOpen(false);
    }
  };

  const handleReset = () => {
    if (confirm("Deseja limpar a sessão atual e recarregar o sistema? Dados salvos não serão perdidos.")) {
      // Tenta forçar um reload limpo
      window.location.href = '/';
      setTimeout(() => window.location.reload(), 100);
    }
  };

  // Theme application (simulated)
  const themeColors = {
    slate: '#0f172a', // Default
    blue: '#1e3a8a',
    violet: '#5b21b6',
    emerald: '#064e3b'
  };
  const primaryColor = userSettings ? themeColors[userSettings.theme] : themeColors.slate;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      {onNavigate && <KeyboardShortcuts onNavigate={onNavigate} />}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(route) => {
          if (onNavigate) onNavigate(route);
          setIsSearchOpen(false);
        }}
      />

      {/* Sidebar Desktop */}
      <aside
        className="hidden md:flex flex-col w-64 text-white border-r border-slate-800 shadow-xl z-20 transition-colors duration-300"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-accent">
            {userSettings?.logoBase64 ? (
              <img src={userSettings.logoBase64} alt="Logo" className="h-8 w-auto rounded" />
            ) : (
              <Scale size={28} strokeWidth={2.5} />
            )}
            <h1 className="text-xl font-bold tracking-tight text-white truncate">
              {userSettings?.officeName || 'Law Agent'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate">
            {userSettings ? 'Software Licenciado' : 'by Lince Tecnologia'}
          </p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <SidebarItem icon={Search} label="Buscar..." isSearch onClick={() => setIsSearchOpen(true)} />
          </div>

          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Módulos</p>
          <SidebarItem icon={Home} label="Dashboard" active={activeModule === 'dashboard'} onClick={() => handleNav('dashboard')} />
          <SidebarItem icon={Brain} label="Inteligência Artificial" active={activeModule === 'intelligence'} onClick={() => handleNav('intelligence')} />
          <SidebarItem icon={CalendarDays} label="Agenda" active={activeModule === 'calendar'} onClick={() => handleNav('calendar')} />
          <SidebarItem icon={CheckSquare} label="Tarefas" active={activeModule === 'tasks'} onClick={() => handleNav('tasks')} />
          <SidebarItem icon={DivideSquare} label="Calculadoras Judiciais" active={activeModule === 'calculators'} onClick={() => handleNav('calculators')} />

          <div className="mt-4 pt-4 border-t border-white/5">
            <SidebarItem icon={Calculator} label="Honorários OAB" active={activeModule === 'calculator'} onClick={() => handleNav('calculator')} />
            <SidebarItem icon={Users} label="Clientes" active={activeModule === 'clients'} onClick={() => handleNav('clients')} />
            <SidebarItem icon={FileText} label="Processos" active={activeModule === 'cases'} onClick={() => handleNav('cases')} />
            <SidebarItem icon={Landmark} label="Tribunais" active={activeModule === 'courts'} onClick={() => handleNav('courts')} />
            <SidebarItem icon={Files} label="Documentos" active={activeModule === 'documents'} onClick={() => handleNav('documents')} />
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Gestão</p>
            <SidebarItem icon={DollarSign} label="Financeiro" active={activeModule === 'finance'} onClick={() => handleNav('finance')} />
            <SidebarItem icon={Settings} label="Configurações" active={activeModule === 'settings'} onClick={() => handleNav('settings')} />
          </div>
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="w-full flex items-center justify-center gap-2 text-xs text-slate-300 hover:text-white transition-colors py-2 mb-2 bg-white/5 hover:bg-white/10 rounded"
          >
            <MessageSquare size={12} /> Feedback
          </button>
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-red-300 transition-colors py-2 mb-2 border border-white/10 rounded hover:border-red-400/30"
          >
            <RefreshCw size={12} /> Reiniciar Sistema
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-slate-300 overflow-hidden">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : 'AD'}

            </div>
            <div className="flex-1 truncate">

              <p className="text-sm font-medium text-white truncate">{user?.name || 'Dr. Advogado'}</p>
              <p className="text-xs text-slate-400">{user?.role === 'ADMIN' ? 'Administrador' : 'Advogado Associado'}</p>
            </div>
            <button onClick={logout} className="text-slate-400 hover:text-white p-1">
              <RefreshCw size={14} className="rotate-180" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-30 shadow-md"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-2 text-accent">
          <Scale size={24} />
          <h1 className="text-lg font-bold text-white">Law Agent</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSearchOpen(true)} className="text-slate-300 hover:text-white">
            <Search size={22} />
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 pt-16 p-4 md:hidden animate-in slide-in-from-top-10"
          style={{ backgroundColor: primaryColor }}
        >
          <nav className="space-y-2 text-white overflow-y-auto max-h-[80vh]">
            <SidebarItem icon={Home} label="Dashboard" active={activeModule === 'dashboard'} onClick={() => handleNav('dashboard')} />
            <SidebarItem icon={Brain} label="Inteligência Artificial" active={activeModule === 'intelligence'} onClick={() => handleNav('intelligence')} />
            <SidebarItem icon={CalendarDays} label="Agenda" active={activeModule === 'calendar'} onClick={() => handleNav('calendar')} />
            <SidebarItem icon={CheckSquare} label="Tarefas" active={activeModule === 'tasks'} onClick={() => handleNav('tasks')} />
            <SidebarItem icon={DivideSquare} label="Calculadoras" active={activeModule === 'calculators'} onClick={() => handleNav('calculators')} />
            <SidebarItem icon={Calculator} label="Honorários" active={activeModule === 'calculator'} onClick={() => handleNav('calculator')} />
            <SidebarItem icon={Users} label="Clientes" active={activeModule === 'clients'} onClick={() => handleNav('clients')} />
            <SidebarItem icon={FileText} label="Processos" active={activeModule === 'cases'} onClick={() => handleNav('cases')} />
            <SidebarItem icon={Files} label="Documentos" active={activeModule === 'documents'} onClick={() => handleNav('documents')} />
            <SidebarItem icon={DollarSign} label="Financeiro" active={activeModule === 'finance'} onClick={() => handleNav('finance')} />
            <SidebarItem icon={Settings} label="Configurações" active={activeModule === 'settings'} onClick={() => handleNav('settings')} />
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative md:pt-0 pt-16">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
