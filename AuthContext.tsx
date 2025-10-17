import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Company, PlanName, MonthlyPlan, ClientPackage, Client, Service, Employee, Sale } from '../types';
import { format, addMonths, addDays, subDays } from 'date-fns';
import { faker } from '@faker-js/faker';
import { 
    initialUsersData, 
    demoCompanyData, 
    mockClientPackagesData,
    mockPlanosData,
    mockAgendamentosData,
    mockClientesData,
    mockServicosData,
    mockFuncionariosData,
    mockCombosData,
    mockProdutosData,
    mockVouchersData,
    mockFormasPagamentoData,
    mockEspecialidadesData
} from '../data/mockData';

interface BirthdayConfig {
  message: string;
  voucherId: string | null;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  company: Company | null;
  loginLojista: (email: string, password: string) => Promise<boolean>;
  loginCliente: (email: string, password: string) => Promise<boolean>;
  loginDemo: (role: 'lojista' | 'cliente') => Promise<boolean>;
  registerCliente: (name: string, email: string, phone: string, password: string, birthDate: string, cpf: string) => Promise<boolean>;
  logout: () => void;
  isDemo: boolean;
  updateCompany: (newCompanyData: Company) => void;
  updateUser: (newUserData: Partial<User>) => void;
  addNewClient: (clientData: Omit<Client, 'id' | 'company_id' | 'active'>) => User;
  
  // Centralized Data
  agendamentos: typeof mockAgendamentosData;
  clientes: typeof mockClientesData;
  servicos: typeof mockServicosData;
  funcionarios: typeof mockFuncionariosData;
  combos: typeof mockCombosData;
  produtos: typeof mockProdutosData;
  vouchers: typeof mockVouchersData;
  formasPagamento: typeof mockFormasPagamentoData;
  especialidades: typeof mockEspecialidadesData;
  planos: typeof mockPlanosData;
  sales: Sale[];
  addSale: (sale: Sale) => void;

  // Plan management
  clientPackages: ClientPackage[];
  approvePackage: (clientId: string, planId: string, paymentMethod: string) => void;
  rejectPackage: (clientId: string, planId: string) => void;
  cancelPackageSubscription: (clientId: string, permanent: boolean) => void;
  registerOverduePayment: (clientId: string, planId: string) => void;
  requestPlanSubscription: (planId: string, isRecurring: boolean) => void;
  cancelPlanSubscriptionRequest: () => void;
  cancelClientPackage: (packageId: string) => void;
  activateClientPackage: (clientId: string, planId: string) => void;
  usePlanService: (clientId: string, serviceId: string) => void;
  findUserById: (id: string) => User | undefined;

  // Birthday Config
  birthdayConfig: BirthdayConfig;
  updateBirthdayConfig: (config: BirthdayConfig) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const mockSalesData: Sale[] = [];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [userDatabase, setUserDatabase] = useState<User[]>(initialUsersData);
  const [clientPackages, setClientPackages] = useState<ClientPackage[]>(mockClientPackagesData);
  const [birthdayConfig, setBirthdayConfig] = useState<BirthdayConfig>({
    message: 'Olá, {cliente}! A equipe da {empresa} te deseja um feliz aniversário! 🎉 Para comemorar, aqui está um presente para você:',
    voucherId: 'voucher-aniversario',
  });
  
  // Expose mock data through context
  const [agendamentos, setAgendamentos] = useState(mockAgendamentosData);
  const [clientes, setClientes] = useState(mockClientesData);
  const [servicos] = useState(mockServicosData);
  const [funcionarios] = useState(mockFuncionariosData);
  const [combos] = useState(mockCombosData);
  const [produtos] = useState(mockProdutosData);
  const [vouchers] = useState(mockVouchersData);
  const [formasPagamento] = useState(mockFormasPagamentoData);
  const [especialidades] = useState(mockEspecialidadesData);
  const [planos] = useState(mockPlanosData);
  const [sales, setSales] = useState<Sale[]>(mockSalesData);

  useEffect(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const hasTodaysAppointments = mockAgendamentosData.some(apt => apt.date === todayStr);

    if (!hasTodaysAppointments && mockClientesData.length > 2 && mockServicosData.length > 2 && mockFuncionariosData.length > 1) {
        const newAppointments = [
            { id: faker.string.uuid(), client_id: mockClientesData[0].id, employee_id: mockFuncionariosData[0].id, service_id: mockServicosData[0].id, date: todayStr, start_time: '10:00', end_time: '10:30', status: 'agendado' as 'agendado', company_id: 'demo-company', created_at: new Date().toISOString() },
            { id: faker.string.uuid(), client_id: mockClientesData[1].id, employee_id: mockFuncionariosData[1].id, service_id: mockServicosData[1].id, date: todayStr, start_time: '11:00', end_time: '11:20', status: 'agendado' as 'agendado', company_id: 'demo-company', created_at: new Date().toISOString() },
            { id: faker.string.uuid(), client_id: mockClientesData[2].id, employee_id: mockFuncionariosData[0].id, service_id: mockServicosData[2].id, date: todayStr, start_time: '14:00', end_time: '14:50', status: 'agendado' as 'agendado', company_id: 'demo-company', created_at: new Date().toISOString() },
        ];
        setAgendamentos(prev => [...prev, ...newAppointments]);
    }
  }, []);

  const findUserById = (id: string) => userDatabase.find(u => u.id === id);

  const updateUserInDatabase = (userId: string, updates: Partial<User>) => {
    setUserDatabase(prevDb => prevDb.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (user?.id === userId) {
      setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
    }
  };

  const updateCompany = (newCompanyData: Company) => setCompany(newCompanyData);
  const updateUser = (newUserData: Partial<User>) => { if (user) { updateUserInDatabase(user.id, newUserData); } };

  const loginLojista = async (email: string, password: string): Promise<boolean> => {
    let foundUser: User | undefined;
    if (email === 'master' && password === 'nico2019') {
        foundUser = userDatabase.find(u => u.id === 'master-user');
    }
    if (foundUser) {
        setUser(foundUser);
        setCompany(demoCompanyData);
        setIsDemo(false);
        return true;
    }
    return false;
  };

  const loginCliente = async (email: string, password: string): Promise<boolean> => {
    const foundUser = userDatabase.find(u => u.role === 'cliente' && u.email === email);
    if (foundUser) {
      setUser(foundUser);
      setCompany(demoCompanyData);
      setIsDemo(false);
      return true;
    }
    return false;
  };

  const loginDemo = async (role: 'lojista' | 'cliente'): Promise<boolean> => {
    if (role === 'lojista') {
      setUser(userDatabase.find(u => u.id === 'master-user'));
      setCompany(demoCompanyData);
      setIsDemo(true);
      return true;
    }
    if (role === 'cliente') {
      setUser(userDatabase.find(u => u.id === 'cli-com-plano'));
      setCompany(demoCompanyData);
      setIsDemo(true);
      return true;
    }
    return false;
  };

  const registerCliente = async (name: string, email: string, phone: string, password: string, birthDate: string, cpf: string): Promise<boolean> => {
    const newClientUser: User = { id: `client-${Date.now()}`, name, email, phone, birthDate, cpf, role: 'cliente', isNewClient: true, serviceHistory: [], usedVouchers: [], planUsage: {} };
    const newClientData: Client = { id: newClientUser.id, name, phone, email, birthDate, cpf, active: true, company_id: 'demo-company', planUsage: {} };
    setUserDatabase(prev => [...prev, newClientUser]);
    setClientes(prev => [...prev, newClientData]);
    setUser(newClientUser);
    setCompany(demoCompanyData);
    setIsDemo(false);
    return true;
  };

  const addNewClient = (clientData: Omit<Client, 'id' | 'company_id' | 'active'>): User => {
    const newClientUser: User = { id: faker.string.uuid(), name: clientData.name, email: clientData.email || `${clientData.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}@cliente.com`, role: 'cliente', phone: clientData.phone, birthDate: clientData.birthDate, isNewClient: true, planUsage: {} };
    const newClientData: Client = { ...clientData, id: newClientUser.id, company_id: 'demo-company', active: true, planUsage: {} };
    setUserDatabase(prev => [...prev, newClientUser]);
    setClientes(prev => [...prev, newClientData]);
    return newClientUser;
  };

  const logout = () => { setUser(null); setCompany(null); setIsDemo(false); };

  const addSale = (sale: Sale) => { setSales(prev => [sale, ...prev]); };

  const usePlanService = (clientId: string, serviceId: string) => {
    const updateUserPlanUsage = (u: User | Client) => {
        const currentUsage = u.planUsage ? u.planUsage[serviceId] || 0 : 0;
        return { ...u, planUsage: { ...u.planUsage, [serviceId]: currentUsage + 1 }};
    };
    setClientes(prev => prev.map(c => c.id === clientId ? updateUserPlanUsage(c) as Client : c));
    if (user?.id === clientId) {
        setUser(prev => prev ? updateUserPlanUsage(prev) as User : null);
    }
  };

  const requestPlanSubscription = (planId: string, isRecurring: boolean) => {
    if (!user) return;
    const plan = planos.find(p => p.id === planId);
    if (!plan) return;
    const updatedPackages = clientPackages.filter(p => !(p.clientId === user.id && p.status === 'pendente'));
    const newRequest: ClientPackage = { id: faker.string.uuid(), clientId: user.id, clientName: user.name, planId, planName: plan.name, planPrice: plan.price, status: 'pendente', isRecurring, requestDate: new Date().toISOString(), renewalDate: '', expirationDate: '' };
    setClientPackages([...updatedPackages, newRequest]);
  };

  const cancelPlanSubscriptionRequest = () => { if (!user) return; setClientPackages(prev => prev.filter(p => !(p.clientId === user.id && p.status === 'pendente'))); };
  
  const cancelClientPackage = (packageId: string) => {
    setClientPackages(prev => prev.map(pkg => pkg.id === packageId && pkg.clientId === user?.id ? { ...pkg, status: 'cancelado' } : pkg));
  };

  const approvePackage = (clientId: string, planId: string, paymentMethod: string) => {
    setClientPackages(prev => prev.map(pkg => {
      if (pkg.clientId === clientId && pkg.status === 'pendente' && pkg.planId === planId) {
        const planDetails = planos.find(p => p.id === planId);
        return { ...pkg, status: 'ativo', activationDate: new Date().toISOString(), expirationDate: addDays(new Date(), planDetails?.validityInDays || 30).toISOString(), renewalDate: addMonths(new Date(), 1).toISOString() };
      }
      return pkg;
    }));
  };

  const rejectPackage = (clientId: string, planId: string) => { setClientPackages(prev => prev.filter(pkg => !(pkg.clientId === clientId && pkg.planId === planId && pkg.status === 'pendente'))); };

  const cancelPackageSubscription = (clientId: string, permanent: boolean) => {
    setClientPackages(prev => prev.map(pkg => {
      if (pkg.clientId === clientId && pkg.status === 'em-atraso') {
        return { ...pkg, status: permanent ? 'expirado' : 'ativo', isRecurring: permanent ? false : pkg.isRecurring, renewalDate: addMonths(new Date(pkg.renewalDate), 1).toISOString() };
      }
      return pkg;
    }));
  };

  const registerOverduePayment = (clientId: string, planId: string) => {
    setClientPackages(prev => prev.map(pkg => {
        if (pkg.clientId === clientId && pkg.planId === planId && pkg.status === 'em-atraso') {
            const planDetails = planos.find(p => p.id === planId);
            return { ...pkg, status: 'ativo', expirationDate: addDays(new Date(), planDetails?.validityInDays || 30).toISOString(), renewalDate: addMonths(new Date(), 1).toISOString() };
        }
        return pkg;
    }));
  };

  const activateClientPackage = (clientId: string, planId: string) => {
    const clientToUpdate = findUserById(clientId);
    if (!clientToUpdate) return;
    const plan = planos.find(p => p.id === planId);
    if (!plan) return;
    const newPackage: ClientPackage = { id: faker.string.uuid(), clientId, clientName: clientToUpdate.name, planId, planName: plan.name, planPrice: plan.price, status: 'ativo', isRecurring: false, requestDate: new Date().toISOString(), activationDate: new Date().toISOString(), expirationDate: addDays(new Date(), plan.validityInDays).toISOString(), renewalDate: addMonths(new Date(), 1).toISOString() };
    setClientPackages(prev => [...prev.filter(p => p.clientId !== clientId || p.status !== 'ativo'), newPackage]);
    const updateUserWithPlan = (u: User | Client) => ({ ...u, planId: newPackage.id, planUsage: {} });
    setClientes(prev => prev.map(c => c.id === clientId ? updateUserWithPlan(c) as Client : c));
    if (user?.id === clientId) { setUser(prev => prev ? updateUserWithPlan(prev) as User : null); }
  };

  const updateBirthdayConfig = (config: BirthdayConfig) => { setBirthdayConfig(config); };

  return (
    <AuthContext.Provider value={{ 
        user, users: userDatabase, company, loginLojista, loginCliente, loginDemo, registerCliente, logout, isDemo, updateCompany, updateUser, addNewClient,
        agendamentos, clientes, servicos, funcionarios, combos, produtos, vouchers, formasPagamento, especialidades, planos, sales, addSale,
        clientPackages, approvePackage, rejectPackage, cancelPackageSubscription, registerOverduePayment, requestPlanSubscription, cancelPlanSubscriptionRequest, cancelClientPackage, activateClientPackage, usePlanService, findUserById,
        birthdayConfig, updateBirthdayConfig
    }}>
      {children}
    </AuthContext.Provider>
  );
};
