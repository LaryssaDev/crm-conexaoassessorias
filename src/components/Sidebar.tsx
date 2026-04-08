import React, { useState } from 'react';
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
  ChevronRight,
  Menu
} from 'lucide-react';
import { cn } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout, hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { id: 'Dashboard', icon: LayoutDashboard },
    { id: 'Leads', icon: Users },
    { id: 'Atribuição', icon: UserPlus },
    { id: 'Funil', icon: Kanban },
    { id: 'Meta', icon: Target },
    { id: 'Ranking', icon: Trophy },
    { id: 'Agenda', icon: Calendar },
    { id: 'Equipe', icon: Users2 },
    { id: 'Ponto', icon: Clock },
    { id: "PDF's", icon: FileText },
    { id: 'Documentação', icon: FileText },
    { id: 'Custos Fixos', icon: Calculator },
    { id: 'Financeiro', icon: DollarSign },
  ];

  return (
    <aside className={cn(
      "bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 transition-all duration-300 z-20",
      isOpen ? "w-64" : "w-20"
    )}>
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className={cn("flex items-center gap-3 overflow-hidden transition-all duration-300", isOpen ? "w-auto opacity-100" : "w-0 opacity-0 hidden")}>
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <div className="whitespace-nowrap">
            <h1 className="font-bold text-slate-800 leading-tight">Conexão</h1>
            <p className="text-xs text-slate-500">Assessoria CRM</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-all shrink-0 mx-auto"
        >
          <Menu size={24} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar overflow-x-hidden">
        {menuItems.map((item) => {
          if (!hasPermission(item.id)) return null;
          
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all group shrink-0",
                isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-primary"
              )}
              title={!isOpen ? item.id : undefined}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <item.icon size={20} className={cn("shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                {isOpen && <span className="font-medium text-sm whitespace-nowrap">{item.id}</span>}
              </div>
              {isOpen && isActive && <ChevronRight size={16} className="shrink-0" />}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <div className={cn("bg-slate-50 rounded-2xl mb-2 overflow-hidden transition-all duration-300", isOpen ? "p-4" : "p-2")}>
          <div className={cn("flex items-center mb-3", isOpen ? "gap-3" : "justify-center")}>
            <div className="w-10 h-10 shrink-0 bg-slate-200 rounded-full overflow-hidden">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.name}&background=8a2695&color=fff`} 
                alt="Avatar" 
                referrerPolicy="no-referrer"
              />
            </div>
            {isOpen && (
              <div className="overflow-hidden whitespace-nowrap">
                <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={logout}
            title={!isOpen ? "Sair do Sistema" : undefined}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
          >
            <LogOut size={isOpen ? 14 : 18} />
            {isOpen && <span>Sair</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
