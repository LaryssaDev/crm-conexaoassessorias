import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Trophy, Medal, Users } from 'lucide-react';

export const Ranking: React.FC = () => {
  const { user } = useAuth();
  const { users, leads, history } = useData();
  const [selectedDept, setSelectedDept] = useState<'Comercial' | 'Jurídico'>('Comercial');

  const consultants = users.filter(u => u.department === selectedDept && u.role === 'Consultor');
  
  // Add Aline Ferreira if she's the admin and might have sales
  const admins = users.filter(u => u.role === 'Administrador');
  const allPotentialSellers = [...consultants, ...admins];

  const rankingData = allPotentialSellers.map(consultant => {
    const consultantHistory = history.filter(h => h.userId === consultant.id && h.type === 'Pagamento' && h.department === selectedDept);
    const faturamento = consultantHistory.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
    
    // Count leads assigned to this consultant in this department
    const consultantLeads = leads.filter(l => 
      selectedDept === 'Comercial' ? l.consultorComercialId === consultant.id : l.consultorJuridicoId === consultant.id
    ).length;

    // Conversion: Leads with at least one payment / Total leads
    const leadsWithPayment = leads.filter(l => {
      const isAssigned = selectedDept === 'Comercial' ? l.consultorComercialId === consultant.id : l.consultorJuridicoId === consultant.id;
      if (!isAssigned) return false;
      return history.some(h => h.leadId === l.id && h.type === 'Pagamento' && h.department === selectedDept);
    }).length;

    const conversion = consultantLeads > 0 ? Math.round((leadsWithPayment / consultantLeads) * 100) : 0;

    return {
      id: consultant.id,
      name: consultant.name,
      faturamento,
      leads: consultantLeads,
      conversion
    };
  })
  .filter(item => item.faturamento > 0 || item.leads > 0) // Only show those with some activity
  .sort((a, b) => b.faturamento - a.faturamento);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Ranking de Performance</h3>
          <p className="text-sm text-slate-500">Os melhores consultores por departamento</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none">
            <option>Março 2024</option>
            <option>Fevereiro 2024</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button 
          onClick={() => setSelectedDept('Comercial')}
          className={`p-6 rounded-2xl border transition-all text-left flex items-center gap-4 ${
            selectedDept === 'Comercial' 
              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
              : 'bg-white border-slate-100 text-slate-800 hover:border-primary/30'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedDept === 'Comercial' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
            <Users size={24} />
          </div>
          <div>
            <h4 className="font-bold">Meta Comercial</h4>
            <p className={`text-xs ${selectedDept === 'Comercial' ? 'text-white/70' : 'text-slate-500'}`}>Ver ranking do comercial</p>
          </div>
        </button>

        <button 
          onClick={() => setSelectedDept('Jurídico')}
          className={`p-6 rounded-2xl border transition-all text-left flex items-center gap-4 ${
            selectedDept === 'Jurídico' 
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
              : 'bg-white border-slate-100 text-slate-800 hover:border-emerald-600/30'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedDept === 'Jurídico' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
            <Users size={24} />
          </div>
          <div>
            <h4 className="font-bold">Meta Jurídico</h4>
            <p className={`text-xs ${selectedDept === 'Jurídico' ? 'text-white/70' : 'text-slate-500'}`}>Ver ranking do jurídico</p>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {rankingData.slice(0, 3).map((item, idx) => (
          <div key={item.id} className={`relative p-8 rounded-3xl border ${
            idx === 0 
              ? `${selectedDept === 'Comercial' ? 'bg-primary border-primary shadow-primary/20' : 'bg-emerald-600 border-emerald-600 shadow-emerald-600/20'} text-white shadow-xl scale-105 z-10` 
              : 'bg-white text-slate-800 border-slate-100'
          }`}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              {idx === 0 && <Trophy className="text-amber-400 w-10 h-10" />}
              {idx === 1 && <Medal className="text-slate-300 w-10 h-10" />}
              {idx === 2 && <Medal className="text-amber-600 w-10 h-10" />}
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-full border-4 ${idx === 0 ? 'border-white/20' : 'border-slate-100'} overflow-hidden mb-4`}>
                <img src={`https://ui-avatars.com/api/?name=${item.name}&background=random`} alt={item.name} referrerPolicy="no-referrer" />
              </div>
              <h4 className="font-bold text-lg">{item.name}</h4>
              <p className={`text-xs ${idx === 0 ? 'text-white/70' : 'text-slate-500'}`}>Consultor Master</p>
              
              <div className="mt-6 w-full space-y-4">
                <div className={`p-4 rounded-2xl ${idx === 0 ? 'bg-white/10' : 'bg-slate-50'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${idx === 0 ? 'text-white/60' : 'text-slate-400'}`}>Faturamento</p>
                  <p className="text-xl font-bold">R$ {item.faturamento.toLocaleString()}</p>
                </div>
                <div className="flex justify-between px-2">
                  <div className="text-center">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${idx === 0 ? 'text-white/60' : 'text-slate-400'}`}>Leads</p>
                    <p className="font-bold">{item.leads}</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${idx === 0 ? 'text-white/60' : 'text-slate-400'}`}>Conversão</p>
                    <p className="font-bold">{item.conversion}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Posição</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Consultor</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Faturamento</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Leads</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Conversão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rankingData.map((item, idx) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    idx === 0 ? 'bg-amber-100 text-amber-600' : 
                    idx === 1 ? 'bg-slate-100 text-slate-500' : 
                    idx === 2 ? 'bg-amber-50 text-amber-700' : 'text-slate-400'
                  }`}>
                    {idx + 1}º
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                <td className="px-6 py-4 text-slate-600 font-medium">R$ {item.faturamento.toLocaleString()}</td>
                <td className="px-6 py-4 text-slate-600">{item.leads}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${selectedDept === 'Comercial' ? 'bg-emerald-500' : 'bg-blue-500'} rounded-full`} style={{ width: `${item.conversion}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-600">{item.conversion}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
