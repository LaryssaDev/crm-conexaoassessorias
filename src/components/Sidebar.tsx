import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  UserPlus, 
  Kanban, 
  Target, 
  Trophy, 
  Calendar, 
  Users2, 
  FileText, 
  Calculator, 
  DollarSign,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout, hasPermission } = useAuth();

  const menuItems = [
    { id: 'Dashboard', icon: LayoutDashboard },
    { id: 'Leads', icon: Users },
    { id: 'Andamento', icon: Clock },
    { id: 'Atribuição', icon: UserPlus },
    { id: 'Funil', icon: Kanban },
    { id: 'Meta', icon: Target },
    { id: 'Ranking', icon: Trophy },
    { id: 'Agenda', icon: Calendar },
    { id: 'Equipe', icon: Users2 },
    { id: 'Contrato', icon: FileText },
    { id: 'Custos Fixos', icon: Calculator },
    { id: 'Financeiro', icon: DollarSign },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">Conexão</h1>
            <p className="text-xs text-slate-500">Assessoria CRM</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          if (!hasPermission(item.id)) return null;
          
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                <span className="font-medium text-sm">{item.id}</span>
              </div>
              {isActive && <ChevronRight size={16} />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.name}&background=8a2695&color=fff`} 
                alt="Avatar" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={14} />
            Sair do Sistema
          </button>
        </div>
      </div>
    </aside>
  );
};
