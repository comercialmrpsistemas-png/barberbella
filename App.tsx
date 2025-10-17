import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ModalProvider, useModal } from './contexts/ModalContext';
import Layout from './components/Layout/Layout';
import ClienteLayout from './components/Layout/ClienteLayout';
import Landing from './pages/Landing';
import LoginLojista from './pages/Login';
import LoginCliente from './pages/Cliente/LoginCliente';
import CadastroCliente from './pages/Cliente/CadastroCliente';

import Dashboard from './pages/Dashboard';
import Planos from './pages/Planos';
import PlanGuard from './components/PlanGuard';
import UpgradePlan from './pages/UpgradePlan';
import Configuracoes from './pages/Configuracoes';
import Empresa from './pages/Configuracoes/Empresa';
import Backup from './pages/Configuracoes/Backup';
import Usuarios from './pages/Configuracoes/Usuarios';
import ModoIA from './pages/Configuracoes/ChatGPT';
import Notificacoes from './pages/Configuracoes/Notificacoes';
import AniversariantesConfig from './pages/Configuracoes/Aniversariantes';
import AssistenteIA from './pages/AssistenteIA';
import Cadastros from './pages/Cadastros';
import Clientes from './pages/Cadastros/Clientes';
import Especialidades from './pages/Cadastros/Especialidades';
import Funcionarios from './pages/Cadastros/Funcionarios';
import Produtos from './pages/Cadastros/Produtos';
import Servicos from './pages/Cadastros/Servicos';
import Combos from './pages/Cadastros/Combos';
import FormasPagamento from './pages/Cadastros/FormasPagamento';
import Vouchers from './pages/Cadastros/Vouchers';
import Financeiro from './pages/Financeiro';
import PainelFinanceiro from './pages/Financeiro/PainelFinanceiro';
import ContasPagar from './pages/Financeiro/ContasPagar';
import ContasReceber from './pages/Financeiro/ContasReceber';
import Fechamento from './pages/Fechamento';
import Relatorios from './pages/Relatorios';
import RelatorioVendas from './pages/Relatorios/RelatorioVendas';
import RelatorioComissao from './pages/Relatorios/RelatorioComissao';
import RelatorioAgendamentos from './pages/Relatorios/RelatorioAgendamentos';
import RelatorioCadastros from './pages/Relatorios/RelatorioCadastros';
import RelatorioEstoque from './pages/Relatorios/RelatorioEstoque';
import RelatorioFechamentos from './pages/Relatorios/RelatorioFechamentos';
import RelatorioAniversariantes from './pages/Relatorios/RelatorioAniversariantes';
import Agendamentos from './pages/Agendamentos';
import PainelAgendamentos from './pages/Agendamentos/PainelAgendamentos';
import NovoAgendamento from './pages/Agendamentos/NovoAgendamento';
import Vendas from './pages/Vendas';
import MeuPerfilLojista from './pages/MeuPerfilLojista';

// Pacotes Mensais
import PlanosMensais from './pages/Cadastros/PlanosMensais';
import GerenciamentoPlanos from './pages/GerenciamentoPlanos';
import BuscaClientesPacotes from './pages/GerenciamentoPlanos/BuscaClientes';
import SolicitacoesPendentes from './pages/GerenciamentoPlanos/SolicitacoesPendentes';
import PlanosAtivos from './pages/GerenciamentoPlanos/PlanosAtivos';
import PlanosAtraso from './pages/GerenciamentoPlanos/PlanosAtraso';
import PlanosExpirados from './pages/GerenciamentoPlanos/PlanosExpirados';
import PlanosCancelados from './pages/GerenciamentoPlanos/PlanosCancelados';
import RelatorioPlanos from './pages/Relatorios/RelatorioPlanos';
import RelatorioVouchers from './pages/Relatorios/RelatorioVouchers';
import RelatorioFinanceiro from './pages/Relatorios/RelatorioFinanceiro';

// Client Pages
import DashboardCliente from './pages/Cliente/DashboardCliente';
import MeusAgendamentos from './pages/Cliente/MeusAgendamentos';
import NovoAgendamentoCliente from './pages/Cliente/NovoAgendamentoCliente';
import PerfilCliente from './pages/Cliente/PerfilCliente';
import ProdutosCliente from './pages/Cliente/ProdutosCliente';
import AtendimentoIA from './pages/Cliente/AtendimentoIA';
import MeusVouchers from './pages/Cliente/MeusVouchers';
import MeuHistorico from './pages/Cliente/MeuHistorico';
import MeuPlano from "./pages/Cliente/MeuPlano";

const LojistaProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const lojistaRoles = ['tecnico', 'administrador', 'funcionario'];

  if (!user || !lojistaRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return <Layout>{children}</Layout>;
};

const ClienteProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (!user || user.role !== 'cliente') {
    return <Navigate to="/login/cliente" />;
  }
  
  return <ClienteLayout>{children}</ClienteLayout>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const { showAlert } = useModal();

  useEffect(() => {
    const handleShowAlert = (event: CustomEvent) => {
        showAlert(event.detail);
    };
    window.addEventListener('showAlert', handleShowAlert as EventListener);
    return () => {
        window.removeEventListener('showAlert', handleShowAlert as EventListener);
    };
  }, [showAlert]);


  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!user ? <Landing /> : (user.role === 'cliente' ? <Navigate to="/cliente/dashboard" /> : <Navigate to="/dashboard" />)} />
        <Route path="/login/lojista" element={user ? <Navigate to="/dashboard" /> : <LoginLojista />} />
        <Route path="/login/cliente" element={user ? <Navigate to="/cliente/dashboard" /> : <LoginCliente />} />
        <Route path="/cadastro-cliente" element={<CadastroCliente />} />

        {/* Lojista Protected Routes */}
        <Route path="/dashboard" element={<LojistaProtectedRoute><Dashboard /></LojistaProtectedRoute>} />
        <Route path="/planos" element={<LojistaProtectedRoute><Planos /></LojistaProtectedRoute>} />
        <Route path="/meu-perfil" element={<LojistaProtectedRoute><MeuPerfilLojista /></LojistaProtectedRoute>} />
        <Route path="/configuracoes" element={<LojistaProtectedRoute><Configuracoes /></LojistaProtectedRoute>}>
          <Route index element={<Navigate to="empresa" replace />} />
          <Route path="empresa" element={<Empresa />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="modo-ia" element={<PlanGuard feature="assistente_ia"><ModoIA /></PlanGuard>} />
          <Route path="notificacoes" element={<Notificacoes />} />
          <Route path="aniversariantes" element={<AniversariantesConfig />} />
          <Route path="backup" element={<Backup />} />
        </Route>
        <Route path="/cadastros" element={<LojistaProtectedRoute><Cadastros /></LojistaProtectedRoute>}>
          <Route index element={<Navigate to="clientes" replace />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="especialidades" element={<Especialidades />} />
          <Route path="funcionarios" element={<Funcionarios />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="servicos" element={<Servicos />} />
          <Route path="combos" element={<Combos />} />
          <Route path="pacotes" element={<PlanGuard feature="pacotes_mensais"><PlanosMensais /></PlanGuard>} />
          <Route path="formas-pagamento" element={<FormasPagamento />} />
        </Route>
        <Route path="/pacotes-mensais" element={<LojistaProtectedRoute><PlanGuard feature="pacotes_mensais"><GerenciamentoPlanos /></PlanGuard></LojistaProtectedRoute>}>
            <Route index element={<Navigate to="pendentes" replace />} />
            <Route path="pendentes" element={<SolicitacoesPendentes />} />
            <Route path="busca" element={<BuscaClientesPacotes />} />
            <Route path="ativos" element={<PlanosAtivos />} />
            <Route path="atraso" element={<PlanosAtraso />} />
            <Route path="expirados" element={<PlanosExpirados />} />
            <Route path="cancelados" element={<PlanosCancelados />} />
        </Route>
        <Route path="/financeiro" element={<LojistaProtectedRoute><Financeiro /></LojistaProtectedRoute>}>
          <Route index element={<PainelFinanceiro />} />
          <Route path="pagar" element={<ContasPagar />} />
          <Route path="receber" element={<ContasReceber />} />
        </Route>
        <Route path="/fechamento" element={<LojistaProtectedRoute><PlanGuard feature="fechamento"><Fechamento /></PlanGuard></LojistaProtectedRoute>} />
        <Route path="/vouchers" element={<LojistaProtectedRoute><PlanGuard feature="vouchers"><Vouchers /></PlanGuard></LojistaProtectedRoute>} />
        <Route path="/assistente-ia" element={<LojistaProtectedRoute><PlanGuard feature="assistente_ia"><AssistenteIA /></PlanGuard></LojistaProtectedRoute>} />
        <Route path="/relatorios" element={<LojistaProtectedRoute><Relatorios /></LojistaProtectedRoute>}>
          <Route index element={<Relatorios />} />
          <Route path="vendas" element={<RelatorioVendas />} />
          <Route path="comissao" element={<RelatorioComissao />} />
          <Route path="agendamentos" element={<RelatorioAgendamentos />} />
          <Route path="cadastros" element={<RelatorioCadastros />} />
          <Route path="estoque" element={<RelatorioEstoque />} />
          <Route path="fechamentos" element={<PlanGuard feature="fechamento"><RelatorioFechamentos /></PlanGuard>} />
          <Route path="planos" element={<PlanGuard feature="pacotes_mensais"><RelatorioPlanos /></PlanGuard>} />
          <Route path="aniversariantes" element={<RelatorioAniversariantes />} />
          <Route path="vouchers" element={<PlanGuard feature="vouchers"><RelatorioVouchers /></PlanGuard>} />
          <Route path="financeiro-geral" element={<RelatorioFinanceiro />} />
        </Route>
        <Route path="/agendamentos" element={<LojistaProtectedRoute><Agendamentos /></LojistaProtectedRoute>}>
          <Route index element={<PainelAgendamentos />} />
          <Route path="novo" element={<NovoAgendamento />} />
        </Route>
        <Route path="/vendas" element={<LojistaProtectedRoute><Vendas /></LojistaProtectedRoute>} />

        {/* Cliente Protected Routes */}
        <Route path="/cliente/dashboard" element={<ClienteProtectedRoute><DashboardCliente /></ClienteProtectedRoute>} />
        <Route path="/cliente/agendamentos" element={<ClienteProtectedRoute><MeusAgendamentos /></ClienteProtectedRoute>} />
        <Route path="/cliente/novo-agendamento" element={<ClienteProtectedRoute><NovoAgendamentoCliente /></ClienteProtectedRoute>} />
        <Route path="/cliente/meus-pacotes" element={<ClienteProtectedRoute><PlanGuard feature="pacotes_mensais"><MeuPlano /></PlanGuard></ClienteProtectedRoute>} />
        <Route path="/cliente/produtos" element={<ClienteProtectedRoute><ProdutosCliente /></ClienteProtectedRoute>} />
        <Route path="/cliente/atendimento-ia" element={<ClienteProtectedRoute><PlanGuard feature="assistente_ia"><AtendimentoIA /></PlanGuard></ClienteProtectedRoute>} />
        <Route path="/cliente/meus-vouchers" element={<ClienteProtectedRoute><PlanGuard feature="vouchers"><MeusVouchers /></PlanGuard></ClienteProtectedRoute>} />
        <Route path="/cliente/historico" element={<ClienteProtectedRoute><MeuHistorico /></ClienteProtectedRoute>} />
        <Route path="/cliente/perfil" element={<ClienteProtectedRoute><PerfilCliente /></ClienteProtectedRoute>} />

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <NotificationProvider>
          <ModalProvider>
            <AppRoutes />
          </ModalProvider>
        </NotificationProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;
