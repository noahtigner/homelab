#!/usr/bin/env bash
set -euo pipefail

N8N_PASSWORD="$(tr -d '\r\n' < /run/secrets/n8n_postgres_password)"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<EOF
DO
\$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'n8n') THEN
    CREATE ROLE n8n LOGIN PASSWORD '${N8N_PASSWORD}';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE n8n OWNER n8n'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'n8n')\gexec

GRANT ALL PRIVILEGES ON DATABASE n8n TO n8n;
EOF
