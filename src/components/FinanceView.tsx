import React, { useState } from 'react';
import { useValithOS } from '../context/ValithOSContext';
import { CashAccount, RevenuePayment } from '../types/database.types';
import {
  DollarSign,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Plus,
  X,
  FileSpreadsheet,
  Edit2,
  Trash2,
  CheckCircle,
  ArrowDownToLine
} from 'lucide-react';

export const FinanceView: React.FC = () => {
  const {
    payments,
    cashAccounts,
    organizations,
    leads,
    savePayment,
    deletePayment,
    saveCashAccount,
    deleteCashAccount,
    refreshAll
  } = useValithOS();

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

  const isWarmStage = (stage: string | null) => {
    if (!stage) return true; // Standalone payments not linked to any pipeline lead are allowed
    return ['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].includes(stage);
  };

  // Modals
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RevenuePayment | null>(null);

  // Payment Form States
  const [clientName, setClientName] = useState('');
  const [orgId, setOrgId] = useState('');
  const [revType, setRevType] = useState<any>('Project');
  const [amount, setAmount] = useState('150000');
  const [currency, setCurrency] = useState<'PKR' | 'USD' | 'EUR' | 'Other'>('PKR');
  const [status, setStatus] = useState<any>('Expected');
  const [invoiceSentDate, setInvoiceSentDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [receivedDate, setReceivedDate] = useState('');
  const [payMethod, setPayMethod] = useState('');
  const [notes, setNotes] = useState('');

  // Account Form States
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<any>('Bank');
  const [accBalance, setAccBalance] = useState('500000');
  const [accCurrency, setAccCurrency] = useState('PKR');

  // Inline Cash Balance Editor
  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [tempBalance, setTempBalance] = useState('');

  const convertToPKR = (val: number, curr: string) => {
    if (curr === 'USD') return val * 280;
    if (curr === 'EUR') return val * 300;
    return val;
  };

  // Metrics
  const cashTotal = cashAccounts.reduce((sum, c) => sum + c.current_balance, 0);
  const receivedTotal = payments
    .filter(p => p.status === 'Received')
    .filter(p => isWarmStage(getLeadStageForPayment(p)))
    .reduce((sum, p) => sum + convertToPKR(p.amount, p.currency), 0);
  const lockedTotal = payments
    .filter(p => p.status === 'Locked')
    .filter(p => isWarmStage(getLeadStageForPayment(p)))
    .reduce((sum, p) => sum + convertToPKR(p.amount, p.currency), 0);
  const expectedTotal = payments
    .filter(p => p.status === 'Expected')
    .filter(p => isWarmStage(getLeadStageForPayment(p)))
    .reduce((sum, p) => sum + convertToPKR(p.amount, p.currency), 0);

  // Submit Payment
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !orgId) return;

    await savePayment({
      id: editingPayment?.id || undefined,
      organization_id: orgId,
      client_name: clientName,
      revenue_type: revType,
      amount: Number(amount),
      currency,
      status,
      invoice_sent_date: invoiceSentDate || undefined,
      due_date: dueDate || undefined,
      received_date: receivedDate || undefined,
      payment_method: payMethod || undefined,
      notes
    });

    setClientName('');
    setOrgId('');
    setAmount('150000');
    setShowAddPayment(false);
    setEditingPayment(null);
    refreshAll();
  };

  // Submit Account
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) return;

    await saveCashAccount({
      account_name: accName,
      account_type: accType,
      currency: accCurrency,
      current_balance: Number(accBalance)
    });

    setAccName('');
    setAccBalance('500000');
    setShowAddAccount(false);
    refreshAll();
  };

  // Edit Account Balance Inline
  const startEditingAccount = (acc: CashAccount) => {
    setEditingAccId(acc.id);
    setTempBalance(acc.current_balance.toString());
  };

  const saveAccountBalance = async (acc: CashAccount) => {
    await saveCashAccount({
      ...acc,
      current_balance: Number(tempBalance)
    });
    setEditingAccId(null);
    refreshAll();
  };

  const handleEditPayment = (p: RevenuePayment) => {
    setEditingPayment(p);
    setClientName(p.client_name);
    setOrgId(p.organization_id);
    setRevType(p.revenue_type);
    setAmount(p.amount.toString());
    setCurrency(p.currency);
    setStatus(p.status);
    setInvoiceSentDate(p.invoice_sent_date || '');
    setDueDate(p.due_date || '');
    setReceivedDate(p.received_date || '');
    setPayMethod(p.payment_method || '');
    setNotes(p.notes || '');
    setShowAddPayment(true);
  };

  const handleDeletePayment = async (id: string) => {
    if (confirm('Delete this transaction permanently?')) {
      await deletePayment(id);
      refreshAll();
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    let csv = 'Client Name,Type,Amount,Currency,Status,Invoice Sent,Due Date,Received Date,Method,Notes\n';
    payments
      .filter(p => isWarmStage(getLeadStageForPayment(p)))
      .forEach((p) => {
      csv += `"${p.client_name.replace(/"/g, '""')}",${p.revenue_type},${p.amount},${p.currency},${p.status},${p.invoice_sent_date || ''},${p.due_date || ''},${p.received_date || ''},"${p.payment_method || ''}","${(p.notes || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'valith_revenue_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Cash & Revenue Ledger</h1>
          <p className="text-xs text-typography-muted">Manage bank balances, cash reserves, and project milestone bills</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 border border-border bg-background-card hover:bg-background-soft px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider"
          >
            <ArrowDownToLine size={13} className="text-aurum" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingPayment(null);
              setShowAddPayment(true);
            }}
            className="flex items-center space-x-2 bg-typography hover:bg-typography/90 text-white px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider"
          >
            <Plus size={14} className="text-aurum" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* METRIC SUMMARIES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-premium">
          <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Cash In Banks</span>
          <span className="block text-lg font-bold text-typography mt-1">
            {cashTotal.toLocaleString()} <span className="text-xs font-normal">PKR</span>
          </span>
        </div>
        <div className="card-premium">
          <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Locked Revenue</span>
          <span className="block text-lg font-bold text-typography mt-1">
            {lockedTotal.toLocaleString()} <span className="text-xs font-normal">PKR</span>
          </span>
        </div>
        <div className="card-premium">
          <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Expected (30 Days)</span>
          <span className="block text-lg font-bold text-aurum mt-1">
            {expectedTotal.toLocaleString()} <span className="text-xs font-normal text-typography">PKR</span>
          </span>
        </div>
        <div className="card-premium">
          <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Received Total</span>
          <span className="block text-lg font-bold text-typography mt-1">
            {receivedTotal.toLocaleString()} <span className="text-xs font-normal">PKR</span>
          </span>
        </div>
      </div>

      {/* MID PANEL: CASH ACCOUNTS & PAYMENTS TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CASH ACCOUNTS */}
        <div className="card-premium h-fit">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold tracking-wider uppercase text-typography">Operating Accounts</h3>
            <button
              onClick={() => setShowAddAccount(true)}
              className="text-[10px] font-bold uppercase text-aurum hover:underline"
            >
              Add Account
            </button>
          </div>
          <div className="space-y-4">
            {cashAccounts.map((acc) => (
              <div key={acc.id} className="flex justify-between items-center py-2.5 border-b border-border/80 text-xs">
                <div>
                  <span className="font-bold text-typography block">{acc.account_name}</span>
                  <span className="text-[10px] text-typography-light block uppercase">{acc.account_type}</span>
                </div>
                <div className="text-right">
                  {editingAccId === acc.id ? (
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="number"
                        value={tempBalance}
                        onChange={(e) => setTempBalance(e.target.value)}
                        className="w-24 text-right py-0.5 px-1 bg-background-soft border border-border"
                      />
                      <button
                        onClick={() => saveAccountBalance(acc)}
                        className="text-[10px] font-bold text-aurum hover:underline"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-typography">
                        {acc.current_balance.toLocaleString()} {acc.currency}
                      </span>
                      <button
                        onClick={() => startEditingAccount(acc)}
                        className="text-[10px] text-typography-light hover:text-aurum"
                      >
                        <Edit2 size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REVENUE PAYMENTS LEDGER */}
        <div className="lg:col-span-2 card-premium">
          <h3 className="text-xs font-bold tracking-wider uppercase text-typography mb-4">Revenue Ledger</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border font-bold uppercase text-[9px] text-typography-muted">
                  <th className="py-2 pb-3">Client</th>
                  <th className="py-2 pb-3">Type</th>
                  <th className="py-2 pb-3 text-right">Amount</th>
                  <th className="py-2 pb-3 text-center">Status</th>
                  <th className="py-2 pb-3">Due Date</th>
                  <th className="py-2 pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.filter(p => isWarmStage(getLeadStageForPayment(p))).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-typography-light">
                      No payment records in ledger.
                    </td>
                  </tr>
                ) : (
                  payments
                    .filter(p => isWarmStage(getLeadStageForPayment(p)))
                    .map((pay) => (
                    <tr key={pay.id} className="hover:bg-background-soft transition-all">
                      <td className="py-3 font-bold text-typography">
                        <div>
                          <span>{pay.client_name}</span>
                          {pay.notes && <span className="block text-[9px] text-typography-light font-normal mt-0.5 truncate max-w-[150px]">{pay.notes}</span>}
                        </div>
                      </td>
                      <td className="py-3 text-typography-muted">{pay.revenue_type}</td>
                      <td className="py-3 text-right font-bold text-typography">
                        {pay.amount.toLocaleString()} {pay.currency}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                          pay.status === 'Received'
                            ? 'bg-aurum-glow text-aurum-dark'
                            : pay.status === 'Locked'
                            ? 'bg-typography text-white'
                            : 'bg-background-soft text-typography-muted'
                        }`}>
                          {pay.status}
                        </span>
                      </td>
                      <td className="py-3 text-typography-light">{pay.due_date || '-'}</td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => handleEditPayment(pay)}
                          className="text-[10px] text-aurum hover:underline font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePayment(pay.id)}
                          className="text-[10px] text-red-500 hover:underline font-bold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {showAddPayment && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background-card border border-border rounded-lg max-w-md w-full shadow-premium p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAddPayment(false);
                setEditingPayment(null);
              }}
              className="absolute top-4 right-4 text-typography-light hover:text-typography"
            >
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-typography">
              {editingPayment ? 'Edit Payment Milestone' : 'Record Revenue Milestone'}
            </h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. Optimize Digital"
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
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Revenue Type</label>
                  <select
                    value={revType}
                    onChange={(e) => setRevType(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="Project">Project setup fee</option>
                    <option value="Retainer">Retainer</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Subscription">Subscription</option>
                    <option value="Partnership">Partnership</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Amount</label>
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
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Payment Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs"
                >
                  <option value="Expected">Expected (in pipeline)</option>
                  <option value="Locked">Locked (SOW signed, pending clear)</option>
                  <option value="Invoiced">Invoiced (Sent bill)</option>
                  <option value="Received">Received (Cash in bank)</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Invoice Sent Date</label>
                  <input
                    type="date"
                    value={invoiceSentDate}
                    onChange={(e) => setInvoiceSentDate(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Received Date</label>
                  <input
                    type="date"
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Payment Method</label>
                  <input
                    type="text"
                    placeholder="e.g. Bank Transfer, Stripe"
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Private billing details..."
                  className="w-full text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-typography text-white py-2 rounded text-xs font-semibold uppercase tracking-wider hover:bg-typography/90 transition-all"
              >
                Record Receivable
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD ACCOUNT MODAL */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background-card border border-border rounded-lg max-w-md w-full shadow-premium p-6 relative">
            <button onClick={() => setShowAddAccount(false)} className="absolute top-4 right-4 text-typography-light hover:text-typography">
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-typography">Add Cash Wallet Account</h2>
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Account Name</label>
                <input
                  type="text"
                  placeholder="e.g. Meezan Operating Bank"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Account Type</label>
                  <select
                    value={accType}
                    onChange={(e) => setAccType(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="Bank">Bank Account</option>
                    <option value="Cash">Cash Reserve</option>
                    <option value="Wallet">Digital Wallet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Currency</label>
                  <select
                    value={accCurrency}
                    onChange={(e) => setAccCurrency(e.target.value)}
                    className="w-full text-xs"
                  >
                    <option value="PKR">PKR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Initial Balance</label>
                <input
                  type="number"
                  value={accBalance}
                  onChange={(e) => setAccBalance(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-typography text-white py-2 rounded text-xs font-semibold uppercase tracking-wider hover:bg-typography/90 transition-all"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
