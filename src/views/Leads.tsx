import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNotifications } from '../context/NotificationContext';
import { Lead } from '../types';
import { parseCurrency } from '../utils/format';
import { 
  Plus, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  Edit2,
  Trash2,
  Mail,
  Phone,
  X
} from 'lucide-react';

export const Leads: React.FC = () => {
  const { user } = useAuth();
  const { leads, addLead, updateLead, deleteLead } = useData();
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Form state for new lead
  const [newLead, setNewLead] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    origin: 'Instagram',
    contractType: 'Veiculo',
    installmentValue: ''
  });

  const filteredLeads = (leads || []).filter(lead => 
    (lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.cpf || '').includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Novo': return 'bg-blue-100 text-blue-700';
      case 'Em Negociação': return 'bg-amber-100 text-amber-700';
      case 'Fechado': return 'bg-emerald-100 text-emerald-700';
      case 'Perdido': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    const lead: Lead = {
      id: crypto.randomUUID(),
      ...newLead,
      installmentValue: parseCurrency(newLead.installmentValue),
      status: 'Novo',
      assignedTo: user?.id,
      createdAt: new Date().toISOString()
    };
    addLead(lead);
    addNotification(
      'Novo Cliente',
      `O cliente ${lead.name} foi adicionado com sucesso.`,
      'lead'
    );
    setShowAddModal(false);
    setNewLead({ name: '', cpf: '', phone: '', email: '', origin: 'Instagram', contractType: 'Veiculo', installmentValue: '' });
  };

  const handleEditLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLead) {
      updateLead(editingLead);
      setShowEditModal(false);
      setEditingLead(null);
    }
  };

  const handleDeleteLead = () => {
    if (showDeleteConfirm) {
      deleteLead(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  const exportLeads = () => {
    const headers = ['Nome', 'CPF', 'Telefone', 'E-mail', 'Origem', 'Tipo de Contrato', 'Valor da Parcela', 'Status', 'Data de Criação'];
    const csvContent = [
      headers.join(';'),
      ...leads.map(l => [
        `"${(l.name || '').replace(/"/g, '""')}"`,
        `"${(l.cpf || '').replace(/"/g, '""')}"`,
        `"${(l.phone || '').replace(/"/g, '""')}"`,
        `"${(l.email || '').replace(/"/g, '""')}"`,
        `"${(l.origin || '').replace(/"/g, '""')}"`,
        `"${(l.contractType || '').replace(/"/g, '""')}"`,
        (l.installmentValue || 0).toString().replace('.', ','),
        `"${(l.status || '').replace(/"/g, '""')}"`,
        `"${(l.createdAt || '').replace(/"/g, '""')}"`
      ].join(';'))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'leads_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/);
      
      if (lines.length < 2) return;

      // Detect delimiter
      const firstLine = lines[0];
      const delimiter = firstLine.includes(';') ? ';' : ',';

      const importedLeads: Lead[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Robust CSV parser that handles quotes and empty fields
        const values: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            if (inQuotes && line[j+1] === '"') {
              current += '"';
              j++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === delimiter && !inQuotes) {
            values.push(current);
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current);

        if (values.length < 4) continue;

        const lead: Lead = {
          id: crypto.randomUUID(),
          name: values[0] || '',
          cpf: values[1] || '',
          phone: values[2] || '',
          email: values[3] || '',
          origin: values[4] || 'Instagram',
          contractType: values[5] || 'Veiculo',
          installmentValue: Number((values[6] || '0').replace(',', '.')),
          status: (values[7] || 'Novo') as any,
          assignedTo: user?.id,
          createdAt: values[8] || new Date().toISOString()
        };
        
        importedLeads.push(lead);
      }

      if (importedLeads.length > 0) {
        importedLeads.forEach(lead => addLead(lead));
        alert(`${importedLeads.length} leads importados com sucesso!`);
      } else {
        alert('Nenhum lead válido encontrado no arquivo.');
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  if (!leads) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou CPF..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm w-80 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileImport} 
            accept=".csv" 
            className="hidden" 
          />
          <button 
            onClick={handleImportClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition-all"
          >
            <Upload size={18} />
            Importar
          </button>
          <button 
            onClick={exportLeads}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition-all"
          >
            <Download size={18} />
            Exportar
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <Plus size={18} />
            Novo Lead
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lead</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Origem</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contrato</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                        {(lead.name || 'U').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{lead.name || 'Sem nome'}</p>
                        <p className="text-xs text-slate-500">{lead.cpf || 'Sem CPF'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Mail size={12} className="text-slate-400" />
                        {lead.email || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone size={12} className="text-slate-400" />
                        {lead.phone || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{lead.origin || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-slate-800 font-medium">{lead.contractType || 'N/A'}</p>
                      <p className="text-xs text-slate-500">R$ {(Number(lead.installmentValue) || 0).toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(lead.status || 'Novo')}`}>
                      {lead.status || 'Novo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingLead(lead);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(lead.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Apagar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">Mostrando {filteredLeads.length} de {leads.length} leads</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 text-xs font-medium text-white bg-primary rounded-lg">1</button>
            <button className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Próximo</button>
          </div>
        </div>
      </div>

      {/* Edit Lead Modal */}
      {showEditModal && editingLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Editar Lead</h3>
                <p className="text-xs text-slate-500">Atualize os dados do cliente</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditLead}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                  <input 
                    type="text"
                    required
                    value={editingLead.name}
                    onChange={(e) => setEditingLead({...editingLead, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                  <input 
                    type="text"
                    required
                    value={editingLead.cpf}
                    onChange={(e) => setEditingLead({...editingLead, cpf: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                  <input 
                    type="text"
                    required
                    value={editingLead.phone}
                    onChange={(e) => setEditingLead({...editingLead, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                  <input 
                    type="email"
                    required
                    value={editingLead.email}
                    onChange={(e) => setEditingLead({...editingLead, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Origem</label>
                  <select 
                    value={editingLead.origin}
                    onChange={(e) => setEditingLead({...editingLead, origin: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option>Instagram</option>
                    <option>Facebook</option>
                    <option>Google</option>
                    <option>Indicação</option>
                    <option>WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Contrato</label>
                  <select 
                    value={editingLead.contractType}
                    onChange={(e) => setEditingLead({...editingLead, contractType: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Veiculo">Veiculo</option>
                    <option value="Imovel">Imovel</option>
                    <option value="Financiamento">Financiamento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor da Parcela (R$)</label>
                  <input 
                    type="text"
                    required
                    value={editingLead.installmentValue}
                    onChange={(e) => setEditingLead({...editingLead, installmentValue: parseCurrency(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    value={editingLead.status}
                    onChange={(e) => setEditingLead({...editingLead, status: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Novo">Novo</option>
                    <option value="Em Negociação">Em Negociação</option>
                    <option value="Fechado">Fechado</option>
                    <option value="Perdido">Perdido</option>
                  </select>
                </div>
              </div>

              <div className="p-6 bg-slate-50 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Confirmar Exclusão</h3>
              <p className="text-slate-500 mb-6">Tem certeza que deseja apagar este lead? Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDeleteLead}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl shadow-lg shadow-red-200 hover:bg-red-600 transition-all"
                >
                  Apagar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Cadastrar Novo Lead</h3>
                <p className="text-xs text-slate-500">Preencha os dados para adicionar um novo cliente</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddLead}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                  <input 
                    type="text"
                    required
                    value={newLead.name}
                    onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Nome do cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                  <input 
                    type="text"
                    required
                    value={newLead.cpf}
                    onChange={(e) => setNewLead({...newLead, cpf: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                  <input 
                    type="text"
                    required
                    value={newLead.phone}
                    onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                  <input 
                    type="email"
                    required
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Origem</label>
                  <select 
                    value={newLead.origin}
                    onChange={(e) => setNewLead({...newLead, origin: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option>Instagram</option>
                    <option>Facebook</option>
                    <option>Google</option>
                    <option>Indicação</option>
                    <option>WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Contrato</label>
                  <select 
                    value={newLead.contractType}
                    onChange={(e) => setNewLead({...newLead, contractType: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Veiculo">Veiculo</option>
                    <option value="Imovel">Imovel</option>
                    <option value="Financiamento">Financiamento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor da Parcela (R$)</label>
                  <input 
                    type="text"
                    required
                    value={newLead.installmentValue}
                    onChange={(e) => setNewLead({...newLead, installmentValue: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  Cadastrar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
