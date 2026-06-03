import React, { useState, useEffect } from 'react';
import { useValithOS } from '../context/ValithOSContext';
import { Lead } from '../types/database.types';
import {
  Plus,
  Filter,
  DollarSign,
  Calendar,
  MessageSquare,
  CheckSquare,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';

const STAGES = [
  'New',
  'Connected',
  'Messaged',
  'Replied',
  'Demo Sent',
  'Meeting Scheduled',
  'SOW Sent',
  'Negotiation',
  'Closed Won',
  'Closed Lost'
];

export const PipelineView: React.FC = () => {
  const {
    leads,
    organizations,
    contacts,
    saveLead,
    saveTask,
    refreshAll,
    offers,
    segments: dbSegments
  } = useValithOS();

  // Filters
  const [filterSegment, setFilterSegment] = useState('');
  const [filterOfferAngle, setFilterOfferAngle] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterChannel, setFilterChannel] = useState('');

  // Modals
  const [showAddLead, setShowAddLead] = useState(false);
  const [showQuickTask, setShowQuickTask] = useState(false);
  
  // Selected Lead for Logging
  const [selectedLeadId, setSelectedLeadId] = useState('');

  // Lead Form State
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadOrgName, setNewLeadOrgName] = useState('');
  const [newLeadContactName, setNewLeadContactName] = useState('');
  const [newLeadAngle, setNewLeadAngle] = useState('');
  const [newLeadPriority, setNewLeadPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newLeadSegment, setNewLeadSegment] = useState('');
  const [newLeadChannel, setNewLeadChannel] = useState<'LinkedIn' | 'WhatsApp' | 'Email' | 'Referral' | 'Website' | 'Event' | 'Manual' | 'Other'>('LinkedIn');

  useEffect(() => {
    if (offers.length > 0 && !newLeadAngle) {
      setNewLeadAngle(offers[0].name);
    }
  }, [offers, newLeadAngle]);

  useEffect(() => {
    if (dbSegments.length > 0 && !newLeadSegment) {
      setNewLeadSegment(dbSegments[0].name);
    }
  }, [dbSegments, newLeadSegment]);



  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState<'Follow-up' | 'Call' | 'Meeting' | 'Proposal' | 'Payment' | 'Delivery' | 'Admin' | 'Content' | 'Other'>('Follow-up');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [taskDescription, setTaskDescription] = useState('');

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('leadId', id);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (!leadId) return;

    const lead = leads.find(l => l.id === leadId);
    if (lead && lead.stage !== targetStage) {
      const isClosed = targetStage === 'Closed Won' || targetStage === 'Closed Lost';
      const updatedStatus = isClosed ? 'Closed' : lead.status;
      
      await saveLead({
        ...lead,
        stage: targetStage as any,
        status: updatedStatus as any
      });
      refreshAll();
    }
  };

  const handleMoveStage = async (lead: Lead, targetStage: string) => {
    const isClosed = targetStage === 'Closed Won' || targetStage === 'Closed Lost';
    const updatedStatus = isClosed ? 'Closed' : lead.status;
    
    await saveLead({
      ...lead,
      stage: targetStage as any,
      status: updatedStatus as any
    });
    refreshAll();
  };

  // Submit Lead
  const handleAddLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadOrgName.trim()) return;

    // 1. Create Organization
    const { dbService } = await import('../services/db');
    const org = await dbService.saveOrganization({
      name: newLeadOrgName,
      segment: newLeadSegment,
      source_channel: newLeadChannel
    });

    // 2. Create Contact if provided
    let contactId = undefined;
    if (newLeadContactName.trim()) {
      const contact = await dbService.saveContact({
        organization_id: org.id,
        full_name: newLeadContactName,
        relationship_strength: 'Cold',
        decision_role: 'Unknown'
      });
      contactId = contact.id;
    }

    // 3. Create Lead
    await saveLead({
      organization_id: org.id,
      primary_contact_id: contactId,
      lead_name: newLeadName,
      source_channel: newLeadChannel,
      segment: newLeadSegment,
      offer_angle: newLeadAngle,
      stage: 'New',
      status: 'Active',
      priority: newLeadPriority,
      probability_percent: 10,
      deal_value_estimate: 0,
      monthly_retainer_estimate: 0,
      next_action: 'Initial outreach'
    });

    // Clean up
    setNewLeadName('');
    setNewLeadOrgName('');
    setNewLeadContactName('');
    setShowAddLead(false);
    refreshAll();
  };



  // Submit Task
  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const lead = leads.find(l => l.id === selectedLeadId);

    await saveTask({
      lead_id: selectedLeadId || undefined,
      organization_id: lead?.organization_id || undefined,
      title: taskTitle,
      description: taskDescription,
      task_type: taskType,
      due_date: taskDueDate || undefined,
      priority: taskPriority,
      status: 'Open'
    });

    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
    setShowQuickTask(false);
    refreshAll();
  };

  // Filters logic
  const filteredLeads = leads.filter((l) => {
    if (filterSegment && l.segment !== filterSegment) return false;
    if (filterOfferAngle && l.offer_angle !== filterOfferAngle) return false;
    if (filterPriority && l.priority !== filterPriority) return false;
    if (filterChannel && l.source_channel !== filterChannel) return false;
    return l.status !== 'Archived'; // Don't show archived on board
  });

  // Unique filter values
  const filterSegmentOptions = Array.from(new Set([...dbSegments.map(s => s.name), ...leads.map(l => l.segment)])).filter(Boolean);
  const filterOfferOptions = Array.from(new Set([...offers.map(o => o.name), ...leads.map(l => l.offer_angle)])).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Sales Pipeline Kanban</h1>
          <p className="text-xs text-typography-muted">Drag and drop leads to update sales stages</p>
        </div>

        <div className="flex space-x-3">

          <button
            onClick={() => {
              setSelectedLeadId(leads[0]?.id || '');
              setShowQuickTask(true);
            }}
            className="flex items-center space-x-2 bg-background-card hover:bg-background-soft border border-border px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider text-typography"
          >
            <CheckSquare size={13} className="text-aurum" />
            <span>New Task</span>
          </button>

          <button
            onClick={() => setShowAddLead(true)}
            className="flex items-center space-x-2 bg-typography hover:bg-typography/90 text-white px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider"
          >
            <Plus size={14} className="text-aurum" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-background-card border border-border rounded-lg p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase text-typography-muted">
          <Filter size={14} />
          <span>Filters:</span>
        </div>

        {/* Segment */}
        <select
          value={filterSegment}
          onChange={(e) => setFilterSegment(e.target.value)}
          className="text-xs py-1"
        >
          <option value="">All Segments</option>
          {filterSegmentOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Offer Angle */}
        <select
          value={filterOfferAngle}
          onChange={(e) => setFilterOfferAngle(e.target.value)}
          className="text-xs py-1"
        >
          <option value="">All Offer Angles</option>
          {filterOfferOptions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="text-xs py-1"
        >
          <option value="">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Channel */}
        <select
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value)}
          className="text-xs py-1"
        >
          <option value="">All Channels</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Email">Email</option>
          <option value="Referral">Referral</option>
          <option value="Manual">Manual</option>
          <option value="Other">Other</option>
        </select>

        {/* Reset */}
        {(filterSegment || filterOfferAngle || filterPriority || filterChannel) && (
          <button
            onClick={() => {
              setFilterSegment('');
              setFilterOfferAngle('');
              setFilterPriority('');
              setFilterChannel('');
            }}
            className="text-[10px] uppercase font-bold text-red-500 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* KANBAN BOARD */}
      <div className="flex space-x-4 overflow-x-auto pb-6 min-h-[500px]">
        {STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.stage === stage);
          const valueAllowedStages = ['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'];
          const stageValue = valueAllowedStages.includes(stage)
            ? stageLeads.reduce((sum: number, l) => sum + l.deal_value_estimate, 0)
            : 0;

          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, stage)}
              className="w-72 shrink-0 bg-background-soft rounded-lg p-3 flex flex-col space-y-3 border border-border/40"
            >
              {/* Stage Header */}
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="text-xs font-bold text-typography uppercase">{stage}</h3>
                  <span className="text-[10px] text-typography-muted">{stageLeads.length} leads</span>
                </div>
                {['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].includes(stage) && (
                  <div className="text-right">
                    <span className="text-xs font-bold text-typography">{stageValue.toLocaleString()}</span>
                    <span className="block text-[8px] text-typography-light uppercase font-bold">PKR</span>
                  </div>
                )}
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[600px] min-h-[400px]">
                {stageLeads.length === 0 ? (
                  <div className="h-full border border-dashed border-border rounded-lg flex items-center justify-center p-6 text-center">
                    <p className="text-[10px] text-typography-light uppercase tracking-wider">Drag items here</p>
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const org = organizations.find((o) => o.id === lead.organization_id);
                    const contact = contacts.find((c) => c.id === lead.primary_contact_id);

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        className="bg-background-card border border-border hover:border-aurum rounded-lg p-4 shadow-premium hover:shadow-premium-hover transition-all duration-200 cursor-grab active:cursor-grabbing space-y-3 relative group"
                      >
                        {/* Priority indicator */}
                        <div className="absolute top-4 right-4">
                          <span
                            className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              lead.priority === 'High'
                                ? 'bg-red-50 text-red-600'
                                : lead.priority === 'Medium'
                                ? 'bg-aurum-glow text-aurum-dark'
                                : 'bg-background-soft text-typography-muted'
                            }`}
                          >
                            {lead.priority}
                          </span>
                        </div>

                        {/* Org & Name */}
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-aurum block truncate">
                            {org?.name || 'Unknown Org'}
                          </span>
                          <h4 className="text-xs font-bold text-typography leading-snug truncate mt-0.5">
                            {lead.lead_name}
                          </h4>
                          {contact && (
                            <span className="block text-[10px] text-typography-muted truncate mt-0.5">
                              {contact.full_name} ({contact.role_title || 'Lead'})
                            </span>
                          )}
                        </div>

                        {/* Offer & Value */}
                        <div className="flex justify-between items-center pt-2 border-t border-border/60 text-xs">
                          <span className="text-[10px] text-typography-light truncate max-w-[120px]">
                            {lead.offer_angle}
                          </span>
                          <span className="font-bold text-typography">
                            {['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].includes(lead.stage)
                              ? `${lead.deal_value_estimate.toLocaleString()} PKR`
                              : '—'}
                          </span>
                        </div>

                        {/* Actions & Follow up */}
                        <div className="space-y-1.5 pt-2 border-t border-border/40 text-[10px]">
                          {lead.next_action && (
                            <p className="text-typography-muted italic leading-tight truncate">
                              Next: {lead.next_action}
                            </p>
                          )}
                          {lead.next_follow_up_date && (
                            <div className="flex items-center space-x-1.5 text-typography-light">
                              <Calendar size={10} className="text-aurum shrink-0" />
                              <span>F/Up: {lead.next_follow_up_date}</span>
                            </div>
                          )}
                        </div>

                        {/* Mobile Selector Fallback */}
                        <div className="block md:hidden mt-2 pt-2 border-t border-border/20">
                          <select
                            value={lead.stage}
                            onChange={(e) => handleMoveStage(lead, e.target.value)}
                            className="text-[10px] py-0.5 w-full bg-background-soft"
                          >
                            {STAGES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK ADD LEAD MODAL */}
      {showAddLead && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background-card border border-border rounded-lg max-w-md w-full shadow-premium p-6 relative">
            <button onClick={() => setShowAddLead(false)} className="absolute top-4 right-4 text-typography-light hover:text-typography">
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-typography">Quick Add Lead</h2>
            <form onSubmit={handleAddLeadSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Lead Name</label>
                <input
                  type="text"
                  placeholder="e.g. MARCEM RFP Setup"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Company / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. MARCEM"
                    value={newLeadOrgName}
                    onChange={(e) => setNewLeadOrgName(e.target.value)}
                    className="w-full text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Primary Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sheraz"
                    value={newLeadContactName}
                    onChange={(e) => setNewLeadContactName(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Offer Angle</label>
                  <select
                    value={newLeadAngle}
                    onChange={(e) => setNewLeadAngle(e.target.value)}
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
                    value={newLeadSegment}
                    onChange={(e) => setNewLeadSegment(e.target.value)}
                    className="w-full text-xs"
                  >
                    {dbSegments.map(seg => (
                      <option key={seg.id} value={seg.name}>{seg.name}</option>
                    ))}
                    {dbSegments.length === 0 && <option value="Other">Other</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Channel</label>
                  <select
                    value={newLeadChannel}
                    onChange={(e) => setNewLeadChannel(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Referral">Referral</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Priority</label>
                  <select
                    value={newLeadPriority}
                    onChange={(e) => setNewLeadPriority(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-typography text-white py-2 rounded text-xs font-semibold uppercase tracking-wider hover:bg-typography/90 transition-all"
              >
                Create Lead
              </button>
            </form>
          </div>
        </div>
      )}



      {/* QUICK CREATE TASK */}
      {showQuickTask && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background-card border border-border rounded-lg max-w-md w-full shadow-premium p-6 relative">
            <button onClick={() => setShowQuickTask(false)} className="absolute top-4 right-4 text-typography-light hover:text-typography">
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-typography">Quick Create Task</h2>
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Link to Lead (optional)</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full text-xs"
                >
                  <option value="">-- No Lead Link --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>{l.lead_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Send invoice to Imran"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Task Type</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="Follow-up">Follow-up</option>
                    <option value="Call">Call</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Payment">Payment</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-typography-muted mb-1">Description</label>
                <textarea
                  rows={2}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Additional context..."
                  className="w-full text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-typography text-white py-2 rounded text-xs font-semibold uppercase tracking-wider hover:bg-typography/90 transition-all"
              >
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
