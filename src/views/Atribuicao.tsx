import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_USERS, INITIAL_LEADS } from '../constants';
import { Lead, User } from '../types';
import { 
  UserCheck, 
  Search, 
  Filter, 
  Save,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';

export const Atribuicao: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [searchTerm, setSearchTerm] = useState('');

  const supervisorsComercial = INITIAL_USERS.filter(u => u.department === 'Comercial' && u.role === 'Supervisor');
  const consultoresComercial = INITIAL_USERS.filter(u => u.department === 'Comercial' && u.role === 'Consultor');
  const supervisorsJuridico = INITIAL_USERS.filter(u => u.department === 'Jurídico' && u.role === 'Supervisor');
  const consultoresJuridico = INITIAL_USERS.filter(u => u.department === 'Jurídico' && u.role === 'Consultor');

  const handleAssign = (leadId: string, role: keyof Lead, userId: string) => {
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, [role]: userId } : lead
    ));
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.cpf.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Atribuição de Leads</h3>
          <p className="text-sm text-slate-500">Defina os responsáveis comerciais e jurídicos para cada cliente</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-64">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Comercial</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Jurídico</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{lead.name}</p>
                        <p className="text-xs text-slate-500">{lead.cpf}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Supervisor</label>
                        <select 
                          value={lead.supervisorComercialId || ''}
                          onChange={(e) => handleAssign(lead.id, 'supervisorComercialId', e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Selecionar...</option>
                          {supervisorsComercial.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Consultor</label>
                        <select 
                          value={lead.consultorComercialId || ''}
                          onChange={(e) => handleAssign(lead.id, 'consultorComercialId', e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Selecionar...</option>
                          {consultoresComercial.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Supervisor</label>
                        <select 
                          value={lead.supervisorJuridicoId || ''}
                          onChange={(e) => handleAssign(lead.id, 'supervisorJuridicoId', e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Selecionar...</option>
                          {supervisorsJuridico.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Consultor</label>
                        <select 
                          value={lead.consultorJuridicoId || ''}
                          onChange={(e) => handleAssign(lead.id, 'consultorJuridicoId', e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Selecionar...</option>
                          {consultoresJuridico.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => alert('Atribuições salvas com sucesso!')}
                      className="p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all"
                      title="Salvar Atribuições"
                    >
                      <Save size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
