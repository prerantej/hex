-- Enable pg_trgm for fast ILIKE/word-similarity searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes for search fields
CREATE INDEX IF NOT EXISTS submission_journey_trgm ON "Submission" USING GIN ("journey" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS submission_role_trgm ON "Submission" USING GIN ("roleTitle" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS company_name_trgm ON "Company" USING GIN ("name" gin_trgm_ops);
