import { supabase, isSupabaseConfigured } from '../supabaseClient';
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
// LOCAL STORAGE SEED DATA
// ----------------------------------------------------
const SEED_ORGANIZATIONS: Organization[] = [
  { id: 'o-1', name: 'Optimize Digital', website: 'https://optimizedigital.pk', linkedin_url: 'https://linkedin.com/company/optimize-digital', industry: 'Digital Media', segment: 'A2 RFP Active / Closed Client', location: 'Islamabad', country: 'Pakistan', city: 'Islamabad', source_channel: 'LinkedIn', notes: 'SOW signed, deployment complete', created_at: '2026-05-24T10:00:00Z', updated_at: '2026-05-24T10:00:00Z' },
  { id: 'o-2', name: 'MARCEM', website: 'https://marcem.com', industry: 'Events & Institutional', segment: 'A2 RFP Active', location: 'Islamabad', country: 'Pakistan', city: 'Rawalpindi', source_channel: 'Referral', notes: 'Sheraz is involved in operations/sales/tenders', created_at: '2026-06-01T11:00:00Z', updated_at: '2026-06-01T11:00:00Z' },
  { id: 'o-3', name: 'Protribes', website: 'https://protribes.com', linkedin_url: 'https://linkedin.com/company/protribes', industry: 'Tech Platform', segment: 'A2 RFP Active', location: 'Islamabad', country: 'Pakistan', city: 'Islamabad', source_channel: 'LinkedIn', notes: 'CEO is Ahmad Javad', created_at: '2026-06-02T09:00:00Z', updated_at: '2026-06-02T09:00:00Z' },
  { id: 'o-4', name: 'Sardar Group', industry: 'Government Contracting', segment: 'A2/A3 RFP Possible', location: 'Peshawar', country: 'Pakistan', city: 'Peshawar', source_channel: 'Manual', notes: 'Has current provider, SOW sent', created_at: '2026-05-28T09:00:00Z', updated_at: '2026-05-28T09:00:00Z' },
  { id: 'o-5', name: 'Lumenex', website: 'https://lumenex.co', linkedin_url: 'https://linkedin.com/company/lumenex', industry: 'Technology', segment: 'Foreign Partner', location: 'London', country: 'UK', city: 'London', source_channel: 'LinkedIn', notes: 'Strategic partner call booked for June 12', created_at: '2026-05-29T12:00:00Z', updated_at: '2026-05-29T12:00:00Z' },
  { id: 'o-6', name: 'Hind Legal', website: 'https://hindlegal.com', industry: 'Legal Services', segment: 'Foreign Strategic', location: 'Dubai', country: 'UAE', city: 'Dubai', source_channel: 'Email', notes: 'Jeanina routed to Hind', created_at: '2026-06-01T15:00:00Z', updated_at: '2026-06-01T15:00:00Z' },
  { id: 'o-7', name: 'HRUK / Winston Tech', website: 'https://winstontechnologyzone.com', linkedin_url: 'https://linkedin.com/in/farhan-qureshi-47219632', industry: 'HR & IT Services', segment: 'Strategic Local/Foreign', location: 'Lahore', country: 'Pakistan', city: 'Lahore', source_channel: 'LinkedIn', notes: 'Farhan Qureshi CEO', created_at: '2026-05-20T10:00:00Z', updated_at: '2026-05-20T10:00:00Z' },
  { id: 'o-8', name: 'Prestige Events', industry: 'Event Management', segment: 'A2/A3 RFP Possible', location: 'Karachi', country: 'Pakistan', city: 'Karachi', source_channel: 'WhatsApp', notes: 'Syed Adnan', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'o-9', name: 'Topline PR', website: 'https://toplinepr.com.pk', industry: 'Public Relations', segment: 'A4 Workflow Fit', location: 'Islamabad', country: 'Pakistan', city: 'Islamabad', source_channel: 'LinkedIn', notes: 'PR firm, cold for RFPs, potential for WhatsApp later', created_at: '2026-05-18T10:00:00Z', updated_at: '2026-05-18T10:00:00Z' },
  { id: 'o-10', name: 'Long-Tail Outreach Group', industry: 'Various', segment: 'Foreign Partner', location: 'Various', country: 'Various', city: 'Various', source_channel: 'LinkedIn', notes: 'Hasan, Hadi, Ahsan, Misix, Dirk pipeline', created_at: '2026-05-01T12:00:00Z', updated_at: '2026-05-01T12:00:00Z' }
];

const SEED_CONTACTS: Contact[] = [
  { id: 'c-1', organization_id: 'o-1', full_name: 'Imran Ghazali', role_title: 'Founder & CEO', seniority: 'Founder', email: 'imran@optimizedigital.pk', relationship_strength: 'Strong', decision_role: 'Economic Buyer', notes: 'Valith first customer', created_at: '2026-05-24T10:00:00Z', updated_at: '2026-05-24T10:00:00Z' },
  { id: 'c-2', organization_id: 'o-2', full_name: 'Sheraz', role_title: 'Head of Tenders & Sales', seniority: 'Director', relationship_strength: 'Warm', decision_role: 'Champion', notes: 'Went to GIKI for tender submission. Strong workflow fit.', created_at: '2026-06-01T11:00:00Z', updated_at: '2026-06-01T11:00:00Z' },
  { id: 'c-3', organization_id: 'o-3', full_name: 'Ahmad Javad', role_title: 'CEO', seniority: 'Founder', email: 'info@protribes.com', relationship_strength: 'Warm', decision_role: 'Economic Buyer', notes: 'Replied in 3 mins on LinkedIn', created_at: '2026-06-02T09:00:00Z', updated_at: '2026-06-02T09:00:00Z' },
  { id: 'c-4', organization_id: 'o-4', full_name: 'Sardar', role_title: 'Managing Director', seniority: 'Executive', relationship_strength: 'Cold', decision_role: 'Economic Buyer', notes: 'Has current provider', created_at: '2026-05-28T09:00:00Z', updated_at: '2026-05-28T09:00:00Z' },
  { id: 'c-5', organization_id: 'o-5', full_name: 'Karina', role_title: 'Partnership Lead', seniority: 'Director', email: 'karina@lumenex.co', relationship_strength: 'Warm', decision_role: 'Champion', notes: 'Call booked June 12', created_at: '2026-05-29T12:00:00Z', updated_at: '2026-05-29T12:00:00Z' },
  { id: 'c-6', organization_id: 'o-6', full_name: 'Hind', role_title: 'Managing Partner', seniority: 'Founder', email: 'hind@hindlegal.com', relationship_strength: 'Cold', decision_role: 'Economic Buyer', notes: 'Routed by Jeanina', created_at: '2026-06-01T15:00:00Z', updated_at: '2026-06-01T15:00:00Z' },
  { id: 'c-7', organization_id: 'o-7', full_name: 'Farhan Qureshi', role_title: 'CEO', seniority: 'Founder', email: 'farhan@winstontech.com', linkedin_url: 'http://www.linkedin.com/in/farhan-qureshi-47219632', relationship_strength: 'Warm', decision_role: 'Economic Buyer', notes: 'Winston Technology Zone', created_at: '2026-05-20T10:00:00Z', updated_at: '2026-05-20T10:00:00Z' },
  { id: 'c-8', organization_id: 'o-8', full_name: 'Syed Adnan', role_title: 'Operations Lead', seniority: 'Director', relationship_strength: 'Cold', decision_role: 'Champion', notes: 'Voice note sent', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'c-9', organization_id: 'o-9', full_name: 'Topline CEO', role_title: 'CEO', seniority: 'Founder', relationship_strength: 'Cold', decision_role: 'Economic Buyer', notes: 'PR firm CEO', created_at: '2026-05-18T10:00:00Z', updated_at: '2026-05-18T10:00:00Z' },
  { id: 'c-10', organization_id: 'o-10', full_name: 'Dirk', role_title: 'Sales Partner', seniority: 'Director', relationship_strength: 'Cold', decision_role: 'User', notes: 'Misix/Dirk contact', created_at: '2026-05-01T12:00:00Z', updated_at: '2026-05-01T12:00:00Z' }
];

const SEED_LEADS: Lead[] = [
  { id: 'l-1', organization_id: 'o-1', primary_contact_id: 'c-1', lead_name: 'Optimize Digital RFP Intelligence', source_channel: 'LinkedIn', segment: 'A2 RFP Active / Closed Client', offer_angle: 'RFP Intelligence', stage: 'Closed Won', status: 'Closed', priority: 'High', probability_percent: 100, deal_value_estimate: 150000, monthly_retainer_estimate: 0, next_action: 'Project delivery and support', pain_points: 'Manual reading of large RFPs', buying_signals: 'Signed SOW and invoice', notes: 'First official Valith RFP deployment. SOW signed, invoice acknowledged.', created_at: '2026-05-24T10:00:00Z', updated_at: '2026-05-24T10:00:00Z' },
  { id: 'l-2', organization_id: 'o-2', primary_contact_id: 'c-2', lead_name: 'MARCEM RFP Automation', source_channel: 'Referral', segment: 'A2 RFP Active', offer_angle: 'RFP Intelligence', stage: 'Meeting Scheduled', status: 'Active', priority: 'High', probability_percent: 45, deal_value_estimate: 0, monthly_retainer_estimate: 0, next_action: 'Confirm meeting time and office pin.', next_follow_up_date: '2026-06-03', last_interaction_date: '2026-06-01', pain_points: 'Time-consuming manual tender formatting', buying_signals: 'Responded positively to setup meeting', objections: 'Pending time/pin confirmation', notes: 'Event/institutional agency. Meeting moved to tomorrow.', created_at: '2026-06-01T11:00:00Z', updated_at: '2026-06-01T11:00:00Z' },
  { id: 'l-3', organization_id: 'o-3', primary_contact_id: 'c-3', lead_name: 'Protribes RFP Intelligence', source_channel: 'LinkedIn', segment: 'A2 RFP Active', offer_angle: 'RFP Intelligence', stage: 'Replied', status: 'Active', priority: 'High', probability_percent: 20, deal_value_estimate: 0, monthly_retainer_estimate: 0, next_action: 'Send concise RFP details email and confirm on LinkedIn.', next_follow_up_date: '2026-06-04', last_interaction_date: '2026-06-02', pain_points: 'High overhead matching bidding requirements', buying_signals: 'Replied in 3 minutes with email', objections: 'Needs custom pitch', notes: 'CEO shared info@protribes.com for details.', created_at: '2026-06-02T09:00:00Z', updated_at: '2026-06-02T09:00:00Z' },
  { id: 'l-4', organization_id: 'o-4', primary_contact_id: 'c-4', lead_name: 'Sardar RFP Setup', source_channel: 'Manual', segment: 'A2/A3 RFP Possible', offer_angle: 'RFP Intelligence', stage: 'SOW Sent', status: 'Waiting', priority: 'Medium', probability_percent: 15, deal_value_estimate: 180000, monthly_retainer_estimate: 0, next_action: 'Follow up later with optional demo video offer.', next_follow_up_date: '2026-06-08', last_interaction_date: '2026-05-28', pain_points: 'Already has service provider', buying_signals: 'Looked at proposal PDF', objections: 'Existing service provider', notes: 'One-page Valith RFP proposal PDF sent and seen.', created_at: '2026-05-28T09:00:00Z', updated_at: '2026-05-28T09:00:00Z' },
  { id: 'l-5', organization_id: 'o-5', primary_contact_id: 'c-5', lead_name: 'Lumenex AI Partner', source_channel: 'LinkedIn', segment: 'Foreign Partner', offer_angle: 'Partner/Implementation', stage: 'Meeting Scheduled', status: 'Active', priority: 'High', probability_percent: 30, deal_value_estimate: 0, monthly_retainer_estimate: 0, next_action: 'Prepare partnership/pilot call brief before June 12.', next_follow_up_date: '2026-06-11', last_interaction_date: '2026-05-29', pain_points: 'Lacks local tech deployment resources', buying_signals: 'Booked a call for June 12', objections: 'Timezones, margin splits', notes: 'Strategic foreign partner lead. High international upside.', created_at: '2026-05-29T12:00:00Z', updated_at: '2026-05-29T12:00:00Z' },
  { id: 'l-6', organization_id: 'o-6', primary_contact_id: 'c-6', lead_name: 'Hind Legal LegalTech', source_channel: 'Email', segment: 'Foreign Strategic', offer_angle: 'AI Workflow Audit', stage: 'Routed to Contact', status: 'Active', priority: 'High', probability_percent: 15, deal_value_estimate: 0, monthly_retainer_estimate: 0, next_action: 'Email Hind and track response.', next_follow_up_date: '2026-06-05', last_interaction_date: '2026-06-01', pain_points: 'Doc review overhead in legal drafting', buying_signals: 'Recommended by Jeanina', objections: 'Unknown budget', notes: 'Jeanina routed Aimel to Hind for invitation.', created_at: '2026-06-01T15:00:00Z', updated_at: '2026-06-01T15:00:00Z' },
  { id: 'l-7', organization_id: 'o-7', primary_contact_id: 'c-7', lead_name: 'HRUK Lead Acquisition', source_channel: 'LinkedIn', segment: 'Strategic Local/Foreign', offer_angle: 'Lead Follow-up', stage: 'Messaged', status: 'Waiting', priority: 'Medium', probability_percent: 10, deal_value_estimate: 0, monthly_retainer_estimate: 0, next_action: 'Reach out offering workflow pipeline help.', next_follow_up_date: '2026-06-09', last_interaction_date: '2026-05-20', pain_points: 'Client acquisition and follow-up follow through', buying_signals: 'Warm previous reply', objections: 'May prefer operations over RFP', notes: 'Warm reply. Focus on workflow/operations automation.', created_at: '2026-05-20T10:00:00Z', updated_at: '2026-05-20T10:00:00Z' },
  { id: 'l-8', organization_id: 'o-8', primary_contact_id: 'c-8', lead_name: 'Prestige RFP Integration', source_channel: 'WhatsApp', segment: 'A2/A3 RFP Possible', offer_angle: 'RFP Intelligence', stage: 'Messaged', status: 'Waiting', priority: 'Medium', probability_percent: 10, deal_value_estimate: 0, monthly_retainer_estimate: 0, next_action: 'Follow up on WhatsApp voice note.', next_follow_up_date: '2026-06-07', last_interaction_date: '2026-06-01', pain_points: 'Manual PR RFP processing', buying_signals: 'Read voice note and message', objections: 'No response yet', notes: 'Corporate event lead. DM and voice note sent.', created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
  { id: 'l-9', organization_id: 'o-9', primary_contact_id: 'c-9', lead_name: 'Topline PR WhatsApp Lead', source_channel: 'LinkedIn', segment: 'A4 Workflow Fit', offer_angle: 'WhatsApp Workflow Assistant', stage: 'Cold', status: 'Cold', priority: 'Low', probability_percent: 5, deal_value_estimate: 0, monthly_retainer_estimate: 0, next_action: 'Archive or follow up later for WhatsApp.', last_interaction_date: '2026-05-18', pain_points: 'Not actively chasing tenders', objections: 'No immediate RFP interest', notes: 'Call suggested PR firm is cold for RFP but fit for WhatsApp workflows later.', created_at: '2026-05-18T10:00:00Z', updated_at: '2026-05-18T10:00:00Z' },
  { id: 'l-10', organization_id: 'o-10', primary_contact_id: 'c-10', lead_name: 'Dirk / Misix long-tail', source_channel: 'LinkedIn', segment: 'Foreign Partner', offer_angle: 'Partner/Implementation', stage: 'Connected', status: 'Waiting', priority: 'Low', probability_percent: 5, deal_value_estimate: 0, monthly_retainer_estimate: 0, next_action: 'Monitor update', last_interaction_date: '2026-05-01', notes: 'Part of long-tail outreach pipeline.', created_at: '2026-05-01T12:00:00Z', updated_at: '2026-05-01T12:00:00Z' }
];

const SEED_DEALS: Deal[] = [
  { id: 'd-deal-1', lead_id: 'l-1', organization_id: 'o-1', deal_name: 'Optimize Digital - RFP Deployment', offer_type: 'RFP Intelligence', stage: 'Closed Won', setup_fee_amount: 150000, retainer_amount: 0, currency: 'PKR', probability_percent: 100, expected_close_date: '2026-05-30', closed_date: '2026-05-30', status: 'Active', notes: 'First commercial deploy.', created_at: '2026-05-24T10:00:00Z', updated_at: '2026-05-24T10:00:00Z' },
  { id: 'd-deal-2', lead_id: 'l-2', organization_id: 'o-2', deal_name: 'MARCEM RFP Setup & Retainer', offer_type: 'RFP Intelligence', stage: 'Discovery', setup_fee_amount: 225000, retainer_amount: 45000, currency: 'PKR', probability_percent: 45, expected_close_date: '2026-06-15', status: 'Active', notes: 'GIKI tender submit. Strong operational fit.', created_at: '2026-06-01T11:00:00Z', updated_at: '2026-06-01T11:00:00Z' }
];

const SEED_TASKS: Task[] = [
  { id: 't-1', lead_id: 'l-2', organization_id: 'o-2', deal_id: 'd-deal-2', title: 'Confirm meeting time & pin with Sheraz', description: 'Ask Sheraz for the office address pin and exact time for tomorrow\'s meeting.', task_type: 'Meeting', due_date: '2026-06-03', due_time: '10:00', priority: 'High', status: 'Open', created_at: '2026-06-02T15:00:00Z', updated_at: '2026-06-02T15:00:00Z' },
  { id: 't-2', lead_id: 'l-3', organization_id: 'o-3', title: 'Send RFP details to info@protribes.com', description: 'Draft and email a concise RFP intelligence proposal and mention CEO Linkedin connection.', task_type: 'Proposal', due_date: '2026-06-04', due_time: '14:00', priority: 'High', status: 'Open', created_at: '2026-06-02T15:00:00Z', updated_at: '2026-06-02T15:00:00Z' },
  { id: 't-3', lead_id: 'l-5', organization_id: 'o-5', title: 'Prepare Lumenex partner briefing', description: 'Review Lumenex website and draft the AI Workflow Mapping joint pilot brief.', task_type: 'Admin', due_date: '2026-06-11', due_time: '17:00', priority: 'Medium', status: 'Open', created_at: '2026-06-02T15:00:00Z', updated_at: '2026-06-02T15:00:00Z' }
];

const SEED_PAYMENTS: RevenuePayment[] = [
  { id: 'p-1', organization_id: 'o-1', lead_id: 'l-1', deal_id: 'd-deal-1', client_name: 'Optimize Digital', revenue_type: 'Project', amount: 150000, currency: 'PKR', status: 'Locked', invoice_sent_date: '2026-05-29', due_date: '2026-06-05', notes: 'SOW signed, treating as locked for planning. Delivery starts on clearance.', created_at: '2026-05-29T12:00:00Z', updated_at: '2026-05-29T12:00:00Z' },
  { id: 'p-2', organization_id: 'o-2', lead_id: 'l-2', deal_id: 'd-deal-2', client_name: 'MARCEM', revenue_type: 'Project', amount: 225000, currency: 'PKR', status: 'Expected', due_date: '2026-06-20', notes: 'Setup fee on successful close.', created_at: '2026-06-01T11:00:00Z', updated_at: '2026-06-01T11:00:00Z' }
];

const SEED_MRR: MRREntry[] = [
  { id: 'mrr-1', organization_id: 'o-2', deal_id: 'd-deal-2', client_name: 'MARCEM', service_name: 'RFP Search & Parse', monthly_amount: 45000, currency: 'PKR', status: 'Expected', start_date: '2026-07-01', next_billing_date: '2026-07-01', notes: 'Potential monthly retainer for RFP service.', created_at: '2026-06-01T11:00:00Z', updated_at: '2026-06-01T11:00:00Z' }
];

const SEED_EXPENSES: Expense[] = [
  { id: 'e-1', expense_name: 'ChatGPT Plus Subscription', vendor: 'OpenAI', category: 'Software', amount: 20, currency: 'USD', billing_type: 'Monthly', payment_status: 'Paid', due_date: '2026-06-01', paid_date: '2026-06-01', notes: 'AI drafting assistance', created_at: '2026-06-01T00:00:00Z', updated_at: '2026-06-01T00:00:00Z' },
  { id: 'e-2', expense_name: 'Claude Pro Account', vendor: 'Anthropic', category: 'Software', amount: 20, currency: 'USD', billing_type: 'Monthly', payment_status: 'Paid', due_date: '2026-06-01', paid_date: '2026-06-01', notes: 'Coding & architecture research', created_at: '2026-06-01T00:00:00Z', updated_at: '2026-06-01T00:00:00Z' },
  { id: 'e-3', expense_name: 'Valith.tech domain', vendor: 'Namecheap', category: 'Domain', amount: 12, currency: 'USD', billing_type: 'Yearly', payment_status: 'Paid', due_date: '2026-01-15', paid_date: '2026-01-15', notes: 'Yearly renew', created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z' },
  { id: 'e-4', expense_name: 'Hosting & Database Infrastructure', vendor: 'Supabase', category: 'Hosting', amount: 25, currency: 'USD', billing_type: 'Monthly', payment_status: 'Upcoming', due_date: '2026-06-15', notes: 'Database & backend APIs', created_at: '2026-06-01T00:00:00Z', updated_at: '2026-06-01T00:00:00Z' },
  { id: 'e-5', expense_name: 'Client Transit Rawalpindi', vendor: 'Local Transport', category: 'Transport', amount: 5000, currency: 'PKR', billing_type: 'One-time', payment_status: 'Paid', due_date: '2026-05-30', paid_date: '2026-05-30', notes: 'Taxi/Fuel to client offices', created_at: '2026-05-30T00:00:00Z', updated_at: '2026-05-30T00:00:00Z' },
  { id: 'e-6', expense_name: 'Content Scheduler Tools', vendor: 'Buffer', category: 'Tools', amount: 15, currency: 'USD', billing_type: 'Monthly', payment_status: 'Upcoming', due_date: '2026-06-10', notes: 'Linkedin post schedules', created_at: '2026-06-01T00:00:00Z', updated_at: '2026-06-01T00:00:00Z' },
  { id: 'e-7', expense_name: 'Ads A/B Testing', vendor: 'Meta Ads', category: 'Ads', amount: 15000, currency: 'PKR', billing_type: 'One-time', payment_status: 'Paid', due_date: '2026-05-25', paid_date: '2026-05-25', notes: 'RFP service lead gen test', created_at: '2026-05-25T00:00:00Z', updated_at: '2026-05-25T00:00:00Z' }
];

const SEED_CASH_ACCOUNTS: CashAccount[] = [
  { id: 'ca-1', account_name: 'Valith Primary Bank', account_type: 'Bank', currency: 'PKR', current_balance: 520000, updated_at: '2026-06-02T12:00:00Z' },
  { id: 'ca-2', account_name: 'Founder Cash Wallet', account_type: 'Wallet', currency: 'PKR', current_balance: 35000, updated_at: '2026-06-02T12:00:00Z' }
];

const SEED_SETTINGS: Setting[] = [
  { id: 's-1', key: 'company_name', value: 'Valith AI Solutions', created_at: '2026-06-01T00:00:00Z', updated_at: '2026-06-01T00:00:00Z' },
  { id: 's-2', key: 'founder_name', value: 'Valith Founder', created_at: '2026-06-01T00:00:00Z', updated_at: '2026-06-01T00:00:00Z' },
  { id: 's-3', key: 'base_currency', value: 'PKR', created_at: '2026-06-01T00:00:00Z', updated_at: '2026-06-01T00:00:00Z' },
  { id: 's-4', key: 'mrr_goal', value: '1000000', created_at: '2026-06-01T00:00:00Z', updated_at: '2026-06-01T00:00:00Z' }
];

const SEED_OFFERS: Offer[] = [
  { id: 'off-1', name: 'RFP Intelligence', description: 'AI parsing & scoring of large RFP documents' },
  { id: 'off-2', name: 'WhatsApp Workflow Assistant', description: 'Autonomous WhatsApp messaging/scheduling integrations' },
  { id: 'off-3', name: 'AI Workflow Audit', description: 'Deep-dive operational discovery & architecture maps' },
  { id: 'off-4', name: 'Inbox Automation', description: 'Eon-based routing/processing of inbound inquiry mail' },
  { id: 'off-5', name: 'Partner/Implementation', description: 'Joint software delivery or strategic outsourcing' },
  { id: 'off-6', name: 'Other', description: 'Custom dynamic project offering' }
];

const SEED_SEGMENTS: Segment[] = [
  { id: 'seg-1', name: 'A1 Whale', description: 'High-value enterprise target (>$500k ARR potential)' },
  { id: 'seg-2', name: 'A2 RFP Active', description: 'Actively bidding on tenders and RFPs' },
  { id: 'seg-3', name: 'A3 Smaller RFP Active', description: 'Mid-market RFP and tender bidders' },
  { id: 'seg-4', name: 'A4 Workflow Fit', description: 'Heavy back-office administration overhead' },
  { id: 'seg-5', name: 'Foreign Partner', description: 'Outreach & distribution alliance partners' },
  { id: 'seg-6', name: 'Strategic', description: 'High-leverage target relationships' },
  { id: 'seg-7', name: 'Other', description: 'Uncategorized lead segment' }
];

// Helper to initialize local storage
function initLocalStorage() {
  if (!localStorage.getItem('vos_organizations')) {
    localStorage.setItem('vos_organizations', JSON.stringify(SEED_ORGANIZATIONS));
    localStorage.setItem('vos_contacts', JSON.stringify(SEED_CONTACTS));
    localStorage.setItem('vos_leads', JSON.stringify(SEED_LEADS));
    localStorage.setItem('vos_deals', JSON.stringify(SEED_DEALS));
    localStorage.setItem('vos_tasks', JSON.stringify(SEED_TASKS));
    localStorage.setItem('vos_revenue_payments', JSON.stringify(SEED_PAYMENTS));
    localStorage.setItem('vos_mrr_entries', JSON.stringify(SEED_MRR));
    localStorage.setItem('vos_expenses', JSON.stringify(SEED_EXPENSES));
    localStorage.setItem('vos_cash_accounts', JSON.stringify(SEED_CASH_ACCOUNTS));
    localStorage.setItem('vos_documents', JSON.stringify([]));
    localStorage.setItem('vos_ai_captures', JSON.stringify([]));
    localStorage.setItem('vos_settings', JSON.stringify(SEED_SETTINGS));
    localStorage.setItem('vos_offers', JSON.stringify(SEED_OFFERS));
    localStorage.setItem('vos_segments', JSON.stringify(SEED_SEGMENTS));
  }
}

// Initialize on import
initLocalStorage();

// Generic Local Storage Actions
function getLocal<T>(key: string): T[] {
  return JSON.parse(localStorage.getItem(`vos_${key}`) || '[]');
}

function saveLocal<T extends { id: string }>(key: string, items: T[]): void {
  localStorage.setItem(`vos_${key}`, JSON.stringify(items));
}

function upsertLocal<T extends { id: string }>(key: string, item: T): T {
  const items = getLocal<T>(key);
  const index = items.findIndex((i) => i.id === item.id);
  const nowStr = new Date().toISOString();
  
  const updatedItem = {
    ...item,
    updated_at: nowStr,
    created_at: index >= 0 ? (items[index] as any).created_at || nowStr : nowStr
  };

  if (index >= 0) {
    items[index] = updatedItem;
  } else {
    items.push(updatedItem);
  }
  saveLocal(key, items);
  return updatedItem;
}

function deleteLocal<T extends { id: string }>(key: string, id: string): void {
  const items = getLocal<T>(key);
  const filtered = items.filter((i) => i.id !== id);
  saveLocal(key, filtered);
}

// ----------------------------------------------------
// DB SERVICE INTERFACE
// ----------------------------------------------------
export const dbService = {
  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('organizations').select('*').order('name');
      if (!error && data) return data;
      console.error('Supabase query error, fallback to local:', error);
    }
    return getLocal<Organization>('organizations');
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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('organizations').upsert(item).select().single();
      if (!error && data) return data;
      console.error('Supabase save error, fallback to local:', error);
    }
    return upsertLocal<Organization>('organizations', item);
  },
  async deleteOrganization(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('organizations').delete().eq('id', id);
      if (!error) return;
      console.error('Supabase delete error, fallback to local:', error);
    }
    deleteLocal<Organization>('organizations', id);
  },

  // Contacts
  async getContacts(): Promise<Contact[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('contacts').select('*').order('full_name');
      if (!error && data) return data;
    }
    return getLocal<Contact>('contacts');
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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('contacts').upsert(item).select().single();
      if (!error && data) return data;
    }
    return upsertLocal<Contact>('contacts', item);
  },
  async deleteContact(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (!error) return;
    }
    deleteLocal<Contact>('contacts', id);
  },

  // Leads
  async getLeads(): Promise<Lead[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal<Lead>('leads');
  },
  async saveLead(lead: Omit<Lead, 'created_at' | 'updated_at' | 'id'> & { id?: string }): Promise<Lead> {
    const valueAllowedStages = ['SOW Sent', 'Negotiation', 'Closed Won', 'Closed Lost'];
    const isValAllowed = valueAllowedStages.includes(lead.stage);
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
      stage: lead.stage,
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('leads').upsert(item).select().single();
      if (!error && data) return data;
    }
    return upsertLocal<Lead>('leads', item);
  },
  async deleteLead(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (!error) return;
    }
    deleteLocal<Lead>('leads', id);
  },

  // Deals
  async getDeals(): Promise<Deal[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal<Deal>('deals');
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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('deals').upsert(item).select().single();
      if (!error && data) return data;
    }
    return upsertLocal<Deal>('deals', item);
  },
  async deleteDeal(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('deals').delete().eq('id', id);
      if (!error) return;
    }
    deleteLocal<Deal>('deals', id);
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('tasks').select('*').order('due_date', { ascending: true });
      if (!error && data) return data;
    }
    return getLocal<Task>('tasks');
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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('tasks').upsert(item).select().single();
      if (!error && data) return data;
    }
    return upsertLocal<Task>('tasks', item);
  },
  async deleteTask(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (!error) return;
    }
    deleteLocal<Task>('tasks', id);
  },

  // Revenue Payments
  async getPayments(): Promise<RevenuePayment[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('revenue_payments').select('*').order('due_date', { ascending: true });
      if (!error && data) return data;
    }
    return getLocal<RevenuePayment>('revenue_payments');
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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('revenue_payments').upsert(item).select().single();
      if (!error && data) return data;
    }
    return upsertLocal<RevenuePayment>('revenue_payments', item);
  },
  async deletePayment(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('revenue_payments').delete().eq('id', id);
      if (!error) return;
    }
    deleteLocal<RevenuePayment>('revenue_payments', id);
  },

  // MRR Entries
  async getMRREntries(): Promise<MRREntry[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('mrr_entries').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal<MRREntry>('mrr_entries');
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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('mrr_entries').upsert(item).select().single();
      if (!error && data) return data;
    }
    return upsertLocal<MRREntry>('mrr_entries', item);
  },
  async deleteMRREntry(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('mrr_entries').delete().eq('id', id);
      if (!error) return;
    }
    deleteLocal<MRREntry>('mrr_entries', id);
  },

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('expenses').select('*').order('due_date', { ascending: true });
      if (!error && data) return data;
    }
    return getLocal<Expense>('expenses');
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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('expenses').upsert(item).select().single();
      if (!error && data) return data;
    }
    return upsertLocal<Expense>('expenses', item);
  },
  async deleteExpense(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (!error) return;
    }
    deleteLocal<Expense>('expenses', id);
  },

  // Cash Accounts
  async getCashAccounts(): Promise<CashAccount[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('cash_accounts').select('*').order('account_name');
      if (!error && data) return data;
    }
    return getLocal<CashAccount>('cash_accounts');
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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('cash_accounts').upsert(item).select().single();
      if (!error && data) return data;
    }
    return upsertLocal<CashAccount>('cash_accounts', item);
  },
  async deleteCashAccount(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('cash_accounts').delete().eq('id', id);
      if (!error) return;
    }
    deleteLocal<CashAccount>('cash_accounts', id);
  },

  // Documents
  async getDocuments(): Promise<DBDocument[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal<DBDocument>('documents');
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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('documents').upsert(item).select().single();
      if (!error && data) return data;
    }
    return upsertLocal<DBDocument>('documents', item);
  },
  async deleteDocument(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (!error) return;
    }
    deleteLocal<DBDocument>('documents', id);
  },

  // AI Captures
  async getAICaptures(): Promise<AICapture[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('ai_captures').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return getLocal<AICapture>('ai_captures');
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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('ai_captures').upsert(item).select().single();
      if (!error && data) return data;
    }
    return upsertLocal<AICapture>('ai_captures', item);
  },
  async deleteAICapture(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('ai_captures').delete().eq('id', id);
      if (!error) return;
    }
    deleteLocal<AICapture>('ai_captures', id);
  },

  // Settings
  async getSettings(): Promise<Setting[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('settings').select('*');
      if (!error && data) return data;
    }
    return getLocal<Setting>('settings');
  },
  async saveSetting(key: string, value: string): Promise<Setting> {
    const settings = getLocal<Setting>('settings');
    const existing = settings.find((s) => s.key === key);
    const item: Setting = {
      id: existing?.id || generateUUID(),
      key,
      value,
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('settings').upsert({ key, value }).select().single();
      if (!error && data) return data;
    }
    return upsertLocal<Setting>('settings', item);
  },

  // Offers
  async getOffers(): Promise<Offer[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('offers').select('*').order('name');
      if (!error && data) return data;
    }
    return getLocal<Offer>('offers');
  },
  async saveOffer(offer: Omit<Offer, 'created_at' | 'updated_at' | 'id'> & { id?: string }): Promise<Offer> {
    const item: Offer = {
      id: offer.id || generateUUID(),
      name: offer.name,
      description: offer.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('offers').upsert(item).select().single();
      if (!error && data) return data;
    }
    return upsertLocal<Offer>('offers', item);
  },
  async deleteOffer(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('offers').delete().eq('id', id);
      if (!error) return;
    }
    deleteLocal<Offer>('offers', id);
  },

  // Segments
  async getSegments(): Promise<Segment[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('segments').select('*').order('name');
      if (!error && data) return data;
    }
    return getLocal<Segment>('segments');
  },
  async saveSegment(segment: Omit<Segment, 'created_at' | 'updated_at' | 'id'> & { id?: string }): Promise<Segment> {
    const item: Segment = {
      id: segment.id || generateUUID(),
      name: segment.name,
      description: segment.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('segments').upsert(item).select().single();
      if (!error && data) return data;
    }
    return upsertLocal<Segment>('segments', item);
  },
  async deleteSegment(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('segments').delete().eq('id', id);
      if (!error) return;
    }
    deleteLocal<Segment>('segments', id);
  }
};
