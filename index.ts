export type PlanName = 'basic' | 'plus' | 'prime';

export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  role: 'tecnico' | 'administrador' | 'funcionario' | 'cliente';
  avatarUrl?: string;
  company_id?: string;
  permissions?: string[];
  phone?: string;
  birthDate?: string;
  isNewClient?: boolean;
  serviceHistory?: { serviceId: string, date: string }[];
  usedVouchers?: { voucherId: string, usedDate: string }[];
  plan?: PlanName; // Lojista plan
  planId?: string; // ID of the active monthly package for clients
  planUsage?: { [serviceId: string]: number };
}

export interface Company {
  id: string;
  document: string; // CPF ou CNPJ
  name: string;
  logo_url?: string;
  phone: string;
  address: string;
  business_hours: BusinessHours[];
  discount_limit: number;
  markup_limit: number;
}

export interface BusinessHours {
  day: string;
  start_time: string;
  end_time: string;
  break_start?: string;
  break_end?: string;
  active: boolean; // Adicionado para controlar dias de trabalho
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  specialties: string[];
  commission_products: number;
  commission_services: number;
  commission_combos: number;
  schedule: BusinessHours[];
  active: boolean;
  company_id: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  birthDate?: string;
  active: boolean;
  company_id: string;
  preferred_employee?: string;
  isNewClient?: boolean;
  serviceHistory?: { serviceId: string, date: string }[];
  usedVouchers?: { voucherId: string, usedDate: string }[];
  planId?: string; // ID of the active monthly package
  planUsage?: { [serviceId: string]: number };
}

export interface Service {
  id: string;
  name: string;
  duration: number; // em minutos
  price: number;
  active: boolean;
  specialty_ids: string[];
}

export interface Product {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  price: number;
  active: boolean;
  company_id: string;
}

export interface Combo {
  id: string;
  name: string;
  type: 'service' | 'product';
  items: ComboItem[];
  price: number;
  duration?: number;
  allow_discount: boolean;
  active: boolean;
}

export interface ComboItem {
  type: 'product' | 'service';
  id: string;
  quantity: number;
}

export interface Appointment {
  id: string;
  client_id: string;
  employee_id: string;
  service_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'agendado' | 'concluido' | 'cancelado';
  company_id: string;
  created_at: string;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  employee_id: string;
  client_id?: string;
  subtotal: number;
  discount: number;
  discount_type: 'value' | 'percentage';
  voucherCode?: string;
  markup: number;
  markup_type: 'value' | 'percentage';
  packageCredit: number;
  total: number;
  payments: Payment[];
  appointment_id?: string;
  company_id: string;
  created_at: string;
}

export interface CartItem {
    id: string;
    name: string;
    price: number;
    type: 'service' | 'product' | 'combo' | 'package';
    quantity: number;
    coveredByPlan?: boolean;
    employeeId?: string;
}

export interface Payment {
    method: string;
    amount: number;
}

export interface SaleItem {
  type: 'product' | 'service' | 'combo' | 'package';
  id: string;
  name: string; // Adicionado para facilitar a exibição
  quantity: number;
  price: number;
  total: number;
  employeeId?: string;
  coveredByPlan?: boolean;
}

export interface Voucher {
  id: string;
  name: string;
  code: string;
  description: string;
  type: 'value' | 'percentage';
  value: number;
  active: boolean;
  validFrom: string; // ISO Date string
  validTo: string;   // ISO Date string
  appliesTo: 'all' | 'products' | 'services' | 'plans';
  eligibility: 'all' | 'new_clients' | 'birthday_month' | 'fidelity';
  fidelityTargetServiceId?: string;
  fidelityTargetCount?: number;
  singleUsePerClient: boolean;
}

export interface ClientVoucher {
    voucherId: string;
    status: 'available' | 'used' | 'expired';
    usedDate?: string;
}

export interface MonthlyPlan {
  id: string;
  name: string;
  price: number;
  services: PlanService[];
  validityInDays: number; // New field for validity
  active: boolean;
}

export interface PlanService {
  serviceId: string;
  quantity: number;
}

export interface ClientPackage {
  id: string;
  clientId: string;
  clientName: string;
  planId: string;
  planName: string;
  planPrice: number;
  status: 'ativo' | 'pendente' | 'em-atraso' | 'expirado' | 'cancelado';
  isRecurring: boolean;
  requestDate: string; // ISO
  activationDate?: string; // ISO
  renewalDate: string; // ISO
  expirationDate: string; // ISO
}
