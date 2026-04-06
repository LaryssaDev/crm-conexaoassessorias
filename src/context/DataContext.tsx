import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, Lead, FixedCost, Transaction, HistoryRecord, AgendaItem, TimeRecord, Document } from '../types';
import { INITIAL_USERS, INITIAL_LEADS, INITIAL_COSTS, INITIAL_TRANSACTIONS, INITIAL_HISTORY } from '../constants';
import { supabase, isConfigured } from '../lib/supabase';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';

interface DataContextType {
  users: User[];
  leads: Lead[];
  costs: FixedCost[];
  transactions: Transaction[];
  history: HistoryRecord[];
  agenda: AgendaItem[];
  loading: boolean;
  comercialTarget: number;
  juridicoTarget: number;
  setComercialTarget: (target: number) => void;
  setJuridicoTarget: (target: number) => void;
  setUserTarget: (userId: string, target: number) => Promise<void>;
  deleteTarget: (key: 'comercial_target' | 'juridico_target') => Promise<void>;
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
  addAgendaItem: (item: AgendaItem) => Promise<void>;
  deleteAgendaItem: (id: string) => Promise<void>;
  timeRecords: TimeRecord[];
  addTimeRecord: (record: TimeRecord) => Promise<void>;
  updateTimeRecord: (record: TimeRecord) => Promise<void>;
  saveLeadPdfData: (leadId: string, data: any) => Promise<void>;
  getLeadPdfData: (leadId: string) => Promise<any>;
  pdfDrafts: Record<string, any>;
  setPdfDraft: (leadId: string, data: any) => void;
  documents: Document[];
  uploadDocument: (leadId: string, file: File) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [costs, setCosts] = useState<FixedCost[]>(INITIAL_COSTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [history, setHistory] = useState<HistoryRecord[]>(INITIAL_HISTORY);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pdfDrafts, setPdfDrafts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [lastResetDate, setLastResetDate] = useState<string | null>(localStorage.getItem('last_cost_reset'));
  const [comercialTarget, setComercialTargetState] = useState<number>(0);
  const [juridicoTarget, setJuridicoTargetState] = useState<number>(0);

  const setUserTarget = async (userId: string, target: number) => {
    console.log(`--- Sincronizando Meta Individual: ${userId} ---`);
    console.log('Valor:', target);
    
    // Update local state first for immediate feedback
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, target } : u));
    
    if (isConfigured) {
      try {
        const response = await supabase
          .from('settings')
          .upsert([
            { key: `user_target_${userId}`, value: target.toString() }
          ], { onConflict: 'key' });
        
        if (response.error) throw response.error;
        console.log(`✅ Meta Individual para ${userId} salva!`);
      } catch (error) {
        console.error('❌ Falha ao salvar meta individual.', error);
      }
    }
  };

  const setComercialTarget = async (target: number) => {
    console.log('--- Iniciando Sincronização de Meta Comercial ---');
    console.log('Valor:', target);
    setComercialTargetState(target);
    
    if (isConfigured) {
      try {
        const response = await supabase
          .from('settings')
          .upsert([
            { key: 'comercial_target', value: target.toString() }
          ], { onConflict: 'key' });
        
        console.log('Resposta do Supabase:', response);
        
        if (response.error) {
          console.error('Erro detalhado do Supabase:', response.error);
          throw response.error;
        }
        
        console.log('✅ Meta Comercial salva no banco de dados!');
      } catch (error) {
        console.error('❌ Falha ao salvar no banco. Usando LocalStorage como backup.', error);
        localStorage.setItem('comercial_target', target.toString());
      }
    } else {
      localStorage.setItem('comercial_target', target.toString());
    }
  };

  const setJuridicoTarget = async (target: number) => {
    console.log('--- Iniciando Sincronização de Meta Jurídica ---');
    console.log('Valor:', target);
    setJuridicoTargetState(target);
    
    if (isConfigured) {
      try {
        const response = await supabase
          .from('settings')
          .upsert([
            { key: 'juridico_target', value: target.toString() }
          ], { onConflict: 'key' });
        
        console.log('Resposta do Supabase:', response);
        
        if (response.error) {
          console.error('Erro detalhado do Supabase:', response.error);
          throw response.error;
        }
        
        console.log('✅ Meta Jurídica salva no banco de dados!');
      } catch (error) {
        console.error('❌ Falha ao salvar no banco. Usando LocalStorage como backup.', error);
        localStorage.setItem('juridico_target', target.toString());
      }
    } else {
      localStorage.setItem('juridico_target', target.toString());
    }
  };

  const deleteTarget = async (key: 'comercial_target' | 'juridico_target') => {
    console.log(`--- Resetando Meta: ${key} ---`);
    if (isConfigured) {
      try {
        // Em vez de deletar a linha, vamos apenas zerar o valor.
        // Isso é mais seguro e garante que o card suma da interface.
        const { error } = await supabase
          .from('settings')
          .upsert([{ key, value: '0' }], { onConflict: 'key' });
          
        if (error) throw error;
        
        if (key === 'comercial_target') {
          setComercialTargetState(0);
          localStorage.setItem('comercial_target', '0');
        } else {
          setJuridicoTargetState(0);
          localStorage.setItem('juridico_target', '0');
        }
        
        console.log(`✅ Meta ${key} resetada para 0 com sucesso!`);
      } catch (error) {
        console.error(`❌ Erro ao resetar meta ${key}:`, error);
      }
    } else {
      if (key === 'comercial_target') {
        setComercialTargetState(0);
        localStorage.setItem('comercial_target', '0');
      } else {
        setJuridicoTargetState(0);
        localStorage.setItem('juridico_target', '0');
      }
    }
  };

  const fetchData = useCallback(async (showLoading = true) => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }
    
    // Only show loading on initial fetch or when explicitly requested
    // If showLoading is an object (from Supabase payload), treat as false
    const shouldShowLoading = typeof showLoading === 'boolean' ? showLoading : false;
    
    if (shouldShowLoading) {
      setLoading(true);
    }
    try {
      const [
        { data: usersData, error: usersError },
        { data: leadsData, error: leadsError },
        { data: costsData, error: costsError },
        { data: transactionsData, error: transactionsError },
        { data: historyData, error: historyError },
        { data: agendaData, error: agendaError },
        { data: timeRecordsData, error: timeRecordsError },
        { data: settingsData },
        { data: documentsData, error: documentsError }
      ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('fixed_costs').select('*').order('due_date', { ascending: true }),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('history_records').select('*').order('created_at', { ascending: false }),
        supabase.from('agenda').select('*').order('date', { ascending: true }),
        supabase.from('time_records').select('*').order('date', { ascending: false }),
        supabase.from('settings').select('*'),
        supabase.from('documents').select('*').order('created_at', { ascending: false })
      ]);

      if (settingsData) {
        const comercial = settingsData.find((s: any) => s.key === 'comercial_target');
        const juridico = settingsData.find((s: any) => s.key === 'juridico_target');
        setComercialTargetState(comercial ? Number(comercial.value) : 0);
        setJuridicoTargetState(juridico ? Number(juridico.value) : 0);
      } else {
        setComercialTargetState(0);
        setJuridicoTargetState(0);
      }

      // Handle potential auth errors (401 Unauthorized)
      const errors = [usersError, leadsError, costsError, transactionsError, historyError, agendaError, timeRecordsError, documentsError].filter(Boolean);
      if (errors.some(err => err?.message.includes('JWT') || err?.message.includes('Unauthorized') || err?.code === 'PGRST301')) {
        console.error('Auth error detected during data fetch. Session might be invalid.');
        // AuthContext will handle the actual logout via onAuthStateChange if the session is truly gone,
        // but we can at least stop loading here.
        setLoading(false);
        return;
      }

      if (usersData) {
        setUsers(usersData.length > 0 ? usersData.map((u: any) => {
          const userTarget = settingsData?.find((s: any) => s.key === `user_target_${u.id}`);
          return {
            ...u,
            createdAt: u.created_at,
            target: userTarget ? Number(userTarget.value) : undefined
          };
        }) : INITIAL_USERS);
      }
      if (leadsData) {
        setLeads(leadsData.map((l: any) => ({
          id: l.id,
          name: l.name,
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
      if (agendaData) {
        setAgenda(agendaData.map((a: any) => ({
          ...a,
          userId: a.user_id,
          createdAt: a.created_at
        })));
      }
      if (timeRecordsData) {
        setTimeRecords(timeRecordsData.map((tr: any) => ({
          ...tr,
          userId: tr.user_id,
          checkIn: tr.check_in,
          lunchStart: tr.lunch_start,
          lunchEnd: tr.lunch_end,
          checkOut: tr.check_out,
          createdAt: tr.created_at
        })));
      }

      if (documentsData) {
        setDocuments(documentsData.map((d: any) => ({
          ...d,
          createdAt: d.created_at,
          uploadedBy: d.uploaded_by,
          leadId: d.lead_id
        })));
      }
    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch initial data from Supabase
  useEffect(() => {
    if (!user) {
      setUsers(INITIAL_USERS);
      setLeads(INITIAL_LEADS);
      setCosts(INITIAL_COSTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setHistory(INITIAL_HISTORY);
      setAgenda([]);
      setLoading(false);
      return;
    }

    fetchData();

    // Set up real-time subscriptions
    let usersSub: any, leadsSub: any, costsSub: any, transactionsSub: any, historySub: any, timeRecordsSub: any, settingsSub: any, documentsSub: any;
    
    if (isConfigured) {
      usersSub = supabase.channel('users_changes').on('postgres_changes' as any, { event: '*', table: 'users' }, fetchData).subscribe();
      
      leadsSub = supabase.channel('leads_changes').on('postgres_changes' as any, { event: 'INSERT', table: 'leads' }, (payload: any) => {
        const newLead = payload.new;
        addNotification('Novo Lead', `O lead ${newLead.name} foi adicionado.`, 'lead');
        fetchData(false);
      }).on('postgres_changes' as any, { event: 'UPDATE', table: 'leads' }, fetchData).on('postgres_changes' as any, { event: 'DELETE', table: 'leads' }, fetchData).subscribe();

      costsSub = supabase.channel('costs_changes').on('postgres_changes' as any, { event: '*', table: 'fixed_costs' }, fetchData).subscribe();
      
      transactionsSub = supabase.channel('transactions_changes').on('postgres_changes' as any, { event: 'INSERT', table: 'transactions' }, (payload: any) => {
        const newTransaction = payload.new;
        if (newTransaction.type === 'Entrada') {
          addNotification('Novo Pagamento', `Um pagamento de R$ ${newTransaction.value.toLocaleString()} foi recebido: ${newTransaction.description}`, 'payment');
        }
        fetchData(false);
      }).on('postgres_changes' as any, { event: 'UPDATE', table: 'transactions' }, fetchData).on('postgres_changes' as any, { event: 'DELETE', table: 'transactions' }, fetchData).subscribe();

      historySub = supabase.channel('history_changes').on('postgres_changes' as any, { event: 'INSERT', table: 'history_records' }, (payload: any) => {
        const newRecord = payload.new;
        if (newRecord.type === 'Pagamento') {
          addNotification('Pagamento Registrado', `Pagamento de R$ ${newRecord.value.toLocaleString()} registrado em andamento.`, 'payment');
        }
        fetchData(false);
      }).on('postgres_changes' as any, { event: 'UPDATE', table: 'history_records' }, fetchData).on('postgres_changes' as any, { event: 'DELETE', table: 'history_records' }, fetchData).subscribe();

      timeRecordsSub = supabase.channel('time_records_changes').on('postgres_changes' as any, { event: '*', table: 'time_records' }, fetchData).subscribe();

      settingsSub = supabase.channel('settings_changes').on('postgres_changes' as any, { event: '*', table: 'settings' }, (payload: any) => {
        // Only fetch data if the changed setting is not related to PDF data
        // to avoid unnecessary re-fetches while typing in the PDF tab
        const changedKey = payload.new?.key || payload.old?.key;
        if (changedKey && !changedKey.startsWith('pdf_data_')) {
          fetchData(false);
        }
      }).subscribe();

      documentsSub = supabase.channel('documents_changes').on('postgres_changes' as any, { event: '*', table: 'documents' }, () => fetchData(false)).subscribe();
    }

    return () => {
      if (isConfigured) {
        if (usersSub) supabase.removeChannel(usersSub);
        if (leadsSub) supabase.removeChannel(leadsSub);
        if (costsSub) supabase.removeChannel(costsSub);
        if (transactionsSub) supabase.removeChannel(transactionsSub);
        if (historySub) supabase.removeChannel(historySub);
        if (timeRecordsSub) supabase.removeChannel(timeRecordsSub);
        if (settingsSub) supabase.removeChannel(settingsSub);
        // @ts-ignore
        if (documentsSub) supabase.removeChannel(documentsSub);
      }
    };
  }, [user, addNotification, fetchData]);


  useEffect(() => {
    const now = new Date();
    if (now.getDate() === 1) {
      const today = now.toISOString().split('T')[0];
      if (lastResetDate !== today) {
        setCosts(prev => prev.map(c => ({ ...c, status: 'Pendente' })));
        setLastResetDate(today);
        localStorage.setItem('last_cost_reset', today);
        // Update Supabase
        if (isConfigured) {
          costs.forEach(async (cost) => {
            await supabase.from('fixed_costs').update({ status: 'Pendente' }).eq('id', cost.id);
          });
        }
      }
    }
  }, [lastResetDate, costs]);

  const addUser = async (user: User, password?: string) => {
    if (!isConfigured) {
      setUsers(prev => [...prev, user]);
      return;
    }
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
    if (!isConfigured) {
      setUsers(prev => prev.map(u => u.id === user.id ? user : u));
      return;
    }
    const { error } = await supabase.from('users').update(user).eq('id', user.id);
    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    if (!isConfigured) {
      setUsers(prev => prev.filter(u => u.id !== id));
      return;
    }
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
    if (!isConfigured) {
      setLeads(prev => [lead, ...prev]);
      return;
    }
    const dbLead = {
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      origin: lead.origin,
      contract_type: lead.contractType,
      installment_value: lead.installmentValue,
      status: lead.status,
      assigned_to: lead.assignedTo || null,
      supervisor_id: lead.supervisorId || null,
      supervisor_comercial_id: lead.supervisorComercialId || null,
      consultor_comercial_id: lead.consultorComercialId || null,
      supervisor_juridico_id: lead.supervisorJuridicoId || null,
      consultor_juridico_id: lead.consultorJuridicoId || null,
      created_at: lead.createdAt
    };
    const { error } = await supabase.from('leads').insert([dbLead]);
    if (error) {
      console.error('Error adding lead:', error);
      throw error;
    }
  };

  const updateLead = async (lead: Lead) => {
    if (!isConfigured) {
      setLeads(prev => prev.map(l => l.id === lead.id ? lead : l));
      return;
    }
    const dbLead = {
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      origin: lead.origin,
      contract_type: lead.contractType,
      installment_value: lead.installmentValue,
      status: lead.status,
      assigned_to: lead.assignedTo || null,
      supervisor_id: lead.supervisorId || null,
      supervisor_comercial_id: lead.supervisorComercialId || null,
      consultor_comercial_id: lead.consultorComercialId || null,
      supervisor_juridico_id: lead.supervisorJuridicoId || null,
      consultor_juridico_id: lead.consultorJuridicoId || null
    };
    const { error } = await supabase.from('leads').update(dbLead).eq('id', lead.id);
    if (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  };

  const deleteLead = async (id: string) => {
    if (user?.role === 'Consultor') {
      console.error('Consultants are not allowed to delete leads.');
      return;
    }
    if (!isConfigured) {
      setLeads(prev => prev.filter(l => l.id !== id));
      return;
    }
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  };

  // Converts a day string (e.g. "10" or "05") to a full YYYY-MM-DD date using the current month.
  // If it's already a full date, returns as-is.
  const toFullDate = (dueDate: string): string => {
    if (!dueDate) return new Date().toISOString().split('T')[0];
    if (dueDate.includes('-')) return dueDate; // already full date
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = dueDate.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const addCost = async (cost: FixedCost) => {
    if (!isConfigured) {
      setCosts(prev => [...prev, cost]);
      return;
    }
    const dbCost = {
      id: cost.id,
      description: cost.description,
      value: cost.value,
      due_date: toFullDate(cost.dueDate),
      status: cost.status
    };
    const { error } = await supabase.from('fixed_costs').insert([dbCost]);
    if (error) {
      console.error('Error adding cost:', error);
      throw error;
    }
  };

  const updateCost = async (cost: FixedCost) => {
    if (!isConfigured) {
      setCosts(prev => prev.map(c => c.id === cost.id ? cost : c));
      return;
    }
    const dbCost = {
      description: cost.description,
      value: cost.value,
      due_date: toFullDate(cost.dueDate),
      status: cost.status
    };
    const { error } = await supabase.from('fixed_costs').update(dbCost).eq('id', cost.id);
    if (error) {
      console.error('Error updating cost:', error);
      throw error;
    }
  };

  const deleteCost = async (id: string) => {
    if (!isConfigured) {
      setCosts(prev => prev.filter(c => c.id !== id));
      return;
    }
    const { error } = await supabase.from('fixed_costs').delete().eq('id', id);
    if (error) {
      console.error('Error deleting cost:', error);
      throw error;
    }
  };

  const addTransaction = async (transaction: Transaction) => {
    if (!isConfigured) {
      setTransactions(prev => [...prev, transaction]);
      return;
    }
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
    if (!isConfigured) {
      setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
      return;
    }
    const { error } = await supabase.from('transactions').update(transaction).eq('id', transaction.id);
    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!isConfigured) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      return;
    }
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const addHistory = async (record: HistoryRecord) => {
    if (!isConfigured) {
      setHistory(prev => [record, ...prev]);
      return;
    }
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

  const addAgendaItem = async (item: AgendaItem) => {
    if (!isConfigured) {
      setAgenda(prev => [...prev, item]);
      return;
    }
    const dbItem = {
      title: item.title,
      date: item.date,
      time: item.time,
      description: item.description,
      user_id: item.userId
    };
    const { error } = await supabase.from('agenda').insert([dbItem]);
    if (error) {
      console.error('Error adding agenda item:', error);
      throw error;
    }
  };

  const deleteAgendaItem = async (id: string) => {
    if (!isConfigured) {
      setAgenda(prev => prev.filter(i => i.id !== id));
      return;
    }
    const { error } = await supabase.from('agenda').delete().eq('id', id);
    if (error) {
      console.error('Error deleting agenda item:', error);
      throw error;
    }
  };

  const addTimeRecord = async (record: TimeRecord) => {
    if (!isConfigured) {
      setTimeRecords(prev => [...prev, record]);
      return;
    }
    const dbRecord = {
      user_id: record.userId,
      date: record.date,
      check_in: record.checkIn,
      lunch_start: record.lunchStart,
      lunch_end: record.lunchEnd,
      check_out: record.checkOut,
      created_at: record.createdAt
    };
    const { error } = await supabase.from('time_records').insert([dbRecord]);
    if (error) {
      console.error('Error adding time record:', error);
      throw error;
    }
  };

  const updateTimeRecord = async (record: TimeRecord) => {
    if (!isConfigured) {
      setTimeRecords(prev => prev.map(r => r.id === record.id ? record : r));
      return;
    }
    const dbRecord = {
      check_in: record.checkIn,
      lunch_start: record.lunchStart,
      lunch_end: record.lunchEnd,
      check_out: record.checkOut
    };
    const { error } = await supabase.from('time_records').update(dbRecord).eq('id', record.id);
    if (error) {
      console.error('Error updating time record:', error);
      throw error;
    }
  };

  const setPdfDraft = (leadId: string, data: any) => {
    setPdfDrafts(prev => ({ ...prev, [leadId]: data }));
  };

  const saveLeadPdfData = async (leadId: string, data: any) => {
    if (!isConfigured) {
      localStorage.setItem(`pdf_data_${leadId}`, JSON.stringify(data));
      return;
    }
    try {
      const { error } = await supabase
        .from('settings')
        .upsert([
          { key: `pdf_data_${leadId}`, value: JSON.stringify(data) }
        ], { onConflict: 'key' });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving lead PDF data:', error);
      throw error;
    }
  };

  const getLeadPdfData = async (leadId: string) => {
    if (!isConfigured) {
      const saved = localStorage.getItem(`pdf_data_${leadId}`);
      return saved ? JSON.parse(saved) : null;
    }
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', `pdf_data_${leadId}`)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      return data ? JSON.parse(data.value) : null;
    } catch (error) {
      console.error('Error getting lead PDF data:', error);
      return null;
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

    if (isConfigured) {
      await supabase.from('fixed_costs').update({ status: newStatus }).eq('id', id);
    } else {
      setCosts(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    }
  }, [costs, transactions]);

  const uploadDocument = async (leadId: string, file: File) => {
    if (!isConfigured || !user) return;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${leadId}/${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // 3. Save metadata to database
      const newDoc = {
        lead_id: leadId,
        name: file.name,
        url: publicUrl,
        type: file.type,
        size: file.size,
        uploaded_by: user.name
      };

      const { error: dbError } = await supabase
        .from('documents')
        .insert([newDoc]);

      if (dbError) throw dbError;
      
      addNotification('Documento Enviado', `O documento ${file.name} foi enviado com sucesso.`, 'lead');
      fetchData(false);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Erro ao enviar documento. Verifique se o bucket "documents" existe no seu Supabase Storage.');
    }
  };

  const deleteDocument = async (id: string) => {
    if (!isConfigured) return;
    
    try {
      const docToDelete = documents.find(d => d.id === id);
      if (!docToDelete) return;

      // Extract path from URL (assuming it's a Supabase Storage URL)
      // URL format: .../storage/v1/object/public/documents/LEAD_ID/FILE_NAME
      const urlParts = docToDelete.url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const leadId = docToDelete.leadId;
      const filePath = `${leadId}/${fileName}`;

      // 1. Delete from Storage
      await supabase.storage.from('documents').remove([filePath]);

      // 2. Delete from Database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData(false);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  return (
    <DataContext.Provider value={{ 
      users, leads, costs, transactions, history, loading,
      comercialTarget, juridicoTarget, setComercialTarget, setJuridicoTarget, setUserTarget, deleteTarget,
      addUser, updateUser, deleteUser,
      addLead, updateLead, deleteLead,
      addCost, updateCost, deleteCost,
      addTransaction, updateTransaction, deleteTransaction,
      addHistory,
      toggleCostStatus,
      agenda,
      addAgendaItem,
      deleteAgendaItem,
      timeRecords,
      addTimeRecord,
      updateTimeRecord,
      saveLeadPdfData,
      getLeadPdfData,
      pdfDrafts,
      setPdfDraft,
      documents,
      uploadDocument,
      deleteDocument
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
