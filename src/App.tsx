import React, { useState } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import { LoginPage } from './views/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './views/Dashboard';
import { Leads } from './views/Leads';
import { Andamento } from './views/Andamento';
import { Atribuicao } from './views/Atribuicao';
import { Funil } from './views/Funil';
import { Meta } from './views/Meta';
import { Ranking } from './views/Ranking';
import { Agenda } from './views/Agenda';
import { Equipe } from './views/Equipe';
import { Contrato } from './views/Contrato';
import { CustosFixos } from './views/CustosFixos';
import { Financeiro } from './views/Financeiro';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { loading: dataLoading } = useData();
  const [activeTab, setActiveTab] = useState('Dashboard');

  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-600 font-medium animate-pulse">
          {authLoading ? 'Autenticando...' : 'Sincronizando com Supabase...'}
        </p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderView = () => {
    switch (activeTab) {
      case 'Dashboard': return <Dashboard />;
      case 'Leads': return <Leads />;
      case 'Andamento': return <Andamento />;
      case 'Atribuição': return <Atribuicao />;
      case 'Funil': return <Funil />;
      case 'Meta': return <Meta />;
      case 'Ranking': return <Ranking />;
      case 'Agenda': return <Agenda />;
      case 'Equipe': return <Equipe />;
      case 'Contrato': return <Contrato />;
      case 'Custos Fixos': return <CustosFixos />;
      case 'Financeiro': return <Financeiro />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex flex-col min-w-0">
        <Header title={activeTab} />
        <div className="p-8 overflow-y-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
