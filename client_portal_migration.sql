-- Valith OS - Client Portal Database Migration
-- Adds client access tokens and secure RPC data query function

-- 1. Add client_token UUID column to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS client_token UUID DEFAULT uuid_generate_v4() UNIQUE;

-- 2. Ensure all existing organizations have a client token populated
UPDATE organizations SET client_token = uuid_generate_v4() WHERE client_token IS NULL;

-- 3. Create the get_client_portal_data function
CREATE OR REPLACE FUNCTION get_client_portal_data(p_token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS to query tables securely without exposing public read
AS $$
DECLARE
    v_org_id UUID;
    v_result JSONB;
BEGIN
    -- Find the organization associated with the client token
    SELECT id INTO v_org_id FROM organizations WHERE client_token = p_token;
    
    -- If no organization matches the token, return an error
    IF v_org_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid portal access token');
    END IF;
    
    -- Assemble the secure, client-friendly JSON payload
    SELECT jsonb_build_object(
        'success', true,
        'organization', (
            SELECT row_to_json(o) FROM (
                SELECT id, name, website, industry, segment, location, country, city, created_at 
                FROM organizations 
                WHERE id = v_org_id
            ) o
        ),
        'contacts', COALESCE((
            SELECT jsonb_agg(row_to_json(c)) FROM (
                SELECT id, full_name, role_title, email, phone, whatsapp, linkedin_url
                FROM contacts 
                WHERE organization_id = v_org_id
            ) c
        ), '[]'::jsonb),
        'leads', COALESCE((
            SELECT jsonb_agg(row_to_json(l)) FROM (
                SELECT id, lead_name, stage, status, priority, next_action, next_follow_up_date, next_meeting_at, meeting_type, meeting_status
                FROM leads 
                WHERE organization_id = v_org_id
            ) l
        ), '[]'::jsonb),
        'deals', COALESCE((
            SELECT jsonb_agg(row_to_json(d)) FROM (
                SELECT id, deal_name, offer_type, stage, setup_fee_amount, retainer_amount, currency, expected_close_date, status
                FROM deals 
                WHERE organization_id = v_org_id
            ) d
        ), '[]'::jsonb),
        'tasks', COALESCE((
            SELECT jsonb_agg(row_to_json(t)) FROM (
                SELECT id, title, description, task_type, due_date, priority, status
                FROM tasks 
                WHERE organization_id = v_org_id OR lead_id IN (SELECT id FROM leads WHERE organization_id = v_org_id)
            ) t
        ), '[]'::jsonb),
        'payments', COALESCE((
            SELECT jsonb_agg(row_to_json(p)) FROM (
                SELECT id, revenue_type, amount, currency, status, invoice_sent_date, due_date, received_date, notes
                FROM revenue_payments 
                WHERE organization_id = v_org_id
            ) p
        ), '[]'::jsonb),
        'mrr_entries', COALESCE((
            SELECT jsonb_agg(row_to_json(m)) FROM (
                SELECT id, service_name, monthly_amount, currency, status, start_date, next_billing_date, notes
                FROM mrr_entries 
                WHERE organization_id = v_org_id
            ) m
        ), '[]'::jsonb),
        'documents', COALESCE((
            SELECT jsonb_agg(row_to_json(doc)) FROM (
                SELECT id, title, document_type, file_url, status, sent_date, notes
                FROM documents 
                WHERE organization_id = v_org_id AND status != 'Draft'
            ) doc
        ), '[]'::jsonb)
    ) INTO v_result;
    
    RETURN v_result;
END;
$$;
