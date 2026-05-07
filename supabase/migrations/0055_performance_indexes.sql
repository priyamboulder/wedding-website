-- Improve query performance on date-filtered transaction lookups
-- Note: couple_id index already exists (finance_transactions_couple_idx from 0010)
CREATE INDEX IF NOT EXISTS idx_finance_transactions_paid_at
  ON finance_transactions(couple_id, paid_at);
