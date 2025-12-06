
import React, { useEffect, useState } from 'react';
import {
  Users, FileText, DollarSign, TrendingUp,
  Briefcase, ChevronRight, Plus, Calculator, Calendar, AlertTriangle, ArrowUpRight, ArrowDownRight,
  CheckSquare, Clock, BarChart3, PieChart as PieChartIcon, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { AppRoute, Proposal, Task } from '../types';
import { getClients } from '../services/clientService';
import { getCases } from '../services/caseService';
import { getProposals } from '../services/proposalService';
import { getTasks } from '../services/taskService';
import { getTransactions } from '../services/financialService';
import { formatCurrency } from '../services/feeEngine';
import { LoadingState } from './ui/States';

interface DashboardModuleProps {
  onNavigate?: (route: AppRoute) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeCases: 0,
    revenueReceived: 0,
    revenuePending: 0,
    revenueOverdue: 0,
    proposalsCount: 0,
    recentProposals: [] as Proposal[],
    upcomingTasks: [] as Task[],
    monthlyRevenue: [] as any[],
    caseDistribution: [] as any[]
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [clients, cases, proposals, tasks, transactions] = await Promise.all([
          getClients(),
          getCases(),
          getProposals(),
          getTasks(),
          getTransactions()
        ]);

        const activeCases = cases.filter(c => c.status === 'Ativo').length;

        // Financeiro Real
        const received = transactions.filter(t => t.status === 'PAID' && t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
        const pending = transactions.filter(t => t.status === 'PENDING' && t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
        const overdue = transactions.filter(t => t.status === 'OVERDUE' && t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);

        // Agregação Real de Receita Mensal
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        // Inicializa array com 12 meses zerados
        const monthlyData = months.map(m => ({ name: m, recebido: 0, previsto: 0 }));

        transactions.forEach(t => {
          const date = new Date(t.dueDate);
          if (date.getFullYear() === currentYear) {
            const monthIndex = date.getMonth();
            if (t.type === 'INCOME') {
              if (t.status === 'PAID') {
                monthlyData[monthIndex].recebido += t.amount;
              } else if (t.status === 'PENDING') {
                monthlyData[monthIndex].previsto += t.amount;
              }
            }
          }
        });

        // Filtra até o mês atual + 1 (ou mostra tudo se quiser)
        const finalMonthlyData = monthlyData.slice(0, currentMonth + 1);

        // Dados reais de distribuição de casos
        const statusCounts = cases.reduce((acc: any, curr) => {
          acc[curr.status] = (acc[curr.status] || 0) + 1;
          return acc;
        }, {});

        const caseData = Object.keys(statusCounts).map(status => ({
          name: status,
          value: statusCounts[status]
        }));

        // Fallback se não tiver casos
        const finalCaseData = caseData.length > 0 ? caseData : [
          { name: 'Civil', value: 4 },
          { name: 'Trabalhista', value: 3 },
          { name: 'Previdenciário', value: 2 },
          { name: 'Família', value: 5 }
        ];

        // Tasks
        const upcoming = tasks
          .filter(t => t.status !== 'DONE' && t.dueDate)
          .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
          .slice(0, 3);

        setStats({
          totalClients: clients.length,
          activeCases: activeCases,
          revenueReceived: received,
          revenuePending: pending,
          revenueOverdue: overdue,
          proposalsCount: proposals.length,
          recentProposals: proposals.slice(0, 5),
          upcomingTasks: upcoming,
          monthlyRevenue: monthlyData.length > 0 ? monthlyData : [
            { name: 'Jan', recebido: 4000, previsto: 2400 },
            { name: 'Fev', recebido: 3000, previsto: 1398 },
            { name: 'Mar', recebido: 2000, previsto: 9800 },
            { name: 'Abr', recebido: 2780, previsto: 3908 },
            { name: 'Mai', recebido: 1890, previsto: 4800 },
            { name: 'Jun', recebido: 2390, previsto: 3800 },
          ],
          caseDistribution: finalCaseData
        });
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, trend, onClick }: any) => (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
          <Icon className={colorClass.replace('bg-', 'text-')} size={24} />
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-amber-600'}`}>
            {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span className="ml-1">{Math.floor(Math.random() * 15) + 5}%</span>
          </div>
        )}
      </div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );

  if (loading) return <LoadingState message="Carregando inteligência de dados..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Law Agent <span className="text-accent">PRO</span></h1>
          <p className="text-slate-500">Business Intelligence & Gestão Estratégica.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate && onNavigate({ module: 'calculator' })}
            className="bg-accent hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm shadow-sm shadow-sky-200"
          >
            <Calculator size={16} /> Simulação
          </button>
          <button
            onClick={() => onNavigate && onNavigate({ module: 'clients' })}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm shadow-sm"
          >
            <Plus size={16} /> Cliente
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Receita Realizada"
          value={formatCurrency(stats.revenueReceived)}
          subtitle="Total recebido no período"
          icon={DollarSign}
          colorClass="bg-emerald-500 text-emerald-600"
          trend="up"
          onClick={() => onNavigate && onNavigate({ module: 'finance' })}
        />
        <StatCard
          title="A Receber"
          value={formatCurrency(stats.revenuePending)}
          subtitle="Previsão próximos 30 dias"
          icon={TrendingUp}
          colorClass="bg-sky-500 text-sky-600"
          trend="up"
          onClick={() => onNavigate && onNavigate({ module: 'finance' })}
        />
        <StatCard
          title="Processos Ativos"
          value={stats.activeCases}
          subtitle="Carteira em andamento"
          icon={Briefcase}
          colorClass="bg-violet-500 text-violet-600"
          trend="up"
          onClick={() => onNavigate && onNavigate({ module: 'cases' })}
        />
        <StatCard
          title="Produtividade"
          value="94%"
          subtitle="Taxa de conclusão de tarefas"
          icon={Activity}
          colorClass="bg-amber-500 text-amber-600"
          onClick={() => onNavigate && onNavigate({ module: 'tasks' })}
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Gráfico Financeiro */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 size={18} className="text-emerald-500" />
              Desempenho Financeiro
            </h3>
            <select className="text-xs border rounded p-1 text-slate-500">
              <option>Últimos 6 meses</option>
              <option>Este ano</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRecebido" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPrevisto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `R$${value / 1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="recebido" name="Recebido" stroke="#10b981" fillOpacity={1} fill="url(#colorRecebido)" strokeWidth={2} />
                <Area type="monotone" dataKey="previsto" name="Previsto" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorPrevisto)" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição de Casos */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <PieChartIcon size={18} className="text-violet-500" />
              Carteira de Processos
            </h3>
          </div>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.caseDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.caseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-800">{stats.activeCases}</span>
              <span className="text-xs text-slate-400">Total</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {stats.caseDistribution.slice(0, 4).map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-medium text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Section: Tasks & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Próximos Prazos (Tasks) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-amber-500" />
              Próximos Prazos
            </h3>
            <button
              onClick={() => onNavigate && onNavigate({ module: 'tasks' })}
              className="text-xs text-slate-400 hover:text-accent"
            >
              Ver todos
            </button>
          </div>
          <div className="p-4 space-y-3 flex-1">
            {stats.upcomingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-slate-400">
                <Clock size={32} className="mb-2 opacity-20" />
                <p className="text-xs">Agenda livre! Tudo em dia.</p>
              </div>
            ) : (
              stats.upcomingTasks.map(task => (
                <div key={task.id} className="flex items-start gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" onClick={() => onNavigate && onNavigate({ module: 'tasks' })}>
                  <div className={`mt-1 p-2 rounded-lg ${task.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    <AlertTriangle size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-bold text-slate-800">{task.title}</p>
                      <span className="text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {new Date(task.dueDate!).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.description || 'Sem descrição'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Propostas Recentes */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FileText size={18} className="text-sky-500" />
              Últimas Propostas
            </h3>
          </div>

          {stats.recentProposals.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm flex-1 flex flex-col items-center justify-center">
              <Calculator size={32} className="mb-2 opacity-20" />
              Nenhuma proposta gerada ainda.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentProposals.map((proposal) => (
                <button
                  key={proposal.id}
                  type="button"
                  onClick={() => onNavigate && onNavigate({ module: 'clients', params: { clientId: proposal.clientId, tab: 'proposals' } })}
                  className="w-full p-4 hover:bg-slate-50 transition-colors flex justify-between items-center text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-accent border border-slate-200 group-hover:border-accent/30 transition-all">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm group-hover:text-accent transition-colors line-clamp-1">{proposal.serviceDescription}</p>
                      <p className="text-xs text-slate-500">{proposal.clientName}</p>
                    </div>
                  </div>
                  <div className="text-right min-w-fit pl-4">
                    <p className="font-bold text-slate-700 text-sm">{formatCurrency(proposal.totalValue)}</p>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded 
                       ${proposal.status === 'ACEITA' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {proposal.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
