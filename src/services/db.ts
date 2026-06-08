import { supabase } from '../supabaseClient';
import {
  Organization,
  Contact,
  Lead,
  Deal,
  Task,
  RevenuePayment,
  MRREntry,
  Expense,
  CashAccount,
  DBDocument,
  AICapture,
  Setting,
  Offer,
  Segment
} from '../types/database.types';

// Helper to generate UUIDs locally
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ----------------------------------------------------
// DB SERVICE INTERFACE
// ----------------------------------------------------
export const dbService = {
  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    const { data, error } = await supabase.from('organizations').select('*').order('name');
    if (error) throw error;
    return data;
  },
  async saveOrganization(org: Omit<Organization, 'created_at' | 'updated_at' | 'id'> & { id?: string }): Promise<Organization> {
    const item: Organization = {
      id: org.id || generateUUID(),
      name: org.name,
      website: org.website,
      linkedin_url: org.linkedin_url,
      industry: org.industry,
      segment: org.segment,
      location: org.location,
      country: org.country,
      city: org.city,
      source_channel: org.source_channel,
      notes: org.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('organizations').upsert(item).select().single();
    if (error) throw error;
    return data;
  },
  async deleteOrganization(id: string): Promise<void> {
    const { error } = await supabase.from('organizations').delete().eq('id', id);
    if (error) throw error;
  },

  // Contacts
  async getContacts(): Promise<Contact[]> {
    const { data, error } = await supabase.from('contacts').select('*').order('full_name');
    if (error) throw error;
    return data;
  },
  async saveContact(contact: Omit<Contact, 'created_at' | 'updated_at' | 'id'> & { id?: string }): Promise<Contact> {
    const item: Contact = {
      id: contact.id || generateUUID(),
      organization_id: contact.organization_id,
      full_name: contact.full_name,
      role_title: contact.role_title,
      seniority: contact.seniority,
      email: contact.email,
      phone: contact.phone,
      whatsapp: contact.whatsapp,
      linkedin_url: contact.linkedin_url,
      relationship_strength: contact.relationship_strength,
      decision_role: contact.decision_role,
      notes: contact.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('contacts').upsert(item).select().single();
    if (error) throw error;
    return data;
  },
  async deleteContact(id: string): Promise<void> {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) throw error;
  },

  // Leads
  async getLeads(): Promise<Lead[]> {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async saveLead(lead: Omit<Lead, 'created_at' | 'updated_at' | 'id'> & { id?: string }): Promise<Lead> {
    const valueAllowedStages = ['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'];
    
    // Automatic stage/meeting sync logic
    let stage = lead.stage;
    let next_meeting_at = lead.next_meeting_at;
    let meeting_type = lead.meeting_type;
    let meeting_status = lead.meeting_status;

    // 1. If lead is moved to "Meeting Scheduled" but has no next_meeting_at, set a default (e.g. today at 5:00 PM)
    if (stage === 'Meeting Scheduled' && !next_meeting_at) {
      const now = new Date();
      now.setHours(17, 0, 0, 0);
      next_meeting_at = now.toISOString();
      if (!meeting_type) meeting_type = 'Discovery Call';
      if (!meeting_status) meeting_status = 'Pending';
    }

    // 2. If next_meeting_at is set, and the lead is in a stage prior to "Meeting Scheduled", update stage to "Meeting Scheduled"
    const priorStages = ['New', 'Connected', 'Messaged', 'Replied', 'Demo Sent'];
    if (next_meeting_at && priorStages.includes(stage)) {
      stage = 'Meeting Scheduled';
      if (!meeting_type) meeting_type = 'Discovery Call';
      if (!meeting_status) meeting_status = 'Scheduled';
    }

    const isValAllowed = valueAllowedStages.includes(stage);
    const finalValue = isValAllowed ? Number(lead.deal_value_estimate || 0) : 0;
    const finalRetainer = isValAllowed ? Number(lead.monthly_retainer_estimate || 0) : 0;

    const item: Lead = {
      id: lead.id || generateUUID(),
      organization_id: lead.organization_id,
      primary_contact_id: lead.primary_contact_id,
      lead_name: lead.lead_name,
      source_channel: lead.source_channel,
      segment: lead.segment,
      offer_angle: lead.offer_angle,
      stage: stage,
      status: lead.status,
      priority: lead.priority,
      probability_percent: Number(lead.probability_percent || 0),
      deal_value_estimate: finalValue,
      monthly_retainer_estimate: finalRetainer,
      next_action: lead.next_action,
      next_follow_up_date: lead.next_follow_up_date,
      last_interaction_date: lead.last_interaction_date,
      pain_points: lead.pain_points,
      buying_signals: lead.buying_signals,
      objections: lead.objections,
      notes: lead.notes,
      next_meeting_at: next_meeting_at,
      meeting_type: meeting_type,
      meeting_status: meeting_status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('leads').upsert(item).select().single();
    if (error) throw error;
    return data;
  },
  async deleteLead(id: string): Promise<void> {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
  },

  // Deals
  async getDeals(): Promise<Deal[]> {
    const { data, error } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async saveDeal(deal: Omit<Deal, 'created_at' | 'updated_at' | 'id'> & { id?: string }): Promise<Deal> {
    const item: Deal = {
      id: deal.id || generateUUID(),
      lead_id: deal.lead_id,
      organization_id: deal.organization_id,
      deal_name: deal.deal_name,
      offer_type: deal.offer_type,
      stage: deal.stage,
      setup_fee_amount: Number(deal.setup_fee_amount || 0),
      retainer_amount: Number(deal.retainer_amount || 0),
      currency: deal.currency,
      probability_percent: Number(deal.probability_percent || 0),
      expected_close_date: deal.expected_close_date,
      closed_date: deal.closed_date,
      status: deal.status,
      notes: deal.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('deals').upsert(item).select().single();
    if (error) throw error;
    return data;
  },
  async deleteDeal(id: string): Promise<void> {
    const { error } = await supabase.from('deals').delete().eq('id', id);
    if (error) throw error;
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase.from('tasks').select('*').order('due_date', { ascending: true });
    if (error) throw error;
    return data;
  },
  async saveTask(task: Omit<Task, 'created_at' | 'updated_at' | 'id'> & { id?: string }): Promise<Task> {
    const item: Task = {
      id: task.id || generateUUID(),
      lead_id: task.lead_id,
      organization_id: task.organization_id,
      deal_id: task.deal_id,
      title: task.title,
      description: task.description,
      task_type: task.task_type,
      due_date: task.due_date,
      due_time: task.due_time,
      priority: task.priority,
      status: task.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('tasks').upsert(item).select().single();
    if (error) throw error;
    return data;
  },
  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },

  // Revenue Payments
  async getPayments(): Promise<RevenuePayment[]> {
    const { data, error } = await supabase.from('revenue_payments').select('*').order('due_date', { ascending: true });
    if (error) throw error;
    return data;
  },
  async savePayment(payment: Omit<RevenuePayment, 'created_at' | 'updated_at' | 'id'> & { id?: string }): Promise<RevenuePayment> {
    const item: RevenuePayment = {
      id: payment.id || generateUUID(),
      organization_id: payment.organization_id,
      lead_id: payment.lead_id,
      deal_id: payment.deal_id,
      client_name: payment.client_name,
      revenue_type: payment.revenue_type,
      amount: Number(payment.amount || 0),
      currency: payment.currency,
      status: payment.status,
      invoice_sent_date: payment.invoice_sent_date,
      due_date: payment.due_date,
      received_date: payment.received_date,
      payment_method: payment.payment_method,
      notes: payment.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('revenue_payments').upsert(item).select().single();
    if (error) throw error;
    return data;
  },
  async deletePayment(id: string): Promise<void> {
    const { error } = await supabase.from('revenue_payments').delete().eq('id', id);
    if (error) throw error;
  },

  // MRR Entries
  async getMRREntries(): Promise<MRREntry[]> {
    const { data, error } = await supabase.from('mrr_entries').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async saveMRREntry(mrr: Omit<MRREntry, 'created_at' | 'updated_at' | 'id'> & { id?: string }): Promise<MRREntry> {
    const item: MRREntry = {
      id: mrr.id || generateUUID(),
      organization_id: mrr.organization_id,
      deal_id: mrr.deal_id,
      client_name: mrr.client_name,
      service_name: mrr.service_name,
      monthly_amount: Number(mrr.monthly_amount || 0),
      currency: mrr.currency,
      status: mrr.status,
      start_date: mrr.start_date,
      next_billing_date: mrr.next_billing_date,
      end_date: mrr.end_date,
      notes: mrr.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('mrr_entries').upsert(item).select().single();
    if (error) throw error;
    return data;
  },
  async deleteMRREntry(id: string): Promise<void> {
    const { error } = await supabase.from('mrr_entries').delete().eq('id', id);
    if (error) throw error;
  },

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    const { data, error } = await supabase.from('expenses').select('*').order('due_date', { ascending: true });
    if (error) throw error;
    return data;
  },
  async saveExpense(exp: Omit<Expense, 'created_at' | 'updated_at' | 'id'> & { id?: string }): Promise<Expense> {
    const item: Expense = {
      id: exp.id || generateUUID(),
      expense_name: exp.expense_name,
      vendor: exp.vendor,
      category: exp.category,
      amount: Number(exp.amount || 0),
      currency: exp.currency,
      billing_type: exp.billing_type,
      payment_status: exp.payment_status,
      due_date: exp.due_date,
      paid_date: exp.paid_date,
      notes: exp.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('expenses').upsert(item).select().single();
    if (error) throw error;
    return data;
  },
  async deleteExpense(id: string): Promise<void> {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
  },

  // Cash Accounts
  async getCashAccounts(): Promise<CashAccount[]> {
    const { data, error } = await supabase.from('cash_accounts').select('*').order('account_name');
    if (error) throw error;
    return data;
  },
  async saveCashAccount(acc: Omit<CashAccount, 'updated_at' | 'id'> & { id?: string }): Promise<CashAccount> {
    const item: CashAccount = {
      id: acc.id || generateUUID(),
      account_name: acc.account_name,
      account_type: acc.account_type,
      currency: acc.currency,
      current_balance: Number(acc.current_balance || 0),
      notes: acc.notes,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('cash_accounts').upsert(item).select().single();
    if (error) throw error;
    return data;
  },
  async deleteCashAccount(id: string): Promise<void> {
    const { error } = await supabase.from('cash_accounts').delete().eq('id', id);
    if (error) throw error;
  },

  // Documents
  async getDocuments(): Promise<DBDocument[]> {
    const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async saveDocument(doc: Omit<DBDocument, 'created_at' | 'updated_at' | 'id'> & { id?: string }): Promise<DBDocument> {
    const item: DBDocument = {
      id: doc.id || generateUUID(),
      organization_id: doc.organization_id,
      lead_id: doc.lead_id,
      deal_id: doc.deal_id,
      title: doc.title,
      document_type: doc.document_type,
      file_url: doc.file_url,
      storage_path: doc.storage_path,
      status: doc.status,
      sent_date: doc.sent_date,
      notes: doc.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('documents').upsert(item).select().single();
    if (error) throw error;
    return data;
  },
  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw error;
  },

  // AI Captures
  async getAICaptures(): Promise<AICapture[]> {
    const { data, error } = await supabase.from('ai_captures').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async saveAICapture(cap: Omit<AICapture, 'created_at' | 'updated_at' | 'id'> & { id?: string }): Promise<AICapture> {
    const item: AICapture = {
      id: cap.id || generateUUID(),
      source: cap.source,
      raw_text: cap.raw_text,
      parsed_json: cap.parsed_json,
      status: cap.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('ai_captures').upsert(item).select().single();
    if (error) throw error;
    return data;
  },
  async deleteAICapture(id: string): Promise<void> {
    const { error } = await supabase.from('ai_captures').delete().eq('id', id);
    if (error) throw error;
  },

  // Settings
  async getSettings(): Promise<Setting[]> {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) throw error;
    return data;
  },
  async saveSetting(key: string, value: string): Promise<Setting> {
    const { data, error } = await supabase.from('settings').upsert({ key, value }).select().single();
    if (error) throw error;
    return data;
  },

  // Offers
  async getOffers(): Promise<Offer[]> {
    const { data, error } = await supabase.from('offers').select('*').order('name');
    if (error) throw error;
    return data;
  },
  async saveOffer(offer: Omit<Offer, 'created_at' | 'updated_at' | 'id'> & { id?: string }): Promise<Offer> {
    const item: Offer = {
      id: offer.id || generateUUID(),
      name: offer.name,
      description: offer.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('offers').upsert(item).select().single();
    if (error) throw error;
    return data;
  },
  async deleteOffer(id: string): Promise<void> {
    const { error } = await supabase.from('offers').delete().eq('id', id);
    if (error) throw error;
  },

  // Segments
  async getSegments(): Promise<Segment[]> {
    const { data, error } = await supabase.from('segments').select('*').order('name');
    if (error) throw error;
    return data;
  },
  async saveSegment(segment: Omit<Segment, 'created_at' | 'updated_at' | 'id'> & { id?: string }): Promise<Segment> {
    const item: Segment = {
      id: segment.id || generateUUID(),
      name: segment.name,
      description: segment.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('segments').upsert(item).select().single();
    if (error) throw error;
    return data;
  },
  async deleteSegment(id: string): Promise<void> {
    const { error } = await supabase.from('segments').delete().eq('id', id);
    if (error) throw error;
  },

  // Client Portal secure RPC query
  async getClientPortalData(token: string): Promise<any> {
    const { data, error } = await supabase.rpc('get_client_portal_data', { p_token: token });
    if (error) throw error;
    return data;
  },

  async submitClientFeedback(token: string, title: string, description: string): Promise<any> {
    const { data, error } = await supabase.rpc('submit_client_feedback', {
      p_token: token,
      p_title: title,
      p_description: description
    });
    if (error) throw error;
    return data;
  }
};
