import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, Lead, FixedCost, Transaction, HistoryRecord } from '../types';
import { INITIAL_USERS, INITIAL_LEADS, INITIAL_COSTS, INITIAL_TRANSACTIONS, INITIAL_HISTORY } from '../constants';
import { supabase } from '../lib/supabase';

interface DataContextType {
  users: User[];
  leads: Lead[];
  costs: FixedCost[];
  transactions: Transaction[];
  history: HistoryRecord[];
  loading: boolean;
  addUser: (user: User) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addLead: (lead: Lead) => Promise<void>;
  updateLead: (lead: Lead) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  addCost: (cost: FixedCost) => Promise<void>;
  updateCost: (cost: FixedCost) => Promise<void>;
  deleteCost: (id: string) => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addHistory: (record: HistoryRecord) => Promise<void>;
  toggleCostStatus: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [costs, setCosts] = useState<FixedCost[]>(INITIAL_COSTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [history, setHistory] = useState<HistoryRecord[]>(INITIAL_HISTORY);
  const [loading, setLoading] = useState(true);
  const [lastResetDate, setLastResetDate] = useState<string | null>(localStorage.getItem('last_cost_reset'));

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          { data: usersData },
          { data: leadsData },
          { data: costsData },
          { data: transactionsData },
          { data: historyData }
        ] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('leads').select('*').order('created_at', { ascending: false }),
          supabase.from('fixed_costs').select('*').order('due_date', { ascending: true }),
          supabase.from('transactions').select('*').order('date', { ascending: false }),
          supabase.from('history_records').select('*').order('created_at', { ascending: false })
        ]);

        if (usersData) setUsers(usersData.length > 0 ? usersData : INITIAL_USERS);
        if (leadsData) setLeads(leadsData);
        if (costsData) setCosts(costsData);
        if (transactionsData) setTransactions(transactionsData);
        if (historyData) setHistory(historyData);
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const usersSub = supabase.channel('users_changes').on('postgres_changes' as any, { event: '*', table: 'users' }, fetchData).subscribe();
    const leadsSub = supabase.channel('leads_changes').on('postgres_changes' as any, { event: '*', table: 'leads' }, fetchData).subscribe();
    const costsSub = supabase.channel('costs_changes').on('postgres_changes' as any, { event: '*', table: 'fixed_costs' }, fetchData).subscribe();
    const transactionsSub = supabase.channel('transactions_changes').on('postgres_changes' as any, { event: '*', table: 'transactions' }, fetchData).subscribe();
    const historySub = supabase.channel('history_changes').on('postgres_changes' as any, { event: '*', table: 'history_records' }, fetchData).subscribe();

    return () => {
      supabase.removeChannel(usersSub);
      supabase.removeChannel(leadsSub);
      supabase.removeChannel(costsSub);
      supabase.removeChannel(transactionsSub);
      supabase.removeChannel(historySub);
    };
  }, []);

  useEffect(() => {
    const now = new Date();
    if (now.getDate() === 1) {
      const today = now.toISOString().split('T')[0];
      if (lastResetDate !== today) {
        setCosts(prev => prev.map(c => ({ ...c, status: 'Pendente' })));
        setLastResetDate(today);
        localStorage.setItem('last_cost_reset', today);
        // Update Supabase
        costs.forEach(async (cost) => {
          await supabase.from('fixed_costs').update({ status: 'Pendente' }).eq('id', cost.id);
        });
      }
    }
  }, [lastResetDate, costs]);

  const addUser = async (user: User) => {
    const { error } = await supabase.from('users').insert([user]);
    if (error) console.error('Error adding user:', error);
  };

  const updateUser = async (user: User) => {
    const { error } = await supabase.from('users').update(user).eq('id', user.id);
    if (error) console.error('Error updating user:', error);
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) console.error('Error deleting user:', error);
  };

  const addLead = async (lead: Lead) => {
    const { error } = await supabase.from('leads').insert([lead]);
    if (error) console.error('Error adding lead:', error);
  };

  const updateLead = async (lead: Lead) => {
    const { error } = await supabase.from('leads').update(lead).eq('id', lead.id);
    if (error) console.error('Error updating lead:', error);
  };

  const deleteLead = async (id: string) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) console.error('Error deleting lead:', error);
  };

  const addCost = async (cost: FixedCost) => {
    const { error } = await supabase.from('fixed_costs').insert([cost]);
    if (error) console.error('Error adding cost:', error);
  };

  const updateCost = async (cost: FixedCost) => {
    const { error } = await supabase.from('fixed_costs').update(cost).eq('id', cost.id);
    if (error) console.error('Error updating cost:', error);
  };

  const deleteCost = async (id: string) => {
    const { error } = await supabase.from('fixed_costs').delete().eq('id', id);
    if (error) console.error('Error deleting cost:', error);
  };

  const addTransaction = async (transaction: Transaction) => {
    const { error } = await supabase.from('transactions').insert([transaction]);
    if (error) console.error('Error adding transaction:', error);
  };

  const updateTransaction = async (transaction: Transaction) => {
    const { error } = await supabase.from('transactions').update(transaction).eq('id', transaction.id);
    if (error) console.error('Error updating transaction:', error);
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) console.error('Error deleting transaction:', error);
  };

  const addHistory = async (record: HistoryRecord) => {
    const { error } = await supabase.from('history_records').insert([record]);
    if (error) console.error('Error adding history:', error);
  };

  const toggleCostStatus = useCallback(async (id: string) => {
    const costToToggle = costs.find(c => c.id === id);
    if (!costToToggle) return;

    const newStatus = costToToggle.status === 'Pago' ? 'Pendente' : 'Pago';

    if (newStatus === 'Pago') {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const alreadyPaidThisMonth = transactions.some(t => {
        if (!t.costId || t.costId !== id) return false;
        const tDate = new Date(t.date);
        return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      });

      if (!alreadyPaidThisMonth) {
        const newTransaction: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'Saída',
          description: `Pagamento: ${costToToggle.description}`,
          value: costToToggle.value,
          date: now.toISOString().split('T')[0],
          category: 'Custos Fixos',
          costId: id
        };
        await addTransaction(newTransaction);
      }
    }

    await supabase.from('fixed_costs').update({ status: newStatus }).eq('id', id);
  }, [costs, transactions]);

  return (
    <DataContext.Provider value={{ 
      users, leads, costs, transactions, history, loading,
      addUser, updateUser, deleteUser,
      addLead, updateLead, deleteLead,
      addCost, updateCost, deleteCost,
      addTransaction, updateTransaction, deleteTransaction,
      addHistory,
      toggleCostStatus
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
