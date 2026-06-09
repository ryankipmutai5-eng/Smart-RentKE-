-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current tenant_id from JWT/Auth
-- This assumes a 'tenant_id' claim is present in the JWT or we look it up from users table
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS uuid AS $$
  -- Option 1: Lookup from users table (safer but slower)
  -- SELECT tenant_id FROM users WHERE id = auth.uid();
  
  -- Option 2: Get from JWT claim (faster, requires Supabase setup)
  SELECT coalesce(
    nullif(current_setting('request.jwt.claims', true)::json->>'tenant_id', '')::uuid,
    (SELECT tenant_id FROM users WHERE id = auth.uid())
  );
$$ LANGUAGE sql STABLE;

-- 1. tenants
CREATE POLICY "Users can view their own tenant" ON tenants
FOR SELECT USING (id = current_tenant_id());

CREATE POLICY "Admins can update their own tenant" ON tenants
FOR UPDATE USING (id = current_tenant_id())
WITH CHECK (id = current_tenant_id());

-- 2. users
CREATE POLICY "Users can view others in organization" ON users
FOR SELECT USING (tenant_id = current_tenant_id());

CREATE POLICY "Admins can manage organization users" ON users
FOR ALL USING (tenant_id = current_tenant_id());

-- 3. properties
CREATE POLICY "Tenant access to properties" ON properties
FOR ALL USING (tenant_id = current_tenant_id());

-- 4. units
CREATE POLICY "Tenant access to units" ON units
FOR ALL USING (tenant_id = current_tenant_id());

-- 5. tenants_profile
CREATE POLICY "Tenant access to profiles" ON tenants_profile
FOR ALL USING (tenant_id = current_tenant_id());

-- 6. leases
CREATE POLICY "Tenant access to leases" ON leases
FOR ALL USING (tenant_id = current_tenant_id());

-- 7. rent_payments
CREATE POLICY "Tenant access to payments" ON rent_payments
FOR ALL USING (tenant_id = current_tenant_id());

-- 8. maintenance_tickets
CREATE POLICY "Tenant access to tickets" ON maintenance_tickets
FOR ALL USING (tenant_id = current_tenant_id());

-- 9. whatsapp_conversations
CREATE POLICY "Tenant access to conversations" ON whatsapp_conversations
FOR ALL USING (tenant_id = current_tenant_id());

-- 10. whatsapp_messages
CREATE POLICY "Tenant access to messages" ON whatsapp_messages
FOR ALL USING (tenant_id = current_tenant_id());

-- 11. notifications
CREATE POLICY "Tenant access to notifications" ON notifications
FOR ALL USING (tenant_id = current_tenant_id());

-- 12. audit_logs
CREATE POLICY "Tenant access to audit logs" ON audit_logs
FOR SELECT USING (tenant_id = current_tenant_id());

CREATE POLICY "System can insert audit logs" ON audit_logs
FOR INSERT WITH CHECK (tenant_id = current_tenant_id());
