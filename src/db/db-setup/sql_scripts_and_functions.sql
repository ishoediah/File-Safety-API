-- ============================================================
-- FILE SAFETY API — DATABASE SETUP
-- ============================================================
-- This file documents all manual SQL run in the Supabase SQL editor.
-- Run these statements in order when setting up a fresh database
-- environment (new Supabase project, staging, production, etc.).
-- ============================================================

--NOTE: The tables setup was done through the table editor UI.
--Which is why it has not been added to this documentation.

-- ------------------------------------------------------------
-- 1. COMPOSITE UNIQUE CONSTRAINT on usage_counts
-- ------------------------------------------------------------
-- Ensures there is only ONE row per customer per month.
-- This is what makes the atomic increment safe: it gives the
-- "ON CONFLICT" clause below something to detect a conflict on.
-- Without this, two simultaneous requests could create duplicate
-- rows or lose an increment (a race condition).
ALTER TABLE usage_counts
ADD CONSTRAINT unique_customer_month UNIQUE (customer_id, month);


-- ------------------------------------------------------------
-- 2. ATOMIC USAGE INCREMENT FUNCTION
-- ------------------------------------------------------------
-- Increments a customer's monthly call count by 1 automically.
-- "Atomic" means the read-and-add happens as a single, uninterruptible
-- database operation — so simultaneous requests can never lose a count.
--
-- How it works:
--   - Tries to INSERT a new row with count = 1 (first call of the month).
--   - If a row already exists for this customer + month (the "conflict",
--     detected via the unique constraint above), it instead UPDATES that
--     row, adding 1 to the existing count.
--   - Also updates updated_at to the current time on every call.
--
-- Parameters:
--   p_customer_id : the customer's UUID
--   p_month       : the month as text, format "YYYY-MM" (e.g. "2026-06")
create or replace function increment_usage(p_customer_id uuid, p_month text)
returns void
language sql
as $$
  insert into usage_counts (customer_id, month, count, updated_at)
  values (p_customer_id, p_month, 1, now())
  on conflict (customer_id, month)
  do update set count = usage_counts.count + 1, updated_at = now();
$$;


-- ------------------------------------------------------------
-- 3. TABLE PERMISSIONS (GRANTS)
-- ------------------------------------------------------------
-- The new-style Supabase service key does NOT automatically have
-- permission to read/write tables. Without these grants, every query
-- fails with error 42501 "permission denied for table".
-- These give the service role the access the API needs.
GRANT SELECT, INSERT, UPDATE ON public.api_keys TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.usage_counts TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.request_log TO service_role;


-- ------------------------------------------------------------
-- 4. FUNCTION EXECUTE PERMISSION
-- ------------------------------------------------------------
-- Allows the service role to call the increment_usage function above.
grant execute on function increment_usage(uuid, text) to service_role;


-- ------------------------------------------------------------
-- NOTE: If a fresh setup still fails with permission errors even
-- after the grants above, you may also need:
--   GRANT USAGE ON SCHEMA public TO service_role;
-- ------------------------------------------------------------