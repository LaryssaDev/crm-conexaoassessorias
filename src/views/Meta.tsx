import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { parseCurrency } from '../utils/format';
import { Target, Users, Edit2, X, Check, Plus, Trash2, ChevronDown, ChevronUp, User as UserIcon } from 'lucide-react';

export const Meta: React.FC = () => {
  const { user } = useAuth();
  const { users, history, comercialTarget, juridicoTarget, setComercialTarget, setJuridicoTarget, setUserTarget, deleteTarget } = useData();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTargetDept, setNewTargetDept] = useState<'Comercial' | 'Juridico'>('Comercial');
  const [newTargetValue, setNewTargetValue] = useState('');
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editTargetValue, setEditTargetValue] = useState('');
  
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

  let departments = [
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

  // Filter departments for Consultants and Supervisors
  if (user?.role === 'Consultor' || user?.role === 'Supervisor') {
    departments = departments.filter(d => d.id === (user.department === 'Comercial' ? 'Comercial' : 'Juridico'));
  }

  // Filter out departments with no target (target === 0)
  const activeDepartments = departments.filter(d => d.target > 0);

  const handleAddTarget = async () => {
    const parsedValue = parseCurrency(newTargetValue);
    if (!isNaN(parsedValue)) {
      if (newTargetDept === 'Comercial') {
        await setComercialTarget(parsedValue);
      } else {
        await setJuridicoTarget(parsedValue);
      }
      setShowAddModal(false);
      setNewTargetValue('');
    }
  };

  const handleDeleteTarget = async (id: string) => {
    if (id === 'Comercial') {
      await deleteTarget('comercial_target');
    } else {
      await deleteTarget('juridico_target');
    }
  };

  const handleSaveUserTarget = async (userId: string) => {
    const parsedValue = parseCurrency(editTargetValue);
    if (!isNaN(parsedValue)) {
      await setUserTarget(userId, parsedValue);
      setEditingUserId(null);
      setEditTargetValue('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Metas e Objetivos</h3>
          <p className="text-sm text-slate-500">Acompanhamento de performance mensal por departamento</p>
        </div>
        {(user?.role === 'Administrador' || user?.role === 'Financeiro') && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <Plus size={18} />
            Adicionar Meta
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeDepartments.length > 0 ? (
          activeDepartments.map(dept => {
            const isConsultant = user?.role === 'Consultor';
            
            // For consultants, we show their individual target if set, otherwise the average
            const userTarget = users.find(u => u.id === user?.id)?.target;
            const targetVal = isConsultant 
              ? (userTarget !== undefined ? userTarget : dept.perConsultant)
              : dept.target;

            // Calculate current faturamento for the logged-in user if they are a consultant
            const userIndividualCurrent = history
              .filter(h => h.userId === user?.id && h.type === 'Pagamento')
              .reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

            const currentVal = isConsultant ? userIndividualCurrent : dept.current;
            const percent = targetVal > 0 ? Math.round((currentVal / targetVal) * 100) : 0;
            const isExpanded = expandedDept === dept.id;

            return (
              <div key={dept.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${dept.color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-emerald-50 text-emerald-600'} rounded-xl flex items-center justify-center`}>
                        <Users size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{isConsultant ? 'Minha Meta Individual' : dept.name}</h4>
                        <p className="text-xs text-slate-500">{isConsultant ? 'Sua performance individual' : `${dept.consultants.length} Consultores ativos`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${dept.color === 'primary' ? 'text-primary' : 'text-emerald-600'}`}>{percent}%</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Atingido</p>
                      </div>
                      {(user?.role === 'Administrador' || user?.role === 'Financeiro') && (
                        <button 
                          onClick={() => setExpandedDept(isExpanded ? null : dept.id)}
                          className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
                        >
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-slate-500">{isConsultant ? 'Minha Meta' : 'Meta Mensal'}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">R$ {targetVal.toLocaleString()}</span>
                          { (user?.role === 'Administrador' || user?.role === 'Financeiro') && (
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleDeleteTarget(dept.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Apagar Meta"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
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
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            {isConsultant ? 'Meta da Equipe' : 'Meta por Consultor (Média)'}
                          </p>
                          <p className="text-lg font-bold text-slate-800">R$ {(isConsultant ? dept.target : dept.perConsultant).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            {isConsultant ? 'Meu Faturamento' : 'Total Atual'}
                          </p>
                          <p className="text-lg font-bold text-slate-800">R$ {currentVal.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consultants Detail List */}
                {isExpanded && (user?.role === 'Administrador' || user?.role === 'Financeiro') && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-8">
                    <h5 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <UserIcon size={16} className="text-primary" />
                      Metas Individuais dos Consultores
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dept.consultants.map(consultant => {
                        const consultantCurrent = history
                          .filter(h => h.userId === consultant.id && h.type === 'Pagamento')
                          .reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
                        
                        const consultantTarget = consultant.target !== undefined ? consultant.target : dept.perConsultant;
                        const consultantPercent = consultantTarget > 0 ? Math.round((consultantCurrent / consultantTarget) * 100) : 0;
                        const isEditing = editingUserId === consultant.id;

                        return (
                          <div key={consultant.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="font-bold text-slate-800">{consultant.name}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Consultor</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-primary">{consultantPercent}%</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Meta Atribuída:</span>
                                {isEditing ? (
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="text"
                                      value={editTargetValue}
                                      onChange={(e) => setEditTargetValue(e.target.value)}
                                      className="w-24 bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                                      placeholder="Valor"
                                      autoFocus
                                    />
                                    <button 
                                      onClick={() => handleSaveUserTarget(consultant.id)}
                                      className="p-1 bg-primary text-white rounded-md hover:bg-primary/90"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button 
                                      onClick={() => setEditingUserId(null)}
                                      className="p-1 bg-slate-100 text-slate-400 rounded-md hover:bg-slate-200"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-800">R$ {consultantTarget.toLocaleString()}</span>
                                    <button 
                                      onClick={() => {
                                        setEditingUserId(consultant.id);
                                        setEditTargetValue(consultantTarget.toString());
                                      }}
                                      className="p-1 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-md transition-all"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">Realizado:</span>
                                <span className="text-sm font-bold text-slate-800">R$ {consultantCurrent.toLocaleString()}</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${dept.color === 'primary' ? 'bg-primary' : 'bg-emerald-500'} rounded-full`} 
                                  style={{ width: `${Math.min(consultantPercent, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
              <Target size={32} />
            </div>
            <h4 className="text-lg font-bold text-slate-800">Nenhuma meta ativa</h4>
            <p className="text-sm text-slate-500 max-w-xs">Clique no botão "Adicionar Meta" acima para definir os objetivos do mês.</p>
          </div>
        )}
      </div>

      {/* Add Target Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Adicionar Meta</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                <select 
                  value={newTargetDept}
                  onChange={(e) => setNewTargetDept(e.target.value as 'Comercial' | 'Juridico')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Comercial">Comercial</option>
                  <option value="Juridico">Jurídico</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor da Meta (R$)</label>
                <input 
                  type="text"
                  value={newTargetValue}
                  onChange={(e) => setNewTargetValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Ex: 100.000"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddTarget}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
