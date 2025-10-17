import { useReducer, useMemo } from 'react';
import { faker } from '@faker-js/faker';
import { Client, Service, Combo, Product, Employee, Appointment, Sale, SaleItem, CartItem, MonthlyPlan, Voucher } from '../types';
import { useAuth } from '../contexts/AuthContext';

// --- STATE AND ACTIONS ---

type PdvState = {
  status: 'selecting_items' | 'paying';
  client: Client | null;
  cart: CartItem[];
  appointmentId: string | null;
  discount: number;
  discountType: 'value' | 'percentage';
  voucherCode: string | null;
};

type PdvAction =
  | { type: 'SELECT_CLIENT'; payload: Client | null }
  | { type: 'START_WALK_IN_SALE' }
  | { type: 'ADD_ITEM'; payload: { item: Service | Product | Combo | MonthlyPlan; type: 'service' | 'product' | 'combo' | 'package', coveredByPlan?: boolean } }
  | { type: 'IMPORT_APPOINTMENT'; payload: { appointment: Appointment, client: Client, service: Service, employee: Employee } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'ASSIGN_EMPLOYEE'; payload: { itemId: string; employeeId: string } }
  | { type: 'START_PAYMENT' }
  | { type: 'APPLY_VOUCHER'; payload: { code: string; discount: number; discountType: 'value' | 'percentage' } }
  | { type: 'APPLY_MANUAL_DISCOUNT'; payload: { discount: number; discountType: 'value' | 'percentage' } }
  | { type: 'REMOVE_DISCOUNT' }
  | { type: 'RESET' };

const initialState: PdvState = {
  status: 'selecting_items',
  client: null,
  cart: [],
  appointmentId: null,
  discount: 0,
  discountType: 'value',
  voucherCode: null,
};

function pdvReducer(state: PdvState, action: PdvAction): PdvState {
  switch (action.type) {
    case 'SELECT_CLIENT':
      return {
        ...state,
        client: action.payload,
        status: 'selecting_items',
      };
    
    case 'START_WALK_IN_SALE':
      return {
        ...initialState,
        status: 'selecting_items',
        client: null,
      };

    case 'ADD_ITEM': {
      const { item, type, coveredByPlan } = action.payload;
      if (type === 'package') {
        if (!state.client) return state;
        if (state.cart.some(cartItem => cartItem.type === 'package')) return state;
      }
      const existingItem = state.cart.find(cartItem => cartItem.id === item.id && cartItem.type === type);
      if (existingItem && type !== 'package') {
        return { ...state, cart: state.cart.map(cartItem => cartItem.id === item.id && cartItem.type === type ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem) };
      }
      const newItem: CartItem = { id: item.id, name: item.name, price: item.price, type: type, quantity: 1, coveredByPlan };
      return { ...state, cart: [...state.cart, newItem] };
    }

    case 'IMPORT_APPOINTMENT': {
        const { appointment, client, service, employee } = action.payload;
        const newItem: CartItem = { id: service.id, name: service.name, price: service.price, type: 'service', quantity: 1, employeeId: employee.id };
        return { ...initialState, client: client, cart: [newItem], status: 'selecting_items', appointmentId: appointment.id };
    }

    case 'REMOVE_ITEM':
      return { ...state, cart: state.cart.filter(item => item.id !== action.payload) };

    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) return { ...state, cart: state.cart.filter(item => item.id !== itemId) };
      return { ...state, cart: state.cart.map(item => item.id === itemId ? { ...item, quantity } : item) };
    }
    
    case 'ASSIGN_EMPLOYEE':
      return { ...state, cart: state.cart.map(item => item.id === action.payload.itemId ? { ...item, employeeId: action.payload.employeeId } : item) };

    case 'START_PAYMENT':
      return { ...state, status: 'paying' };

    case 'APPLY_VOUCHER':
      return { ...state, discount: action.payload.discount, discountType: action.payload.discountType, voucherCode: action.payload.code };

    case 'APPLY_MANUAL_DISCOUNT':
      return { ...state, discount: action.payload.discount, discountType: action.payload.discountType, voucherCode: null };

    case 'REMOVE_DISCOUNT':
      return { ...state, discount: 0, voucherCode: null, discountType: 'value' };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// --- CUSTOM HOOK ---

export const usePdvState = () => {
  const [state, dispatch] = useReducer(pdvReducer, initialState);
  const { user, funcionarios, activateClientPackage, vouchers, addSale, usePlanService, clientPackages, planos } = useAuth();

  const cartCalculations = useMemo(() => {
    const subtotal = state.cart.reduce((sum, item) => {
        return item.coveredByPlan ? sum : sum + item.price * item.quantity;
    }, 0);
    const packageCredit = state.cart.reduce((sum, item) => {
        return item.coveredByPlan ? sum + item.price * item.quantity : sum;
    }, 0);

    let finalDiscount = 0;
    if (state.discountType === 'percentage') {
      finalDiscount = subtotal * (state.discount / 100);
    } else {
      finalDiscount = state.discount;
    }
    finalDiscount = Math.min(subtotal, finalDiscount);
    const total = subtotal - finalDiscount;
    return { subtotal, total, finalDiscount, packageCredit };
  }, [state.cart, state.discount, state.discountType]);

  const selectClient = (client: Client | null) => dispatch({ type: 'SELECT_CLIENT', payload: client });
  const startWalkInSale = () => dispatch({ type: 'START_WALK_IN_SALE' });
  
  const addItemToCart = (item: Service | Product | Combo | MonthlyPlan, type: 'service' | 'product' | 'combo' | 'package') => {
    let coveredByPlan = false;
    if (type === 'service' && state.client?.planId) {
        const clientPackage = clientPackages.find(p => p.id === state.client?.planId && p.status === 'ativo');
        if (clientPackage) {
            const planDetails = planos.find(p => p.id === clientPackage.planId);
            const serviceInPlan = planDetails?.services.find(s => s.serviceId === item.id);
            if (serviceInPlan) {
                const used = state.client.planUsage?.[item.id] || 0;
                if (used < serviceInPlan.quantity) {
                    coveredByPlan = true;
                }
            }
        }
    }
    dispatch({ type: 'ADD_ITEM', payload: { item, type, coveredByPlan } });
  };

  const importAppointment = (appointment: Appointment, client: Client, service: Service, employee: Employee) => dispatch({ type: 'IMPORT_APPOINTMENT', payload: { appointment, client, service, employee } });
  const removeItemFromCart = (itemId: string) => dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  const updateItemQuantity = (itemId: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  const assignEmployeeToItem = (itemId: string, employeeId: string) => dispatch({ type: 'ASSIGN_EMPLOYEE', payload: { itemId, employeeId } });
  const startPayment = () => { if (state.cart.length > 0) dispatch({ type: 'START_PAYMENT' }) };
  const removeDiscount = () => dispatch({ type: 'REMOVE_DISCOUNT' });
  const resetPdv = () => dispatch({ type: 'RESET' });

  const applyVoucher = (code: string): { success: boolean; message: string } => {
    const voucher = vouchers.find(v => v.code.toLowerCase() === code.toLowerCase() && v.active);
    if (!voucher) return { success: false, message: 'Voucher inválido ou inativo.' };
    dispatch({ type: 'APPLY_VOUCHER', payload: { code: voucher.code, discount: voucher.value, discountType: voucher.type } });
    return { success: true, message: 'Voucher aplicado com sucesso!' };
  };

  const applyManualDiscount = (discount: number, type: 'value' | 'percentage'): { success: boolean; message: string } => {
    dispatch({ type: 'APPLY_MANUAL_DISCOUNT', payload: { discount, discountType: type } });
    return { success: true, message: 'Desconto manual aplicado.' };
  };

  const completeSale = (payments: { method: string; amount: number }[]): Sale | null => {
    if (!user) { console.error("Usuário não definido para completar a venda."); return null; }

    const packageItem = state.cart.find(item => item.type === 'package');
    if (packageItem && state.client) {
        activateClientPackage(state.client.id, packageItem.id);
    }

    const { subtotal, total, finalDiscount, packageCredit } = cartCalculations;
    const saleItems: SaleItem[] = state.cart.map(item => ({ ...item, total: item.price * item.quantity }));
    
    saleItems.forEach(item => {
        if (item.coveredByPlan && state.client) {
            usePlanService(state.client.id, item.id);
        }
    });

    const newSale: Sale = {
      id: faker.string.uuid(),
      items: saleItems,
      employee_id: user.id,
      client_id: state.client?.id,
      subtotal,
      discount: finalDiscount,
      discount_type: state.discountType,
      voucherCode: state.voucherCode || undefined,
      markup: 0,
      markup_type: 'value',
      packageCredit,
      total,
      payments,
      appointment_id: state.appointmentId || undefined,
      company_id: user.company_id || 'demo-company',
      created_at: new Date().toISOString(),
    };
    
    addSale(newSale);
    return newSale;
  };

  const getEmployeeForCartItem = (item: CartItem) => {
    if (item.employeeId) return funcionarios.find(f => f.id === item.employeeId);
    return null;
  };

  return {
    state,
    ...cartCalculations,
    selectClient,
    startWalkInSale,
    addItemToCart,
    importAppointment,
    removeItemFromCart,
    updateItemQuantity,
    assignEmployeeToItem,
    startPayment,
    completeSale,
    resetPdv,
    getEmployeeForCartItem,
    applyVoucher,
    applyManualDiscount,
    removeDiscount,
  };
};
