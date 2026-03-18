import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { parseCurrency } from '../utils/format';
import { 
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus, 
  Filter, 
  Download,
  TrendingUp,
  X,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Transaction } from '../types';

export const Financeiro: React.FC = () => {
  const { user } = useAuth();
  const { transactions, addTransaction, deleteTransaction } = useData();
  const [showModal, setShowModal] = useState(false);
  const [showFullExtrato, setShowFullExtrato] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    value: '' as any,
    type: 'Entrada' as 'Entrada' | 'Saída',
    category: 'Vendas',
    date: new Date().toISOString().split('T')[0]
  });

  // Prepare chart data from real transactions
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonth = new Date().getMonth();
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const monthIdx = (currentMonth - i + 12) % 12;
    const monthTransactions = (transactions || []).filter(t => {
      if (!t.date) return false;
      const d = new Date(t.date);
      return d.getMonth() === monthIdx;
    });

    last6Months.push({
      name: months[monthIdx],
      entradas: monthTransactions
        .filter(t => t.type === 'Entrada')
        .reduce((acc, t) => acc + (Number(t.value) || 0), 0),
      saidas: monthTransactions
        .filter(t => t.type === 'Saída')
        .reduce((acc, t) => acc + (Number(t.value) || 0), 0)
    });
  }

  const totalEntradas = (transactions || []).filter(t => t.type === 'Entrada').reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const totalSaidas = (transactions || []).filter(t => t.type === 'Saída').reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const saldo = totalEntradas - totalSaidas;

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const transactionToAdd: Transaction = {
      id: crypto.randomUUID(),
      ...newTransaction,
      value: parseCurrency(newTransaction.value)
    };
    addTransaction(transactionToAdd);
    setShowModal(false);
    setNewTransaction({
      description: '',
      value: '' as any,
      type: 'Entrada',
      category: 'Vendas',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const exportTransactions = () => {
    const headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.date ? new Date(t.date).toLocaleDateString() : 'N/A',
        t.description || '',
        t.type || '',
        t.category || '',
        Number(t.value) || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transacoes_financeiras.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Financeiro</h3>
          <p className="text-sm text-slate-500">Controle de fluxo de caixa e transações</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportTransactions}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
          >
            <Download size={18} />
            Exportar
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <Plus size={18} />
            Nova Transação
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <ArrowUpCircle size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Entradas</p>
            <h3 className="text-2xl font-bold text-emerald-600">R$ {totalEntradas.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
            <ArrowDownCircle size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Saídas</p>
            <h3 className="text-2xl font-bold text-red-600">R$ {totalSaidas.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-primary p-8 rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-6 text-white">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">Saldo Geral</p>
            <h3 className="text-2xl font-bold">R$ {saldo.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800">Fluxo de Caixa Mensal</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-xs text-slate-500">Entradas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                <span className="text-xs text-slate-500">Saídas</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last6Months}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(v) => `R$ ${v/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="entradas" fill="#8a2695" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="saidas" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Extrato Recente</h3>
            <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
              <Filter size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {(transactions || []).slice(0, 10).map(t => (
              <div key={t.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    t.type === 'Entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {t.type === 'Entrada' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.description || 'Sem descrição'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{t.category || 'Geral'} • {t.date ? new Date(t.date).toLocaleDateString() : 'Data N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`font-bold text-sm ${
                    t.type === 'Entrada' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {t.type === 'Entrada' ? '+' : '-'} R$ {(Number(t.value) || 0).toLocaleString()}
                  </p>
                  <button 
                    onClick={() => deleteTransaction(t.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Remover transação"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <button 
              onClick={() => setShowFullExtrato(true)}
              className="w-full py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-all"
            >
              Ver Extrato Completo
            </button>
          </div>
        </div>
      </div>

      {/* Full Extrato Modal */}
      {showFullExtrato && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Extrato Completo</h3>
              <button onClick={() => setShowFullExtrato(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(transactions || []).map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500">{t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{t.description || 'Sem descrição'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{t.category || 'Geral'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          t.type === 'Entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {t.type || 'N/A'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${
                        t.type === 'Entrada' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {t.type === 'Entrada' ? '+' : '-'} R$ {(Number(t.value) || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Nova Transação Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Nova Transação</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tipo</label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setNewTransaction({...newTransaction, type: 'Entrada'})}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      newTransaction.type === 'Entrada' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    Entrada
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewTransaction({...newTransaction, type: 'Saída'})}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      newTransaction.type === 'Saída' 
                        ? 'bg-red-50 border-red-200 text-red-600' 
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    Saída
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Descrição</label>
                <input 
                  type="text"
                  required
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Ex: Pagamento Cliente X"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Valor (R$)</label>
                  <input 
                    type="text"
                    required
                    value={newTransaction.value}
                    onChange={(e) => setNewTransaction({...newTransaction, value: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Data</label>
                  <input 
                    type="date"
                    required
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Categoria</label>
                <select 
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="Vendas">Vendas</option>
                  <option value="Serviços">Serviços</option>
                  <option value="Aluguel">Aluguel</option>
                  <option value="Salários">Salários</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="pt-6 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  Salvar Transação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
