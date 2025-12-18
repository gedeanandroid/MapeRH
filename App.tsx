import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Intelligence from './components/Intelligence';
import Pricing from './components/Pricing';
import Security from './components/Security';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Login from './src/pages/Login';
import Signup from './src/pages/Signup';
import EmailConfirmation from './src/pages/EmailConfirmation';
import CompleteProfile from './src/pages/CompleteProfile';
import PlanSelection from './src/pages/PlanSelection';
import Checkout from './src/pages/Checkout';
import SubscriptionSuccess from './src/pages/SubscriptionSuccess';
import ManageSubscription from './src/pages/ManageSubscription';
import Dashboard from './src/pages/Dashboard';
import WorkspaceHome from './src/pages/WorkspaceHome';
import CompanyIdentity from './src/pages/workspace/CompanyIdentity';
import OrganizationalStructure from './src/pages/workspace/OrganizationalStructure';
import Positions from './src/pages/workspace/Positions';
import Competencies from './src/pages/workspace/Competencies';
import Employees from './src/pages/workspace/Employees';
import CompanyUsers from './src/pages/workspace/CompanyUsers';
import AuditLogs from './src/pages/AuditLogs';
import AdminLayout from './src/layouts/AdminLayout';
import GlobalUsers from './src/pages/admin/GlobalUsers';
import BannerImpersonation from './src/components/BannerImpersonation';
import LoadingScreen from './src/components/LoadingScreen';
import { useAuth } from './src/contexts/AuthProvider';
import { Navigate } from 'react-router-dom';

function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-gray900 selection:bg-secondary-main selection:text-neutral-gray900">
      <Header />
      <main>
        <Hero />
        <Features />
        <Intelligence />
        <Pricing />
        <Security />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const { userRole, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative min-h-screen">
      <BannerImpersonation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/email-confirmation" element={<EmailConfirmation />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/planos" element={<PlanSelection />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/assinatura/sucesso" element={<SubscriptionSuccess />} />
        <Route path="/assinatura" element={<ManageSubscription />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin Routes */}
        <Route path="/admin" element={userRole === 'superadmin' ? <AdminLayout /> : <Navigate to="/" />}>
          <Route index element={<div className="p-4">Dashboard Admin (Em construção)</div>} />
          <Route path="consultorias" element={<div className="p-4">Consultorias (Em construção)</div>} />
          <Route path="usuarios" element={<GlobalUsers />} />
        </Route>

        <Route path="/workspace/:empresaId" element={<WorkspaceHome />} />
        <Route path="/workspace/:empresaId/identidade" element={<CompanyIdentity />} />
        <Route path="/workspace/:empresaId/estrutura" element={<OrganizationalStructure />} />
        <Route path="/workspace/:empresaId/cargos" element={<Positions />} />
        <Route path="/workspace/:empresaId/competencias" element={<Competencies />} />
        <Route path="/workspace/:empresaId/colaboradores" element={<Employees />} />
        <Route path="/workspace/:empresaId/usuarios" element={<CompanyUsers />} />
        <Route path="/workspace/:empresaId/auditoria" element={<AuditLogs />} />
        {/* Fallback route */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </div>
  );
}

export default App;
