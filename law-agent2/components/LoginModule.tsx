
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Scale, Lock, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

import { useToast } from './ui/Toast';

export const LoginModule: React.FC = () => {
    const { login } = useAuth();
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            showToast('success', 'Login realizado com sucesso!');
        } catch (err) {
            const msg = 'Email ou senha incorretos.';
            setError(msg);
            showToast('error', msg);
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-900 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />

            <div className="flex-1 flex flex-col justify-center items-center p-8 z-10">
                <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">

                    {/* Logo Section */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-sm">
                                <Scale className="h-10 w-10 text-accent" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Law Agent <span className="text-accent">PRO</span></h1>
                        <p className="text-slate-400">Entre para acessar seu escritório digital.</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm animate-in slide-in-from-top-2">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Email Corporativo</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-accent transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-slate-600"
                                        placeholder="nome@adv.com.br"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Senha</label>
                                    <a href="#" className="text-xs text-accent hover:text-accent/80 transition-colors">Esqueceu a senha?</a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-accent transition-colors" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-slate-600"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Entrar no Sistema <ArrowRight className="h-4 w-4" /></>}
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 text-center space-y-4">
                        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                            <CheckCircle2 size={14} className="text-emerald-500" /> Criptografia End-to-End
                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                            <CheckCircle2 size={14} className="text-emerald-500" /> Certificado SSL
                        </div>
                        <p className="text-xs text-slate-600">
                            &copy; 2024 Law Agent SaaS. Todos os direitos reservados.
                        </p>
                    </div>

                    <div className="mt-8 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 text-xs text-slate-400 text-center">
                        <p className="font-bold text-slate-300 mb-1">Credenciais de Demonstração:</p>
                        <p>Admin: <span className="font-mono text-accent">admin@lawagent.com</span> / <span className="font-mono text-accent">admin</span></p>
                        <p>Advogado: <span className="font-mono text-accent">adv@lawagent.com</span> / <span className="font-mono text-accent">123456</span></p>
                    </div>

                </div>
            </div>
        </div>
    );
};
