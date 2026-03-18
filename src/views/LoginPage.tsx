import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { LogIn } from 'lucide-react';
import { supabase, isConfigured } from '../lib/supabase';

export const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [loginStr, setLoginStr] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addUser } = useData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!isConfigured) {
      setError('O banco de dados não foi configurado. Adicione a URL e a Chave do Supabase no menu Settings.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const userToAdd: any = {
          id: crypto.randomUUID(),
          name: name,
          login: loginStr.trim(),
          role: 'Administrador',
          department: 'Comercial'
        };
        await addUser(userToAdd, password.trim());
        setIsSignUp(false);
        setError('Conta criada com sucesso! Verifique seu e-mail se a confirmação estiver ativada, ou tente fazer login.');
      } else {
        const success = await login(loginStr.trim(), password.trim());
        if (!success) {
          setError('E-mail ou senha incorretos. Verifique suas credenciais.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">CRM Conexão Assessoria</h1>
          <p className="text-slate-500 mt-2">
            {isSignUp ? 'Crie sua conta de administrador' : 'Entre com suas credenciais para acessar o sistema'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Seu Nome"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input
              type="email"
              value={loginStr}
              onChange={(e) => setLoginStr(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className={`p-3 rounded-lg text-sm text-center ${error.includes('sucesso') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {loading ? 'Processando...' : (isSignUp ? 'Criar Conta' : 'Acessar Sistema')}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem uma conta? Cadastre-se'}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">© 2024 Conexão Assessoria. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};
