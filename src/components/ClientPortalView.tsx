import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import {
  FileText,
  ExternalLink,
  Calendar,
  Clock,
  Briefcase,
  CheckCircle2,
  Circle,
  HelpCircle,
  Mail,
  Send,
  Loader2,
  DollarSign
} from 'lucide-react';

interface ClientPortalViewProps {
  token: string;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({ token }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Feedback & Request States
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackDesc, setFeedbackDesc] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTitle.trim() || !feedbackDesc.trim()) return;

    try {
      setSubmittingFeedback(true);
      setFeedbackError(null);
      setFeedbackSuccess(null);
      
      const res = await dbService.submitClientFeedback(token, feedbackTitle, feedbackDesc);
      if (res && res.success) {
        setFeedbackSuccess('Your request has been securely submitted to the Valith Founder Office. We will review it and follow up shortly!');
        setFeedbackTitle('');
        setFeedbackDesc('');
      } else {
        setFeedbackError(res?.error || 'Failed to submit feedback. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setFeedbackError('An error occurred while sending your request. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        setLoading(true);
        const result = await dbService.getClientPortalData(token);
        if (result && result.success) {
          setData(result);
        } else {
          setError(result?.error || 'Invalid or expired client portal access token.');
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to securely authenticate and fetch client workspace details.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPortalData();
    }
  }, [token]);

  // Translate internal CRM stage names into clean, client-facing terminology
  const getClientFriendlyStage = (stage: string) => {
    switch (stage) {
      case 'New':
      case 'Connected':
      case 'Messaged':
      case 'Replied':
      case 'Demo Sent':
      case 'Meeting Scheduled':
      case 'Discovery':
      case 'Demo':
        return 'Onboarding & Discovery';
      case 'SOW Sent':
      case 'Negotiation':
      case 'Proposal':
        return 'Proposal & Agreement Review';
      case 'Closed Won':
        return 'Active Project Delivery';
      case 'Closed Lost':
        return 'Project Closed';
      case 'Paused':
        return 'Project Paused';
      default:
        return stage || 'Active Project';
    }
  };

  // Translate task status to a client-friendly tracker
  const getClientFriendlyTaskStatus = (status: string) => {
    switch (status) {
      case 'Done':
        return { label: 'Completed', color: 'text-green-600 bg-green-50 border-green-100' };
      case 'In Progress':
        return { label: 'In Progress', color: 'text-aurum-dark bg-aurum-glow/10 border-aurum/20' };
      case 'Open':
      default:
        return { label: 'Scheduled', color: 'text-typography-light bg-background-soft border-border' };
    }
  };

  // Translate invoice payments statuses
  const getClientFriendlyInvoiceStatus = (status: string) => {
    switch (status) {
      case 'Received':
        return { label: 'Paid / Receipt Issued', color: 'text-green-600 bg-green-50 border-green-100' };
      case 'Invoiced':
        return { label: 'Invoiced / Pending Payment', color: 'text-aurum-dark bg-aurum-glow/10 border-aurum/20' };
      case 'Overdue':
        return { label: 'Overdue', color: 'text-red-600 bg-red-50 border-red-100' };
      case 'Expected':
      case 'Locked':
        return { label: 'Scheduled', color: 'text-typography-light bg-background-soft border-border' };
      default:
        return { label: status, color: 'text-typography-light bg-background-soft border-border' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <Loader2 className="w-8 h-8 text-aurum animate-spin" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-typography-muted">
          Establishing Secure Portal Connection...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="max-w-md bg-background-card border border-border rounded-lg p-8 shadow-premium space-y-4">
          <HelpCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-sm font-bold uppercase tracking-wider text-typography">Secure Portal Access Restricted</h1>
          <p className="text-xs text-typography-muted">
            {error || 'The portal link you are trying to access is invalid or has expired.'}
          </p>
          <div className="pt-2">
            <a
              href="mailto:support@valith.tech"
              className="inline-flex items-center space-x-1.5 border border-border bg-background-soft hover:bg-border px-4 py-2 rounded text-xs font-bold uppercase tracking-wider text-typography"
            >
              <Mail size={12} />
              <span>Contact Valith Support</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const { organization, contacts, leads, deals, tasks, payments, mrr_entries, documents } = data;

  // Render Client Portal Dashboard
  return (
    <div className="min-h-screen bg-background text-typography p-4 md:p-8 selection:bg-aurum-glow">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* BRAND & HEADER BANNER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-6 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold tracking-widest text-aurum uppercase">Valith AI Solutions</span>
              <span className="h-4 w-px bg-border"></span>
              <span className="text-xs font-bold uppercase text-typography-light tracking-wide">Client Workspace</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-2 text-typography">
              {organization.name} Partner Portal
            </h1>
            <p className="text-xs text-typography-muted mt-1">
              Real-time workspace showing scope checkpoints, invoice records, and shared deliverables.
            </p>
          </div>
          
          {/* Quick contact card */}
          <div className="flex items-center space-x-3 bg-background-card border border-border p-3 rounded-lg shadow-sm">
            <div className="text-right">
              <span className="block text-[8px] uppercase tracking-wider text-typography-light font-bold">Valith Solutions Account Manager</span>
              <span className="text-xs font-bold text-typography block">Founder Office</span>
            </div>
            <div className="flex space-x-1">
              <a
                href="mailto:founder@valith.tech"
                className="p-2 border border-border rounded hover:bg-background-soft text-typography hover:text-aurum transition-colors"
                title="Email Account Manager"
              >
                <Mail size={13} />
              </a>
              <a
                href="https://wa.me/923000000000" // Placeholder phone or generic WhatsApp
                target="_blank"
                rel="noreferrer"
                className="p-2 border border-border rounded hover:bg-background-soft text-typography hover:text-aurum transition-colors"
                title="WhatsApp Account Manager"
              >
                <Send size={13} />
              </a>
            </div>
          </div>
        </div>

        {/* ACTIVE PROJECT STATUS METADATA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-background-card border border-border rounded-lg p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-xs font-bold tracking-wider uppercase text-typography border-b border-border/50 pb-2 flex items-center space-x-2">
                <Briefcase size={13} className="text-aurum" />
                <span>Active Service Agreements & Projects</span>
              </h2>
            </div>

            {leads.length === 0 && deals.length === 0 ? (
              <p className="text-xs text-typography-light italic text-center py-6">
                No active projects or agreements scheduled currently.
              </p>
            ) : (
              <div className="space-y-4">
                {[...leads, ...deals].map((project: any, i: number) => {
                  const isDeal = project.setup_fee_amount !== undefined;
                  const name = isDeal ? project.deal_name : project.lead_name;
                  const type = isDeal ? project.offer_type : project.offer_angle;
                  
                  return (
                    <div key={i} className="p-4 bg-background-soft border border-border/60 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-typography-light font-bold">
                          {isDeal ? 'Service Agreement' : 'Active Engagement'}
                        </span>
                        <h3 className="text-sm font-bold text-typography mt-0.5">{name}</h3>
                        <p className="text-[10px] text-typography-muted mt-0.5">
                          Offer System: {type}
                        </p>
                      </div>
                      <div className="flex flex-col md:items-end text-xs">
                        <span className="block text-[8px] uppercase tracking-wider text-typography-light font-bold">Project Status</span>
                        <span className="mt-1 font-bold text-aurum uppercase text-[10px] tracking-wider bg-aurum-glow/10 border border-aurum/20 px-2 py-0.5 rounded">
                          {getClientFriendlyStage(project.stage)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RETAINER SERVICES (MRR) CARD */}
          <div className="bg-background-card border border-border rounded-lg p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-xs font-bold tracking-wider uppercase text-typography border-b border-border/50 pb-2">
                Monthly Retainer Subscriptions
              </h2>
              {mrr_entries.length === 0 ? (
                <p className="text-xs text-typography-light italic text-center py-8">
                  No active recurring retainer subscriptions.
                </p>
              ) : (
                <div className="divide-y divide-border/60">
                  {mrr_entries.map((entry: any) => (
                    <div key={entry.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs text-typography">{entry.service_name}</span>
                        <span className="text-xs font-bold text-aurum">
                          {entry.monthly_amount.toLocaleString()} {entry.currency}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-typography-light mt-1">
                        <span>Status: <span className="font-semibold capitalize text-typography-muted">{entry.status}</span></span>
                        {entry.next_billing_date && (
                          <span>Next Invoice: {new Date(entry.next_billing_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {mrr_entries.length > 0 && (
              <div className="pt-4 border-t border-border mt-4 text-[9px] text-typography-light uppercase tracking-wider">
                Note: Invoices are dispatched automatically on renewal dates.
              </div>
            )}
          </div>
        </div>

        {/* WORKSPACE MILESTONES & DOCUMENT SHARE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* TASK CHECKS (DELIVERABLES) */}
          <div className="bg-background-card border border-border rounded-lg p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold tracking-wider uppercase text-typography border-b border-border/50 pb-2 flex items-center justify-between">
              <span>Project Milestones & Deliverables</span>
              <span className="text-[10px] text-typography-light font-bold">
                {tasks.filter((t: any) => t.status === 'Done').length}/{tasks.length} Completed
              </span>
            </h2>

            {tasks.length === 0 ? (
              <p className="text-xs text-typography-light italic text-center py-8">
                No milestones scheduled at this stage.
              </p>
            ) : (
              <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                {tasks.map((task: any) => {
                  const isDone = task.status === 'Done';
                  const badge = getClientFriendlyTaskStatus(task.status);
                  
                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border transition-all flex items-start space-x-3 ${
                        isDone ? 'border-border/40 bg-background-soft/50' : 'border-border bg-background-soft'
                      }`}
                    >
                      <div className="mt-0.5 text-typography-light shrink-0">
                        {isDone ? (
                          <CheckCircle2 size={15} className="text-green-600" />
                        ) : (
                          <Circle size={15} className="text-typography-light" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className={`text-xs font-bold leading-tight ${isDone ? 'text-typography-muted line-through' : 'text-typography'}`}>
                            {task.title}
                          </h4>
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-[10px] text-typography-light mt-1 leading-snug">
                            {task.description}
                          </p>
                        )}
                        {task.due_date && (
                          <div className="flex items-center space-x-1 mt-2 text-[9px] text-typography-light">
                            <Calendar size={10} />
                            <span>Target Date: {new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AGREEMENTS & DOCUMENTS */}
          <div className="bg-background-card border border-border rounded-lg p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold tracking-wider uppercase text-typography border-b border-border/50 pb-2">
              Shared Files & Agreements
            </h2>

            {documents.length === 0 ? (
              <p className="text-xs text-typography-light italic text-center py-8">
                No documents or SOW agreements shared yet.
              </p>
            ) : (
              <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="p-3.5 bg-background-soft border border-border/80 rounded-lg flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="p-2 border border-border/60 rounded bg-background text-aurum shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-typography truncate leading-snug">{doc.title}</h4>
                        <div className="flex items-center space-x-1.5 text-[9px] text-typography-light mt-0.5">
                          <span className="capitalize">{doc.document_type}</span>
                          {doc.sent_date && (
                            <>
                              <span>•</span>
                              <span>Shared: {new Date(doc.sent_date).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {doc.file_url ? (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 border border-border rounded hover:bg-background hover:text-aurum hover:border-aurum/40 text-typography-muted transition-all shrink-0"
                        title="Download / View document"
                      >
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      <span className="text-[9px] text-typography-light italic uppercase tracking-wider shrink-0">Pending URL</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FINANCIAL SUMMARY / INVOICES */}
        <div className="bg-background-card border border-border rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-bold tracking-wider uppercase text-typography border-b border-border/50 pb-2 flex items-center space-x-2">
            <DollarSign size={13} className="text-aurum" />
            <span>Invoice Checkpoints & Receipts</span>
          </h2>

          {payments.length === 0 ? (
            <p className="text-xs text-typography-light italic text-center py-8">
              No financial invoices logged.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-[9px] uppercase tracking-wider font-bold text-typography-light">
                    <th className="py-2.5 px-3">Reference / Scope</th>
                    <th className="py-2.5 px-3">Service Type</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3 text-right">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-typography-muted">
                  {payments.map((p: any) => {
                    const statusBadge = getClientFriendlyInvoiceStatus(p.status);
                    
                    return (
                      <tr key={p.id} className="hover:bg-background-soft/40 transition-colors">
                        <td className="py-3 px-3 font-semibold text-typography">{p.notes || `Invoice - ${p.revenue_type}`}</td>
                        <td className="py-3 px-3 capitalize">{p.revenue_type}</td>
                        <td className="py-3 px-3 text-right font-bold text-typography">
                          {p.amount.toLocaleString()} {p.currency}
                        </td>
                        <td className="py-3 px-3">
                          {p.due_date ? new Date(p.due_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border inline-block ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CLIENT REQUESTS / COLLABORATIVE FEEDBACK FORM */}
        <div className="bg-background-card border border-border rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-bold tracking-wider uppercase text-typography border-b border-border/50 pb-2 flex items-center space-x-2">
            <Send size={13} className="text-aurum" />
            <span>Submit Change Request or Inquiry</span>
          </h2>
          <p className="text-[10px] text-typography-muted leading-relaxed">
            Need adjustments to scope deliverables, have questions about invoice details, or want to submit an inquiry? Submit your request below, and the founder office will be notified immediately.
          </p>

          {feedbackSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded flex items-start space-x-2">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-green-600" />
              <span>{feedbackSuccess}</span>
            </div>
          )}

          {feedbackError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
              {feedbackError}
            </div>
          )}

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-typography-light mb-1">Subject / Area</label>
                <input
                  type="text"
                  placeholder="e.g. Scope Change Request / Milestones Feedback / Invoice Inquiry"
                  value={feedbackTitle}
                  onChange={(e) => setFeedbackTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-background-soft border border-border rounded focus:outline-none focus:border-aurum/40 text-typography placeholder:text-typography-light/60"
                  required
                  disabled={submittingFeedback}
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-typography-light mb-1">Details & Context</label>
                <textarea
                  rows={4}
                  placeholder="Describe your request or question in detail. Please provide any background context so we can act on it promptly."
                  value={feedbackDesc}
                  onChange={(e) => setFeedbackDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-background-soft border border-border rounded focus:outline-none focus:border-aurum/40 text-typography placeholder:text-typography-light/60 resize-none"
                  required
                  disabled={submittingFeedback}
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={submittingFeedback || !feedbackTitle.trim() || !feedbackDesc.trim()}
                className="inline-flex items-center space-x-2 border border-border bg-typography text-white hover:bg-typography/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors"
              >
                {submittingFeedback ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Send size={12} />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
