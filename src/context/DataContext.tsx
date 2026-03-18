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
  addUser: (user: User, password?: string) => Promise<void>;
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

        if (usersData) {
          setUsers(usersData.length > 0 ? usersData.map((u: any) => ({
            ...u,
            createdAt: u.created_at
          })) : INITIAL_USERS);
        }
        if (leadsData) {
          setLeads(leadsData.map((l: any) => ({
            id: l.id,
            name: l.name,
            cpf: l.cpf,
            phone: l.phone,
            email: l.email,
            origin: l.origin,
            contractType: l.contract_type || l.contractType,
            installmentValue: l.installment_value || l.installmentValue,
            status: l.status,
            assignedTo: l.assigned_to || l.assignedTo,
            supervisorId: l.supervisor_id || l.supervisorId,
            supervisorComercialId: l.supervisor_comercial_id || l.supervisorComercialId,
            consultorComercialId: l.consultor_comercial_id || l.consultorComercialId,
            supervisorJuridicoId: l.supervisor_juridico_id || l.supervisorJuridicoId,
            consultorJuridicoId: l.consultor_juridico_id || l.consultorJuridicoId,
            createdAt: l.created_at || l.createdAt
          })));
        }
        if (costsData) {
          setCosts(costsData.map((c: any) => ({
            ...c,
            dueDate: c.due_date || c.dueDate
          })));
        }
        if (transactionsData) setTransactions(transactionsData);
        if (historyData) {
          setHistory(historyData.map((h: any) => ({
            id: h.id,
            leadId: h.lead_id || h.leadId,
            userId: h.user_id || h.userId,
            department: h.department,
            type: h.type,
            description: h.description,
            value: h.value,
            paymentMethod: h.payment_method || h.paymentMethod,
            installments: h.installments,
            createdAt: h.created_at || h.createdAt
          })));
        }
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

  const addUser = async (user: User, password?: string) => {
    // If a password is provided, attempt to sign up the user in Supabase Auth
    if (password) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.login,
        password: password,
        options: {
          data: {
            full_name: user.name,
            role: user.role,
            department: user.department
          }
        }
      });

      if (authError) {
        console.error('Error signing up user in Auth:', authError);
        
        // If the user already exists in Auth, try to sign in to get their ID
        if (authError.message.includes('User already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: user.login,
            password: password
          });

          if (signInError) {
            console.error('Error signing in to get existing user ID:', signInError);
            throw new Error('Este e-mail já está registrado no sistema de autenticação, mas a senha fornecida está incorreta ou o e-mail não foi confirmado.');
          }

          if (signInData?.user) {
            user.id = signInData.user.id;
          }
        } else {
          throw authError;
        }
      } else if (authData?.user) {
        user.id = authData.user.id;
      }
    }

    // Check if a user with the same login already exists in the users table
    // This handles cases where a user was added manually to the DB with a different ID
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('login', user.login)
      .single();

    if (existingUser && existingUser.id !== user.id) {
      console.log('Found existing user with same login but different ID. Deleting to repair link.');
      // We delete the old record to avoid unique constraint violations on 'login'
      // and to ensure the ID matches the Auth ID.
      await supabase.from('users').delete().eq('id', existingUser.id);
    }

    // Use upsert to handle cases where the user might already exist in the users table
    const { error } = await supabase.from('users').upsert([user], { onConflict: 'id' });
    if (error) {
      console.error('Error adding/updating user in database:', error);
      throw error;
    }
  };

  const updateUser = async (user: User) => {
    const { error } = await supabase.from('users').update(user).eq('id', user.id);
    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    console.log('Attempting to delete user with ID:', id);
    try {
      // Nullify references in leads to avoid foreign key constraint errors
      await Promise.all([
        supabase.from('leads').update({ supervisor_comercial_id: null }).eq('supervisor_comercial_id', id),
        supabase.from('leads').update({ consultor_comercial_id: null }).eq('consultor_comercial_id', id),
        supabase.from('leads').update({ supervisor_juridico_id: null }).eq('supervisor_juridico_id', id),
        supabase.from('leads').update({ consultor_juridico_id: null }).eq('consultor_juridico_id', id),
        supabase.from('leads').update({ assigned_to: null }).eq('assigned_to', id),
        supabase.from('leads').update({ supervisor_id: null }).eq('supervisor_id', id)
      ]);

      // Nullify references in history records
      await supabase.from('history_records').update({ user_id: null }).eq('user_id', id);

      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) {
        console.error('Error deleting user from database:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteUser process:', error);
      throw error;
    }
  };

  const addLead = async (lead: Lead) => {
    const dbLead = {
      name: lead.name,
      cpf: lead.cpf,
      phone: lead.phone,
      email: lead.email,
      origin: lead.origin,
      contract_type: lead.contractType,
      installment_value: lead.installmentValue,
      status: lead.status,
      assigned_to: lead.assignedTo,
      supervisor_id: lead.supervisorId,
      supervisor_comercial_id: lead.supervisorComercialId,
      consultor_comercial_id: lead.consultorComercialId,
      supervisor_juridico_id: lead.supervisorJuridicoId,
      consultor_juridico_id: lead.consultorJuridicoId,
      created_at: lead.createdAt
    };
    const { error } = await supabase.from('leads').insert([dbLead]);
    if (error) {
      console.error('Error adding lead:', error);
      throw error;
    }
  };

  const updateLead = async (lead: Lead) => {
    const dbLead = {
      name: lead.name,
      cpf: lead.cpf,
      phone: lead.phone,
      email: lead.email,
      origin: lead.origin,
      contract_type: lead.contractType,
      installment_value: lead.installmentValue,
      status: lead.status,
      assigned_to: lead.assignedTo,
      supervisor_id: lead.supervisorId,
      supervisor_comercial_id: lead.supervisorComercialId,
      consultor_comercial_id: lead.consultorComercialId,
      supervisor_juridico_id: lead.supervisorJuridicoId,
      consultor_juridico_id: lead.consultorJuridicoId
    };
    const { error } = await supabase.from('leads').update(dbLead).eq('id', lead.id);
    if (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  };

  const deleteLead = async (id: string) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  };

  const addCost = async (cost: FixedCost) => {
    const dbCost = {
      description: cost.description,
      value: cost.value,
      due_date: cost.dueDate,
      status: cost.status
    };
    const { error } = await supabase.from('fixed_costs').insert([dbCost]);
    if (error) {
      console.error('Error adding cost:', error);
      throw error;
    }
  };

  const updateCost = async (cost: FixedCost) => {
    const dbCost = {
      description: cost.description,
      value: cost.value,
      due_date: cost.dueDate,
      status: cost.status
    };
    const { error } = await supabase.from('fixed_costs').update(dbCost).eq('id', cost.id);
    if (error) {
      console.error('Error updating cost:', error);
      throw error;
    }
  };

  const deleteCost = async (id: string) => {
    const { error } = await supabase.from('fixed_costs').delete().eq('id', id);
    if (error) {
      console.error('Error deleting cost:', error);
      throw error;
    }
  };

  const addTransaction = async (transaction: Transaction) => {
    const dbTransaction = {
      type: transaction.type,
      description: transaction.description,
      value: transaction.value,
      date: transaction.date,
      category: transaction.category,
      cost_id: transaction.costId
    };
    const { error } = await supabase.from('transactions').insert([dbTransaction]);
    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    const { error } = await supabase.from('transactions').update(transaction).eq('id', transaction.id);
    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const addHistory = async (record: HistoryRecord) => {
    const dbRecord = {
      lead_id: record.leadId,
      user_id: record.userId,
      department: record.department,
      type: record.type,
      description: record.description,
      value: record.value,
      payment_method: record.paymentMethod,
      installments: record.installments,
      created_at: record.createdAt
    };
    const { error } = await supabase.from('history_records').insert([dbRecord]);
    if (error) {
      console.error('Error adding history:', error);
      throw error;
    }
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
          id: crypto.randomUUID(),
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
