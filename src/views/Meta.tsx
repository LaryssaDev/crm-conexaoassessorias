import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { parseCurrency } from '../utils/format';
import { Target, Users, Edit2, X, Check } from 'lucide-react';

export const Meta: React.FC = () => {
  const { user } = useAuth();
  const { users, history } = useData();
  
  const [comercialTarget, setComercialTarget] = useState(100000);
  const [juridicoTarget, setJuridicoTarget] = useState(60000);
  const [editingDept, setEditingDept] = useState<{ id: string, name: string, current: number } | null>(null);
  const [tempTarget, setTempTarget] = useState('');
  
  const comercialConsultants = users.filter(u => u.department === 'Comercial' && u.role === 'Consultor');
  const juridicoConsultants = users.filter(u => u.department === 'Jurídico' && u.role === 'Consultor');

  // Calculate current faturamento per department
  const comercialCurrent = history
    .filter(h => h.department === 'Comercial' && h.type === 'Pagamento')
    .reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  const juridicoCurrent = history
    .filter(h => h.department === 'Jurídico' && h.type === 'Pagamento')
    .reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  const comercialPerConsultant = comercialConsultants.length > 0 ? comercialTarget / comercialConsultants.length : 0;
  const juridicoPerConsultant = juridicoConsultants.length > 0 ? juridicoTarget / juridicoConsultants.length : 0;

  const departments = [
    { 
      id: 'Comercial', 
      name: 'Equipe Comercial', 
      target: comercialTarget, 
      setTarget: setComercialTarget,
      consultants: comercialConsultants,
      perConsultant: comercialPerConsultant,
      current: comercialCurrent,
      color: 'primary'
    },
    { 
      id: 'Juridico', 
      name: 'Equipe Jurídico', 
      target: juridicoTarget, 
      setTarget: setJuridicoTarget,
      consultants: juridicoConsultants,
      perConsultant: juridicoPerConsultant,
      current: juridicoCurrent,
      color: 'emerald'
    }
  ];

  const handleSaveTarget = () => {
    const parsedValue = parseCurrency(tempTarget);
    if (editingDept && !isNaN(parsedValue)) {
      const dept = departments.find(d => d.id === editingDept.id);
      if (dept) {
        dept.setTarget(parsedValue);
      }
      setEditingDept(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Metas e Objetivos</h3>
          <p className="text-sm text-slate-500">Acompanhamento de performance mensal por departamento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {departments.map(dept => {
          const percent = dept.target > 0 ? Math.round((dept.current / dept.target) * 100) : 0;
          return (
            <div key={dept.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${dept.color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-emerald-50 text-emerald-600'} rounded-xl flex items-center justify-center`}>
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{dept.name}</h4>
                    <p className="text-xs text-slate-500">{dept.consultants.length} Consultores ativos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${dept.color === 'primary' ? 'text-primary' : 'text-emerald-600'}`}>{percent}%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Atingido</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-slate-500">Meta Mensal</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">R$ {dept.target.toLocaleString()}</span>
                      {user?.role === 'Administrador' && (
                        <button 
                          onClick={() => {
                            setEditingDept({ id: dept.id, name: dept.name, current: dept.target });
                            setTempTarget(dept.target.toString());
                          }}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${dept.color === 'primary' ? 'bg-primary' : 'bg-emerald-500'} rounded-full transition-all duration-1000`} 
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Meta por Consultor</p>
                      <p className="text-lg font-bold text-slate-800">R$ {dept.perConsultant.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Atual</p>
                      <p className="text-lg font-bold text-slate-800">R$ {dept.current.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Target Modal */}
      {editingDept && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Editar Meta</h3>
              <button onClick={() => setEditingDept(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">Defina a nova meta mensal para a <strong>{editingDept.name}</strong>.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor da Meta (R$)</label>
                <input 
                  type="text"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Ex: 100.000"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setEditingDept(null)}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveTarget}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
