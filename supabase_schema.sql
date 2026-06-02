-- Supabase Database Schema for Valith OS v0
-- Internal command center for Valith AI Solutions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    website TEXT,
    linkedin_url TEXT,
    industry TEXT,
    segment TEXT,
    location TEXT,
    country TEXT,
    city TEXT,
    source_channel TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 2. Contacts
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role_title TEXT,
    seniority TEXT,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    linkedin_url TEXT,
    relationship_strength TEXT DEFAULT 'Cold', -- Cold, Warm, Strong, Strategic
    decision_role TEXT DEFAULT 'Unknown',      -- Economic Buyer, Champion, User, Influencer, Gatekeeper, Unknown
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON contacts
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. Leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    primary_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    lead_name TEXT NOT NULL,
    source_channel TEXT DEFAULT 'Manual', -- LinkedIn, WhatsApp, Email, Referral, Website, Event, Manual, Other
    segment TEXT, -- A1 Whale, A2 RFP Active, A3 Smaller RFP Active, A4 Workflow Fit, Foreign Partner, WhatsApp Lead, Inbox Workflow, Strategic, Other
    offer_angle TEXT, -- RFP Intelligence, WhatsApp Workflow Assistant, AI Workflow Audit, Inbox Automation, Partner/Implementation, Lead Follow-up, Other
    stage TEXT DEFAULT 'New', -- New, Connected, Messaged, Replied, Demo Sent, Meeting Scheduled, SOW Sent, Negotiation, Closed Won, Closed Lost, Cold, Archived
    status TEXT DEFAULT 'Active', -- Active, Waiting, Follow Up, Closed, Cold, Archived
    priority TEXT DEFAULT 'Medium', -- High, Medium, Low
    probability_percent INTEGER DEFAULT 0,
    deal_value_estimate NUMERIC DEFAULT 0,
    monthly_retainer_estimate NUMERIC DEFAULT 0,
    next_action TEXT,
    next_follow_up_date DATE,
    last_interaction_date DATE,
    pain_points TEXT,
    buying_signals TEXT,
    objections TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. Deals
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    deal_name TEXT NOT NULL,
    offer_type TEXT, -- RFP Intelligence, WhatsApp Workflow, AI Workflow Audit, Inbox Automation, Partnership, Other
    stage TEXT DEFAULT 'Discovery', -- Discovery, Demo, Proposal, Negotiation, Closed Won, Closed Lost, Paused
    setup_fee_amount NUMERIC DEFAULT 0,
    retainer_amount NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD', -- PKR, USD, EUR, Other
    probability_percent INTEGER DEFAULT 0,
    expected_close_date DATE,
    closed_date DATE,
    status TEXT DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_deals_updated_at
BEFORE UPDATE ON deals
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- 6. Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT NOT NULL, -- Follow-up, Call, Meeting, Proposal, Payment, Delivery, Admin, Content, Other
    due_date DATE,
    due_time TEXT,
    priority TEXT DEFAULT 'Medium', -- High, Medium, Low
    status TEXT DEFAULT 'Open', -- Open, In Progress, Done, Snoozed, Cancelled
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. Revenue Payments
CREATE TABLE revenue_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    revenue_type TEXT NOT NULL, -- Project, Retainer, Maintenance, Subscription, Partnership, Other
    amount NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD', -- PKR, USD, EUR, Other
    status TEXT NOT NULL, -- Expected, Locked, Invoiced, Received, Overdue, Cancelled
    invoice_sent_date DATE,
    due_date DATE,
    received_date DATE,
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_revenue_payments_updated_at
BEFORE UPDATE ON revenue_payments
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 8. MRR Entries
CREATE TABLE mrr_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    service_name TEXT NOT NULL,
    monthly_amount NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL, -- Active, Expected, Paused, Cancelled
    start_date DATE,
    next_billing_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_mrr_entries_updated_at
BEFORE UPDATE ON mrr_entries
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 9. Expenses
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_name TEXT NOT NULL,
    vendor TEXT,
    category TEXT NOT NULL, -- Tools, Ads, Transport, Coworking, Hosting, Domain, Software, Contractors, Food/Meeting, Other
    amount NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD', -- PKR, USD, EUR, Other
    billing_type TEXT NOT NULL, -- One-time, Monthly, Yearly
    payment_status TEXT NOT NULL, -- Paid, Upcoming, Overdue, Cancelled
    due_date DATE,
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON expenses
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 10. Cash Accounts
CREATE TABLE cash_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL, -- Bank, Cash, Wallet, Other
    currency TEXT DEFAULT 'PKR',
    current_balance NUMERIC DEFAULT 0,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_cash_accounts_updated_at
BEFORE UPDATE ON cash_accounts
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 11. Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL, -- Proposal, SOW, Invoice, Contract, Demo, Case Study, Notes, Other
    file_url TEXT,
    storage_path TEXT,
    status TEXT DEFAULT 'Draft', -- Draft, Sent, Viewed, Signed, Archived
    sent_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 12. AI Captures
CREATE TABLE ai_captures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL, -- WhatsApp, LinkedIn, Email, Call, Meeting, ChatGPT, Manual Note, Other
    raw_text TEXT NOT NULL,
    parsed_json JSONB,
    status TEXT DEFAULT 'Needs Review', -- Parsed, Applied, Needs Review, Failed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_ai_captures_updated_at
BEFORE UPDATE ON ai_captures
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 13. Settings
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mrr_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (single founder setup)
-- In a simple single-founder system, authenticated users can read and write all data.
CREATE POLICY "Allow all actions for authenticated users" ON organizations TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for authenticated users" ON contacts TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for authenticated users" ON leads TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for authenticated users" ON deals TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for authenticated users" ON tasks TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for authenticated users" ON revenue_payments TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for authenticated users" ON mrr_entries TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for authenticated users" ON expenses TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for authenticated users" ON cash_accounts TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for authenticated users" ON documents TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for authenticated users" ON ai_captures TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for authenticated users" ON settings TO authenticated USING (true) WITH CHECK (true);

-- 14. Offers
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_offers_updated_at
BEFORE UPDATE ON offers
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 15. Segments
CREATE TABLE segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_segments_updated_at
BEFORE UPDATE ON segments
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all actions for authenticated users" ON offers TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for authenticated users" ON segments TO authenticated USING (true) WITH CHECK (true);

