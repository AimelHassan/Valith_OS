import React from 'react';
import { ValithOSProvider, useValithOS } from './context/ValithOSContext';
import { Layout } from './components/Layout';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { PipelineView } from './components/PipelineView';
import { LeadsView } from './components/LeadsView';
import { DealsView } from './components/DealsView';
import { TasksView } from './components/TasksView';
import { FinanceView } from './components/FinanceView';
import { MRRView } from './components/MRRView';
import { ExpensesView } from './components/ExpensesView';
import { ProposalsView } from './components/ProposalsView';
import { AICaptureInboxView } from './components/AICaptureInboxView';
import { FounderBriefView } from './components/FounderBriefView';
import { AIAdvisorView } from './components/AIAdvisorView';
import { OffersView } from './components/OffersView';
import { SegmentsView } from './components/SegmentsView';
import { SettingsView } from './components/SettingsView';
import { CalendarView } from './components/CalendarView';
import { ClientPortalView } from './components/ClientPortalView';

const AppContent: React.FC = () => {
  const { user, activeTab, isLoading, errorMsg, leads } = useValithOS();

  // Check if client portal is requested
  const queryParams = new URLSearchParams(window.location.search);
  const portalToken = queryParams.get('portal') || queryParams.get('client');

  if (portalToken) {
    return <ClientPortalView token={portalToken} />;
  }

  if (isLoading && leads.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        {/* aurum spinner */}
        <div className="w-8 h-8 rounded-full border-2 border-border border-t-aurum animate-spin"></div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-typography-muted">
          Loading Valith OS...
        </span>
      </div>
    );
  }

  // Enforce auth login screen
  if (!user) {
    return <AuthView />;
  }

  // Active view router
  const renderActiveView = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardView />;
      case 'Pipeline':
        return <PipelineView />;
      case 'Leads':
        return <LeadsView />;
      case 'Calendar':
        return <CalendarView />;
      case 'Deals':
        return <DealsView />;
      case 'Offers':
        return <OffersView />;
      case 'Segments':
        return <SegmentsView />;
      case 'Tasks':
        return <TasksView />;
      case 'Finance':
        return <FinanceView />;
      case 'MRR':
        return <MRRView />;
      case 'Expenses':
        return <ExpensesView />;
      case 'Proposals':
        return <ProposalsView />;
      case 'AI Capture':
        return <AICaptureInboxView />;
      case 'Founder Brief':
        return <FounderBriefView />;
      case 'AI Advisor':
        return <AIAdvisorView />;
      case 'Settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <Layout>
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border-l-2 border-red-500 text-red-700 text-xs rounded-r">
          <span className="font-bold uppercase tracking-wider block text-[10px] mb-1">Database Warning</span>
          {errorMsg}
        </div>
      )}
      {renderActiveView()}
    </Layout>
  );
};

export function App() {
  return (
    <ValithOSProvider>
      <AppContent />
    </ValithOSProvider>
  );
}

export default App;
