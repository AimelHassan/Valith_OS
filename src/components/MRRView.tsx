import React, { useState } from 'react';
import { useValithOS } from '../context/ValithOSContext';
import { MRREntry } from '../types/database.types';
import {
  TrendingUp,
  Zap,
  Plus,
  X,
  Trash2,
  Calendar
} from 'lucide-react';

export const MRRView: React.FC = () => {
  const {
    mrrEntries,
    organizations,
    deals,
    leads,
    saveMRREntry,
    deleteMRREntry,
    refreshAll
  } = useValithOS();

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
    if (!stage) return true; // Standalone retainers not linked to any pipeline lead are allowed
    return ['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].includes(stage);
  };

  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form States
  const [clientName, setClientName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [orgId, setOrgId] = useState('');
  const [dealId, setDealId] = useState('');
  const [amount, setAmount] = useState('45000');
  const [currency, setCurrency] = useState<'PKR' | 'USD' | 'EUR' | 'Other'>('PKR');
  const [status, setStatus] = useState<any>('Expected');
  const [startDate, setStartDate] = useState('');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [notes, setNotes] = useState('');

  // Math
  const activeTotal = mrrEntries
    .filter(m => m.status === 'Active' && isWarmStage(getLeadStageForMRR(m)))
    .reduce((sum, m) => sum + m.monthly_amount, 0);
  const expectedTotal = mrrEntries
    .filter(m => m.status === 'Expected' && isWarmStage(getLeadStageForMRR(m)))
    .reduce((sum, m) => sum + m.monthly_amount, 0);

  // Submit MRR
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !orgId || !serviceName.trim()) return;

    await saveMRREntry({
      organization_id: orgId,
      deal_id: dealId || undefined,
      client_name: clientName,
      service_name: serviceName,
      monthly_amount: Number(amount),
      currency,
      status,
      start_date: startDate || undefined,
      next_billing_date: nextBillingDate || undefined,
      notes
    });

    setClientName('');
    setServiceName('');
    setOrgId('');
    setDealId('');
    setAmount('45000');
    setShowAddModal(false);
    refreshAll();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove this recurring retainer contract?')) {
      await deleteMRREntry(id);
      refreshAll();
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Monthly Recurring Revenue (MRR)</h1>
          <p className="text-xs text-typography-muted">Track monthly agency retainers and subscription services</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-typography hover:bg-typography/90 text-white px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider"
        >
          <Plus size={14} className="text-aurum" />
          <span>Add Retainer</span>
        </button>
      </div>

      {/* METRIC SUMMARIES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-premium">
          <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Active MRR</span>
          <span className="block text-lg font-bold text-typography mt-1">
            {activeTotal.toLocaleString()} <span className="text-xs font-normal">PKR</span>
          </span>
          <span className="block text-[9px] text-typography-light mt-1">Confirmed recurring retainer revenue</span>
        </div>

        <div className="card-premium">
          <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Expected MRR Pipeline</span>
          <span className="block text-lg font-bold text-aurum mt-1">
            {expectedTotal.toLocaleString()} <span className="text-xs font-normal text-typography">PKR</span>
          </span>
          <span className="block text-[9px] text-typography-light mt-1">Unclosed proposals with monthly components</span>
        </div>

        <div className="card-premium">
          <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Combined MRR Run-rate</span>
          <span className="block text-lg font-bold text-typography mt-1">
            {(activeTotal + expectedTotal).toLocaleString()} <span className="text-xs font-normal">PKR</span>
          </span>
          <span className="block text-[9px] text-typography-light mt-1">Potential monthly recurring volume</span>
        </div>
      </div>

      {/* RETAINERS DATABASE TABLE */}
      <div className="bg-background-card border border-border rounded-lg overflow-hidden shadow-premium">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-background-soft border-b border-border text-[9px] uppercase tracking-wider font-bold text-typography-muted">
              <th className="py-3 px-4">Client Name</th>
              <th className="py-3 px-4">Service Description</th>
              <th className="py-3 px-4 text-right">Monthly Amount</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4">Next Billing Date</th>
              <th className="py-3 px-4">Notes</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mrrEntries.filter(m => isWarmStage(getLeadStageForMRR(m))).length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-typography-light">
                  No monthly recurring retainers active or expected.
                </td>
              </tr>
            ) : (
              mrrEntries
                .filter(m => isWarmStage(getLeadStageForMRR(m)))
                .map((mrr) => (
                <tr key={mrr.id} className="hover:bg-background-soft transition-all">
                  <td className="py-3.5 px-4 font-bold text-typography">{mrr.client_name}</td>
                  <td className="py-3.5 px-4 text-typography-muted">{mrr.service_name}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-typography">
                    {mrr.monthly_amount.toLocaleString()} {mrr.currency}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                      mrr.status === 'Active'
                        ? 'bg-aurum-glow text-aurum-dark'
                        : mrr.status === 'Expected'
                        ? 'bg-background-soft text-typography-muted'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {mrr.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-typography-light">{mrr.next_billing_date || 'N/A'}</td>
                  <td className="py-3.5 px-4 text-typography-light truncate max-w-[200px]">{mrr.notes || '-'}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(mrr.id)}
                      className="text-typography-light hover:text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD MRR RETAINER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background-card border border-border rounded-lg max-w-md w-full shadow-premium p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-typography-light hover:text-typography">
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-typography">Create Monthly Retainer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. MARCEM"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Link Organization</label>
                  <select
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                    className="w-full text-xs"
                    required
                  >
                    <option value="">-- Choose Org --</option>
                    {organizations.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Link Deal (optional)</label>
                  <select
                    value={dealId}
                    onChange={(e) => setDealId(e.target.value)}
                    className="w-full text-xs"
                  >
                    <option value="">-- Choose Deal --</option>
                    {deals.map((d) => (
                      <option key={d.id} value={d.id}>{d.deal_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Service Description</label>
                <input
                  type="text"
                  placeholder="e.g. RFP Intelligence pipeline parser support"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Monthly Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="PKR">PKR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs"
                >
                  <option value="Expected">Expected (Negotiating)</option>
                  <option value="Active">Active (Ongoing Billing)</option>
                  <option value="Paused">Paused</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Next Billing Date</label>
                  <input
                    type="date"
                    value={nextBillingDate}
                    onChange={(e) => setNextBillingDate(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Private Billing Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Terms, overrides or specific renewal agreements..."
                  className="w-full text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-typography text-white py-2 rounded text-xs font-semibold uppercase tracking-wider hover:bg-typography/90 transition-all"
              >
                Create Retainer Agreement
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
