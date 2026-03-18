import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Settings } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        <p className="text-xs text-slate-500">Bem-vindo de volta, {user?.name}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            className="bg-slate-50 border-none rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
          <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
