-- Add dedupe_hash column for duplicate transaction detection
ALTER TABLE finance_transactions
  ADD COLUMN IF NOT EXISTS dedupe_hash text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_finance_transactions_dedupe_hash
  ON finance_transactions(dedupe_hash)
  WHERE dedupe_hash IS NOT NULL;
