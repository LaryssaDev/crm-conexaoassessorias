import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { parseCurrency } from '../utils/format';
import { FixedCost } from '../types';
import { Plus, Calculator, CheckCircle2, Clock, Trash2, Search, X } from 'lucide-react';

export const CustosFixos: React.FC = () => {
  const { user } = useAuth();
  const { costs, addCost, deleteCost, toggleCostStatus } = useData();
  const [showModal, setShowModal] = useState(false);
  const [newCost, setNewCost] = useState({
    description: '',
    value: '' as any,
    dueDate: new Date().toISOString().split('T')[0]
  });

  const totalPendente = (costs || []).filter(c => c.status === 'Pendente').reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const totalPago = (costs || []).filter(c => c.status === 'Pago').reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  const handleAddCost = (e: React.FormEvent) => {
    e.preventDefault();
    const costToAdd: FixedCost = {
      id: crypto.randomUUID(),
      description: newCost.description,
      value: parseCurrency(newCost.value),
      dueDate: newCost.dueDate,
      status: 'Pendente'
    };
    addCost(costToAdd);
    setShowModal(false);
    setNewCost({ description: '', value: '' as any, dueDate: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Custos Fixos</h3>
          <p className="text-sm text-slate-500">Gestão de despesas mensais da empresa</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <Plus size={18} />
          Novo Custo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Mensal</p>
          <h3 className="text-2xl font-bold text-slate-800">R$ {(totalPago + totalPendente).toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Total Pago</p>
          <h3 className="text-2xl font-bold text-emerald-600">R$ {totalPago.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Total Pendente</p>
          <h3 className="text-2xl font-bold text-amber-600">R$ {totalPendente.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar custo..." 
              className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vencimento</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(costs || []).map(cost => (
              <tr key={cost.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-800">{cost.description || 'Sem descrição'}</td>
                <td className="px-6 py-4 text-slate-600">R$ {(Number(cost.value) || 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-slate-500 text-sm">{cost.dueDate ? new Date(cost.dueDate).toLocaleDateString() : 'N/A'}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleCostStatus(cost.id)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                      cost.status === 'Pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {cost.status === 'Pago' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {cost.status || 'Pendente'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => deleteCost(cost.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Novo Custo Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Novo Custo Fixo</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddCost} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Descrição</label>
                <input 
                  type="text"
                  required
                  value={newCost.description}
                  onChange={(e) => setNewCost({...newCost, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Ex: Aluguel, Internet..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Valor (R$)</label>
                  <input 
                    type="text"
                    required
                    value={newCost.value}
                    onChange={(e) => setNewCost({...newCost, value: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Vencimento</label>
                  <input 
                    type="date"
                    required
                    value={newCost.dueDate}
                    onChange={(e) => setNewCost({...newCost, dueDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
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
                  Salvar Custo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
