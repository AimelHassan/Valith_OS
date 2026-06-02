import React, { useState } from 'react';
import { useValithOS } from '../context/ValithOSContext';
import { aiService, ParsedCaptureResult } from '../services/ai';
import { dbService } from '../services/db';
import {
  Inbox,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Users,
  Briefcase,
  CheckSquare,
  ArrowRight
} from 'lucide-react';

export const AICaptureInboxView: React.FC = () => {
  const {
    saveLead,
    saveTask,
    refreshAll,
    offers,
    segments: dbSegments
  } = useValithOS();

  const [rawText, setRawText] = useState('');
  const [source, setSource] = useState<'WhatsApp' | 'LinkedIn' | 'Email' | 'Call' | 'Meeting' | 'Manual Note'>('LinkedIn');
  const [isLoading, setIsLoading] = useState(false);
  
  // Parsed results
  const [parsedData, setParsedData] = useState<ParsedCaptureResult | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit fields for review before saving
  const [orgName, setOrgName] = useState('');
  const [orgWeb, setOrgWeb] = useState('');
  const [orgInd, setOrgInd] = useState('');
  const [orgLoc, setOrgLoc] = useState('');

  const [conName, setConName] = useState('');
  const [conTitle, setConTitle] = useState('');
  const [conEmail, setConEmail] = useState('');
  const [conWhatsApp, setConWhatsApp] = useState('');

  const [leadName, setLeadName] = useState('');
  const [leadAngle, setLeadAngle] = useState('');
  const [leadSegment, setLeadSegment] = useState('');
  const [leadVal, setLeadVal] = useState(0);
  const [leadRet, setLeadRet] = useState(0);
  const [leadAction, setLeadAction] = useState('');
  const [leadPains, setLeadPains] = useState('');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('');

  // Handle parsing trigger
  const handleParse = async () => {
    if (!rawText.trim()) return;
    setIsLoading(true);
    setError(null);
    setIsApplied(false);
    
    try {
      const parsed = await aiService.parseCaptureInbox(rawText);
      setParsedData(parsed);

      // Hydrate state for review
      setOrgName(parsed.organization?.name || '');
      setOrgWeb(parsed.organization?.website || '');
      setOrgInd(parsed.organization?.industry || 'Technology');
      setOrgLoc(parsed.organization?.location || 'Pakistan');

      setConName(parsed.contact?.full_name || '');
      setConTitle(parsed.contact?.role_title || 'Executive');
      setConEmail(parsed.contact?.email || '');
      setConWhatsApp(parsed.contact?.whatsapp || '');

      setLeadName(parsed.lead?.lead_name || 'New Lead from AI Capture');
      setLeadAngle(parsed.lead?.offer_angle || 'RFP Intelligence');
      setLeadSegment(parsed.lead?.segment || 'A2 RFP Active');
      setLeadVal(parsed.lead?.deal_value_estimate || 150000);
      setLeadRet(parsed.lead?.monthly_retainer_estimate || 0);
      setLeadAction(parsed.lead?.next_action || 'Send follow-up details');
      setLeadPains(parsed.lead?.pain_points || '');
      
      setTaskTitle(parsed.task?.title || '');
      setTaskDue(parsed.task?.due_date || '');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while calling Gemini API.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle applying to Database
  const handleApply = async () => {
    if (!orgName.trim() || !leadName.trim()) return;
    setIsLoading(true);

    try {
      // 1. Create Org
      const org = await dbService.saveOrganization({
        name: orgName,
        website: orgWeb || undefined,
        industry: orgInd || undefined,
        segment: leadSegment,
        location: orgLoc || undefined,
        source_channel: source
      });

      // 2. Create Contact if provided
      let contactId = undefined;
      if (conName.trim()) {
        const contact = await dbService.saveContact({
          organization_id: org.id,
          full_name: conName,
          role_title: conTitle || undefined,
          email: conEmail || undefined,
          whatsapp: conWhatsApp || undefined,
          relationship_strength: 'Warm',
          decision_role: 'Unknown'
        });
        contactId = contact.id;
      }

      // 3. Create Lead
      const lead = await saveLead({
        organization_id: org.id,
        primary_contact_id: contactId,
        lead_name: leadName,
        source_channel: source as any,
        segment: leadSegment,
        offer_angle: leadAngle,
        stage: 'New',
        status: 'Active',
        priority: 'Medium',
        probability_percent: 10,
        deal_value_estimate: Number(leadVal),
        monthly_retainer_estimate: Number(leadRet),
        next_action: leadAction,
        pain_points: leadPains
      });

      // 4. Create Task if provided
      if (taskTitle.trim()) {
        await saveTask({
          lead_id: lead.id,
          organization_id: org.id,
          title: taskTitle,
          due_date: taskDue || undefined,
          task_type: 'Follow-up',
          priority: 'Medium',
          status: 'Open'
        });
      }



      // Save to Capture history
      await dbService.saveAICapture({
        source,
        raw_text: rawText,
        parsed_json: parsedData,
        status: 'Applied'
      });

      setIsApplied(true);
      setRawText('');
      setParsedData(null);
      refreshAll();
    } catch (err: any) {
      console.error(err);
      setError(`Apply failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-xl font-bold tracking-tight uppercase">AI Capture Inbox</h1>
        <p className="text-xs text-typography-muted">Paste unstructured conversation streams to auto-populate CRM entities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INPUT FORM BLOCK */}
        <div className="card-premium space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold tracking-wider uppercase text-typography">Conversational Input stream</h3>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as any)}
              className="text-xs py-1"
            >
              <option value="LinkedIn">LinkedIn DM</option>
              <option value="WhatsApp">WhatsApp Message</option>
              <option value="Email">Email Thread</option>
              <option value="Call">Call Notes</option>
              <option value="Meeting">Meeting Transcript</option>
              <option value="Manual Note">Manual Note</option>
            </select>
          </div>

          <textarea
            rows={12}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`Example:
"Sheraz from MARCEM called me. They want to setup the RFP system by GIKI. Setup estimated around 225,000 PKR, with retainer around 45,000 PKR. Meeting moved to tomorrow. Need to confirm time."`}
            className="w-full text-xs p-3 font-sans"
            disabled={isLoading}
          />

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded text-xs flex items-center space-x-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isApplied && (
            <div className="p-3 bg-aurum-glow text-aurum-dark rounded text-xs flex items-center space-x-2">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>Leads, Contacts, and Follow-ups imported successfully!</span>
            </div>
          )}

          <button
            onClick={handleParse}
            disabled={isLoading || !rawText.trim()}
            className="w-full bg-typography hover:bg-typography/90 text-white py-2.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            <Sparkles size={14} className="text-aurum animate-pulse" />
            <span>{isLoading ? 'Processing...' : 'Parse with Gemini'}</span>
          </button>
        </div>

        {/* REVIEW AND SAVE BLOCK */}
        <div className="card-premium space-y-5">
          <h3 className="text-xs font-bold tracking-wider uppercase text-typography">Parsed Entities Review</h3>
          
          {parsedData ? (
            <div className="space-y-4 text-xs max-h-[480px] overflow-y-auto pr-1">
              {/* Organization Entity */}
              <div className="border border-border p-3.5 rounded-lg space-y-3">
                <div className="flex items-center space-x-2 font-bold text-typography uppercase text-[9px] text-aurum-dark">
                  <Users size={12} />
                  <span>Organization</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] text-typography-muted mb-0.5 font-semibold uppercase">Company Name</label>
                    <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} className="w-full text-xs p-1" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-typography-muted mb-0.5 font-semibold uppercase">Website</label>
                    <input type="text" value={orgWeb} onChange={e => setOrgWeb(e.target.value)} className="w-full text-xs p-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] text-typography-muted mb-0.5 font-semibold uppercase">Industry</label>
                    <input type="text" value={orgInd} onChange={e => setOrgInd(e.target.value)} className="w-full text-xs p-1" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-typography-muted mb-0.5 font-semibold uppercase">Location</label>
                    <input type="text" value={orgLoc} onChange={e => setOrgLoc(e.target.value)} className="w-full text-xs p-1" />
                  </div>
                </div>
              </div>

              {/* Contact Entity */}
              <div className="border border-border p-3.5 rounded-lg space-y-3">
                <div className="flex items-center space-x-2 font-bold text-typography uppercase text-[9px] text-aurum-dark">
                  <User size={12} />
                  <span>Contact Profile</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] text-typography-muted mb-0.5 font-semibold uppercase">Full Name</label>
                    <input type="text" value={conName} onChange={e => setConName(e.target.value)} className="w-full text-xs p-1" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-typography-muted mb-0.5 font-semibold uppercase">Role Title</label>
                    <input type="text" value={conTitle} onChange={e => setConTitle(e.target.value)} className="w-full text-xs p-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] text-typography-muted mb-0.5 font-semibold uppercase">Email</label>
                    <input type="text" value={conEmail} onChange={e => setConEmail(e.target.value)} className="w-full text-xs p-1" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-typography-muted mb-0.5 font-semibold uppercase">WhatsApp</label>
                    <input type="text" value={conWhatsApp} onChange={e => setConWhatsApp(e.target.value)} className="w-full text-xs p-1" />
                  </div>
                </div>
              </div>

              {/* Lead Details */}
              <div className="border border-border p-3.5 rounded-lg space-y-3">
                <div className="flex items-center space-x-2 font-bold text-typography uppercase text-[9px] text-aurum-dark">
                  <Briefcase size={12} />
                  <span>Lead Pipeline record</span>
                </div>
                <div>
                  <label className="block text-[9px] text-typography-muted mb-0.5 font-semibold uppercase">Lead Name</label>
                  <input type="text" value={leadName} onChange={e => setLeadName(e.target.value)} className="w-full text-xs p-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] text-typography-muted mb-0.5 font-semibold uppercase">Offer Angle</label>
                    <select value={leadAngle} onChange={e => setLeadAngle(e.target.value)} className="w-full text-xs p-1">
                      {offers.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                      {leadAngle && !offers.some(o => o.name === leadAngle) && <option value={leadAngle}>{leadAngle} (parsed)</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] text-typography-muted mb-0.5 font-semibold uppercase">Segment</label>
                    <select value={leadSegment} onChange={e => setLeadSegment(e.target.value)} className="w-full text-xs p-1">
                      {dbSegments.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      {leadSegment && !dbSegments.some(s => s.name === leadSegment) && <option value={leadSegment}>{leadSegment} (parsed)</option>}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] text-typography-muted mb-0.5 font-semibold uppercase">Setup Value (PKR)</label>
                    <input type="number" value={leadVal} onChange={e => setLeadVal(Number(e.target.value))} className="w-full text-xs p-1" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-typography-muted mb-0.5 font-semibold uppercase">Retainer (PKR)</label>
                    <input type="number" value={leadRet} onChange={e => setLeadRet(Number(e.target.value))} className="w-full text-xs p-1" />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] text-typography-muted mb-0.5 font-semibold uppercase">Next Action</label>
                  <input type="text" value={leadAction} onChange={e => setLeadAction(e.target.value)} className="w-full text-xs p-1" />
                </div>
                <div>
                  <label className="block text-[9px] text-typography-muted mb-0.5 font-semibold uppercase">Frictions/Pain Points</label>
                  <textarea rows={2} value={leadPains} onChange={e => setLeadPains(e.target.value)} className="w-full text-xs p-1" />
                </div>
              </div>

              {/* Task Entity */}
              <div className="border border-border p-3.5 rounded-lg space-y-3">
                <div className="flex items-center space-x-2 font-bold text-typography uppercase text-[9px] text-aurum-dark">
                  <CheckSquare size={12} />
                  <span>Linked Action Task</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] text-typography-muted mb-0.5 font-semibold uppercase">Task Title</label>
                    <input type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="w-full text-xs p-1" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-typography-muted mb-0.5 font-semibold uppercase">Due Date</label>
                    <input type="date" value={taskDue} onChange={e => setTaskDue(e.target.value)} className="w-full text-xs p-1" />
                  </div>
                </div>
              </div>

              <button
                onClick={handleApply}
                disabled={isLoading}
                className="w-full bg-aurum hover:bg-aurum-dark text-white py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2"
              >
                <span>Commit & Sync to Operating DB</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="h-[300px] border border-dashed border-border rounded-lg flex items-center justify-center text-center p-6">
              <p className="text-xs text-typography-light uppercase tracking-wider">
                Paste raw chat text on the left and trigger Gemini to preview entity parses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
