import React, { useEffect } from 'react';
import { AppRoute } from '../types';
import { useToast } from './ui/Toast';

interface KeyboardShortcutsProps {
    onNavigate: (route: AppRoute) => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ onNavigate }) => {
    const { showToast } = useToast();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Ctrl+Shift or Cmd+Shift combinations
            if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
                switch (e.key.toLowerCase()) {
                    case 'd':
                        e.preventDefault();
                        onNavigate({ module: 'dashboard' });
                        showToast('info', 'Atalho: Dashboard');
                        break;
                    case 'c':
                        e.preventDefault();
                        onNavigate({ module: 'clients' });
                        showToast('info', 'Atalho: Clientes');
                        break;
                    case 'p':
                        e.preventDefault();
                        onNavigate({ module: 'cases' });
                        showToast('info', 'Atalho: Processos');
                        break;
                    case 't':
                        e.preventDefault();
                        onNavigate({ module: 'tasks' });
                        showToast('info', 'Atalho: Tarefas');
                        break;
                    case 'k':
                        e.preventDefault();
                        onNavigate({ module: 'calculator' });
                        showToast('info', 'Atalho: Calculadora');
                        break;
                    case 'f':
                        e.preventDefault();
                        onNavigate({ module: 'finance' });
                        showToast('info', 'Atalho: Financeiro');
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNavigate, showToast]);

    return null; // Componente invisível
};
