import React, { useState } from 'react';
import { useValithOS } from '../context/ValithOSContext';
import { Expense } from '../types/database.types';
import {
  Plus,
  X,
  Trash2,
  AlertTriangle,
  CreditCard,
  Calendar,
  Receipt
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const {
    expenses,
    saveExpense,
    deleteExpense,
    refreshAll
  } = useValithOS();

  const [showAddModal, setShowAddModal] = useState(false);

  // Form States
  const [expenseName, setExpenseName] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState<any>('Software');
  const [amount, setAmount] = useState('20');
  const [currency, setCurrency] = useState<'PKR' | 'USD' | 'EUR' | 'Other'>('USD');
  const [billingType, setBillingType] = useState<any>('Monthly');
  const [paymentStatus, setPaymentStatus] = useState<any>('Upcoming');
  const [dueDate, setDueDate] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [notes, setNotes] = useState('');

  const convertToPKR = (val: number, curr: string) => {
    if (curr === 'USD') return val * 280;
    if (curr === 'EUR') return val * 300;
    return val;
  };

  // Calculations
  const monthlyExpenses = expenses.filter(e => e.billing_type === 'Monthly' && e.payment_status !== 'Cancelled');
  const totalMonthlyPKR = monthlyExpenses.reduce((sum, e) => sum + convertToPKR(e.amount, e.currency), 0);

  // Category breakdown
  const categoryTotals = expenses.reduce((acc, e) => {
    const pkrAmount = convertToPKR(e.amount, e.currency);
    acc[e.category] = (acc[e.category] || 0) + pkrAmount;
    return acc;
  }, {} as Record<string, number>);

  const maxCategoryVal = Math.max(...Object.values(categoryTotals), 1);

  // Submit Expense
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseName.trim()) return;

    await saveExpense({
      expense_name: expenseName,
      vendor: vendor || undefined,
      category,
      amount: Number(amount),
      currency,
      billing_type: billingType,
      payment_status: paymentStatus,
      due_date: dueDate || undefined,
      paid_date: paidDate || undefined,
      notes
    });

    setExpenseName('');
    setVendor('');
    setAmount('20');
    setNotes('');
    setShowAddModal(false);
    refreshAll();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this expense record?')) {
      await deleteExpense(id);
      refreshAll();
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Operational Outflows</h1>
          <p className="text-xs text-typography-muted">Track software tool licenses, hosting node costs, and transit bills</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-typography hover:bg-typography/90 text-white px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider"
        >
          <Plus size={14} className="text-aurum" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* METRIC SUMMARIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outflow Metric */}
        <div className="card-premium h-fit">
          <span className="text-[10px] font-bold text-typography-muted tracking-wider uppercase">Monthly Fixed Outflow</span>
          <span className="block text-2xl font-bold text-red-500 mt-2">
            {totalMonthlyPKR.toLocaleString()} <span className="text-xs font-normal text-typography">PKR/mo</span>
          </span>
          <span className="block text-[9px] text-typography-light mt-1">Sum of active monthly recurring subscriptions</span>
        </div>

        {/* Category Allocation */}
        <div className="card-premium lg:col-span-2">
          <h3 className="text-xs font-bold tracking-wider uppercase text-typography mb-4">Category Outflow Allocation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(categoryTotals).map(([cat, val]) => {
              const pct = (val / maxCategoryVal) * 100;
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-typography-muted">{cat}</span>
                    <span className="font-bold text-typography">{val.toLocaleString()} PKR</span>
                  </div>
                  <div className="h-1 bg-background-soft rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* EXPENSE LEDGER */}
      <div className="bg-background-card border border-border rounded-lg overflow-hidden shadow-premium">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-background-soft border-b border-border text-[9px] uppercase tracking-wider font-bold text-typography-muted">
              <th className="py-3 px-4">Expense Name</th>
              <th className="py-3 px-4">Vendor</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Billing Cycle</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-typography-light">
                  No expense records saved.
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-background-soft transition-all">
                  <td className="py-3.5 px-4 font-bold text-typography">{exp.expense_name}</td>
                  <td className="py-3.5 px-4 text-typography-muted">{exp.vendor || '-'}</td>
                  <td className="py-3.5 px-4 text-typography-light">{exp.category}</td>
                  <td className="py-3.5 px-4 text-typography-light capitalize">{exp.billing_type}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-typography">
                    {exp.amount.toLocaleString()} {exp.currency}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                      exp.payment_status === 'Paid'
                        ? 'bg-aurum-glow text-aurum-dark'
                        : exp.payment_status === 'Upcoming'
                        ? 'bg-background-soft text-typography-muted'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {exp.payment_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-typography-light">{exp.due_date || 'N/A'}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="text-typography-light hover:text-red-500 transition-all font-bold"
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

      {/* RECORD EXPENSE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background-card border border-border rounded-lg max-w-md w-full shadow-premium p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-typography-light hover:text-typography">
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-typography">Record Operating Bill</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Expense Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Supabase Hosting plan"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Vendor</label>
                  <input
                    type="text"
                    placeholder="e.g. Supabase Inc."
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="Software">Software</option>
                    <option value="Hosting">Hosting</option>
                    <option value="Domain">Domain</option>
                    <option value="Tools">Tools</option>
                    <option value="Ads">Ads</option>
                    <option value="Transport">Transport</option>
                    <option value="Coworking">Coworking</option>
                    <option value="Contractors">Contractors</option>
                    <option value="Food/Meeting">Food & Meetings</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Outflow Amount</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Billing Type</label>
                  <select
                    value={billingType}
                    onChange={(e) => setBillingType(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="One-time">One-time</option>
                    <option value="Monthly">Monthly Recurring</option>
                    <option value="Yearly">Yearly Recurring</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="Upcoming">Upcoming (Due)</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Paid Date</label>
                  <input
                    type="date"
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
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
                  placeholder="Private details on subscription accounts..."
                  className="w-full text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-typography text-white py-2 rounded text-xs font-semibold uppercase tracking-wider hover:bg-typography/90 transition-all"
              >
                Record Operating Bill
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
