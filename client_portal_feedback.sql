-- Valith OS - Client Portal Feedback RPC Function
-- Enables secure, token-validated feedback submission creating high-priority CRM tasks

CREATE OR REPLACE FUNCTION submit_client_feedback(
    p_token UUID,
    p_title TEXT,
    p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS to query/insert securely without exposing public write access
AS $$
DECLARE
    v_org_id UUID;
    v_org_name TEXT;
    v_task_id UUID;
BEGIN
    -- Resolve token to organization
    SELECT id, name INTO v_org_id, v_org_name FROM organizations WHERE client_token = p_token;
    
    IF v_org_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid access token');
    END IF;
    
    -- Generate UUID for the task
    v_task_id := uuid_generate_v4();
    
    -- Insert a high-priority task for the founder
    INSERT INTO tasks (
        id,
        organization_id,
        title,
        description,
        task_type,
        priority,
        status,
        due_date,
        created_at,
        updated_at
    ) VALUES (
        v_task_id,
        v_org_id,
        '[Client Request] ' || p_title,
        'Submitted by ' || v_org_name || ': ' || p_description,
        'Admin',
        'High',
        'Open',
        CURRENT_DATE,
        NOW(),
        NOW()
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'task_id', v_task_id,
        'message', 'Feedback successfully received and queued'
    );
END;
$$;
