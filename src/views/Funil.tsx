import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNotifications } from '../context/NotificationContext';
import { HistoryRecord, Lead, Department } from '../types';
import { parseCurrency } from '../utils/format';
import {
  Plus,
  Search,
  Filter,
  Phone,
  MessageSquare,
  Info,
  DollarSign,
  Clock,
  X,
  ChevronRight,
} from 'lucide-react';

export const Funil: React.FC = () => {
  const { user } = useAuth();
  const { leads, updateLead, users, history: dataHistory, addHistory, addTransaction } = useData();
  const { addNotification } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'phone'>('name');

  // Selected lead for the history panel
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // New record modal
  const [showModal, setShowModal] = useState(false);
  const [newDept, setNewDept] = useState<Department>('Comercial');
  const [newType, setNewType] = useState<'Contato' | 'Observação' | 'Pagamento'>('Contato');
  const [newDesc, setNewDesc] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('Pix');
  const [newInstallments, setNewInstallments] = useState('1');

  const columns = [
    { id: 'Novo', title: 'Novo', color: 'bg-blue-500' },
    { id: 'Em Atendimento', title: 'Em Atendimento', color: 'bg-cyan-500' },
    { id: 'Em Negociação', title: 'Em Negociação', color: 'bg-amber-500' },
    { id: 'Fechado', title: 'Fechado', color: 'bg-emerald-500' },
    { id: 'Perdido', title: 'Perdido', color: 'bg-red-500' },
  ];

  const filteredLeads = (leads || []).filter(l => {
    if (user?.role === 'Consultor') {
      const isAssigned =
        l.consultorComercialId === user.id ||
        l.consultorJuridicoId === user.id ||
        l.assignedTo === user.id;
      if (!isAssigned) return false;
    } else if (user?.role === 'Supervisor') {
      const isSupervisor =
        l.supervisorComercialId === user.id ||
        l.supervisorJuridicoId === user.id ||
        l.supervisorId === user.id;
      if (!isSupervisor) return false;
    }

    if (!searchTerm) return true;
    if (searchType === 'phone') {
      const normalizedSearch = searchTerm.replace(/[\D]/g, '');
      const phone1 = (l.phone || '').replace(/[\D]/g, '');
      const phone2 = (l.phone2 || '').replace(/[\D]/g, '');
      return phone1.includes(normalizedSearch) || phone2.includes(normalizedSearch);
    }
    return (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (l.origin || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getLeadsByStatus = (status: string) => filteredLeads.filter(l => l.status === status);

  // History for selected lead
  const leadHistory = selectedLead
    ? (dataHistory || []).filter(h => h.leadId === selectedLead.id)
    : [];

  const addRecord = async () => {
    if (!selectedLead || !newDesc) return;

    let assignedUserId = user?.id;
    if (newType === 'Pagamento') {
      const adminId = users.find(u => u.role === 'Administrador')?.id || user?.id || '';
      if (newDept === 'Comercial') {
        assignedUserId = selectedLead.consultorComercialId || adminId;
      } else if (newDept === 'Jurídico') {
        assignedUserId = selectedLead.consultorJuridicoId || adminId;
      }
    }

    const record: HistoryRecord = {
      id: crypto.randomUUID(),
      leadId: selectedLead.id,
      userId: assignedUserId,
      department: newDept,
      type: newType,
      description: newDesc,
      value: newType === 'Pagamento' ? parseCurrency(newValue) : undefined,
      paymentMethod: newType === 'Pagamento' ? newPaymentMethod : undefined,
      installments: newType === 'Pagamento' ? Number(newInstallments) : undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      await addHistory(record);

      if (newType === 'Pagamento' && newValue) {
        await addTransaction({
          id: crypto.randomUUID(),
          type: 'Entrada',
          description: `Pagamento Lead: ${selectedLead.name} - ${newDesc}`,
          value: parseCurrency(newValue),
          date: new Date().toISOString().split('T')[0],
          category: 'Vendas',
        });
        addNotification(
          'Pagamento Recebido',
          `Pagamento de R$ ${parseCurrency(newValue).toLocaleString()} recebido de ${selectedLead.name}.`,
          'payment'
        );
      }

      setShowModal(false);
      setNewDesc('');
      setNewValue('');
      setNewInstallments('1');
    } catch (error) {
      console.error('Error adding record:', error);
      alert('Erro ao adicionar registro.');
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Search bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <select
            value={searchType}
            onChange={(e) => { setSearchType(e.target.value as 'name' | 'phone'); setSearchTerm(''); }}
            className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            <option value="name">Nome</option>
            <option value="phone">Telefone</option>
          </select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type={searchType === 'phone' ? 'tel' : 'text'}
              placeholder={searchType === 'phone' ? 'Buscar por telefone...' : 'Buscar por nome ou origem...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-all">
            <Filter size={16} />
            Filtros Avançados
          </button>
        </div>
      </div>

      {/* Kanban + history panel */}
      <div className="flex gap-6">
        {/* Kanban board */}
        <div className={`flex-1 overflow-x-auto custom-scrollbar transition-all duration-300 ${selectedLead ? 'max-w-[calc(100%-380px)]' : 'max-w-full'}`}>
          <div className="flex gap-4 min-w-max h-[calc(100vh-260px)] pb-4">
            {columns.map(column => {
              const columnLeads = getLeadsByStatus(column.id);
              return (
                <div key={column.id} className="w-72 flex flex-col bg-slate-100/50 rounded-2xl border border-slate-200/50">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${column.color}`}></div>
                      <h3 className="font-bold text-slate-800 text-sm">{column.title}</h3>
                      <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-400 border border-slate-200">
                        {columnLeads.length}
                      </span>
                    </div>
                    <button className="p-1 text-slate-400 hover:text-slate-600">
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                    {columnLeads.map(lead => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                        className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer transition-all group ${
                          selectedLead?.id === lead.id
                            ? 'border-primary shadow-md ring-2 ring-primary/20'
                            : 'border-slate-100 hover:shadow-md hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate transition-colors ${selectedLead?.id === lead.id ? 'text-primary' : 'text-slate-800 group-hover:text-primary'}`}>
                              {lead.name}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold tracking-wider">{lead.origin}</p>
                            {lead.phone && (
                              <div className="flex items-center gap-1 mt-1.5">
                                <Phone size={10} className="text-slate-400" />
                                <span className="text-[11px] text-slate-500 font-medium">{lead.phone}</span>
                                {lead.phone2 && (
                                  <span className="text-[11px] text-slate-400">/ {lead.phone2}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <ChevronRight size={14} className={`ml-2 mt-0.5 shrink-0 transition-colors ${selectedLead?.id === lead.id ? 'text-primary' : 'text-slate-300'}`} />
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                          <select
                            value={lead.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              const newStatus = e.target.value as Lead['status'];
                              updateLead({ ...lead, status: newStatus });
                            }}
                            className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-primary/30"
                          >
                            <option value="Novo">Novo</option>
                            <option value="Em Atendimento">Em Atendimento</option>
                            <option value="Em Negociação">Negociação</option>
                            <option value="Fechado">Fechado</option>
                            <option value="Perdido">Perdido</option>
                          </select>
                          <p className="text-xs font-bold text-slate-700">R$ {(Number(lead.installmentValue) || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}

                    {columnLeads.length === 0 && (
                      <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 text-xs text-center p-4">
                        Nenhum lead encontrado
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* History side panel */}
        {selectedLead && (
          <div className="w-96 shrink-0 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm h-[calc(100vh-260px)] overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Panel header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-slate-800 truncate">{selectedLead.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Histórico de andamento</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">
                    {selectedLead.contractType}
                  </span>
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    R$ {(Number(selectedLead.installmentValue) || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all shrink-0 ml-2"
              >
                <X size={18} />
              </button>
            </div>

            {/* Add record button */}
            <div className="px-5 py-3 border-b border-slate-100">
              <button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                <Plus size={16} />
                Novo Registro
              </button>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              {leadHistory.length > 0 ? (
                leadHistory.map((record, idx) => (
                  <div key={record.id} className="relative pl-8">
                    {idx !== leadHistory.length - 1 && (
                      <div className="absolute left-[11px] top-7 bottom-[-24px] w-0.5 bg-slate-100"></div>
                    )}
                    <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                      record.type === 'Contato' ? 'bg-blue-500' :
                      record.type === 'Pagamento' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}>
                      {record.type === 'Contato' ? <MessageSquare size={12} className="text-white" /> :
                       record.type === 'Pagamento' ? <DollarSign size={12} className="text-white" /> :
                       <Info size={12} className="text-white" />}
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            {record.type} • {record.department}
                          </span>
                          <span className="text-[10px] font-bold text-primary/70 block">
                            {users?.find(u => u.id === record.userId)?.name || 'Sistema'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                          <Clock size={10} />
                          {record.createdAt ? new Date(record.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{record.description}</p>
                      {record.value && (
                        <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col gap-1">
                          <span className="text-xs font-bold text-emerald-600">Valor: R$ {(Number(record.value) || 0).toLocaleString()}</span>
                          <span className="text-[10px] text-slate-500 font-medium uppercase">
                            Forma: {record.paymentMethod} • {record.installments}x
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                  <Clock size={40} className="mb-3 opacity-20" />
                  <p className="text-sm text-center">Nenhum registro encontrado para este cliente.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Record Modal */}
      {showModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Novo Registro</h3>
              <p className="text-xs text-slate-500">Adicione uma atualização para {selectedLead.name}</p>
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
                        newDept === d ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
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
                  {(['Contato', 'Observação', 'Pagamento'] as const)
                    .filter(t => t !== 'Pagamento' || user?.role === 'Administrador' || user?.role === 'Financeiro')
                    .map(t => (
                      <button
                        key={t}
                        onClick={() => setNewType(t)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          newType === t ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                </div>
              </div>

              {newType === 'Pagamento' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                    <input
                      type="text"
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
