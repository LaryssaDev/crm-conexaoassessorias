import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { HistoryRecord, Lead, Department } from '../types';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Info, 
  DollarSign, 
  ChevronRight,
  Phone,
  Clock,
  Users
} from 'lucide-react';

export const Andamento: React.FC = () => {
  const { user } = useAuth();
  const { leads, history: dataHistory, addHistory } = useData();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Update local history when dataHistory or selectedLead changes
  React.useEffect(() => {
    if (selectedLead) {
      setHistory(dataHistory.filter(h => h.leadId === selectedLead.id));
    } else {
      setHistory([]);
    }
  }, [selectedLead, dataHistory]);

  // Form state
  const [newDept, setNewDept] = useState<Department>('Comercial');
  const [newType, setNewType] = useState<'Contato' | 'Observação' | 'Pagamento'>('Contato');
  const [newDesc, setNewDesc] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('Pix');
  const [newInstallments, setNewInstallments] = useState('1');

  const addRecord = () => {
    if (!selectedLead || !newDesc) return;
    
    const record: HistoryRecord = {
      id: Math.random().toString(36).substr(2, 9),
      leadId: selectedLead.id,
      department: newDept,
      type: newType,
      description: newDesc,
      value: newType === 'Pagamento' ? Number(newValue) : undefined,
      paymentMethod: newType === 'Pagamento' ? newPaymentMethod : undefined,
      installments: newType === 'Pagamento' ? Number(newInstallments) : undefined,
      createdAt: new Date().toISOString(),
    };

    addHistory(record);
    setShowModal(false);
    setNewDesc('');
    setNewValue('');
    setNewInstallments('1');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Leads List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar cliente..." 
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>

        <div className="space-y-3">
          {leads.map((lead) => (
            <button
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedLead?.id === lead.id 
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-white border-slate-100 text-slate-800 hover:border-primary/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold truncate pr-2">{lead.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                  selectedLead?.id === lead.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {lead.status}
                </span>
              </div>
              <p className={`text-xs ${selectedLead?.id === lead.id ? 'text-white/80' : 'text-slate-500'}`}>
                {lead.contractType} • R$ {lead.installmentValue.toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Details View */}
      <div className="lg:col-span-2">
        {selectedLead ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-200px)]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{selectedLead.name}</h3>
                <p className="text-xs text-slate-500">Histórico de andamento do processo</p>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                <Plus size={16} />
                Novo Registro
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {history.filter(h => h.leadId === selectedLead.id).length > 0 ? (
                history.filter(h => h.leadId === selectedLead.id).map((record, idx) => (
                  <div key={record.id} className="relative pl-8">
                    {/* Timeline line */}
                    {idx !== history.filter(h => h.leadId === selectedLead.id).length - 1 && (
                      <div className="absolute left-[11px] top-8 bottom-[-32px] w-0.5 bg-slate-100"></div>
                    )}
                    
                    {/* Icon */}
                    <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                      record.type === 'Contato' ? 'bg-blue-500' : 
                      record.type === 'Pagamento' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}>
                      {record.type === 'Contato' ? <MessageSquare size={12} className="text-white" /> : 
                       record.type === 'Pagamento' ? <DollarSign size={12} className="text-white" /> : 
                       <Info size={12} className="text-white" />}
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {record.type} • {record.department}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(record.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{record.description}</p>
                      {record.value && (
                        <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col gap-1">
                          <span className="text-xs font-bold text-emerald-600">Valor: R$ {record.value.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-500 font-medium uppercase">Forma: {record.paymentMethod} • {record.installments}x</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Clock size={48} className="mb-4 opacity-20" />
                  <p>Nenhum registro encontrado para este cliente.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-12">
            <Users size={48} className="mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-slate-300">Selecione um cliente</h3>
            <p className="text-center max-w-xs mt-2">Escolha um cliente na lista ao lado para ver o histórico completo de andamento.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Novo Registro</h3>
              <p className="text-xs text-slate-500">Adicione uma nova atualização para {selectedLead?.name}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Comercial', 'Jurídico'] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setNewDept(d)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        newDept === d ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Registro</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Contato', 'Observação', 'Pagamento'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setNewType(t)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        newType === t ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {newType === 'Pagamento' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                    <input 
                      type="number"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
                    <select 
                      value={newPaymentMethod}
                      onChange={(e) => setNewPaymentMethod(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option>Pix</option>
                      <option>Cartão de Crédito</option>
                      <option>Boleto</option>
                      <option>Dinheiro</option>
                      <option>Transferência</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Parcelas</label>
                    <input 
                      type="number"
                      value={newInstallments}
                      onChange={(e) => setNewInstallments(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <textarea 
                  rows={4}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Descreva o que aconteceu..."
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={addRecord}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                Salvar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
