import React from 'react';
import {
  Home,
  Calendar,
  DollarSign,
  FileText,
  Users,
  Settings,
  BrainCircuit,
  BookCheck,
  Bell,
  Ticket,
  Gift,
  Layers,
  Award,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  Archive,
  ShoppingCart,
  XCircle,
} from 'lucide-react';
import { Feature } from '../../contexts/SubscriptionContext';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  submenu?: MenuItem[];
  roles?: string[];
  feature?: Feature;
}

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard'
  },
  {
    id: 'agendamentos',
    label: 'Agendamentos',
    icon: Calendar,
    submenu: [
      { id: 'painel-agendamentos', label: 'Painel de Agendamentos', icon: Calendar, path: '/agendamentos' },
      { id: 'novo-agendamento', label: 'Novo Agendamento', icon: Calendar, path: '/agendamentos/novo' }
    ]
  },
  {
    id: 'vendas',
    label: 'Vendas/PDV',
    icon: ShoppingCart,
    path: '/vendas',
  },
  {
    id: 'fechamento',
    label: 'Fechamento',
    icon: BookCheck,
    path: '/fechamento',
    feature: 'fechamento',
  },
  {
    id: 'pacotes-mensais',
    label: 'Gestão de Pacotes',
    icon: Award,
    feature: 'pacotes_mensais',
    submenu: [
      { id: 'busca-clientes-pacotes', label: 'Busca por Clientes', icon: Search, path: '/pacotes-mensais/busca' },
      { id: 'solicitacoes-pendentes', label: 'Pendentes', icon: Clock, path: '/pacotes-mensais/pendentes' },
      { id: 'planos-ativos', label: 'Ativos', icon: CheckCircle, path: '/pacotes-mensais/ativos' },
      { id: 'planos-atraso', label: 'Em Atraso', icon: AlertTriangle, path: '/pacotes-mensais/atraso' },
      { id: 'planos-expirados', label: 'Expirados', icon: Archive, path: '/pacotes-mensais/expirados' },
      { id: 'planos-cancelados', label: 'Cancelados', icon: XCircle, path: '/pacotes-mensais/cancelados' },
    ]
  },
  {
    id: 'vouchers',
    label: 'Vouchers',
    icon: Ticket,
    path: '/vouchers',
    feature: 'vouchers',
  },
  {
    id: 'assistente-ia',
    label: 'Assistente IA',
    icon: BrainCircuit,
    path: '/assistente-ia',
    feature: 'assistente_ia',
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: DollarSign,
    submenu: [
      { id: 'painel-financeiro', label: 'Painel Financeiro', icon: DollarSign, path: '/financeiro' },
      { id: 'contas-pagar', label: 'Contas a Pagar', icon: DollarSign, path: '/financeiro/pagar' },
      { id: 'contas-receber', label: 'Contas a Receber', icon: DollarSign, path: '/financeiro/receber' },
    ]
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    icon: FileText,
    submenu: [
      { id: 'painel-relatorios', label: 'Painel de Relatórios', icon: FileText, path: '/relatorios' },
      { id: 'rel-comissao', label: 'Rel. Comissão', icon: FileText, path: '/relatorios/comissao' },
      { id: 'rel-vendas', label: 'Rel. Vendas', icon: FileText, path: '/relatorios/vendas' },
      { id: 'rel-agendamentos', label: 'Rel. Agendamentos', icon: FileText, path: '/relatorios/agendamentos' },
      { id: 'rel-cadastros', label: 'Rel. Cadastros', icon: FileText, path: '/relatorios/cadastros' },
      { id: 'rel-estoque', label: 'Rel. Estoque', icon: FileText, path: '/relatorios/estoque' },
      { id: 'rel-fechamentos', label: 'Rel. Fechamentos', icon: BookCheck, path: '/relatorios/fechamentos', feature: 'fechamento' },
      { id: 'rel-planos', label: 'Rel. Pacotes', icon: Award, path: '/relatorios/planos', feature: 'pacotes_mensais' },
      { id: 'rel-aniversariantes', label: 'Rel. Aniversariantes', icon: Gift, path: '/relatorios/aniversariantes' },
      { id: 'rel-vouchers', label: 'Rel. Vouchers', icon: Ticket, path: '/relatorios/vouchers', feature: 'vouchers' },
      { id: 'rel-financeiro', label: 'Rel. Financeiro', icon: DollarSign, path: '/relatorios/financeiro-geral' },
    ]
  },
  {
    id: 'cadastros',
    label: 'Cadastros',
    icon: Users,
    submenu: [
      { id: 'clientes', label: 'Clientes', icon: Users, path: '/cadastros/clientes' },
      { id: 'especialidades', label: 'Especialidades', icon: Users, path: '/cadastros/especialidades' },
      { id: 'funcionarios', label: 'Funcionários', icon: Users, path: '/cadastros/funcionarios' },
      { id: 'produtos', label: 'Produtos', icon: Users, path: '/cadastros/produtos' },
      { id: 'servicos', label: 'Serviços', icon: Users, path: '/cadastros/servicos' },
      { id: 'combos', label: 'Combos', icon: Users, path: '/cadastros/combos' },
      { id: 'pacotes', label: 'Pacotes Mensais', icon: Award, path: '/cadastros/pacotes', feature: 'pacotes_mensais' },
      { id: 'formas-pagamento', label: 'Formas de Pagamento', icon: Users, path: '/cadastros/formas-pagamento' },
    ]
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: Settings,
    submenu: [
      { id: 'empresa', label: 'Empresa', icon: Settings, path: '/configuracoes/empresa' },
      { id: 'usuarios', label: 'Usuários', icon: Settings, path: '/configuracoes/usuarios' },
      { id: 'modo-ia', label: 'Modo IA', icon: BrainCircuit, path: '/configuracoes/modo-ia', feature: 'assistente_ia' },
      { id: 'notificacoes', label: 'Notificações', icon: Bell, path: '/configuracoes/notificacoes' },
      { id: 'aniversariantes-config', label: 'Aniversariantes', icon: Gift, path: '/configuracoes/aniversariantes' },
      { id: 'backup', label: 'Backup', icon: Settings, path: '/configuracoes/backup' },
    ]
  },
  {
    id: 'planos',
    label: 'Planos',
    icon: Layers,
    path: '/planos',
    roles: ['tecnico', 'administrador', 'funcionario'],
  },
];
