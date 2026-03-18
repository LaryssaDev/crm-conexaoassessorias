import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type UserRole = 'Administrador' | 'Supervisor' | 'Consultor' | 'Financeiro';
export type Department = 'Comercial' | 'Jurídico';

export interface User {
  id: string;
  name: string;
  login: string;
  role: UserRole;
  department: Department;
  teamId?: string;
}

export interface Lead {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  origin: string;
  contractType: string;
  installmentValue: number;
  status: 'Novo' | 'Em Negociação' | 'Fechado' | 'Perdido';
  supervisorComercialId?: string;
  consultorComercialId?: string;
  supervisorJuridicoId?: string;
  consultorJuridicoId?: string;
  assignedTo: string; // Legacy field, keeping for compatibility
  supervisorId: string; // Legacy field, keeping for compatibility
  createdAt: string;
}

export interface HistoryRecord {
  id: string;
  leadId: string;
  department: Department;
  type: 'Contato' | 'Observação' | 'Pagamento';
  phone?: string;
  description: string;
  value?: number;
  paymentMethod?: string;
  installments?: number;
  createdAt: string;
}

export interface Goal {
  id: string;
  teamId: string;
  month: string;
  target: number;
  current: number;
}

export interface FixedCost {
  id: string;
  description: string;
  value: number;
  dueDate: string;
  status: 'Pendente' | 'Pago';
}

export interface Transaction {
  id: string;
  type: 'Entrada' | 'Saída';
  description: string;
  value: number;
  date: string;
  category: string;
  costId?: string;
}

export interface Team {
  id: string;
  name: string;
  supervisorId: string;
  department: Department;
}
