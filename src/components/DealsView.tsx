import React, { useState } from 'react';
import { useValithOS } from '../context/ValithOSContext';
import { Deal } from '../types/database.types';
import {
  TrendingUp,
  Percent,
  Calendar,
  CheckCircle,
  Briefcase,
  AlertTriangle,
  Plus,
  X,
  FileText
} from 'lucide-react';

export const DealsView: React.FC = () => {
  const {
    deals,
    leads,
    organizations,
    saveDeal,
    deleteDeal,
    refreshAll
  } = useValithOS();

  // Modals
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  // Form States
  const [dealName, setDealName] = useState('');
  const [leadId, setLeadId] = useState('');
  const [orgId, setOrgId] = useState('');
  const [offerType, setOfferType] = useState('RFP Intelligence');
  const [stage, setStage] = useState<'Discovery' | 'Demo' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost' | 'Paused'>('Discovery');
  const [setupFee, setSetupFee] = useState('150000');
  const [retainer, setRetainer] = useState('0');
  const [currency, setCurrency] = useState<'PKR' | 'USD' | 'EUR' | 'Other'>('PKR');
  const [probability, setProbability] = useState('50');
  const [expectedClose, setExpectedClose] = useState('');
  const [closedDate, setClosedDate] = useState('');
  const [notes, setNotes] = useState('');

  const convertToPKR = (amount: number, curr: string) => {
    if (curr === 'USD') return amount * 280;
    if (curr === 'EUR') return amount * 300;
    return amount;
  };

  // CALCULATE GENERAL DEAL METRICS
  const activeDeals = deals.filter((d) => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost');
  const closedWonDeals = deals.filter((d) => d.stage === 'Closed Won');
  
  const rawPipelinePKR = activeDeals.reduce((sum, d) => sum + convertToPKR(d.setup_fee_amount, d.currency), 0);
  const weightedPipelinePKR = activeDeals.reduce(
    (sum, d) => sum + (convertToPKR(d.setup_fee_amount, d.currency) * d.probability_percent) / 100,
    0
  );
  
  const wonTotalPKR = closedWonDeals.reduce((sum, d) => sum + convertToPKR(d.setup_fee_amount, d.currency), 0);

  // Submit Deal
  const handleDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealName.trim() || !orgId) return;

    await saveDeal({
      id: editingDeal?.id || undefined,
      lead_id: leadId || undefined,
      organization_id: orgId,
      deal_name: dealName,
      offer_type: offerType,
      stage,
      setup_fee_amount: Number(setupFee),
      retainer_amount: Number(retainer),
      currency,
      probability_percent: Number(probability),
      expected_close_date: expectedClose || undefined,
      closed_date: closedDate || undefined,
      status: 'Active',
      notes
    });

    setDealName('');
    setLeadId('');
    setOrgId('');
    setSetupFee('150000');
    setRetainer('0');
    setNotes('');
    setShowAddDeal(false);
    setEditingDeal(null);
    refreshAll();
  };

  const handleEditClick = (d: Deal) => {
    setEditingDeal(d);
    setDealName(d.deal_name);
    setLeadId(d.lead_id || '');
    setOrgId(d.organization_id);
    setOfferType(d.offer_type);
    setStage(d.stage);
    setSetupFee(d.setup_fee_amount.toString());
    setRetainer(d.retainer_amount.toString());
    setCurrency(d.currency);
    setProbability(d.probability_percent.toString());
    setExpectedClose(d.expected_close_date || '');
    setClosedDate(d.closed_date || '');
    setNotes(d.notes || '');
    setShowAddDeal(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm('Delete this opportunity permanently?')) {
      await deleteDeal(id);
      refreshAll();
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Opportunities Ledger</h1>
          <p className="text-xs text-typography-muted">Track setup margins, probabilities, and close forecasts</p>
        </div>
        <button
          onClick={() => {
            setEditingDeal(null);
            setShowAddDeal(true);
          }}
          className="flex items-center space-x-2 bg-typography hover:bg-typography/90 text-white px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider"
        >
          <Plus size={14} className="text-aurum" />
          <span>New Opportunity</span>
        </button>
      </div>

      {/* METRIC ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-premium">
          <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Raw Pipeline Total</span>
          <span className="block text-lg font-bold text-typography mt-1">
            {rawPipelinePKR.toLocaleString()} <span className="text-xs font-normal">PKR</span>
          </span>
          <span className="block text-[9px] text-typography-light mt-1">Sum setup value of active deals</span>
        </div>

        <div className="card-premium">
          <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Weighted Pipeline</span>
          <span className="block text-lg font-bold text-aurum mt-1">
            {weightedPipelinePKR.toLocaleString()} <span className="text-xs font-normal text-typography">PKR</span>
          </span>
          <span className="block text-[9px] text-typography-light mt-1">Adjusted by probability rate</span>
        </div>

        <div className="card-premium">
          <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Closed Won Total</span>
          <span className="block text-lg font-bold text-typography mt-1">
            {wonTotalPKR.toLocaleString()} <span className="text-xs font-normal">PKR</span>
          </span>
          <span className="block text-[9px] text-typography-light mt-1">Cleared setup fees collected</span>
        </div>

        <div className="card-premium">
          <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Win Rate (Volume)</span>
          <span className="block text-lg font-bold text-typography mt-1">
            {deals.length > 0 ? ((closedWonDeals.length / deals.length) * 100).toFixed(0) : 0}%
          </span>
          <span className="block text-[9px] text-typography-light mt-1">Won vs Total created deals</span>
        </div>
      </div>

      {/* DEALS LIST */}
      <div className="bg-background-card border border-border rounded-lg overflow-hidden shadow-premium">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background-soft border-b border-border text-[9px] uppercase tracking-wider font-bold text-typography-muted">
              <th className="py-3 px-4">Deal Name</th>
              <th className="py-3 px-4">Organization</th>
              <th className="py-3 px-4">Offer Type</th>
              <th className="py-3 px-4">Stage</th>
              <th className="py-3 px-4 text-right">Setup Fee</th>
              <th className="py-3 px-4 text-right">Retainer</th>
              <th className="py-3 px-4 text-center">Probability</th>
              <th className="py-3 px-4">Est. Close</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {deals.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-typography-light">
                  No opportunities listed. Create one above.
                </td>
              </tr>
            ) : (
              deals.map((deal) => {
                const org = organizations.find((o) => o.id === deal.organization_id);

                return (
                  <tr key={deal.id} className="hover:bg-background-soft transition-all">
                    <td className="py-3.5 px-4 font-bold text-typography">
                      <div>
                        <span>{deal.deal_name}</span>
                        {deal.notes && <span className="block text-[10px] text-typography-light font-normal mt-0.5 truncate max-w-[200px]">{deal.notes}</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-typography-muted">{org?.name || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-typography-light">{deal.offer_type}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        deal.stage === 'Closed Won'
                          ? 'bg-aurum-glow text-aurum-dark'
                          : deal.stage === 'Closed Lost'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-background-soft text-typography-muted'
                      }`}>
                        {deal.stage}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-typography">
                      {deal.setup_fee_amount.toLocaleString()} {deal.currency}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-typography-muted">
                      {deal.retainer_amount > 0 ? `${deal.retainer_amount.toLocaleString()} ${deal.currency}/mo` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-typography">
                      {deal.probability_percent}%
                    </td>
                    <td className="py-3.5 px-4 text-typography-light">{deal.expected_close_date || '-'}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(deal)}
                        className="text-xs font-bold text-aurum hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(deal.id)}
                        className="text-xs font-bold text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ADD/EDIT DEAL OPPORTUNITY MODAL */}
      {showAddDeal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background-card border border-border rounded-lg max-w-md w-full shadow-premium p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAddDeal(false);
                setEditingDeal(null);
              }}
              className="absolute top-4 right-4 text-typography-light hover:text-typography"
            >
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-typography">
              {editingDeal ? 'Modify Opportunity' : 'Create Opportunity'}
            </h2>
            <form onSubmit={handleDealSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Opportunity Name</label>
                <input
                  type="text"
                  placeholder="e.g. MARCEM RFP Setup"
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Linked Organization</label>
                  <select
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                    className="w-full text-xs"
                    required
                  >
                    <option value="">-- Select Org --</option>
                    {organizations.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Linked Lead (optional)</label>
                  <select
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                    className="w-full text-xs"
                  >
                    <option value="">-- Select Lead --</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>{l.lead_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Offer Type</label>
                  <select
                    value={offerType}
                    onChange={(e) => setOfferType(e.target.value)}
                    className="w-full text-xs"
                  >
                    <option value="RFP Intelligence">RFP Intelligence</option>
                    <option value="WhatsApp Workflow">WhatsApp Workflow</option>
                    <option value="AI Workflow Audit">AI Workflow Audit</option>
                    <option value="Inbox Automation">Inbox Automation</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Sales Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="Discovery">Discovery</option>
                    <option value="Demo">Demo</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Setup Fee Amount</label>
                  <input
                    type="number"
                    value={setupFee}
                    onChange={(e) => setSetupFee(e.target.value)}
                    className="w-full text-xs"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Monthly Retainer</label>
                  <input
                    type="number"
                    value={retainer}
                    onChange={(e) => setRetainer(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={probability}
                    onChange={(e) => setProbability(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Expected Close Date</label>
                  <input
                    type="date"
                    value={expectedClose}
                    onChange={(e) => setExpectedClose(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Closed Date</label>
                  <input
                    type="date"
                    value={closedDate}
                    onChange={(e) => setClosedDate(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Opportunity Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional context on project delivery..."
                  className="w-full text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-typography text-white py-2 rounded text-xs font-semibold uppercase tracking-wider hover:bg-typography/90 transition-all"
              >
                {editingDeal ? 'Update Opportunity' : 'Create Opportunity'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
