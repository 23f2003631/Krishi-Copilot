-- Add telemetry fields for observability and auditing
ALTER TABLE content_variants 
ADD COLUMN IF NOT EXISTS generation_source TEXT,
ADD COLUMN IF NOT EXISTS fallback_reason TEXT;
