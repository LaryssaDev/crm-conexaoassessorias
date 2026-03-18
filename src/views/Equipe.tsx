import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserPlus, Shield, Mail, MoreVertical, Search, X, Edit2, User as UserIcon, Trash2 } from 'lucide-react';
import { UserRole, Department, User } from '../types';

export const Equipe: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { users, addUser, updateUser, deleteUser } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('Todos');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    login: '',
    password: '',
    role: 'Consultor' as UserRole,
    department: 'Comercial' as Department
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'Todos' || u.department === selectedDept;
    const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(u.role);
    return matchesSearch && matchesDept && matchesRole;
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser({
        ...editingUser,
        name: newUser.name,
        login: newUser.login,
        role: newUser.role,
        department: newUser.department,
      });
    } else {
      const userToAdd: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: newUser.name,
        login: newUser.login,
        role: newUser.role,
        department: newUser.department,
      };
      addUser(userToAdd);
    }
    setShowModal(false);
    setEditingUser(null);
    setNewUser({ name: '', email: '', login: '', password: '', role: 'Consultor', department: 'Comercial' });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: `${user.login}@conexao.com`,
      login: user.login,
      password: '••••••••',
      role: user.role,
      department: user.department
    });
    setShowModal(true);
  };

  const toggleRoleFilter = (role: UserRole) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Gestão de Equipe</h3>
          <p className="text-sm text-slate-500">Gerencie usuários, cargos e permissões</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <UserPlus size={18} />
            Novo Usuário
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-4">Filtros</h4>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Departamento</p>
                <div className="space-y-1">
                  {['Todos', 'Comercial', 'Jurídico'].map(d => (
                    <button 
                      key={d} 
                      onClick={() => setSelectedDept(d)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all flex items-center justify-between ${
                        selectedDept === d ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {d}
                      {selectedDept === d && <span className="w-2 h-2 bg-primary rounded-full"></span>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cargo</p>
                <div className="space-y-1">
                  {['Administrador', 'Supervisor', 'Consultor', 'Financeiro'].map(r => (
                    <label key={r} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 rounded-lg transition-all">
                      <input 
                        type="checkbox" 
                        className="rounded text-primary focus:ring-primary" 
                        checked={selectedRoles.includes(r as UserRole)}
                        onChange={() => toggleRoleFilter(r as UserRole)}
                      />
                      {r}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map(u => (
            <div key={u.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${u.name}&background=random`} alt={u.name} referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEdit(u)}
                      className="p-1.5 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteUser(u.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h4 className="font-bold text-slate-800 truncate">{u.name}</h4>
                <p className="text-xs text-slate-500 mb-4">{u.role} • {u.department}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Mail size={14} className="text-slate-400" />
                    {u.login}@conexao.com
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Shield size={14} className="text-slate-400" />
                    Acesso {u.role === 'Administrador' ? 'Total' : 'Restrito'}
                  </div>
                </div>
              </div>
              
            </div>
          ))}
        </div>
      </div>

      {/* Novo Usuário Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <button onClick={() => { setShowModal(false); setEditingUser(null); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Perfil de Acesso</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Consultor">Consultor</option>
                  <option value="Financeiro">Financeiro</option>
                </select>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nome Completo</label>
                  <input 
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Ex: João Silva"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input 
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Login</label>
                    <input 
                      type="text"
                      required
                      value={newUser.login}
                      onChange={(e) => setNewUser({...newUser, login: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="usuario"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Senha</label>
                    <input 
                      type="password"
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="********"
                    />
                  </div>
                </div>

                {(newUser.role === 'Supervisor' || newUser.role === 'Consultor') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Departamento</label>
                    <select 
                      value={newUser.department}
                      onChange={(e) => setNewUser({...newUser, department: e.target.value as Department})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="Comercial">Comercial</option>
                      <option value="Jurídico">Jurídico</option>
                    </select>
                    {newUser.role === 'Consultor' && (
                      <p className="mt-1.5 text-[10px] text-slate-400 italic">
                        * O consultor será automaticamente atribuído ao supervisor do departamento {newUser.department}.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-6 flex gap-3">
                <button 
                  type="button"
                  onClick={() => { setShowModal(false); setEditingUser(null); }}
                  className="flex-1 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
