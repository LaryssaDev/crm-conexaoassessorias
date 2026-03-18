import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Percent, 
  Target 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { leads, transactions } = useData();

  const totalFaturamento = transactions
    .filter(t => t.type === 'Entrada')
    .reduce((acc, t) => acc + t.value, 0);

  const leadsEmNegociacao = leads.filter(l => l.status === 'Em Negociação').length;
  const leadsFechados = leads.filter(l => l.status === 'Fechado').length;
  const leadsPerdidos = leads.filter(l => l.status === 'Perdido').length;
  
  const totalLeads = leads.length;
  const conversao = totalLeads > 0 ? Math.round((leadsFechados / totalLeads) * 100) : 0;

  const stats = [
    { title: 'Faturamento Total', value: `R$ ${totalFaturamento.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Leads em Negociação', value: leadsEmNegociacao.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Leads Fechados', value: leadsFechados.toString(), icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/5' },
    { title: 'Leads Perdidos', value: leadsPerdidos.toString(), icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Taxa de Conversão', value: `${conversao}%`, icon: Percent, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Meta Mensal', value: '0%', icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  // Prepare chart data from transactions
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonth = new Date().getMonth();
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const monthIdx = (currentMonth - i + 12) % 12;
    last6Months.push({
      name: months[monthIdx],
      faturamento: transactions
        .filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === monthIdx && t.type === 'Entrada';
        })
        .reduce((acc, t) => acc + t.value, 0)
    });
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={20} />
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Evolução do Faturamento</h3>
              <p className="text-sm text-slate-500">Desempenho nos últimos 6 meses</p>
            </div>
            <select className="bg-slate-50 border-none rounded-lg px-3 py-2 text-sm outline-none">
              <option>Últimos 6 meses</option>
              <option>Este ano</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last6Months}>
                <defs>
                  <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8a2695" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8a2695" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  tickFormatter={(value) => `R$ ${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Faturamento']}
                />
                <Area 
                  type="monotone" 
                  dataKey="faturamento" 
                  stroke="#8a2695" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorFat)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <Target size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Meta Comercial</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Progresso</span>
                <span className="font-bold text-slate-800">R$ 0 / R$ 100.000</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: '0%' }}></div>
              </div>
              <p className="text-xs text-slate-400 text-center font-bold uppercase tracking-wider">0% Atingido</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Target size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Meta Jurídico</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Progresso</span>
                <span className="font-bold text-slate-800">R$ 0 / R$ 60.000</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: '0%' }}></div>
              </div>
              <p className="text-xs text-slate-400 text-center font-bold uppercase tracking-wider">0% Atingido</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
