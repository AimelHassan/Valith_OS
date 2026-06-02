import React, { useState } from 'react';
import { useValithOS } from '../context/ValithOSContext';
import { DBDocument } from '../types/database.types';
import {
  FileText,
  Plus,
  X,
  Trash2,
  ExternalLink,
  Users,
  Paperclip,
  CheckCircle2
} from 'lucide-react';

export const ProposalsView: React.FC = () => {
  const {
    documents,
    organizations,
    leads,
    deals,
    saveDocument,
    deleteDocument,
    refreshAll
  } = useValithOS();

  const [showAddModal, setShowAddModal] = useState(false);

  // Form States
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<any>('Proposal');
  const [orgId, setOrgId] = useState('');
  const [leadId, setLeadId] = useState('');
  const [dealId, setDealId] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [status, setStatus] = useState<any>('Draft');
  const [sentDate, setSentDate] = useState('');
  const [notes, setNotes] = useState('');

  // Submit Doc
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    await saveDocument({
      title: docTitle,
      document_type: docType,
      organization_id: orgId || undefined,
      lead_id: leadId || undefined,
      deal_id: dealId || undefined,
      file_url: fileUrl || undefined,
      status,
      sent_date: sentDate || undefined,
      notes
    });

    setDocTitle('');
    setFileUrl('');
    setNotes('');
    setOrgId('');
    setLeadId('');
    setDealId('');
    setShowAddModal(false);
    refreshAll();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this document link?')) {
      await deleteDocument(id);
      refreshAll();
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Document Locker</h1>
          <p className="text-xs text-typography-muted">Track custom SOW files, client proposals, invoices, and legal agreements</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-typography hover:bg-typography/90 text-white px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider"
        >
          <Plus size={14} className="text-aurum" />
          <span>Add Document</span>
        </button>
      </div>

      {/* DOCUMENT CARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {documents.length === 0 ? (
          <div className="col-span-3 card-premium py-12 text-center text-typography-light text-xs uppercase tracking-wider">
            No documents cataloged in locker. Add one above.
          </div>
        ) : (
          documents.map((doc) => {
            const org = organizations.find((o) => o.id === doc.organization_id);
            const lead = leads.find((l) => l.id === doc.lead_id);

            return (
              <div
                key={doc.id}
                className="bg-background-card border border-border hover:border-aurum/40 p-5 rounded-lg shadow-premium flex flex-col justify-between space-y-4 hover:shadow-premium-hover transition-all duration-200"
              >
                {/* Upper block */}
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase tracking-wider font-bold bg-background-soft text-typography-muted px-2 py-0.5 rounded">
                      {doc.document_type}
                    </span>
                    <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                      doc.status === 'Signed'
                        ? 'bg-aurum-glow text-aurum-dark'
                        : doc.status === 'Sent' || doc.status === 'Viewed'
                        ? 'bg-typography text-white'
                        : 'bg-background-soft text-typography-muted'
                    }`}>
                      {doc.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-typography leading-snug">
                    {doc.title}
                  </h3>

                  {org && (
                    <div className="flex items-center space-x-1.5 text-[10px] text-typography-muted">
                      <Users size={11} className="text-aurum shrink-0" />
                      <span className="truncate">{org.name}</span>
                    </div>
                  )}

                  {doc.notes && (
                    <p className="text-[10px] text-typography-light italic leading-normal">
                      {doc.notes}
                    </p>
                  )}
                </div>

                {/* Lower Action Block */}
                <div className="pt-3 border-t border-border flex justify-between items-center text-xs">
                  <span className="text-[10px] text-typography-light">
                    {doc.sent_date ? `Sent: ${doc.sent_date}` : 'Draft'}
                  </span>
                  
                  <div className="flex items-center space-x-3">
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1 font-bold text-aurum hover:underline"
                      >
                        <ExternalLink size={12} />
                        <span>View</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-typography-light hover:text-red-500 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RECORD DOCUMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background-card border border-border rounded-lg max-w-md w-full shadow-premium p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-typography-light hover:text-typography">
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-typography">Log Document Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Optimize Digital RFP SOW v1"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="Proposal">Proposal</option>
                    <option value="SOW">Statement of Work (SOW)</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Contract">Service Contract</option>
                    <option value="Demo">Demo Link</option>
                    <option value="Case Study">Case Study</option>
                    <option value="Notes">Notes / Directives</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Document Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent (Awaiting response)</option>
                    <option value="Viewed">Viewed by Client</option>
                    <option value="Signed">Signed / Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Link Org</label>
                  <select
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                    className="w-full text-xs"
                  >
                    <option value="">-- Choose Org --</option>
                    {organizations.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Link Lead</label>
                  <select
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                    className="w-full text-xs"
                  >
                    <option value="">-- Choose Lead --</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>{l.lead_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Link Deal</label>
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
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Document URL / File link</label>
                <div className="flex bg-background-soft rounded border border-border px-3 py-1.5 items-center">
                  <Paperclip size={12} className="text-typography-light mr-2" />
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="bg-transparent border-none p-0 text-xs w-full focus:ring-0 focus:border-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Sent Date</label>
                <input
                  type="date"
                  value={sentDate}
                  onChange={(e) => setSentDate(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Private Comments</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Private commentary on file edits..."
                  className="w-full text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-typography text-white py-2 rounded text-xs font-semibold uppercase tracking-wider hover:bg-typography/90 transition-all"
              >
                Log Document Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
