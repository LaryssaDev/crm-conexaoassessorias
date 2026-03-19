import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { AgendaItem } from '../types';
import { Clock, Plus, ExternalLink, Calendar as CalendarIcon, X, Trash2 } from 'lucide-react';

export const Agenda: React.FC = () => {
  const { user } = useAuth();
  const { agenda, addAgendaItem, deleteAgendaItem } = useData();
  const [view, setView] = useState<'Dia' | 'Semana' | 'Mês'>('Dia');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const event: AgendaItem = {
      id: crypto.randomUUID(),
      ...newEvent,
      userId: user.id,
      createdAt: new Date().toISOString()
    };
    
    try {
      await addAgendaItem(event);
      setShowModal(false);
      setNewEvent({ title: '', time: '', date: new Date().toISOString().split('T')[0], description: '' });
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Erro ao salvar evento.');
    }
  };

  const handleDelete = async (id: string) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteAgendaItem(itemToDelete);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Erro ao excluir evento.');
    }
  };

  const openGoogleCalendar = (event: any) => {
    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const text = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description);
    const dates = event.date.replace(/-/g, '') + 'T' + event.time.replace(/:/g, '') + '00Z';
    window.open(`${baseUrl}&text=${text}&details=${details}&dates=${dates}/${dates}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Agenda de Compromissos</h3>
          <p className="text-sm text-slate-500">Gerencie suas reuniões e prazos</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <Plus size={18} />
          Novo Evento
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[600px]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {view === 'Dia' ? 'Compromissos do Dia' : view === 'Semana' ? 'Visão Semanal' : 'Visão Mensal'}
            </h3>
            <p className="text-sm text-slate-500">
              {view === 'Dia' 
                ? new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                : new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
              }
            </p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['Dia', 'Semana', 'Mês'] as const).map(v => (
              <button 
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  view === v ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {agenda.length > 0 ? (
            agenda
              .filter(e => {
                if (view === 'Dia') {
                  const today = new Date().toISOString().split('T')[0];
                  return e.date === today;
                }
                return true;
              })
              .sort((a, b) => a.time.localeCompare(b.time))
              .map(event => (
                <div key={event.id} className="flex gap-6 group">
                  <div className="w-16 flex-shrink-0 pt-1">
                    <p className="text-sm font-bold text-slate-800">{event.time}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{event.date.split('-').reverse().slice(0, 2).join('/')}</p>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-2xl p-6 border-l-4 border-primary hover:bg-white hover:shadow-md hover:border-primary transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-slate-800">{event.title}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed mt-1">{event.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openGoogleCalendar(event)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-50 transition-all shadow-sm"
                        >
                          <ExternalLink size={12} />
                          Google Agenda
                        </button>
                        <button 
                          onClick={() => handleDelete(event.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                        <Clock size={12} />
                        60 Minutos
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                        <CalendarIcon size={12} />
                        {event.date}
                      </div>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
              <CalendarIcon size={48} className="mb-4 opacity-20" />
              <p>Nenhum compromisso agendado.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-500 w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Excluir Compromisso</h3>
              <p className="text-sm text-slate-500 mt-2">Deseja realmente excluir este compromisso? Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
                className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Novo Evento</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input 
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Ex: Reunião com Cliente"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                  <input 
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
                  <input 
                    type="time"
                    required
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <textarea 
                  rows={3}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Detalhes do compromisso..."
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
