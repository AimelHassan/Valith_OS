import React, { useState, useEffect } from 'react';
import { useValithOS } from '../context/ValithOSContext';
import {
  FileText,
  Copy,
  Check,
  Zap,
  DollarSign,
  Briefcase,
  AlertTriangle
} from 'lucide-react';

export const FounderBriefView: React.FC = () => {
  const {
    leads,
    tasks,
    payments,
    expenses,
    cashAccounts,
    mrrEntries,
    organizations
  } = useValithOS();

  const [copied, setCopied] = useState(false);
  const [briefMarkdown, setBriefMarkdown] = useState('');

  const convertToPKR = (val: number, curr: string) => {
    if (curr === 'USD') return val * 280;
    if (curr === 'EUR') return val * 300;
    return val;
  };

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    // Math summaries
    const cashTotal = cashAccounts.reduce((sum, c) => sum + c.current_balance, 0);
    const receivedRevenue = payments.filter(p => p.status === 'Received').reduce((sum, p) => sum + convertToPKR(p.amount, p.currency), 0);
    const lockedRevenue = payments.filter(p => p.status === 'Locked').reduce((sum, p) => sum + convertToPKR(p.amount, p.currency), 0);
    const expectedRevenue = payments.filter(p => p.status === 'Expected').reduce((sum, p) => sum + convertToPKR(p.amount, p.currency), 0);

    const activeMRR = mrrEntries.filter(m => m.status === 'Active').reduce((sum, m) => sum + convertToPKR(m.monthly_amount, m.currency), 0);
    const expectedMRR = mrrEntries.filter(m => m.status === 'Expected').reduce((sum, m) => sum + convertToPKR(m.monthly_amount, m.currency), 0);

    const monthlyExpenseTotal = expenses
      .filter(e => e.billing_type === 'Monthly' && e.payment_status !== 'Cancelled')
      .reduce((sum, e) => sum + convertToPKR(e.amount, e.currency), 0);

    const netBurn = Math.max(0, monthlyExpenseTotal - activeMRR);
    const runway = netBurn > 0 ? (cashTotal / netBurn).toFixed(1) : 'Infinite';

    // Filtered lists
    const hotLeads = leads.filter(l => l.priority === 'High' && l.status !== 'Closed' && l.status !== 'Archived');
    const waitingLeads = leads.filter(l => l.status === 'Waiting');
    const followupsToday = leads.filter(l => l.next_follow_up_date === todayStr && l.status !== 'Closed' && l.status !== 'Archived');
    const overdueFollowups = leads.filter(l => l.next_follow_up_date && l.next_follow_up_date < todayStr && l.status !== 'Closed' && l.status !== 'Archived');
    const proposalsSent = leads.filter(l => l.stage === 'SOW Sent');
    const meetingsScheduled = leads.filter(l => l.stage === 'Meeting Scheduled');
    const paymentFollowUps = payments.filter(p => p.status === 'Invoiced' || p.status === 'Overdue');
    const strategicLeads = leads.filter(l => l.segment.toLowerCase().includes('strategic') || l.segment.toLowerCase().includes('partner'));

    // Dynamic Decisions Needed
    const decisions: string[] = [];
    if (paymentFollowUps.some(p => p.status === 'Overdue')) {
      decisions.push('Follow up on overdue invoices immediately to secure near-term cash.');
    }
    if (waitingLeads.length > 3) {
      decisions.push(`You have ${waitingLeads.length} leads waiting. Re-engage threads to prevent cold churn.`);
    }
    if (expectedRevenue > 0 && cashTotal < monthlyExpenseTotal * 2) {
      decisions.push('Cash reserves are thin relative to monthly burn. Focus entirely on closing Expected pipeline deals.');
    }
    if (decisions.length === 0) {
      decisions.push('Pipeline looks nominal. Focus on scheduling new partner/outreach discovery calls.');
    }

    // Dynamic Focus Recommendation
    let todayFocus = 'Follow up with scheduled meetings and outstanding proposals.';
    if (followupsToday.length > 0) {
      todayFocus = `Execute the ${followupsToday.length} outreach follow-ups scheduled for today.`;
    } else if (overdueFollowups.length > 0) {
      todayFocus = `Clear the ${overdueFollowups.length} OVERDUE outreach follow-ups immediately to regain pipeline momentum.`;
    } else if (paymentFollowUps.length > 0) {
      todayFocus = `Reach out to clients with outstanding invoices (${paymentFollowUps.map(p => p.client_name).join(', ')}) to clear funds.`;
    }

    // Generate Markdown
    const md = `
# Valith OS — Founder Operating Brief
Generated: ${new Date().toLocaleDateString()}

## 1. Executive Cash Summary
- **Current Cash available:** ${cashTotal.toLocaleString()} PKR
- **Received Revenue (Total):** ${receivedRevenue.toLocaleString()} PKR
- **Locked Revenue (SOW Approved):** ${lockedRevenue.toLocaleString()} PKR
- **Expected 30-Day Setup Revenue:** ${expectedRevenue.toLocaleString()} PKR
- **Active MRR Retainers:** ${activeMRR.toLocaleString()} PKR/mo
- **Expected MRR retainers:** ${expectedMRR.toLocaleString()} PKR/mo

## 2. Burn & Runway
- **Monthly Fixed Expenses:** ${monthlyExpenseTotal.toLocaleString()} PKR/mo
- **Net Monthly Burn (Outflow - MRR):** ${netBurn.toLocaleString()} PKR/mo
- **Safe Runway:** ${runway} Months

## 3. High-Priority CRM Pipeline
### Hot Leads (Priority High)
${hotLeads.length > 0 ? hotLeads.map(l => {
  const allowed = ['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].includes(l.stage);
  const estStr = allowed ? `${l.deal_value_estimate.toLocaleString()} PKR` : '—';
  return `- **${l.lead_name}** | Est Setup: ${estStr} | Next: ${l.next_action || 'N/A'}`;
}).join('\n') : '- None'}

### Waiting on Reply
${waitingLeads.length > 0 ? waitingLeads.map(l => `- **${l.lead_name}** | Next action: ${l.next_action || 'N/A'}`).join('\n') : '- None'}

### Follow-ups Today
${followupsToday.length > 0 ? followupsToday.map(l => `- **${l.lead_name}** | F/Up action: ${l.next_action || 'N/A'}`).join('\n') : '- None'}

### Overdue Follow-ups
${overdueFollowups.length > 0 ? overdueFollowups.map(l => `- **${l.lead_name}** | Was due: ${l.next_follow_up_date} | Next action: ${l.next_action || 'N/A'}`).join('\n') : '- None'}

## 4. Document & Meeting Milestones
- **SOWs Sent:** ${proposalsSent.length} (${proposalsSent.map(l => l.lead_name).join(', ') || 'None'})
- **Meetings Scheduled:** ${meetingsScheduled.length} (${meetingsScheduled.map(l => l.lead_name).join(', ') || 'None'})

## 5. Strategic Partners & WHALEs
${strategicLeads.length > 0 ? strategicLeads.map(l => `- **${l.lead_name}** | Segment: ${l.segment} | Stage: ${l.stage}`).join('\n') : '- None'}

## 6. Strategic Decisions Needed
${decisions.map(d => `- [ ] ${d}`).join('\n')}

## 7. Recommended Focus for Today
> **${todayFocus}**
`.trim();

    setBriefMarkdown(md);
  }, [leads, tasks, payments, expenses, cashAccounts, mrrEntries]);

  const handleCopy = () => {
    navigator.clipboard.writeText(briefMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Founder Operating Brief</h1>
          <p className="text-xs text-typography-muted">Formatted markdown report of business operations to drop directly into Gemini/ChatGPT</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 bg-typography hover:bg-typography/90 text-white px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider"
        >
          {copied ? <Check size={14} className="text-aurum" /> : <Copy size={14} className="text-aurum" />}
          <span>{copied ? 'Copied Brief' : 'Copy Brief Markdown'}</span>
        </button>
      </div>

      {/* RENDER BRIEF */}
      <div className="bg-background-card border border-border rounded-lg p-6 shadow-premium font-mono text-xs overflow-x-auto max-h-[650px] overflow-y-auto relative leading-relaxed">
        {/* Aurum Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 gold-gradient"></div>
        <pre className="whitespace-pre-wrap font-sans text-typography-muted">
          {briefMarkdown}
        </pre>
      </div>
    </div>
  );
};
