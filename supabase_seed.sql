-- Supabase Seed Data for Valith OS v0

-- Clear existing data if necessary (order matters due to FKs)
TRUNCATE settings, ai_captures, documents, cash_accounts, expenses, mrr_entries, revenue_payments, tasks, deals, leads, contacts, organizations CASCADE;

-- Insert Cash Accounts
INSERT INTO cash_accounts (id, account_name, account_type, currency, current_balance, notes) VALUES
('a0000000-0000-0000-0000-000000000001', 'Valith Primary Bank', 'Bank', 'PKR', 520000, 'Primary operating account'),
('a0000000-0000-0000-0000-000000000002', 'Founder Cash Wallet', 'Wallet', 'PKR', 35000, 'Cash in hand for daily transit/meals');

-- Insert Organizations
INSERT INTO organizations (id, name, website, linkedin_url, industry, segment, location, country, city, source_channel, notes) VALUES
('b0000000-0000-0000-0000-000000000001', 'Optimize Digital', 'https://optimizedigital.pk', 'https://linkedin.com/company/optimize-digital', 'Digital Media', 'A2 RFP Active / Closed Client', 'Islamabad', 'Pakistan', 'Islamabad', 'LinkedIn', 'SOW signed, deployment complete'),
('b0000000-0000-0000-0000-000000000002', 'MARCEM', 'https://marcem.com', NULL, 'Events & Institutional', 'A2 RFP Active', 'Islamabad', 'Pakistan', 'Rawalpindi', 'Referral', 'Sheraz is involved in operations/sales/tenders'),
('b0000000-0000-0000-0000-000000000003', 'Protribes', 'https://protribes.com', 'https://linkedin.com/company/protribes', 'Tech Platform', 'A2 RFP Active', 'Islamabad', 'Pakistan', 'Islamabad', 'LinkedIn', 'CEO is Ahmad Javad'),
('b0000000-0000-0000-0000-000000000004', 'Sardar Group', NULL, NULL, 'Government Contracting', 'A2/A3 RFP Possible', 'Peshawar', 'Pakistan', 'Peshawar', 'Manual', 'Has current provider, SOW sent'),
('b0000000-0000-0000-0000-000000000005', 'Lumenex', 'https://lumenex.co', 'https://linkedin.com/company/lumenex', 'Technology', 'Foreign Partner', 'London', 'UK', 'London', 'LinkedIn', 'Strategic partner call booked for June 12'),
('b0000000-0000-0000-0000-000000000006', 'Hind Legal', 'https://hindlegal.com', NULL, 'Legal Services', 'Foreign Strategic', 'Dubai', 'UAE', 'Dubai', 'Email', 'Jeanina routed to Hind'),
('b0000000-0000-0000-0000-000000000007', 'HRUK / Winston Tech', 'https://winstontechnologyzone.com', 'https://linkedin.com/in/farhan-qureshi-47219632', 'HR & IT Services', 'Strategic Local/Foreign', 'Lahore', 'Pakistan', 'Lahore', 'LinkedIn', 'Farhan Qureshi CEO'),
('b0000000-0000-0000-0000-000000000008', 'Prestige Events', NULL, NULL, 'Event Management', 'A2/A3 RFP Possible', 'Karachi', 'Pakistan', 'Karachi', 'WhatsApp', 'Syed Adnan'),
('b0000000-0000-0000-0000-000000000009', 'Topline PR', 'https://toplinepr.com.pk', NULL, 'Public Relations', 'A4 Workflow Fit', 'Islamabad', 'Pakistan', 'Islamabad', 'LinkedIn', 'Call suggested they do not actively chase tenders. Better fit for WhatsApp workflows.'),
('b0000000-0000-0000-0000-000000000010', 'Long-Tail Outreach Group', NULL, NULL, 'Various', 'Foreign Partner', 'Various', 'Various', 'Various', 'LinkedIn', 'Hasan, Hadi, Ahsan, Misix, Dirk pipeline');

-- Insert Contacts
INSERT INTO contacts (id, organization_id, full_name, role_title, seniority, email, phone, whatsapp, linkedin_url, relationship_strength, decision_role, notes) VALUES
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Imran Ghazali', 'Founder & CEO', 'Founder', 'imran@optimizedigital.pk', NULL, NULL, NULL, 'Strong', 'Economic Buyer', 'Valith first customer'),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Sheraz', 'Head of Tenders & Sales', 'Director', NULL, NULL, NULL, NULL, 'Warm', 'Champion', 'Went to GIKI for tender submission. Strong workflow fit.'),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'Ahmad Javad', 'CEO', 'Founder', 'info@protribes.com', NULL, NULL, NULL, 'Warm', 'Economic Buyer', 'Replied in 3 mins on LinkedIn'),
('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'Sardar', 'Managing Director', 'Executive', NULL, NULL, NULL, NULL, 'Cold', 'Economic Buyer', 'Has current provider'),
('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'Karina', 'Partnership Lead', 'Director', 'karina@lumenex.co', NULL, NULL, NULL, 'Warm', 'Champion', 'Call booked June 12'),
('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 'Hind', 'Managing Partner', 'Founder', 'hind@hindlegal.com', NULL, NULL, NULL, 'Cold', 'Economic Buyer', 'Routed by Jeanina'),
('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', 'Farhan Qureshi', 'CEO', 'Founder', 'farhan@winstontech.com', NULL, NULL, 'http://www.linkedin.com/in/farhan-qureshi-47219632', 'Warm', 'Economic Buyer', 'Winston Technology Zone'),
('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000008', 'Syed Adnan', 'Operations Lead', 'Director', NULL, NULL, NULL, NULL, 'Cold', 'Champion', 'Voice note sent'),
('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', 'Topline CEO', 'CEO', 'Founder', NULL, NULL, NULL, NULL, 'Cold', 'Economic Buyer', 'PR firm CEO'),
('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000010', 'Dirk', 'Sales Partner', 'Director', NULL, NULL, NULL, NULL, 'Cold', 'User', 'Misix/Dirk contact');

-- Insert Leads
INSERT INTO leads (id, organization_id, primary_contact_id, lead_name, source_channel, segment, offer_angle, stage, status, priority, probability_percent, deal_value_estimate, monthly_retainer_estimate, next_action, next_follow_up_date, pain_points, buying_signals, objections, notes) VALUES
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Optimize Digital RFP Intelligence', 'LinkedIn', 'A2 RFP Active / Closed Client', 'RFP Intelligence', 'Closed Won', 'Closed', 'High', 100, 150000, 0, 'Project delivery and support', NULL, 'Manual reading of large RFPs', 'Signed SOW and invoice', NULL, 'First official Valith RFP deployment. SOW signed, invoice acknowledged.'),
('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'MARCEM RFP Automation', 'Referral', 'A2 RFP Active', 'RFP Intelligence', 'Meeting Scheduled', 'Active', 'High', 45, 0, 0, 'Confirm meeting time and office pin.', '2026-06-03', 'Time-consuming manual tender formatting', 'Responded positively to setup meeting', 'Pending time/pin confirmation', 'Event/institutional agency. Meeting moved to tomorrow.'),
('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Protribes RFP Intelligence', 'LinkedIn', 'A2 RFP Active', 'RFP Intelligence', 'Replied', 'Active', 'High', 20, 0, 0, 'Send concise RFP details email and confirm on LinkedIn.', '2026-06-04', 'High overhead matching bidding requirements', 'Replied in 3 minutes with email', 'Needs custom pitch', 'CEO shared info@protribes.com for details.'),
('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 'Sardar RFP Setup', 'Manual', 'A2/A3 RFP Possible', 'RFP Intelligence', 'SOW Sent', 'Waiting', 'Medium', 15, 180000, 0, 'Follow up later with optional demo video offer.', '2026-06-08', 'Already has service provider', 'Looked at proposal PDF', 'Existing service provider', 'One-page Valith RFP proposal PDF sent and seen.'),
('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', 'Lumenex AI Partner', 'LinkedIn', 'Foreign Partner', 'Partner/Implementation', 'Meeting Scheduled', 'Active', 'High', 30, 0, 0, 'Prepare partnership/pilot call brief before June 12.', '2026-06-11', 'Lacks local tech deployment resources', 'Booked a call for June 12', 'Timezones, margin splits', 'Strategic foreign partner lead. High international upside.'),
('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000006', 'Hind Legal LegalTech', 'Email', 'Foreign Strategic', 'AI Workflow Audit', 'Routed to Contact', 'Active', 'High', 15, 0, 0, 'Email Hind and track response.', '2026-06-05', 'Doc review overhead in legal drafting', 'Recommended by Jeanina', 'Unknown budget', 'Jeanina routed Aimel to Hind for invitation.'),
('d0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000007', 'HRUK Lead Acquisition', 'LinkedIn', 'Strategic Local/Foreign', 'Lead Follow-up', 'Messaged', 'Waiting', 'Medium', 10, 0, 0, 'Reach out offering workflow pipeline help.', '2026-06-09', 'Client acquisition and follow-up follow through', 'Warm previous reply', 'May prefer operations over RFP', 'Warm reply. Focus on workflow/operations automation.'),
('d0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000008', 'Prestige RFP Integration', 'WhatsApp', 'A2/A3 RFP Possible', 'RFP Intelligence', 'Messaged', 'Waiting', 'Medium', 10, 0, 0, 'Follow up on WhatsApp voice note.', '2026-06-07', 'Manual PR RFP processing', 'Read voice note and message', 'No response yet', 'Corporate event lead. DM and voice note sent.'),
('d0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000009', 'Topline PR WhatsApp Lead', 'LinkedIn', 'A4 Workflow Fit', 'WhatsApp Workflow Assistant', 'Cold', 'Cold', 'Low', 5, 0, 0, 'Archive or follow up later for WhatsApp.', NULL, 'Not actively chasing tenders', 'Not chasing RFPs', 'No immediate RFP interest', 'Call suggested PR firm is cold for RFP but fit for WhatsApp workflows later.'),
('d0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000010', 'Dirk / Misix long-tail', 'LinkedIn', 'Foreign Partner', 'Partner/Implementation', 'Connected', 'Waiting', 'Low', 5, 0, 0, 'Monitor update', NULL, 'Outreach tracking', NULL, NULL, 'Part of long-tail outreach pipeline.');

-- Insert Deals
INSERT INTO deals (id, lead_id, organization_id, deal_name, offer_type, stage, setup_fee_amount, retainer_amount, currency, probability_percent, expected_close_date, status, notes) VALUES
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Optimize Digital - RFP Deployment', 'RFP Intelligence', 'Closed Won', 150000, 0, 'PKR', 100, '2026-05-30', 'Active', 'First commercial deploy.'),
('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'MARCEM RFP Setup & Retainer', 'RFP Intelligence', 'Discovery', 225000, 45000, 'PKR', 45, '2026-06-15', 'Active', 'GIKI tender submit. Strong operational fit.');


-- Insert Tasks
INSERT INTO tasks (id, lead_id, organization_id, deal_id, title, description, task_type, due_date, due_time, priority, status) VALUES
('fa000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'Confirm meeting time & pin with Sheraz', 'Ask Sheraz for the office address pin and exact time for tomorrow''s meeting.', 'Meeting', '2026-06-03', '10:00', 'High', 'Open'),
('fa000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', NULL, 'Send RFP details to info@protribes.com', 'Draft and email a concise RFP intelligence proposal and mention CEO Linkedin connection.', 'Proposal', '2026-06-04', '14:00', 'High', 'Open'),
('fa000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', NULL, 'Prepare Lumenex partner briefing', 'Review Lumenex website and draft the AI Workflow Mapping joint pilot brief.', 'Admin', '2026-06-11', '17:00', 'Medium', 'Open');

-- Insert Revenue Payments
INSERT INTO revenue_payments (id, organization_id, lead_id, deal_id, client_name, revenue_type, amount, currency, status, invoice_sent_date, due_date, received_date, payment_method, notes) VALUES
('fb000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Optimize Digital', 'Project', 150000, 'PKR', 'Locked', '2026-05-29', '2026-06-05', NULL, NULL, 'SOW signed, treating as locked for planning. Delivery starts on clearance.'),
('fb000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'MARCEM', 'Project', 225000, 'PKR', 'Expected', NULL, '2026-06-20', NULL, NULL, 'Setup fee on successful close.');

-- Insert MRR Entries
INSERT INTO mrr_entries (id, organization_id, deal_id, client_name, service_name, monthly_amount, currency, status, start_date, next_billing_date, notes) VALUES
('fc000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'MARCEM', 'RFP Search & Parse', 45000, 'PKR', 'Expected', '2026-07-01', '2026-07-01', 'Potential monthly retainer for RFP service.');

-- Insert Expenses
INSERT INTO expenses (id, expense_name, vendor, category, amount, currency, billing_type, payment_status, due_date, paid_date, notes) VALUES
('fd000000-0000-0000-0000-000000000001', 'ChatGPT Plus Subscription', 'OpenAI', 'Software', 20, 'USD', 'Monthly', 'Paid', '2026-06-01', '2026-06-01', 'AI drafting assistance'),
('fd000000-0000-0000-0000-000000000002', 'Claude Pro Account', 'Anthropic', 'Software', 20, 'USD', 'Monthly', 'Paid', '2026-06-01', '2026-06-01', 'Coding & architecture research'),
('fd000000-0000-0000-0000-000000000003', 'Valith.tech domain', 'Namecheap', 'Domain', 12, 'USD', 'Yearly', 'Paid', '2026-01-15', '2026-01-15', 'Yearly renew'),
('fd000000-0000-0000-0000-000000000004', 'Hosting & Database Infrastructure', 'Supabase', 'Hosting', 25, 'USD', 'Monthly', 'Upcoming', '2026-06-15', NULL, 'Database & backend APIs'),
('fd000000-0000-0000-0000-000000000005', 'Client Transit Rawalpindi', 'Local Transport', 'Transport', 5000, 'PKR', 'One-time', 'Paid', '2026-05-30', '2026-05-30', 'Taxi/Fuel to client offices'),
('fd000000-0000-0000-0000-000000000006', 'Content Scheduler Tools', 'Buffer', 'Tools', 15, 'USD', 'Monthly', 'Upcoming', '2026-06-10', NULL, 'Linkedin post schedules'),
('fd000000-0000-0000-0000-000000000007', 'Ads A/B Testing', 'Meta Ads', 'Ads', 15000, 'PKR', 'One-time', 'Paid', '2026-05-25', '2026-05-25', 'RFP service lead gen test');

-- Insert Settings
INSERT INTO settings (key, value) VALUES
('company_name', 'Valith AI Solutions'),
('founder_name', 'Valith Founder'),
('base_currency', 'PKR'),
('mrr_goal', '1000000');

-- Insert Offers
INSERT INTO offers (id, name, description) VALUES
('b1000000-0000-0000-0000-000000000001', 'RFP Intelligence', 'AI parsing & scoring of large RFP documents'),
('b1000000-0000-0000-0000-000000000002', 'WhatsApp Workflow Assistant', 'Autonomous WhatsApp messaging/scheduling integrations'),
('b1000000-0000-0000-0000-000000000003', 'AI Workflow Audit', 'Deep-dive operational discovery & architecture maps'),
('b1000000-0000-0000-0000-000000000004', 'Inbox Automation', 'Eon-based routing/processing of inbound inquiry mail'),
('b1000000-0000-0000-0000-000000000005', 'Partner/Implementation', 'Joint software delivery or strategic outsourcing'),
('b1000000-0000-0000-0000-000000000006', 'Other', 'Custom dynamic project offering');

-- Insert Segments
INSERT INTO segments (id, name, description) VALUES
('b2000000-0000-0000-0000-000000000001', 'A1 Whale', 'High-value enterprise target (>$500k ARR potential)'),
('b2000000-0000-0000-0000-000000000002', 'A2 RFP Active', 'Actively bidding on tenders and RFPs'),
('b2000000-0000-0000-0000-000000000003', 'A3 Smaller RFP Active', 'Mid-market RFP and tender bidders'),
('b2000000-0000-0000-0000-000000000004', 'A4 Workflow Fit', 'Heavy back-office administration overhead'),
('b2000000-0000-0000-0000-000000000005', 'Foreign Partner', 'Outreach & distribution alliance partners'),
('b2000000-0000-0000-0000-000000000006', 'Strategic', 'High-leverage target relationships'),
('b2000000-0000-0000-0000-000000000007', 'Other', 'Uncategorized lead segment');

