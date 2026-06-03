import { dbService } from './db';

export async function buildDatabaseContextSummary(): Promise<string> {
  try {
    const [
      orgs,
      leads,
      deals,
      tasks,
      payments,
      mrrEntries,
      expenses,
      cashAccounts,
      documents
    ] = await Promise.all([
      dbService.getOrganizations(),
      dbService.getLeads(),
      dbService.getDeals(),
      dbService.getTasks(),
      dbService.getPayments(),
      dbService.getMRREntries(),
      dbService.getExpenses(),
      dbService.getCashAccounts(),
      dbService.getDocuments()
    ]);

    // 1. CASH ANALYSIS
    const cashTotal = cashAccounts.reduce((acc, c) => acc + c.current_balance, 0);
    const cashSummary = cashAccounts
      .map((c) => `- ${c.account_name}: ${c.current_balance.toLocaleString()} ${c.currency}`)
      .join('\n');

    // 2. REVENUE SUMMARY (Locked, Expected, Received)
    const receivedRevenue = payments
      .filter((p) => p.status === 'Received')
      .reduce((sum, p) => sum + p.amount, 0);
    const lockedRevenue = payments
      .filter((p) => p.status === 'Locked')
      .reduce((sum, p) => sum + p.amount, 0);
    const expectedRevenue = payments
      .filter((p) => p.status === 'Expected')
      .reduce((sum, p) => sum + p.amount, 0);

    // 3. MRR SUMMARY
    const activeMRR = mrrEntries
      .filter((m) => m.status === 'Active')
      .reduce((sum, m) => sum + m.monthly_amount, 0);
    const expectedMRR = mrrEntries
      .filter((m) => m.status === 'Expected')
      .reduce((sum, m) => sum + m.monthly_amount, 0);

    // 4. EXPENSES & BURN
    // Convert all USD expenses to PKR for estimation (e.g. 1 USD = 280 PKR)
    const convertToPKR = (amount: number, currency: string) => {
      if (currency === 'USD') return amount * 280;
      if (currency === 'EUR') return amount * 300;
      return amount;
    };

    const monthlyExpenseTotal = expenses
      .filter((e) => e.billing_type === 'Monthly' && e.payment_status !== 'Cancelled')
      .reduce((sum, e) => sum + convertToPKR(e.amount, e.currency), 0);

    const recurringMonthlyIncomePKR = convertToPKR(activeMRR, 'PKR');
    const netBurn = Math.max(0, monthlyExpenseTotal - recurringMonthlyIncomePKR);
    const runwayMonths = netBurn > 0 ? (cashTotal / netBurn).toFixed(1) : 'Infinite';

    // 5. PIPELINE ANALYSIS
    const activeLeads = leads.filter((l) => l.status === 'Active' || l.status === 'Waiting' || l.status === 'Follow Up');
    const pipelineCountByStage = leads.reduce((acc: Record<string, number>, lead) => {
      acc[lead.stage] = (acc[lead.stage] || 0) + 1;
      return acc;
    }, {});

    const hotLeads = activeLeads
      .filter((l) => l.priority === 'High')
      .map((l) => {
        const isAllowed = ['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].includes(l.stage);
        const estStr = isAllowed ? `${l.deal_value_estimate.toLocaleString()} PKR` : '—';
        return `- ${l.lead_name} (Est: ${estStr}, Stage: ${l.stage}, Next Action: ${l.next_action || 'None'})`;
      });

    const waitingLeads = leads
      .filter((l) => l.status === 'Waiting')
      .map((l) => `- ${l.lead_name} (Stage: ${l.stage}, Next Action: ${l.next_action || 'None'})`);

    // 6. TASKS DUE TODAY / OVERDUE
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter((t) => t.status === 'Open' && t.due_date === todayStr);
    const overdueTasks = tasks.filter((t) => t.status === 'Open' && t.due_date && t.due_date < todayStr);

    const taskSummaryToday = todayTasks.length > 0
      ? todayTasks.map((t) => `- [TODAY] ${t.title} (Priority: ${t.priority})`).join('\n')
      : '- No tasks scheduled for today.';

    const taskSummaryOverdue = overdueTasks.length > 0
      ? overdueTasks.map((t) => `- [OVERDUE] ${t.title} (Due: ${t.due_date})`).join('\n')
      : '- No overdue tasks.';

    // 7. STRATEGIC LEADS
    const strategicLeads = leads
      .filter((l) => l.segment.toLowerCase().includes('strategic') || l.segment.toLowerCase().includes('partner'))
      .map((l) => `- ${l.lead_name} (Segment: ${l.segment}, Stage: ${l.stage})`);

    // 8. COMBINED MARKDOWN BRIEF
    const brief = `
VALITH AI SOLUTIONS COMMAND STATE:

[CASH FLOW]
Total Cash Available: ${cashTotal.toLocaleString()} PKR
Breakdown:
${cashSummary}

[REVENUE METRICS]
Received Revenue: ${receivedRevenue.toLocaleString()} PKR
Locked Revenue: ${lockedRevenue.toLocaleString()} PKR
Expected 30-Day Revenue: ${expectedRevenue.toLocaleString()} PKR
Active MRR: ${activeMRR.toLocaleString()} PKR
Expected MRR: ${expectedMRR.toLocaleString()} PKR

[MONTHLY BURN & RUNWAY]
Monthly Fixed Expenses (Est): ${monthlyExpenseTotal.toLocaleString()} PKR
Net Monthly Burn: ${netBurn.toLocaleString()} PKR
Runway: ${runwayMonths} months

[PIPELINE OVERVIEW]
Active Leads: ${activeLeads.length}
Stage Breakdown:
${Object.entries(pipelineCountByStage).map(([stage, count]) => `- ${stage}: ${count}`).join('\n')}

[HOT LEADS (High Priority)]
${hotLeads.length > 0 ? hotLeads.join('\n') : '- None'}

[WAITING ON REPLY]
${waitingLeads.length > 0 ? waitingLeads.join('\n') : '- None'}

[TODAY'S ACTION ITEMS]
${taskSummaryToday}

[OVERDUE TASKS]
${taskSummaryOverdue}

[STRATEGIC & PARTNER LEADS]
${strategicLeads.length > 0 ? strategicLeads.join('\n') : '- None'}
    `.trim();

    return brief;
  } catch (error) {
    console.error('Error building database context summary:', error);
    return 'Error gathering database context. Please verify database connection.';
  }
}
