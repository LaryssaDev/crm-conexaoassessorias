import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Search, Settings, X, Check, Trash2, UserPlus, CreditCard } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'lead': return <UserPlus className="text-blue-500" size={16} />;
      case 'payment': return <CreditCard className="text-emerald-500" size={16} />;
      default: return <Bell className="text-slate-400" size={16} />;
    }
  };

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

        <div className="flex items-center gap-3 border-l border-slate-200 pl-6" ref={dropdownRef}>
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 text-sm">Notificações</h4>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => markAllAsRead()}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all"
                        title="Marcar todas como lidas"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => clearNotifications()}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                      title="Limpar tudo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="mx-auto text-slate-200 mb-2" size={32} />
                      <p className="text-xs text-slate-400">Nenhuma notificação por enquanto</p>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer relative ${!notification.read ? 'bg-primary/5' : ''}`}
                      >
                        {!notification.read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                        )}
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            notification.type === 'lead' ? 'bg-blue-50' : 
                            notification.type === 'payment' ? 'bg-emerald-50' : 'bg-slate-50'
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm ${!notification.read ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
