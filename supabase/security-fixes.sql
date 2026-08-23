-- SHAKS CMS V1.0.0 compatibility migration
-- The V1.0.0 baseline is now secured directly in schema.sql and storage.sql.
-- Existing installations created from an earlier build should still run this file once.
-- It installs the admin_users allow-list and admin-only policies from the previous migration.
-- For a fresh installation, run schema.sql then storage.sql; this file is not required.

-- For existing databases, use the prior security migration retained in your project history.
