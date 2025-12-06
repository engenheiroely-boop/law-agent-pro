
import React, { useState } from 'react';
import { useToast } from './ui/Toast';
import { X, MessageSquare, Bug, Lightbulb, Loader2 } from 'lucide-react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
    const [type, setType] = useState<'BUG' | 'SUGGESTION'>('BUG');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;

        setLoading(true);
        // Simula envio para API
        setTimeout(() => {
            console.log('Feedback enviado:', { type, description });
            showToast('success', 'Obrigado pelo seu feedback!');
            setLoading(false);
            setDescription('');
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare size={18} className="text-accent" />
                        Enviar Feedback
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setType('BUG')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all
                ${type === 'BUG' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Bug size={16} /> Reportar Erro
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('SUGGESTION')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all
                ${type === 'SUGGESTION' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Lightbulb size={16} /> Sugestão
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Descreva o que aconteceu
                        </label>
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none min-h-[120px] resize-none"
                            placeholder={type === 'BUG' ? "Ex: Ao clicar em salvar cliente, apareceu uma tela vermelha..." : "Ex: Seria legal ter um botão para exportar..."}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !description.trim()}
                            className="px-6 py-2 text-sm font-medium text-white bg-accent hover:bg-sky-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Enviar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
