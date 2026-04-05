-- ============================================================================
-- Supabase CENTRAL setup for MoreHub
-- Run this in your CENTRAL Supabase SQL Editor
-- (morehub-central project)
-- ============================================================================

-- 1. Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- 2. Activation codes table
CREATE TABLE IF NOT EXISTS activation_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  used_by_device_id TEXT,          -- filled on first use
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE activation_codes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_activation_codes_code ON activation_codes(code);

-- 3. Business connections — maps each business to its Data Supabase instance
CREATE TABLE IF NOT EXISTS business_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  data_url TEXT NOT NULL,          -- e.g. https://xxxxx.supabase.co
  data_anon_key TEXT NOT NULL,     -- anon key for the data project
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE business_connections ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_business_connections_business
  ON business_connections(business_id);

-- 4. RPC function to validate and consume an activation code atomically
--    Now also returns the data_url + data_anon_key for cloud sync.
CREATE OR REPLACE FUNCTION validate_activation_code(
  p_code TEXT,
  p_device_id TEXT,
  p_device_info JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record activation_codes%ROWTYPE;
  v_conn  business_connections%ROWTYPE;
BEGIN
  -- Find the code
  SELECT * INTO v_record
  FROM activation_codes
  WHERE code = p_code;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_code');
  END IF;

  IF v_record.used_by_device_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_used');
  END IF;

  IF v_record.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'expired');
  END IF;

  -- Consume the code
  UPDATE activation_codes
  SET used_by_device_id = p_device_id,
      used_at = now()
  WHERE id = v_record.id;

  -- Lookup data connection
  SELECT * INTO v_conn
  FROM business_connections
  WHERE business_id = v_record.business_id;

  RETURN jsonb_build_object(
    'success', true,
    'business_id', v_record.business_id,
    'data_url',      COALESCE(v_conn.data_url, ''),
    'data_anon_key', COALESCE(v_conn.data_anon_key, '')
  );
END;
$$;

-- 5. RPC to fetch data connection at any time (not just activation).
--    Verifies the device was actually activated for this business.
CREATE OR REPLACE FUNCTION get_data_connection(
  p_business_id UUID,
  p_device_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valid BOOLEAN;
  v_conn  business_connections%ROWTYPE;
BEGIN
  -- Verify device belongs to this business (was used to consume a code)
  SELECT EXISTS(
    SELECT 1 FROM activation_codes
    WHERE business_id = p_business_id
      AND used_by_device_id = p_device_id
  ) INTO v_valid;

  IF NOT v_valid THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  -- Get connection
  SELECT * INTO v_conn
  FROM business_connections
  WHERE business_id = p_business_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_connection');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'data_url', v_conn.data_url,
    'data_anon_key', v_conn.data_anon_key
  );
END;
$$;

-- 6. RLS policies — only the RPC functions (SECURITY DEFINER) touch these tables
CREATE POLICY "No direct access to businesses"
  ON businesses FOR ALL
  USING (false);

CREATE POLICY "No direct access to activation_codes"
  ON activation_codes FOR ALL
  USING (false);

CREATE POLICY "No direct access to business_connections"
  ON business_connections FOR ALL
  USING (false);
