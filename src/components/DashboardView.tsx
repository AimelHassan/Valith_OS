import React from 'react';
import { useValithOS } from '../context/ValithOSContext';
import {
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  DollarSign,
  Calendar,
  Zap,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    leads,
    deals,
    tasks,
    payments,
    expenses,
    cashAccounts,
    mrrEntries,
    setActiveTab
  } = useValithOS();

  // Exchange rates for standardizing display currency (PKR base)
  const convertToPKR = (amount: number, currency: string) => {
    if (currency === 'USD') return amount * 280;
    if (currency === 'EUR') return amount * 300;
    return amount;
  };

  // Helpers to resolve lead stages for payments and MRR entries
  const getLeadStageForPayment = (payment: any) => {
    if (payment.lead_id) {
      const lead = leads.find((l) => l.id === payment.lead_id);
      return lead ? lead.stage : null;
    }
    if (payment.organization_id) {
      const orgLeads = leads.filter((l) => l.organization_id === payment.organization_id);
      if (orgLeads.length > 0) {
        const warmLead = orgLeads.find(l => ['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].includes(l.stage));
        return warmLead ? warmLead.stage : orgLeads[0].stage;
      }
    }
    return null;
  };

  const getLeadStageForMRR = (mrr: any) => {
    if (mrr.deal_id) {
      const deal = deals.find((d) => d.id === mrr.deal_id);
      if (deal && deal.lead_id) {
        const lead = leads.find((l) => l.id === deal.lead_id);
        return lead ? lead.stage : null;
      }
    }
    if (mrr.organization_id) {
      const orgLeads = leads.filter((l) => l.organization_id === mrr.organization_id);
      if (orgLeads.length > 0) {
        const warmLead = orgLeads.find(l => ['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].includes(l.stage));
        return warmLead ? warmLead.stage : orgLeads[0].stage;
      }
    }
    return null;
  };

  const isWarmStage = (stage: string | null) => {
    if (!stage) return true; // Standalone payments not linked to any pipeline lead are allowed
    return ['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].includes(stage);
  };

  // 1. CASH BALANCE
  const cashTotal = cashAccounts.reduce((acc, c) => acc + c.current_balance, 0);

  // 2. REVENUE METRICS
  const receivedRevenue = payments
    .filter((p) => p.status === 'Received')
    .filter((p) => isWarmStage(getLeadStageForPayment(p)))
    .reduce((sum, p) => sum + convertToPKR(p.amount, p.currency), 0);

  const lockedRevenue = payments
    .filter((p) => p.status === 'Locked')
    .filter((p) => isWarmStage(getLeadStageForPayment(p)))
    .reduce((sum, p) => sum + convertToPKR(p.amount, p.currency), 0);

  const expected30Days = payments
    .filter((p) => p.status === 'Expected')
    .filter((p) => isWarmStage(getLeadStageForPayment(p)))
    .reduce((sum, p) => sum + convertToPKR(p.amount, p.currency), 0);

  // 3. MRR METRICS
  const activeMRR = mrrEntries
    .filter((m) => m.status === 'Active')
    .filter((m) => isWarmStage(getLeadStageForMRR(m)))
    .reduce((sum, m) => sum + convertToPKR(m.monthly_amount, m.currency), 0);

  const expectedMRR = mrrEntries
    .filter((m) => m.status === 'Expected')
    .filter((m) => isWarmStage(getLeadStageForMRR(m)))
    .reduce((sum, m) => sum + convertToPKR(m.monthly_amount, m.currency), 0);

  // 4. EXPENSES, BURN & RUNWAY
  const monthlyExpenses = expenses
    .filter((e) => e.billing_type === 'Monthly' && e.payment_status !== 'Cancelled')
    .reduce((sum, e) => sum + convertToPKR(e.amount, e.currency), 0);

  const netBurn = Math.max(0, monthlyExpenses - activeMRR);
  const runway = netBurn > 0 ? (cashTotal / netBurn).toFixed(1) : 'Infinite';

  // 5. CRM COUNTS
  const activeLeads = leads.filter((l) => l.status === 'Active' || l.status === 'Waiting' || l.status === 'Follow Up');
  const meetingsScheduled = leads.filter((l) => l.stage === 'Meeting Scheduled').length;
  const proposalsSent = leads.filter((l) => l.stage === 'SOW Sent').length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const followupsDueToday = leads.filter(
    (l) => l.next_follow_up_date === todayStr && l.status !== 'Closed' && l.status !== 'Archived'
  ).length;

  const closedWonValue = leads
    .filter((l) => l.stage === 'Closed Won')
    .reduce((sum, l) => sum + l.deal_value_estimate, 0);

  // 6. PIPELINE BY STAGE (Weighted and raw value)
  const stageWeights: Record<string, number> = {
    'New': 5,
    'Connected': 10,
    'Messaged': 15,
    'Replied': 25,
    'Demo Sent': 40,
    'Meeting Scheduled': 50,
    'SOW Sent': 70,
    'Negotiation': 85,
    'Closed Won': 100,
    'Closed Lost': 0,
    'Cold': 0,
    'Archived': 0
  };

  const pipelineStages = [
    'New',
    'Connected',
    'Messaged',
    'Replied',
    'Demo Sent',
    'Meeting Scheduled',
    'SOW Sent',
    'Negotiation',
    'Closed Won'
  ];

  const pipelineByStage = pipelineStages.reduce((acc, stage) => {
    const stageLeads = leads.filter(l => l.stage === stage);
    const isValAllowed = ['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].includes(stage);
    const rawVal = isValAllowed ? stageLeads.reduce((sum, l) => sum + l.deal_value_estimate, 0) : 0;
    const weight = stageWeights[stage] || 0;
    const weightedVal = isValAllowed ? stageLeads.reduce((sum, l) => sum + (l.deal_value_estimate * weight) / 100, 0) : 0;
    
    acc[stage] = { count: stageLeads.length, raw: rawVal, weighted: weightedVal };
    return acc;
  }, {} as Record<string, { count: number; raw: number; weighted: number }>);

  // Lists
  const hotLeads = leads.filter(l => l.priority === 'High' && l.status !== 'Closed' && l.status !== 'Archived');
  const waitingLeads = leads.filter(l => l.status === 'Waiting');
  const todaysTasks = tasks.filter(t => t.status === 'Open' && t.due_date === todayStr);

  const upcomingPayments = payments
    .filter(p => p.status !== 'Received' && p.status !== 'Cancelled')
    .filter(p => isWarmStage(getLeadStageForPayment(p)))
    .slice(0, 5);

  const upcomingExpenses = expenses
    .filter(e => e.payment_status !== 'Paid' && e.payment_status !== 'Cancelled')
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Founder Command Dashboard</h1>
          <p className="text-xs text-typography-muted">Real-time internal diagnostics & focus center</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-aurum bg-aurum-glow px-2.5 py-1 rounded">
            SYS CURRENT TIME: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* METRIC CARD GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Cash Card */}
        <div className="card-premium flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Cash in Bank</span>
            <DollarSign size={14} className="text-aurum" />
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold text-typography">
              {cashTotal.toLocaleString()} <span className="text-xs font-normal">PKR</span>
            </span>
            <span className="block text-[9px] text-typography-light mt-1">Across all operating wallets</span>
          </div>
        </div>

        {/* Locked Revenue */}
        <div className="card-premium flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Locked Revenue</span>
            <CheckCircle2 size={14} className="text-aurum" />
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold text-typography">
              {lockedRevenue.toLocaleString()} <span className="text-xs font-normal">PKR</span>
            </span>
            <span className="block text-[9px] text-typography-light mt-1">SOW signed, pending clearance</span>
          </div>
        </div>

        {/* Expected Revenue */}
        <div className="card-premium flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Expected 30-Day</span>
            <Clock size={14} className="text-aurum" />
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold text-typography">
              {expected30Days.toLocaleString()} <span className="text-xs font-normal">PKR</span>
            </span>
            <span className="block text-[9px] text-typography-light mt-1">Pipeline deals closing soon</span>
          </div>
        </div>

        {/* Received Revenue */}
        <div className="card-premium flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Received Revenue</span>
            <TrendingUp size={14} className="text-aurum" />
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold text-typography">
              {receivedRevenue.toLocaleString()} <span className="text-xs font-normal">PKR</span>
            </span>
            <span className="block text-[9px] text-typography-light mt-1">Total revenue collected</span>
          </div>
        </div>

        {/* Active MRR */}
        <div className="card-premium flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Active MRR</span>
            <Zap size={14} className="text-aurum" />
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold text-typography">
              {activeMRR.toLocaleString()} <span className="text-xs font-normal">PKR</span>
            </span>
            <span className="block text-[9px] text-typography-light mt-1">Expected: {expectedMRR.toLocaleString()} PKR</span>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="card-premium flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Fixed Expenses</span>
            <TrendingDown size={14} className="text-red-500" />
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold text-typography">
              {monthlyExpenses.toLocaleString()} <span className="text-xs font-normal">PKR</span>
            </span>
            <span className="block text-[9px] text-typography-light mt-1">Monthly software/infra burn</span>
          </div>
        </div>

        {/* Net Monthly Burn */}
        <div className="card-premium flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Net Monthly Burn</span>
            <AlertCircle size={14} className="text-red-400" />
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold text-typography">
              {netBurn.toLocaleString()} <span className="text-xs font-normal">PKR</span>
            </span>
            <span className="block text-[9px] text-typography-light mt-1">Shortfall not covered by MRR</span>
          </div>
        </div>

        {/* Runway */}
        <div className="card-premium flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Safe Runway</span>
            <Calendar size={14} className="text-aurum" />
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold text-typography">
              {runway} <span className="text-xs font-normal">{runway === 'Infinite' ? '' : 'Months'}</span>
            </span>
            <span className="block text-[9px] text-typography-light mt-1">Based on current bank balance</span>
          </div>
        </div>
      </div>

      {/* PIPELINE OVERVIEW & CRM METRICS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sales Pipeline Metrics */}
        <div className="card-premium col-span-1 md:col-span-2">
          <h3 className="text-xs font-bold tracking-wider uppercase text-typography mb-4">Pipeline stage distribution</h3>
          <div className="space-y-3.5">
            {pipelineStages.map((stage) => {
              const data = pipelineByStage[stage] || { count: 0, raw: 0, weighted: 0 };
              const maxRaw = Math.max(...Object.values(pipelineByStage).map((d) => d.raw), 1);
              const percentage = (data.raw / maxRaw) * 100;
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-typography">{stage} ({data.count})</span>
                    <div className="text-right">
                      <span className="font-bold text-typography">{data.raw.toLocaleString()} PKR</span>
                      <span className="text-[10px] text-typography-light ml-2">Weighted: {Math.round(data.weighted).toLocaleString()} PKR</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-background-soft rounded-full overflow-hidden">
                    <div
                      className="h-full gold-gradient rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead/Action Stats */}
        <div className="card-premium flex flex-col justify-between">
          <h3 className="text-xs font-bold tracking-wider uppercase text-typography mb-4">CRM Activity Stats</h3>
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-xs text-typography-muted">Active Leads</span>
              <span className="text-sm font-bold text-typography">{activeLeads.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-xs text-typography-muted">Meetings Scheduled</span>
              <span className="text-sm font-bold text-typography">{meetingsScheduled}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-xs text-typography-muted">SOWs Sent</span>
              <span className="text-sm font-bold text-typography">{proposalsSent}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-xs text-typography-muted">Follow-ups Today</span>
              <span className="text-sm font-bold text-aurum">{followupsDueToday}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-typography-muted">Closed Won Total</span>
              <span className="text-sm font-bold text-typography">{closedWonValue.toLocaleString()} PKR</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('Pipeline')}
            className="w-full mt-4 text-center border border-border hover:border-aurum rounded py-2 text-xs font-semibold text-typography-muted hover:text-typography hover:bg-background-soft transition-all"
          >
            Manage Pipeline Board
          </button>
        </div>
      </div>

      {/* TODAY'S TARGETS AND ALERTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hot Leads (Priority High) */}
        <div className="card-premium">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold tracking-wider uppercase text-typography">Hot Deals & Leads</h3>
            <span className="text-[9px] font-bold text-aurum bg-aurum-glow px-2 py-0.5 rounded uppercase">High Priority</span>
          </div>
          {hotLeads.length === 0 ? (
            <p className="text-xs text-typography-light text-center py-8">No high priority leads active.</p>
          ) : (
            <div className="space-y-3">
              {hotLeads.map((l) => (
                <div key={l.id} className="p-3 bg-background-soft rounded border-l-2 border-aurum space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-typography leading-tight">{l.lead_name}</span>
                    <span className="text-[10px] font-bold text-typography-muted">
                      {['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].includes(l.stage)
                        ? `${l.deal_value_estimate.toLocaleString()} PKR`
                        : '—'}
                    </span>
                  </div>
                  <p className="text-[10px] text-typography-muted">Stage: {l.stage} | Next action: {l.next_action || 'None'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Waiting on Client */}
        <div className="card-premium">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold tracking-wider uppercase text-typography">Waiting on Reply</h3>
            <span className="text-[9px] font-bold text-typography-muted bg-background-soft px-2 py-0.5 rounded uppercase">Client Turn</span>
          </div>
          {waitingLeads.length === 0 ? (
            <p className="text-xs text-typography-light text-center py-8">No leads flagged as waiting.</p>
          ) : (
            <div className="space-y-3">
              {waitingLeads.map((l) => (
                <div key={l.id} className="p-3 bg-background-soft rounded border-l-2 border-border space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-typography leading-tight">{l.lead_name}</span>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-typography-light">{l.stage}</span>
                  </div>
                  <p className="text-[10px] text-typography-muted">Pending action: {l.next_action || 'None'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Tasks */}
        <div className="card-premium">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold tracking-wider uppercase text-typography">Today's Tasks</h3>
            <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded uppercase">Focus Items</span>
          </div>
          {todaysTasks.length === 0 ? (
            <p className="text-xs text-typography-light text-center py-8">No tasks scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {todaysTasks.map((t) => (
                <div key={t.id} className="p-3 bg-background-soft rounded border-l-2 border-red-400 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-typography">{t.title}</span>
                    <span className="block text-[9px] text-typography-light uppercase tracking-wider">{t.task_type} | {t.due_time || 'All Day'}</span>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${t.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-background text-typography-muted'}`}>
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FINANCE FORECAST: BILLS AND PAYMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incoming Payments */}
        <div className="card-premium">
          <h3 className="text-xs font-bold tracking-wider uppercase text-typography mb-4">Upcoming Expected Payments</h3>
          {upcomingPayments.length === 0 ? (
            <p className="text-xs text-typography-light text-center py-6">No pending invoices or receivables.</p>
          ) : (
            <div className="divide-y divide-border">
              {upcomingPayments.map((p) => (
                <div key={p.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-typography">{p.client_name}</span>
                    <span className="block text-[10px] text-typography-light">{p.revenue_type} | Due: {p.due_date || 'N/A'}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-typography">{p.amount.toLocaleString()} {p.currency}</span>
                    <span className={`block text-[9px] uppercase font-bold tracking-wider mt-0.5 ${p.status === 'Locked' ? 'text-aurum' : 'text-typography-light'}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses Due */}
        <div className="card-premium">
          <h3 className="text-xs font-bold tracking-wider uppercase text-typography mb-4">Upcoming software & operations bills</h3>
          {upcomingExpenses.length === 0 ? (
            <p className="text-xs text-typography-light text-center py-6">No unpaid expenses or tools upcoming.</p>
          ) : (
            <div className="divide-y divide-border">
              {upcomingExpenses.map((e) => (
                <div key={e.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-typography">{e.expense_name}</span>
                    <span className="block text-[10px] text-typography-light">Vendor: {e.vendor || 'N/A'} | Due: {e.due_date || 'N/A'}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-typography">{e.amount.toLocaleString()} {e.currency}</span>
                    <span className="block text-[9px] uppercase font-bold text-red-500 tracking-wider mt-0.5">
                      {e.payment_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
