import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Lead } from '../types';
import { MoreVertical, Plus, GripVertical, Search, Filter } from 'lucide-react';

export const Funil: React.FC = () => {
  const { leads, updateLead } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  const columns = [
    { id: 'Novo', title: 'Novo', color: 'bg-blue-500' },
    { id: 'Em Negociação', title: 'Em Negociação', color: 'bg-amber-500' },
    { id: 'Fechado', title: 'Fechado', color: 'bg-emerald-500' },
    { id: 'Perdido', title: 'Perdido', color: 'bg-red-500' },
  ];

  const filteredLeads = (leads || []).filter(l => 
    (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.origin || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLeadsByStatus = (status: string) => filteredLeads.filter(l => l.status === status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou origem..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-all">
            <Filter size={16} />
            Filtros Avançados
          </button>
        </div>
      </div>

      <div className="h-[calc(100vh-240px)] overflow-x-auto custom-scrollbar">
        <div className="flex gap-6 min-w-max h-full pb-4">
          {columns.map(column => {
            const columnLeads = getLeadsByStatus(column.id);
            return (
              <div key={column.id} className="w-80 flex flex-col bg-slate-100/50 rounded-2xl border border-slate-200/50">
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
                      className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-primary/20 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{lead.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold tracking-wider">{lead.origin}</p>
                        </div>
                        <select 
                          value={lead.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as Lead['status'];
                            updateLead({ ...lead, status: newStatus });
                          }}
                          className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-primary/30"
                        >
                          <option value="Novo">Novo</option>
                          <option value="Em Negociação">Negociação</option>
                          <option value="Fechado">Fechado</option>
                          <option value="Perdido">Perdido</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500">
                            {(lead.assignedTo || 'U').charAt(0)}
                          </div>
                        </div>
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
    </div>
  );
};
