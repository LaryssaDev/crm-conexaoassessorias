import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  Clock, 
  LogIn, 
  Coffee, 
  LogOut, 
  Calendar, 
  User as UserIcon,
  Search,
  Filter,
  ChevronRight,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { TimeRecord, User } from '../types';
import { cn } from '../types';

export const Ponto: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { users, timeRecords, addTimeRecord, updateTimeRecord } = useData();
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const isAdminOrFinance = currentUser?.role === 'Administrador' || currentUser?.role === 'Financeiro';

  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour12: false });

  // Current user's record for today
  const todayRecord = useMemo(() => {
    return timeRecords.find(r => r.userId === currentUser?.id && r.date === today);
  }, [timeRecords, currentUser?.id, today]);

  const handleRegisterPoint = async (type: 'checkIn' | 'lunchStart' | 'lunchEnd' | 'checkOut') => {
    if (!currentUser) return;

    try {
      if (!todayRecord) {
        if (type !== 'checkIn') {
          alert('Você precisa registrar a entrada primeiro!');
          return;
        }
        const newRecord: TimeRecord = {
          id: crypto.randomUUID(),
          userId: currentUser.id,
          date: today,
          checkIn: currentTime,
          createdAt: new Date().toISOString()
        };
        await addTimeRecord(newRecord);
      } else {
        const updatedRecord = { ...todayRecord, [type]: currentTime };
        await updateTimeRecord(updatedRecord);
      }
    } catch (error) {
      console.error('Error registering point:', error);
      alert('Erro ao registrar ponto. Tente novamente.');
    }
  };

  const filteredUsers = useMemo(() => {
    if (!isAdminOrFinance) return [];
    return users.filter(u => 
      u.role === 'Consultor' && 
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.login.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, isAdminOrFinance, searchTerm]);

  const displayRecords = useMemo(() => {
    const userId = isAdminOrFinance ? selectedUserId : currentUser?.id;
    if (!userId) return [];

    return timeRecords
      .filter(r => r.userId === userId && r.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [timeRecords, selectedUserId, currentUser?.id, isAdminOrFinance, selectedMonth]);

  const handleDownloadReport = () => {
    const selectedUser = users.find(u => u.id === (isAdminOrFinance ? selectedUserId : currentUser?.id));
    if (!selectedUser || displayRecords.length === 0) {
      alert('Nenhum dado disponível para exportar.');
      return;
    }

    const headers = ['Data', 'Entrada', 'Saída Almoço', 'Volta Almoço', 'Saída', 'Status'];
    const csvContent = [
      headers.join(','),
      ...displayRecords.map(r => {
        const status = getStatusLabel(r).label;
        return [
          new Date(r.date + 'T00:00:00').toLocaleDateString('pt-BR'),
          r.checkIn || '-',
          r.lunchStart || '-',
          r.lunchEnd || '-',
          r.checkOut || '-',
          status
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Relatorio_Ponto_${selectedUser.name}_${selectedMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusLabel = (record: TimeRecord) => {
    if (record.checkOut) return { label: 'Finalizado', color: 'bg-slate-100 text-slate-600' };
    if (record.lunchEnd) return { label: 'Trabalhando', color: 'bg-emerald-100 text-emerald-700' };
    if (record.lunchStart) return { label: 'Almoço', color: 'bg-amber-100 text-amber-700' };
    if (record.checkIn) return { label: 'Trabalhando', color: 'bg-emerald-100 text-emerald-700' };
    return { label: 'Pendente', color: 'bg-slate-100 text-slate-400' };
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Registro de Ponto</h3>
          <p className="text-sm text-slate-500">Controle de jornada e horários</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
          <Calendar size={18} className="text-primary" />
          <span className="text-sm font-bold text-slate-700">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </span>
        </div>
      </div>

      {currentUser?.role === 'Consultor' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-4">
              <Clock size={40} />
            </div>
            <h4 className="text-2xl font-bold text-slate-800 mb-1">{currentTime.substring(0, 5)}</h4>
            <p className="text-sm text-slate-500 uppercase tracking-widest font-medium">Horário Atual</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              disabled={!!todayRecord?.checkIn}
              onClick={() => handleRegisterPoint('checkIn')}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                todayRecord?.checkIn 
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700 opacity-60 cursor-not-allowed" 
                  : "bg-white border-slate-100 text-slate-600 hover:border-primary hover:text-primary hover:shadow-lg hover:shadow-primary/5"
              )}
            >
              <LogIn size={24} />
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider mb-1">Entrada</p>
                <p className="text-lg font-bold">{todayRecord?.checkIn || '--:--'}</p>
              </div>
            </button>

            <button
              disabled={!todayRecord?.checkIn || !!todayRecord?.lunchStart}
              onClick={() => handleRegisterPoint('lunchStart')}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                todayRecord?.lunchStart 
                  ? "bg-amber-50 border-amber-100 text-amber-700 opacity-60 cursor-not-allowed" 
                  : !todayRecord?.checkIn 
                    ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                    : "bg-white border-slate-100 text-slate-600 hover:border-amber-500 hover:text-amber-500 hover:shadow-lg hover:shadow-amber-500/5"
              )}
            >
              <Coffee size={24} />
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider mb-1">Saída Almoço</p>
                <p className="text-lg font-bold">{todayRecord?.lunchStart || '--:--'}</p>
              </div>
            </button>

            <button
              disabled={!todayRecord?.lunchStart || !!todayRecord?.lunchEnd}
              onClick={() => handleRegisterPoint('lunchEnd')}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                todayRecord?.lunchEnd 
                  ? "bg-blue-50 border-blue-100 text-blue-700 opacity-60 cursor-not-allowed" 
                  : !todayRecord?.lunchStart 
                    ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                    : "bg-white border-slate-100 text-slate-600 hover:border-blue-500 hover:text-blue-500 hover:shadow-lg hover:shadow-blue-500/5"
              )}
            >
              <Coffee size={24} />
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider mb-1">Volta Almoço</p>
                <p className="text-lg font-bold">{todayRecord?.lunchEnd || '--:--'}</p>
              </div>
            </button>

            <button
              disabled={!todayRecord?.lunchEnd || !!todayRecord?.checkOut}
              onClick={() => handleRegisterPoint('checkOut')}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                todayRecord?.checkOut 
                  ? "bg-red-50 border-red-100 text-red-700 opacity-60 cursor-not-allowed" 
                  : !todayRecord?.lunchEnd 
                    ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                    : "bg-white border-slate-100 text-slate-600 hover:border-red-500 hover:text-red-500 hover:shadow-lg hover:shadow-red-500/5"
              )}
            >
              <LogOut size={24} />
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider mb-1">Saída</p>
                <p className="text-lg font-bold">{todayRecord?.checkOut || '--:--'}</p>
              </div>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {isAdminOrFinance && (
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-800 mb-4">Consultores</h4>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Buscar consultor..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                  {filteredUsers.map(u => (
                    <button 
                      key={u.id} 
                      onClick={() => setSelectedUserId(u.id)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all flex items-center gap-3",
                        selectedUserId === u.id ? 'bg-primary text-white font-bold shadow-md shadow-primary/10' : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                        selectedUserId === u.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      )}>
                        {u.name.charAt(0)}
                      </div>
                      <span className="truncate">{u.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={cn("space-y-4", isAdminOrFinance ? "lg:col-span-3" : "lg:col-span-4")}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h4 className="font-bold text-slate-800">
                {isAdminOrFinance 
                  ? `Histórico: ${users.find(u => u.id === selectedUserId)?.name || 'Selecionar Consultor'}`
                  : 'Meu Histórico de Ponto'
                }
              </h4>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="month" 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button 
                  onClick={handleDownloadReport}
                  className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all"
                  title="Baixar Relatório"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Entrada</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Almoço</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Volta</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Saída</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayRecords.length > 0 ? (
                    displayRecords.map((record) => {
                      const status = getStatusLabel(record);
                      return (
                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-slate-400" />
                              <span className="text-sm font-medium text-slate-700">
                                {new Date(record.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium">{record.checkIn || '--:--'}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium">{record.lunchStart || '--:--'}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium">{record.lunchEnd || '--:--'}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium">{record.checkOut || '--:--'}</td>
                          <td className="px-6 py-4">
                            <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", status.color)}>
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Clock size={32} className="opacity-20" />
                          <p className="text-sm">Nenhum registro encontrado</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
