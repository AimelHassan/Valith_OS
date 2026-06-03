import React, { useState } from 'react';
import { useValithOS } from '../context/ValithOSContext';
import { Lead, Organization, Contact } from '../types/database.types';
import {
  Search,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  AlertOctagon,
  Trash2,
  Edit,
  Mail,
  Phone,
  Bookmark,
  Calendar,
  MessageCircle,
  X,
  FileSpreadsheet,
  ArrowDownToLine,
  Upload
} from 'lucide-react';

export const LeadsView: React.FC = () => {
  const {
    leads,
    organizations,
    contacts,
    tasks,
    payments,
    documents,
    saveLead,
    saveOrganization,
    saveContact,
    deleteLead,
    refreshAll,
    offers,
    segments
  } = useValithOS();

  // Search & Filter
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editLeadName, setEditLeadName] = useState('');
  const [editStage, setEditStage] = useState<any>('New');
  const [editStatus, setEditStatus] = useState<any>('Active');
  const [editPriority, setEditPriority] = useState<any>('Medium');
  const [editValue, setEditValue] = useState(0);
  const [editRetainer, setEditRetainer] = useState(0);
  const [editSegment, setEditSegment] = useState('');
  const [editOfferAngle, setEditOfferAngle] = useState('');
  const [editNextAction, setEditNextAction] = useState('');
  const [editNextFollowUp, setEditNextFollowUp] = useState('');
  const [editPainPoints, setEditPainPoints] = useState('');
  const [editBuyingSignals, setEditBuyingSignals] = useState('');
  const [editObjections, setEditObjections] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // CSV Import/Export States
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [csvText, setCsvText] = useState('');

  // Selected Lead details
  const selectedLead = leads.find((l) => l.id === selectedLeadId);
  const selectedOrg = selectedLead ? organizations.find((o) => o.id === selectedLead.organization_id) : null;
  const selectedContact = selectedLead ? contacts.find((c) => c.id === selectedLead.primary_contact_id) : null;

  // Filtered Leads list
  const filteredLeads = leads.filter((l) => {
    const org = organizations.find((o) => o.id === l.organization_id);
    const contact = contacts.find((c) => c.id === l.primary_contact_id);

    const matchesSearch =
      l.lead_name.toLowerCase().includes(search.toLowerCase()) ||
      (org?.name && org.name.toLowerCase().includes(search.toLowerCase())) ||
      (contact?.full_name && contact.full_name.toLowerCase().includes(search.toLowerCase()));

    const matchesStage = stageFilter ? l.stage === stageFilter : true;
    return matchesSearch && matchesStage;
  });

  // Open Edit Mode
  const startEdit = () => {
    if (!selectedLead) return;
    setEditLeadName(selectedLead.lead_name);
    setEditStage(selectedLead.stage);
    setEditStatus(selectedLead.status);
    setEditPriority(selectedLead.priority);
    setEditValue(selectedLead.deal_value_estimate);
    setEditRetainer(selectedLead.monthly_retainer_estimate);
    setEditSegment(selectedLead.segment || '');
    setEditOfferAngle(selectedLead.offer_angle || '');
    setEditNextAction(selectedLead.next_action || '');
    setEditNextFollowUp(selectedLead.next_follow_up_date || '');
    setEditPainPoints(selectedLead.pain_points || '');
    setEditBuyingSignals(selectedLead.buying_signals || '');
    setEditObjections(selectedLead.objections || '');
    setEditNotes(selectedLead.notes || '');
    setIsEditing(true);
  };

  // Save Edit Lead
  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    await saveLead({
      ...selectedLead,
      lead_name: editLeadName,
      stage: editStage,
      status: editStatus,
      priority: editPriority,
      deal_value_estimate: isValueAllowed ? Number(editValue) : 0,
      monthly_retainer_estimate: isValueAllowed ? Number(editRetainer) : 0,
      segment: editSegment,
      offer_angle: editOfferAngle,
      next_action: editNextAction,
      next_follow_up_date: editNextFollowUp || undefined,
      pain_points: editPainPoints,
      buying_signals: editBuyingSignals,
      objections: editObjections,
      notes: editNotes
    });

    setIsEditing(false);
    refreshAll();
  };

  // Archive lead toggle
  const handleToggleArchive = async () => {
    if (!selectedLead) return;
    const nextStatus = selectedLead.status === 'Archived' ? 'Active' : 'Archived';
    await saveLead({
      ...selectedLead,
      status: nextStatus as any
    });
    refreshAll();
  };

  // Mark won/lost
  const handleSetClosedStage = async (stage: 'Closed Won' | 'Closed Lost') => {
    if (!selectedLead) return;
    await saveLead({
      ...selectedLead,
      stage,
      status: 'Closed'
    });
    refreshAll();
  };

  // CSV EXPORT FOR LEADS
  const handleExportCSV = () => {
    let csv = 'Lead Name,Company,Primary Contact,Stage,Status,Priority,Value Estimate,Retainer Estimate,Next Action,Next Follow Up\n';
    leads.forEach((l) => {
      const org = organizations.find((o) => o.id === l.organization_id);
      const contact = contacts.find((c) => c.id === l.primary_contact_id);
      
      const clean = (str: string | undefined | null) => {
        if (!str) return '';
        return `"${str.replace(/"/g, '""')}"`;
      };

      const valAllowed = ['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].includes(l.stage);
      const valEst = valAllowed ? l.deal_value_estimate : 0;
      const retEst = valAllowed ? l.monthly_retainer_estimate : 0;
      csv += `${clean(l.lead_name)},${clean(org?.name)},${clean(contact?.full_name)},${l.stage},${l.status},${l.priority},${valEst},${retEst},${clean(l.next_action)},${clean(l.next_follow_up_date)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'valith_leads_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV IMPORT FOR LEADS (Simple CSV Parser)
  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    try {
      const rows = csvText.split('\n');
      const headers = rows[0].split(',');
      const leadNameIdx = headers.findIndex(h => h.toLowerCase().includes('lead name') || h.toLowerCase().includes('name'));
      const companyIdx = headers.findIndex(h => h.toLowerCase().includes('company') || h.toLowerCase().includes('org'));
      const contactIdx = headers.findIndex(h => h.toLowerCase().includes('contact') || h.toLowerCase().includes('person'));
      const valueIdx = headers.findIndex(h => h.toLowerCase().includes('value') || h.toLowerCase().includes('estimate'));
      
      const { dbService } = await import('../services/db');

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Matches commas outside quotes
        if (row.length < 2 || !row[leadNameIdx]?.trim()) continue;

        const leadName = row[leadNameIdx].replace(/"/g, '').trim();
        const companyName = row[companyIdx]?.replace(/"/g, '').trim() || 'Imported Org';
        const contactName = row[contactIdx]?.replace(/"/g, '').trim() || '';
        const valueEstimate = Number(row[valueIdx]?.replace(/[^\d]/g, '') || 150000);

        // Save Org
        const org = await dbService.saveOrganization({
          name: companyName,
          segment: 'Imported',
          source_channel: 'Manual'
        });

        // Save Contact
        let contactId = undefined;
        if (contactName) {
          const contact = await dbService.saveContact({
            organization_id: org.id,
            full_name: contactName,
            relationship_strength: 'Cold',
            decision_role: 'Unknown'
          });
          contactId = contact.id;
        }

        // Save Lead
        await saveLead({
          organization_id: org.id,
          primary_contact_id: contactId,
          lead_name: leadName,
          source_channel: 'Manual',
          segment: 'Imported',
          offer_angle: 'RFP Intelligence',
          stage: 'New',
          status: 'Active',
          priority: 'Medium',
          probability_percent: 10,
          deal_value_estimate: valueEstimate,
          monthly_retainer_estimate: 0,
          next_action: 'Perform audit'
        });
      }

      setCsvText('');
      setShowCSVImport(false);
      refreshAll();
      alert('CSV Leads imported successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to parse CSV. Verify format (headers: Lead Name, Company, Primary Contact, Value).');
    }
  };

  // Connected records to display in detail view
  const linkedTasks = selectedLeadId ? tasks.filter((t) => t.lead_id === selectedLeadId) : [];
  const linkedFinance = selectedLeadId ? payments.filter((f) => f.lead_id === selectedLeadId) : [];
  const linkedDocuments = selectedLeadId ? documents.filter((d) => d.lead_id === selectedLeadId) : [];

  const isValueAllowed = editStage === 'SOW Sent' || editStage === 'Negotiation' || editStage === 'Closed Won' || editStage === 'Closed Lost';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
      {/* ---------------- LEADS DATABASE TABLE ---------------- */}
      <div className={`lg:col-span-2 space-y-6 ${selectedLeadId ? 'hidden lg:block' : ''}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">CRM Leads Directory</h1>
            <p className="text-xs text-typography-muted">Manage company details, contact metadata and timeline audits</p>
          </div>
          <div className="flex space-x-3 text-xs">
            <button
              onClick={() => setShowCSVImport(true)}
              className="flex items-center space-x-1.5 border border-border bg-background-card hover:bg-background-soft px-3 py-1.5 rounded font-bold uppercase tracking-wider"
            >
              <Upload size={12} className="text-aurum" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 border border-border bg-background-card hover:bg-background-soft px-3 py-1.5 rounded font-bold uppercase tracking-wider"
            >
              <ArrowDownToLine size={12} className="text-aurum" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Filter */}
        <div className="bg-background-card border border-border rounded-lg p-4 flex gap-4 items-center">
          <div className="flex items-center bg-background-soft rounded px-3 py-1 border border-transparent focus-within:border-aurum/40 w-full max-w-sm">
            <Search size={14} className="text-typography-light mr-2" />
            <input
              type="text"
              placeholder="Search by company or contact name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none p-0 text-xs w-full focus:ring-0 focus:border-none"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-xs py-1.5"
          >
            <option value="">All Stages</option>
            <option value="New">New</option>
            <option value="Connected">Connected</option>
            <option value="Messaged">Messaged</option>
            <option value="Replied">Replied</option>
            <option value="Demo Sent">Demo Sent</option>
            <option value="Meeting Scheduled">Meeting Scheduled</option>
            <option value="SOW Sent">SOW Sent</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
        </div>

        {/* Database Grid */}
        <div className="bg-background-card border border-border rounded-lg overflow-hidden shadow-premium">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-soft border-b border-border text-[9px] uppercase tracking-wider font-bold text-typography-muted">
                <th className="py-3 px-4">Lead Name</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4 text-right">Value</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-typography-light">
                    No leads found matching query.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const org = organizations.find((o) => o.id === lead.organization_id);
                  const contact = contacts.find((c) => c.id === lead.primary_contact_id);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`hover:bg-background-soft cursor-pointer transition-all ${
                        selectedLeadId === lead.id ? 'bg-aurum-glow/10 border-l-2 border-l-aurum' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-typography">{lead.lead_name}</td>
                      <td className="py-3.5 px-4 text-typography-muted">{org?.name || '-'}</td>
                      <td className="py-3.5 px-4 text-typography-light">{contact?.full_name || '-'}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] uppercase font-semibold text-typography-muted">
                          {lead.stage}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-typography">
                        {['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].includes(lead.stage)
                          ? `${lead.deal_value_estimate.toLocaleString()} PKR`
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            lead.priority === 'High'
                              ? 'bg-red-50 text-red-600'
                              : lead.priority === 'Medium'
                              ? 'bg-aurum-glow text-aurum-dark'
                              : 'bg-background-soft text-typography-muted'
                          }`}
                        >
                          {lead.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <ChevronRight size={14} className="text-typography-light inline" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- LEAD DETAIL VIEW PANEL ---------------- */}
      <div className={`col-span-1 space-y-6 ${!selectedLeadId ? 'hidden lg:block' : ''}`}>
        {selectedLead ? (
          <div className="bg-background-card border border-border rounded-lg shadow-premium p-6 relative space-y-6">
            {/* Header / Actions */}
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <span className="text-[9px] font-bold text-aurum uppercase tracking-widest block">Lead Dossier</span>
                <h2 className="text-sm font-bold text-typography mt-1 leading-snug">{selectedLead.lead_name}</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={startEdit}
                  className="p-1.5 border border-border rounded hover:bg-background-soft transition-all text-typography-muted hover:text-typography"
                >
                  <Edit size={13} />
                </button>
                <button
                  onClick={() => setSelectedLeadId(null)}
                  className="p-1.5 border border-border rounded hover:bg-background-soft lg:hidden transition-all text-typography-muted"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-background-soft rounded">
                <span className="block text-[8px] uppercase tracking-wider text-typography-light font-bold">Estimated Setup Value</span>
                <span className="text-sm font-bold text-typography mt-0.5 block">
                  {['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].includes(selectedLead.stage)
                    ? `${selectedLead.deal_value_estimate.toLocaleString()} PKR`
                    : '—'}
                </span>
              </div>
              <div className="p-3 bg-background-soft rounded">
                <span className="block text-[8px] uppercase tracking-wider text-typography-light font-bold">Monthly Retainer</span>
                <span className="text-sm font-bold text-typography mt-0.5 block">
                  {['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].includes(selectedLead.stage)
                    ? `${selectedLead.monthly_retainer_estimate.toLocaleString()} PKR`
                    : '—'}
                </span>
              </div>
            </div>

            {/* Stage Selector Info */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-typography-muted">Stage: {selectedLead.stage}</span>
                <span className="text-typography-light">Status: {selectedLead.status}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSetClosedStage('Closed Won')}
                  className="flex-1 bg-typography text-white text-[10px] font-bold uppercase tracking-wider py-1.5 rounded hover:bg-typography/90"
                >
                  Mark Won
                </button>
                <button
                  onClick={() => handleSetClosedStage('Closed Lost')}
                  className="flex-1 border border-border text-typography-muted text-[10px] font-bold uppercase tracking-wider py-1.5 rounded hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                >
                  Mark Lost
                </button>
                <button
                  onClick={handleToggleArchive}
                  className="px-2 border border-border text-typography-light rounded hover:bg-background-soft"
                >
                  {selectedLead.status === 'Archived' ? 'Restore' : 'Archive'}
                </button>
              </div>
            </div>

            {/* Org Profile */}
            <div className="space-y-2 border-t border-border pt-4 text-xs">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-typography">Organization Details</h3>
              <div className="space-y-1 text-typography-muted">
                <p><span className="font-semibold text-typography-light">Company Name:</span> {selectedOrg?.name || 'N/A'}</p>
                {selectedOrg?.website && (
                  <p>
                    <span className="font-semibold text-typography-light">Website:</span>{' '}
                    <a href={selectedOrg.website} target="_blank" rel="noreferrer" className="text-aurum hover:underline truncate inline-block max-w-[180px]">
                      {selectedOrg.website}
                    </a>
                  </p>
                )}
                <p><span className="font-semibold text-typography-light">Industry/Segment:</span> {selectedOrg?.industry || 'N/A'} / {selectedOrg?.segment || 'N/A'}</p>
                <p><span className="font-semibold text-typography-light">Location:</span> {selectedOrg?.city ? `${selectedOrg.city}, ${selectedOrg.country}` : 'N/A'}</p>
              </div>
            </div>

            {/* Primary Contact Profile */}
            <div className="space-y-2 border-t border-border pt-4 text-xs">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-typography">Contact Profile</h3>
              {selectedContact ? (
                <div className="space-y-1.5 text-typography-muted">
                  <p className="font-bold text-typography">{selectedContact.full_name}</p>
                  <p className="text-typography-light text-[10px]">{selectedContact.role_title} ({selectedContact.seniority})</p>
                  {selectedContact.email && (
                    <a href={`mailto:${selectedContact.email}`} className="flex items-center space-x-1.5 text-aurum hover:underline mt-1">
                      <Mail size={12} />
                      <span>{selectedContact.email}</span>
                    </a>
                  )}
                  <p><span className="font-semibold text-typography-light">Decision Role:</span> {selectedContact.decision_role}</p>
                  <p><span className="font-semibold text-typography-light">Relationship Strength:</span> {selectedContact.relationship_strength}</p>
                </div>
              ) : (
                <p className="text-typography-light italic">No primary contact attached.</p>
              )}
            </div>

            {/* Pain points, buying signals, objections */}
            <div className="space-y-3.5 border-t border-border pt-4 text-xs">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-typography">Outreach Diagnostics</h3>
              
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-typography-light">Friction & Pain Points</span>
                <p className="text-typography-muted mt-0.5">{selectedLead.pain_points || 'No pain points documented.'}</p>
              </div>

              <div>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-typography-light">Objections Logged</span>
                <p className="text-typography-muted mt-0.5">{selectedLead.objections || 'No objections logged.'}</p>
              </div>

              <div>
                <span className="block text-[9px] font-bold uppercase tracking-wider text-typography-light">Buying Signals Captured</span>
                <p className="text-typography-muted mt-0.5">{selectedLead.buying_signals || 'No signals detected yet.'}</p>
              </div>
            </div>

            {/* Linked tasks */}
            <div className="space-y-2 border-t border-border pt-4 text-xs">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-typography">Pending Tasks</h3>
              {linkedTasks.length === 0 ? (
                <p className="text-typography-light italic">No pending tasks.</p>
              ) : (
                <div className="space-y-1.5">
                  {linkedTasks.map((t) => (
                    <div key={t.id} className="p-2 bg-background-soft rounded flex justify-between items-center">
                      <span className="font-semibold text-typography leading-tight">{t.title}</span>
                      <span className="text-[9px] text-typography-light">{t.due_date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>


          </div>
        ) : (
          <div className="bg-background-card border border-border rounded-lg p-12 text-center text-typography-light">
            Select a lead to examine the timeline profile, contact metadata, and attachments.
          </div>
        )}
      </div>

      {/* EDIT MODAL DRAWER */}
      {isEditing && selectedLead && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background-card border border-border rounded-lg max-w-lg w-full shadow-premium p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 text-typography-light hover:text-typography">
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-typography">Edit Lead Dossier</h2>
            <form onSubmit={handleSaveLead} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Lead Name</label>
                <input
                  type="text"
                  value={editLeadName}
                  onChange={(e) => setEditLeadName(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Stage</label>
                  <select
                    value={editStage}
                    onChange={(e) => setEditStage(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="New">New</option>
                    <option value="Connected">Connected</option>
                    <option value="Messaged">Messaged</option>
                    <option value="Replied">Replied</option>
                    <option value="Demo Sent">Demo Sent</option>
                    <option value="Meeting Scheduled">Meeting Scheduled</option>
                    <option value="SOW Sent">SOW Sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Waiting">Waiting</option>
                    <option value="Follow Up">Follow Up</option>
                    <option value="Closed">Closed</option>
                    <option value="Cold">Cold</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">
                    Estimated Setup Value
                    {!isValueAllowed && <span className="text-[9px] font-normal text-red-500 lowercase ml-1">(Unavailable for early stage)</span>}
                  </label>
                  <input
                    type="number"
                    value={isValueAllowed ? editValue : 0}
                    disabled={!isValueAllowed}
                    onChange={(e) => setEditValue(Number(e.target.value))}
                    className="w-full text-xs disabled:opacity-50 disabled:bg-background-soft"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">
                    Monthly Retainer
                    {!isValueAllowed && <span className="text-[9px] font-normal text-red-500 lowercase ml-1">(Unavailable for early stage)</span>}
                  </label>
                  <input
                    type="number"
                    value={isValueAllowed ? editRetainer : 0}
                    disabled={!isValueAllowed}
                    onChange={(e) => setEditRetainer(Number(e.target.value))}
                    className="w-full text-xs disabled:opacity-50 disabled:bg-background-soft"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Offer Angle</label>
                  <select
                    value={editOfferAngle}
                    onChange={(e) => setEditOfferAngle(e.target.value)}
                    className="w-full text-xs"
                  >
                    {offers.map(off => (
                      <option key={off.id} value={off.name}>{off.name}</option>
                    ))}
                    {offers.length === 0 && <option value="Other">Other</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Segment</label>
                  <select
                    value={editSegment}
                    onChange={(e) => setEditSegment(e.target.value)}
                    className="w-full text-xs"
                  >
                    {segments.map(seg => (
                      <option key={seg.id} value={seg.name}>{seg.name}</option>
                    ))}
                    {segments.length === 0 && <option value="Other">Other</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Next Action</label>
                  <input
                    type="text"
                    value={editNextAction}
                    onChange={(e) => setEditNextAction(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Next Follow-Up Date</label>
                  <input
                    type="date"
                    value={editNextFollowUp}
                    onChange={(e) => setEditNextFollowUp(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Friction & Pain Points</label>
                <textarea
                  rows={2}
                  value={editPainPoints}
                  onChange={(e) => setEditPainPoints(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Buying Signals</label>
                <textarea
                  rows={2}
                  value={editBuyingSignals}
                  onChange={(e) => setEditBuyingSignals(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Objections</label>
                <textarea
                  rows={2}
                  value={editObjections}
                  onChange={(e) => setEditObjections(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Private Notes</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-typography text-white py-2 rounded text-xs font-semibold uppercase tracking-wider hover:bg-typography/90 transition-all"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {showCSVImport && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background-card border border-border rounded-lg max-w-lg w-full shadow-premium p-6 relative">
            <button onClick={() => setShowCSVImport(false)} className="absolute top-4 right-4 text-typography-light hover:text-typography">
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 text-typography">Import Leads via CSV</h2>
            <p className="text-[10px] text-typography-light mb-4">
              Paste standard CSV rows below. Must include headers: <code className="bg-background-soft p-0.5 rounded font-mono">Lead Name,Company,Primary Contact,Value</code>
            </p>
            <form onSubmit={handleImportCSV} className="space-y-4">
              <textarea
                rows={10}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`Lead Name,Company,Primary Contact,Value\nOptimize Digital Deploy,Optimize Digital,Imran Ghazali,150000\nMARCEM Tenders Setup,MARCEM,Sheraz,225000`}
                className="w-full font-mono text-xs p-3"
                required
              />
              <button
                type="submit"
                className="w-full bg-typography text-white py-2 rounded text-xs font-semibold uppercase tracking-wider hover:bg-typography/90 transition-all"
              >
                Start Parse & Import
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
