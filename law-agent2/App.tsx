
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Layout } from './components/Layout';
import { DashboardModule } from './components/DashboardModule';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider } from './components/ThemeContext';
import { AppRoute } from './types';

// Lazy load módulos pesados para reduzir bundle inicial
const CalculatorModule = lazy(() => import('./components/CalculatorModule').then(m => ({ default: m.CalculatorModule })));
const ClientModule = lazy(() => import('./components/ClientModule').then(m => ({ default: m.ClientModule })));
const CaseModule = lazy(() => import('./components/CaseModule').then(m => ({ default: m.CaseModule })));
const DocumentsModule = lazy(() => import('./components/DocumentsModule').then(m => ({ default: m.DocumentsModule })));
const SettingsModule = lazy(() => import('./components/SettingsModule').then(m => ({ default: m.SettingsModule })));
const IntelligenceModule = lazy(() => import('./components/IntelligenceModule').then(m => ({ default: m.IntelligenceModule })));
const CalendarModule = lazy(() => import('./components/CalendarModule').then(m => ({ default: m.CalendarModule })));
const CalculatorsModule = lazy(() => import('./components/CalculatorsModule').then(m => ({ default: m.CalculatorsModule })));
const FinanceModule = lazy(() => import('./components/FinanceModule').then(m => ({ default: m.FinanceModule })));
const TaskModule = lazy(() => import('./components/TaskModule').then(m => ({ default: m.TaskModule })));
const PortalModule = lazy(() => import('./components/PortalModule').then(m => ({ default: m.PortalModule })));
const AdminOabModule = lazy(() => import('./components/AdminOabModule').then(m => ({ default: m.AdminOabModule })));
const CourtIntegrationModule = lazy(() => import('./components/CourtIntegrationModule').then(m => ({ default: m.CourtIntegrationModule })));
const DebugDataPanel = lazy(() => import('./components/DebugDataPanel').then(m => ({ default: m.DebugDataPanel })));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
  </div>
);

import { AuthProvider, useAuth } from './components/AuthContext';
import { LoginModule } from './components/LoginModule';

const AuthenticatedApp: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Estado de Roteamento Global
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    // Initialize from hash on load
    const hash = window.location.hash.slice(1); // Remove '#'
    return {
      module: hash || 'dashboard'
    };
  });

  // Hash Routing Support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setCurrentRoute({ module: hash as any });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (route: AppRoute) => {
    setCurrentRoute(route);
    // Update URL hash to match current route
    window.location.hash = route.module;
  };

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <LoginModule />;
  }

  // Se o módulo for "portal", renderiza sem o Layout administrativo
  if (currentRoute.module === 'portal') {
    return (
      <PortalModule onNavigate={handleNavigate} params={currentRoute.params} />
    );
  }

  const renderModule = () => {
    switch (currentRoute.module) {
      case 'dashboard':
        return <DashboardModule onNavigate={handleNavigate} />;

      case 'tasks':
        return <TaskModule initialParams={currentRoute.params} />;

      case 'calendar':
        return <CalendarModule />;

      case 'calculator':
        return <CalculatorModule initialParams={currentRoute.params} onNavigate={handleNavigate} />;

      case 'calculators':
        return <CalculatorsModule />;

      case 'clients':
        return <ClientModule initialParams={currentRoute.params} onNavigate={handleNavigate} />;

      case 'cases':
        return <CaseModule initialParams={currentRoute.params} onNavigate={handleNavigate} />;

      case 'finance':
        return <FinanceModule />;

      case 'documents':
        return <DocumentsModule />;

      case 'courts':
        return <CourtIntegrationModule />;

      case 'settings':
        return <SettingsModule />;

      case 'intelligence':
        return <IntelligenceModule />;

      case 'admin-oab':
        return <AdminOabModule />;

      default:
        return (
          <div className="p-8 text-center text-slate-500">
            Módulo "{currentRoute.module}" não encontrado.
          </div>
        );
    }
  };

  return (
    <Layout activeModule={currentRoute.module} onNavigate={handleNavigate}>
      <Suspense fallback={<LoadingFallback />}>
        {renderModule()}
        <DebugDataPanel />
      </Suspense>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
