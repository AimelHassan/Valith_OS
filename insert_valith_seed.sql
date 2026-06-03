-- Standalone Seed Script for Valith OS v0
-- Based on the Valith OS Seed Brief as of 2026-06-03
-- Valid Hex-digit UUID Fixes applied

-- Clear existing data if necessary (CASCADE automatically handles foreign keys)
TRUNCATE settings, ai_captures, documents, cash_accounts, expenses, mrr_entries, revenue_payments, tasks, deals, leads, contacts, organizations, offers, segments CASCADE;

-- 1. Insert Core Offers
INSERT INTO offers (id, name, description) VALUES
('a1000000-0000-0000-0000-000000000001', 'RFP Intelligence', 'Tender parsing, compliance checking, fit assessment and compliance reports.'),
('a1000000-0000-0000-0000-000000000002', 'WhatsApp Workflow', 'Inbound WhatsApp customer routing, lead qualification, and automatic intake.'),
('a1000000-0000-0000-0000-000000000003', 'AI Workflow Audit', 'Process diagnostic audit to highlight automation leverage points.'),
('a1000000-0000-0000-0000-000000000004', 'Inbox Automation', 'Eon-style email processing, automatic categorization, and context generation.'),
('a1000000-0000-0000-0000-000000000005', 'Lead Qualification', 'Screening qualification checklists and dynamic CRM syncing.'),
('a1000000-0000-0000-0000-000000000006', 'Partnership', 'Implementation partnership, workflow mapping, and AI-enabled operations.'),
('a1000000-0000-0000-0000-000000000007', 'Other', 'General custom AI development and systems consulting.');

-- 2. Insert Core Segments
INSERT INTO segments (id, name, description) VALUES
('ae100000-0000-0000-0000-000000000001', 'A1 Whale', 'Enterprise targets with massive workflow overhead'),
('ae100000-0000-0000-0000-000000000002', 'A2 RFP Active', 'Organizations actively bidding on RFPs/Tenders'),
('ae100000-0000-0000-0000-000000000003', 'A3 Smaller RFP Active', 'Medium event-planning or operational bidding teams'),
('ae100000-0000-0000-0000-000000000004', 'A4 Workflow Fit', 'Heavy back-office admin tasks, messaging or intake workload'),
('ae100000-0000-0000-0000-000000000005', 'Foreign Lead', 'International outbound sales leads'),
('ae100000-0000-0000-0000-000000000006', 'Foreign Partner', 'Outsource implementation partner network'),
('ae100000-0000-0000-0000-000000000007', 'Foreign Strategic', 'Saudi / GCC cross-border advisory, legal-tech networks'),
('ae100000-0000-0000-0000-000000000008', 'Market Insight', 'PR, media, communications connectors for research'),
('ae100000-0000-0000-0000-000000000009', 'Connector', 'Advisory policy connectors for referral networks'),
('ae100000-0000-0000-0000-000000000010', 'Archived / Cold', 'Accounts flagged as inactive, archived, or cold');

-- 3. Insert Settings
INSERT INTO settings (key, value) VALUES
('company_name', 'Valith AI Solutions'),
('founder_name', 'Aimel Hassan Shakir'),
('founder_email', 'aimel@valith.tech'),
('base_currency', 'PKR'),
('mrr_goal', '1000000');

-- 4. Insert Cash Accounts
INSERT INTO cash_accounts (id, account_name, account_type, currency, current_balance, notes) VALUES
('ca000000-0000-0000-0000-000000000001', 'Valith main bank', 'Bank', 'PKR', 150000, 'Used for client payments and tool expenses.'),
('ca000000-0000-0000-0000-000000000002', 'Cash / wallet', 'Cash', 'PKR', 5000, 'Use for transport, petrol, food/meetings.');

-- 5. Insert Organizations
INSERT INTO organizations (id, name, industry, segment, location, country, city, source_channel, notes) VALUES
('b0000000-0000-0000-0000-000000000001', 'Optimize Digital', 'Digital Marketing', 'A2 RFP Active', 'Islamabad, Pakistan', 'Pakistan', 'Islamabad', 'Meeting', 'First official Valith RFP Intelligence client. Warm lead from Blue Area.'),
('b0000000-0000-0000-0000-000000000002', 'MARCEM Event Solution', 'Event Management', 'A2 RFP Active', 'Islamabad/Karachi, Pakistan', 'Pakistan', NULL, 'LinkedIn', 'Event management company. Active with NLC/DP World, SMJ, KPT, GIKI.'),
('b0000000-0000-0000-0000-000000000003', 'Franchise Mavericks', 'Franchising', 'Foreign Lead', 'United States', 'United States', NULL, 'Email', 'Intake screening qualification automation lead.'),
('b0000000-0000-0000-0000-000000000004', 'Lumenex Advisory', 'Management Consulting', 'Foreign Partner', 'United States', 'United States', NULL, 'LinkedIn', 'Implementation partner track. Strategic advisory.'),
('b0000000-0000-0000-0000-000000000005', 'AlMikial', 'Legal Tech', 'Foreign Strategic', 'Saudi Arabia', 'Saudi Arabia', NULL, 'LinkedIn', 'Saudi regulatory/legal infrastructure network.'),
('b0000000-0000-0000-0000-000000000006', 'Protribes Pvt. Ltd.', 'Marketing / Events', 'A2 RFP Active', 'Pakistan', 'Pakistan', NULL, 'LinkedIn', 'CEO Ahmad Javad. Bid-linked awareness campaigns.'),
('b0000000-0000-0000-0000-000000000007', 'MarCom-related Agency', 'Marketing Services', 'A2 RFP Active', 'Pakistan', 'Pakistan', NULL, 'LinkedIn', 'Existing provider active, pitch tender intelligence.'),
('b0000000-0000-0000-0000-000000000008', 'HRUK / Winston Technology Zone', 'Technology Zone', 'Strategic', 'Pakistan', 'Pakistan', NULL, 'LinkedIn', 'Farhan Qureshi. Operations, client acquisition workflow.'),
('b0000000-0000-0000-0000-000000000009', 'Prestige Group of Companies', 'Corporate Events', 'A2 RFP Active', 'Pakistan', 'Pakistan', NULL, 'LinkedIn', 'Syed Adnan Haider. Project execution and events.'),
('b0000000-0000-0000-0000-000000000010', 'Topline PR', 'Public Relations', 'A4 Workflow Fit', 'Pakistan', 'Pakistan', NULL, 'LinkedIn', 'Relies on WhatsApp inbound/relationships, not tenders.'),
('b0000000-0000-0000-0000-000000000011', 'PR-media network', 'Media', 'Market Insight', 'Pakistan', 'Pakistan', NULL, 'LinkedIn', 'Jahangir Nazar. PR and corporate communications.'),
('b0000000-0000-0000-0000-000000000012', 'AW Events', 'Event Management', 'A3 Smaller RFP Active', 'Pakistan', 'Pakistan', NULL, 'WhatsApp', 'Muhammad Waheed Ensari. Requested demo.'),
('b0000000-0000-0000-0000-000000000013', 'Flux Event Management', 'Event Management', 'A3 Smaller RFP Active', 'Pakistan', 'Pakistan', NULL, 'LinkedIn', 'Pending demo video.'),
('b0000000-0000-0000-0000-000000000014', 'Atlas', 'Other', 'Archived / Cold', 'Pakistan', 'Pakistan', NULL, 'LinkedIn', 'Najam. Misunderstood outreach as email marketing.'),
('b0000000-0000-0000-0000-000000000015', 'ZB', 'Other', 'Archived / Cold', 'Pakistan', 'Pakistan', NULL, 'LinkedIn', 'Mahad. Dead archived lead.'),
('b0000000-0000-0000-0000-000000000016', 'UnizConnect', 'Other', 'Archived / Cold', 'Pakistan', 'Pakistan', NULL, 'LinkedIn', 'Ayesha. Seen but cold.'),
('b0000000-0000-0000-0000-000000000017', 'Momentum PR', 'Public Relations', 'Connector', 'Pakistan', 'Pakistan', NULL, 'LinkedIn', 'Hasan Zuberi. PR/policy connector.'),
('b0000000-0000-0000-0000-000000000018', 'GHL Properties', 'Real Estate', 'A4 Workflow Fit', 'Pakistan', 'Pakistan', NULL, 'LinkedIn', 'Ghulam Hadi Lakho. Real estate Pakistan/GCC.'),
('b0000000-0000-0000-0000-000000000019', 'MyTravel.pk', 'Travel', 'A4 Workflow Fit', 'Pakistan', 'Pakistan', NULL, 'LinkedIn', 'Ahsan Bhatti. Travel agency WhatsApp query flow.'),
('b0000000-0000-0000-0000-000000000020', 'Misix Communication', 'Support / Call Center', 'A4 Workflow Fit', 'Pakistan', 'Pakistan', NULL, 'LinkedIn', 'Muhammad Islam. Eon inbox support workflow fit.'),
('b0000000-0000-0000-0000-000000000021', 'Procurement Consulting', 'Supply Chain', 'Market Insight', NULL, NULL, NULL, 'LinkedIn', 'Dirk Meuzelaar. Procurement insight.');

-- 6. Insert Contacts
INSERT INTO contacts (id, organization_id, full_name, role_title, email, relationship_strength, decision_role) VALUES
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Imran Ghazali', 'Founder & CEO', 'imran@optimizedigital.pk', 'Strong', 'Economic Buyer'),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Sheraz Akber Ali', 'Operations / Sales', NULL, 'Warm', 'Influencer'),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'Hil Hamer', 'Founder', NULL, 'Warm', 'Economic Buyer'),
('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'Karina Lupercio', 'Founder', NULL, 'Warm', 'Economic Buyer'),
('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'Jeanina Awni', 'Founder / Coordinator', NULL, 'Warm', 'Influencer'),
('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000005', 'Hind AlMukhtar', 'Managing Director', 'h.almukhtar@almikial.com.sa', 'Cold', 'Economic Buyer'),
('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000006', 'Ahmad Javad', 'CEO', 'Info@protribes.com', 'Warm', 'Economic Buyer'),
('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000007', 'Sardar', 'Operations Manager', NULL, 'Cold', 'Influencer'),
('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000008', 'Farhan Qureshi', 'Director', NULL, 'Warm', 'Unknown'),
('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000009', 'Syed Adnan Haider', 'Managing Director', NULL, 'Cold', 'Unknown'),
('c0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000011', 'Jahangir Nazar', 'Director', NULL, 'Cold', 'Unknown'),
('c0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000012', 'Muhammad Waheed Ensari', 'Founder', NULL, 'Cold', 'Unknown'),
('c0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000014', 'Najam', 'Director', NULL, 'Cold', 'Unknown'),
('c0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000015', 'Mahad', 'Founder', NULL, 'Cold', 'Unknown'),
('c0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000016', 'Ayesha', 'Founder', NULL, 'Cold', 'Unknown'),
('c0000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000017', 'Hasan Zuberi', 'Partner', NULL, 'Warm', 'Unknown'),
('c0000000-0000-0000-0000-000000000018', 'b0000000-0000-0000-0000-000000000018', 'Ghulam Hadi Lakho', 'Founder', NULL, 'Cold', 'Unknown'),
('c0000000-0000-0000-0000-000000000019', 'b0000000-0000-0000-0000-000000000019', 'Ahsan Bhatti', 'Founder', NULL, 'Cold', 'Unknown'),
('c0000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000020', 'Muhammad Islam', 'Founder', NULL, 'Cold', 'Unknown'),
('c0000000-0000-0000-0000-000000000021', 'b0000000-0000-0000-0000-000000000021', 'Dirk Meuzelaar', 'Procurement Specialist', NULL, 'Cold', 'Unknown');

-- 7. Insert Leads
INSERT INTO leads (
    id, organization_id, primary_contact_id, lead_name, source_channel, segment, offer_angle,
    stage, status, priority, probability_percent, deal_value_estimate, monthly_retainer_estimate,
    next_action, next_follow_up_date, pain_points, buying_signals, objections, notes
) VALUES
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Optimize Digital Project', 'Manual', 'A2 RFP Active', 'RFP Intelligence', 'Closed Won', 'Closed', 'High', 100, 150000, 0, 'Wait for payment clearance/update on Thursday. Start setup/deployment only after actual funds clear.', NULL, NULL, 'SOW signed, invoice acknowledged, payment timeline given.', NULL, 'First official Valith RFP Intelligence client. Warm lead from April 9 meeting.'),
('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'MARCEM RFP Intelligence', 'LinkedIn', 'A2 RFP Active', 'RFP Intelligence', 'Replied', 'Waiting', 'High', 40, 225000, 45000, 'Do not chase today. Tomorrow send clean reset asking for proper meeting time and office pin.', '2026-06-04', 'GIKI tender workflow manual processing, requirements extraction.', 'Asked for demo, had call, discussed tender workflow, GIKI tender.', 'Sheraz may not be economic buyer. Scheduling is poor.', 'MARCEM is an event management company. Sheraz is operations/sales/tenders.'),
('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Franchise Mavericks Intake Automation', 'Email', 'Foreign Lead', 'Lead Qualification', 'Meeting Scheduled', 'Active', 'High', 30, 560000, 140000, 'Book/confirm June 8 call if not fully confirmed. Prepare discovery questions.', '2026-06-08', 'Franchise inquiry forms leading to 15 to 30 minute manual qualification calls.', 'Replied to cold email and invited booking.', NULL, 'Cold plain-text email worked. Calendly event is scheduled.'),
('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 'Lumenex Partnership', 'LinkedIn', 'Foreign Partner', 'Partnership', 'Meeting Scheduled', 'Active', 'High', 25, 0, 0, 'Prepare call brief before June 12. Focus on small pilot inside Lumenex or client workflow.', '2026-06-11', NULL, NULL, NULL, 'Strategic foreign partner lead. Meeting moved to June 12.'),
('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000006', 'AlMikial Market Discovery', 'LinkedIn', 'Foreign Strategic', 'Other', 'Routed to Contact', 'Active', 'Medium', 15, 0, 0, 'Reply to Hind requesting June 11 instead of June 10 if needed.', '2026-06-03', NULL, NULL, NULL, 'Jeanina routed Aimel to Hind. Strategic discovery lead, legal-tech Saudi network.'),
('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000007', 'Protribes RFP Intelligence', 'LinkedIn', 'A2 RFP Active', 'RFP Intelligence', 'Replied', 'Waiting', 'Medium', 25, 225000, 45000, 'No more message today. If no reply in 24 to 48 hours, follow up on LinkedIn.', '2026-06-05', NULL, 'Fast CEO reply, requested details.', 'Info@ can bury email.', 'Details email sent. LinkedIn anchor sent.'),
('d0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000008', 'Sardar MarCom bid-work', 'LinkedIn', 'A2 RFP Active', 'RFP Intelligence', 'SOW Sent', 'Waiting', 'Medium', 15, 225000, 45000, 'Do not chase today. Tomorrow or later send follow up with demo offer.', '2026-06-04', NULL, 'Asked for proposal and saw it.', 'Existing provider objection.', 'Existing provider active, pitch tender intelligence.'),
('d0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000009', 'HRUK Partner Pipeline', 'LinkedIn', 'Strategic', 'Other', 'Messaged', 'Waiting', 'Medium', 15, 0, 0, 'Wait. If reply comes, angle around partner/client acquisition, CRM, follow-ups.', NULL, NULL, 'Warm previous reply.', NULL, 'Warm previous reply. Fresh Google Meet CTA sent.'),
('d0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000010', 'Prestige Group Events', 'LinkedIn', 'A2 RFP Active', 'RFP Intelligence', 'Messaged', 'Waiting', 'Medium', 15, 0, 0, 'Follow up after enough time only if opened or engaged.', NULL, NULL, NULL, NULL, 'Corporate event lead. DM and voice note sent.'),
('d0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000010', NULL, 'Topline PR Workflow', 'LinkedIn', 'A4 Workflow Fit', 'WhatsApp Workflow', 'Cold', 'Cold', 'Low', 10, 0, 0, 'Do not force RFP angle. Revisit later with WhatsApp/inbound workflow.', NULL, NULL, 'Call suggested inbound WhatsApp focus.', NULL, 'Initially PR firm had RFP interest, lesson: service match does not mean procurement activity.'),
('d0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000011', 'Jahangir Nazar Insights', 'LinkedIn', 'Market Insight', 'Other', 'Replied', 'Active', 'Low', 5, 0, 0, 'Clarify PR/media workflow research conversation request.', NULL, NULL, NULL, NULL, 'PR/media network connector. Vague ask led to question mark reply.'),
('d0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000012', 'AW Events Demo', 'WhatsApp', 'A3 Smaller RFP Active', 'RFP Intelligence', 'Demo Sent', 'Waiting', 'Medium', 10, 0, 0, 'If demo not already sent, send generic RFP Intelligence demo.', NULL, NULL, 'Replied to WhatsApp requesting demo.', NULL, 'Replied to WhatsApp outreach with send across.'),
('d0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000013', NULL, 'Flux Event Demo', 'LinkedIn', 'A3 Smaller RFP Active', 'RFP Intelligence', 'Demo Sent', 'Waiting', 'Low', 10, 0, 0, 'Send demo when capacity allows.', NULL, NULL, NULL, NULL, 'Pending side lead.'),
('d0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000014', 'Atlas Outreach', 'LinkedIn', 'Archived / Cold', 'Other', 'Closed Lost', 'Archived', 'Low', 0, 0, 0, 'Archive unless he re-engages.', NULL, NULL, NULL, 'Outreach misunderstood as email marketing.', 'Replied that they are not interested because their niche does not respond well to email marketing.'),
('d0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000015', 'ZB Outreach', 'LinkedIn', 'Archived / Cold', 'Other', 'Cold', 'Archived', 'Low', 0, 0, 0, NULL, NULL, NULL, NULL, NULL, 'No replies after voice notes and follow-ups. Dead archived lead.'),
('d0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000016', 'UnizConnect Ayesha', 'LinkedIn', 'Archived / Cold', 'Other', 'Cold', 'Cold', 'Low', 0, 0, 0, NULL, NULL, NULL, 'Seen but cold.', NULL, 'Left Aimel on seen while actively posting.'),
('d0000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000017', 'Hasan Zuberi PR-policy', 'LinkedIn', 'Connector', 'Other', 'Messaged', 'Waiting', 'Low', 5, 0, 0, 'Selective follow-up only after enough time.', NULL, NULL, NULL, NULL, 'PR/policy/Momentum PR connector. Opened but no reply.'),
('d0000000-0000-0000-0000-000000000018', 'b0000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000018', 'Ghulam Hadi real estate', 'LinkedIn', 'A4 Workflow Fit', 'WhatsApp Workflow', 'Messaged', 'Waiting', 'Low', 5, 0, 0, 'Follow up selectively later.', NULL, NULL, NULL, NULL, 'Real estate Pakistan/GCC. Opened but no reply.'),
('d0000000-0000-0000-0000-000000000019', 'b0000000-0000-0000-0000-000000000019', 'c0000000-0000-0000-0000-000000000019', 'Ahsan Bhatti Travel agency', 'LinkedIn', 'A4 Workflow Fit', 'WhatsApp Workflow', 'Messaged', 'Waiting', 'Low', 5, 0, 0, 'Wait.', NULL, NULL, NULL, NULL, 'Travel agency WhatsApp inquiry flow. Opened but no reply.'),
('d0000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000020', 'c0000000-0000-0000-0000-000000000020', 'Muhammad Islam support flow', 'LinkedIn', 'A4 Workflow Fit', 'Inbox Automation', 'Messaged', 'Waiting', 'Low', 5, 0, 0, 'Follow up later if engaged.', NULL, NULL, NULL, NULL, 'Misix Communication. Eon support inbox workflow fit.'),
('d0000000-0000-0000-0000-000000000021', 'b0000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000021', 'Dirk Meuzelaar procurement validation', 'LinkedIn', 'Market Insight', 'Other', 'Messaged', 'Waiting', 'Low', 5, 0, 0, 'Wait.', NULL, NULL, NULL, NULL, 'Procurement/supply chain validation.');

-- 8. Insert Deals
INSERT INTO deals (
    id, lead_id, organization_id, deal_name, offer_type, stage,
    setup_fee_amount, retainer_amount, currency, probability_percent, expected_close_date, closed_date, status, notes
) VALUES
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Optimize Digital RFP Intelligence', 'RFP Intelligence', 'Closed Won', 150000, 0, 'PKR', 100, NULL, '2026-05-22', 'Active', 'First signed client. Delivered setup.'),
('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'MARCEM RFP Intelligence', 'RFP Intelligence', 'Proposal', 225000, 45000, 'PKR', 40, '2026-06-30', NULL, 'Active', 'GIKI tender submit. Awaiting meeting scheduling.'),
('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'Franchise Mavericks Intake Automation', 'Lead Qualification', 'Discovery', 2000, 500, 'USD', 30, '2026-06-30', NULL, 'Active', 'Discovery call booked for June 8.'),
('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 'Protribes RFP Intelligence', 'RFP Intelligence', 'Discovery', 225000, 45000, 'PKR', 25, '2026-06-30', NULL, 'Active', 'Details sent via email.'),
('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', 'Sardar MarCom Tender Intelligence', 'RFP Intelligence', 'Proposal', 225000, 45000, 'PKR', 15, '2026-07-15', NULL, 'Active', 'Existing provider objection.');

-- 9. Insert Tasks
INSERT INTO tasks (
    id, lead_id, organization_id, deal_id, title, description, task_type, due_date, priority, status
) VALUES
('f0000000-0000-0000-0000-000000000001', NULL, NULL, NULL, 'Study for next exam', 'Do not let MARCEM silence hijack exam prep.', 'Admin', '2026-06-03', 'High', 'Open'),
('f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'MARCEM reset follow-up', 'Salam Sheraz bhai, hope you''re doing well. Just checking when it would be convenient to meet properly. I''d prefer to lock a time in advance so I can plan accordingly. Please share the office pin/location whenever you confirm.', 'Follow-up', '2026-06-04', 'High', 'Open'),
('f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'OD payment check', 'Imran said payment after cheque clears Thursday. If no update by reasonable time, send calm follow-up.', 'Payment', '2026-06-04', 'High', 'Open'),
('f0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000005', 'Sardar follow-up with demo CTA', 'Sardar sb, just checking if the proposal was clear. I kept it focused specifically on the RFP/tender intelligence layer, not general tender sourcing. If useful, I can also send a short 2 to 3 minute demo video customized around MarCom/event-agency workflows.', 'Follow-up', '2026-06-04', 'Medium', 'Open'),
('f0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000004', 'Ahmad / Protribes follow-up', 'Ahmad sb, just checking if the email landed properly. I kept it focused on the RFP/tender intelligence workflow and how it differs from simple tender alerts. Happy to share a short demo if relevant.', 'Follow-up', '2026-06-05', 'Medium', 'Open'),
('f0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'Book/confirm Hil call', 'Prepare discovery questions around intake workflow, qualification calls, CRM, Calendly, lead volume, bad-fit percentage and voice vs email/form.', 'Meeting', '2026-06-08', 'High', 'Open'),
('f0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', NULL, 'Reply to Hind for June 11', 'Hi Hind, thank you for sharing. Wednesday, 10 June at 1 PM is a bit tight on my end. Would Thursday, 11 June at the same time work instead? Please feel free to send over the invitation if that is convenient.', 'Follow-up', '2026-06-03', 'Medium', 'Open'),
('f0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', NULL, 'Prepare Jeanina/Hind discovery brief', 'Treat as strategic discovery, not sales pitch. Validate regulated AI implementation gap.', 'Admin', '2026-06-10', 'Medium', 'Open'),
('f0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', NULL, 'Prepare Karina call brief', 'Position Valith as implementation partner for workflow pilots, not offshore dev shop.', 'Admin', '2026-06-11', 'High', 'Open'),
('f0000000-0000-0000-0000-000000000010', NULL, NULL, NULL, 'Update Valith OS daily', 'Every lead interaction should be pasted into AI Capture. Export Founder Brief at end of day.', 'Admin', '2026-06-04', 'Medium', 'Open');

-- 10. Insert Revenue Payments
INSERT INTO revenue_payments (
    id, organization_id, lead_id, deal_id, client_name, revenue_type, amount, currency, status, invoice_sent_date, due_date, received_date, notes
) VALUES
('a2000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Optimize Digital', 'Project', 150000, 'PKR', 'Locked', '2026-05-22', '2026-05-27', NULL, 'First official signed Valith client. Treat payment as locked/received for planning. Delivery starts after actual funds clear.'),
('a2000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000005', 'Sardar / MarCom-related', 'Project', 225000, 'PKR', 'Expected', NULL, NULL, NULL, 'Objection-stage lead due existing provider.');

-- 11. Insert MRR Entries
-- Omitted: No warm leads currently have active/expected MRR retainers set in seed state.

-- 12. Insert Expenses
INSERT INTO expenses (
    id, expense_name, vendor, category, amount, currency, billing_type, payment_status, due_date, notes
) VALUES
('ae000000-0000-0000-0000-000000000001', 'ChatGPT Plus', 'OpenAI', 'Tools', 20, 'USD', 'Monthly', 'Paid', NULL, 'Used for Valith strategy, writing, research, coding assistance.'),
('ae000000-0000-0000-0000-000000000002', 'Claude Pro', 'Anthropic', 'Tools', 20, 'USD', 'Monthly', 'Paid', NULL, 'Used for copywriting, research, design/coding assistance.'),
('ae000000-0000-0000-0000-000000000003', 'valith.tech domain', 'Namecheap', 'Domain', 12, 'USD', 'Yearly', 'Paid', '2026-12-31', 'Valith domain and email identity.'),
('ae000000-0000-0000-0000-000000000004', 'Supabase / Vercel / Hosting', 'Supabase', 'Hosting', 0, 'USD', 'Monthly', 'Paid', NULL, 'Valith OS and demos. Free tier.'),
('ae000000-0000-0000-0000-000000000005', 'Gemini / Google AI', 'Google Cloud', 'Tools', 0, 'USD', 'Monthly', 'Paid', NULL, 'Used for Valith OS AI capture and research. Free tier.'),
('ae000000-0000-0000-0000-000000000006', 'Transport / Client meetings', 'Local', 'Transport', 1000, 'PKR', 'One-time', 'Upcoming', '2026-06-04', 'Bike petrol for client meetings, especially MARCEM DHA/Islamabad-side trip.'),
('ae000000-0000-0000-0000-000000000007', 'Meta Ads Test', 'Meta', 'Ads', 5000, 'PKR', 'One-time', 'Cancelled', NULL, 'Planned WhatsApp AI workflow assistant test. Stated as cancelled so it doesn''t affect burn rates until launched.'),
('ae000000-0000-0000-0000-000000000008', 'Coworking Seat', 'Cowork Space', 'Coworking', 10000, 'PKR', 'Monthly', 'Cancelled', NULL, 'Planned coworking seat. Stated as cancelled so it doesn''t affect burn rates until OD cash clears.');

-- 13. Insert Documents
INSERT INTO documents (
    id, organization_id, lead_id, deal_id, title, document_type, file_url, status, notes
) VALUES
('ad000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Optimize Digital SOW', 'SOW', NULL, 'Signed', 'Signed SOW for first client.'),
('ad000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Optimize Digital Invoice', 'Invoice', NULL, 'Sent', 'Invoice sent for payment clearance.'),
('ad000000-0000-0000-0000-000000000003', NULL, NULL, NULL, 'RFP Intelligence Demo Video', 'Demo', NULL, 'Draft', 'Valith general sales demo video.'),
('ad000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000005', 'Valith RFP/Tender Intelligence One-page Proposal PDF', 'Proposal', NULL, 'Sent', 'Proposal PDF sent to Sardar.'),
('ad000000-0000-0000-0000-000000000005', NULL, NULL, NULL, 'Valith RFP/Tender Intelligence Proposal DOCX', 'Proposal', NULL, 'Draft', 'Editable template proposal.'),
('ad000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'Hil Cold Email Copy', 'Notes', NULL, 'Sent', 'Cold outbound copy that converted.'),
('ad000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000004', 'Protribes Details Email', 'Notes', NULL, 'Sent', 'Details sent via info@protribes.com.'),
('ad000000-0000-0000-0000-000000000008', NULL, NULL, NULL, 'Valith Landing Page', 'Other', NULL, 'Draft', 'Public facing landing page.'),
('ad000000-0000-0000-0000-000000000009', NULL, NULL, NULL, 'Valith OS', 'Other', NULL, 'Draft', 'Internal Command Center system docs.');
