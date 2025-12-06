import React from 'react';
import { Loader2, AlertCircle, FileX, Plus, RefreshCw } from 'lucide-react';

// --- LOADING STATE ---
interface LoadingStateProps {
  message?: string;
}
export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Carregando dados...' }) => (
  <div className="flex flex-col items-center justify-center py-12 text-slate-400 animate-in fade-in duration-500">
    <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
    <p className="text-sm font-medium text-slate-500">{message}</p>
  </div>
);

// --- ERROR STATE ---
interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}
export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = 'Erro ao carregar', 
  message, 
  onRetry 
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-500 bg-red-50/50 rounded-xl border border-red-100 p-6">
    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
      <AlertCircle className="w-6 h-6 text-red-500" />
    </div>
    <h3 className="text-lg font-medium text-slate-900 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 max-w-sm mb-4">{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
      >
        <RefreshCw size={14} /> Tentar Novamente
      </button>
    )}
  </div>
);

// --- EMPTY STATE ---
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ElementType;
  actionLabel?: string;
  onAction?: () => void;
}
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = FileX,
  actionLabel,
  onAction
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/30">
    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
      <Icon size={32} strokeWidth={1.5} />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 max-w-md mb-6 px-4">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-sky-600 transition-colors shadow-sm"
      >
        <Plus size={18} />
        {actionLabel}
      </button>
    )}
  </div>
);