import { User, Lead, Team, FixedCost, Transaction, HistoryRecord } from './types';

export const INITIAL_USERS: User[] = [
  { id: '1', name: 'Aline Ferreira', login: 'aline.ferreira@conexao.com', role: 'Administrador', department: 'Comercial' },
];

export const INITIAL_TEAMS: Team[] = [];

export const INITIAL_LEADS: Lead[] = [];

export const INITIAL_HISTORY: HistoryRecord[] = [];

export const INITIAL_COSTS: FixedCost[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];
