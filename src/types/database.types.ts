// Database Types for Valith OS

export interface Organization {
  id: string;
  name: string;
  website?: string;
  linkedin_url?: string;
  industry?: string;
  segment?: string; // A1 Whale, A2 RFP Active, etc.
  location?: string;
  country?: string;
  city?: string;
  source_channel?: string;
  notes?: string;
  client_token?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  organization_id: string;
  full_name: string;
  role_title?: string;
  seniority?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  linkedin_url?: string;
  relationship_strength: 'Cold' | 'Warm' | 'Strong' | 'Strategic';
  decision_role: 'Economic Buyer' | 'Champion' | 'User' | 'Influencer' | 'Gatekeeper' | 'Unknown';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  organization_id: string;
  primary_contact_id?: string;
  lead_name: string;
  source_channel: 'LinkedIn' | 'WhatsApp' | 'Email' | 'Referral' | 'Website' | 'Event' | 'Manual' | 'Other';
  segment: string;
  offer_angle: string;
  stage: 'New' | 'Connected' | 'Messaged' | 'Replied' | 'Demo Sent' | 'Meeting Scheduled' | 'SOW Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost' | 'Cold' | 'Archived' | 'Routed to Contact';
  status: 'Active' | 'Waiting' | 'Follow Up' | 'Closed' | 'Cold' | 'Archived';
  priority: 'High' | 'Medium' | 'Low';
  probability_percent: number;
  deal_value_estimate: number;
  monthly_retainer_estimate: number;
  next_action?: string;
  next_follow_up_date?: string | null;
  last_interaction_date?: string;
  pain_points?: string;
  buying_signals?: string;
  objections?: string;
  notes?: string;
  next_meeting_at?: string | null;
  meeting_type?: string | null;
  meeting_status?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  lead_id?: string;
  organization_id: string;
  deal_name: string;
  offer_type: string;
  stage: 'Discovery' | 'Demo' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost' | 'Paused';
  setup_fee_amount: number;
  retainer_amount: number;
  currency: 'PKR' | 'USD' | 'EUR' | 'Other';
  probability_percent: number;
  expected_close_date?: string;
  closed_date?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}


export interface Task {
  id: string;
  lead_id?: string;
  organization_id?: string;
  deal_id?: string;
  title: string;
  description?: string;
  task_type: 'Follow-up' | 'Call' | 'Meeting' | 'Proposal' | 'Payment' | 'Delivery' | 'Admin' | 'Content' | 'Other';
  due_date?: string;
  due_time?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Done' | 'Snoozed' | 'Cancelled';
  created_at: string;
  updated_at: string;
}

export interface RevenuePayment {
  id: string;
  organization_id: string;
  lead_id?: string;
  deal_id?: string;
  client_name: string;
  revenue_type: 'Project' | 'Retainer' | 'Maintenance' | 'Subscription' | 'Partnership' | 'Other';
  amount: number;
  currency: 'PKR' | 'USD' | 'EUR' | 'Other';
  status: 'Expected' | 'Locked' | 'Invoiced' | 'Received' | 'Overdue' | 'Cancelled';
  invoice_sent_date?: string;
  due_date?: string;
  received_date?: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MRREntry {
  id: string;
  organization_id: string;
  deal_id?: string;
  client_name: string;
  service_name: string;
  monthly_amount: number;
  currency: 'PKR' | 'USD' | 'EUR' | 'Other';
  status: 'Active' | 'Expected' | 'Paused' | 'Cancelled';
  start_date?: string;
  next_billing_date?: string;
  end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  expense_name: string;
  vendor?: string;
  category: 'Tools' | 'Ads' | 'Transport' | 'Coworking' | 'Hosting' | 'Domain' | 'Software' | 'Contractors' | 'Food/Meeting' | 'Other';
  amount: number;
  currency: 'PKR' | 'USD' | 'EUR' | 'Other';
  billing_type: 'One-time' | 'Monthly' | 'Yearly';
  payment_status: 'Paid' | 'Upcoming' | 'Overdue' | 'Cancelled';
  due_date?: string;
  paid_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CashAccount {
  id: string;
  account_name: string;
  account_type: 'Bank' | 'Cash' | 'Wallet' | 'Other';
  currency: string;
  current_balance: number;
  notes?: string;
  updated_at: string;
}

export interface DBDocument {
  id: string;
  organization_id?: string;
  lead_id?: string;
  deal_id?: string;
  title: string;
  document_type: 'Proposal' | 'SOW' | 'Invoice' | 'Contract' | 'Demo' | 'Case Study' | 'Notes' | 'Other';
  file_url?: string;
  storage_path?: string;
  status: 'Draft' | 'Sent' | 'Viewed' | 'Signed' | 'Archived';
  sent_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AICapture {
  id: string;
  source: 'WhatsApp' | 'LinkedIn' | 'Email' | 'Call' | 'Meeting' | 'ChatGPT' | 'Manual Note' | 'Other';
  raw_text: string;
  parsed_json?: any;
  status: 'Parsed' | 'Applied' | 'Needs Review' | 'Failed';
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Segment {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

