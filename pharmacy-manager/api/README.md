# Pharmacy Manager API foundation

This folder is the separate Phase 1 hosted-platform starter. It does not replace or modify the Windows desktop app in this copy’s root. It contains a FastAPI service, PostgreSQL schema and Alembic migration, email/password sign-in, tenant and branch membership checks, audit-event storage, health endpoints, and local Docker Compose configuration.

## Local development

1. Install Docker Desktop with Compose.
2. Copy `.env.example` to `.env`. Set a local database password and a random `JWT_SECRET_KEY` of at least 32 characters. Keep the database URL credentials in sync with the `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` values. The example uses URL-safe characters in the password.
3. From this `api` folder, run `docker compose up --build`.
4. In another terminal, run `docker compose exec api python -m scripts.bootstrap_tenant`. This securely prompts for the first business, branch, timezone, owner email, and owner password. It refuses to create a second initial tenant.
5. Open `http://127.0.0.1:8000/docs`. Sign in at `POST /auth/token` using the owner email and password, then use the returned bearer token for `/auth/me` and branch endpoints.

The Compose file binds ports to localhost and is for development only. It is not a production deployment recipe. The service runs Alembic migrations on container startup for this single-instance development setup; staging/production should run migrations as a controlled one-off deployment step.

## Foundation model

- `users` stores normalized email addresses and Argon2 password hashes.
- `tenants` represents the pharmacy business; `branches` belong to one tenant and require explicit country, currency, and IANA timezone configuration.
- Tenant and branch membership tables hold roles separately. Branch reads require active membership in both scopes; branch creation requires a tenant owner or admin.
- `audit_events` stores append-oriented event records with actor, tenant, optional branch, request ID, action, and a small allow-listed details object.
- JWT access tokens expire after a short configured period. API code loads current user and membership status from PostgreSQL rather than trusting role claims in a token.

The initial routes are deliberately small: health/live, health/ready, authentication, current user, tenant branch listing/creation, and branch context. Inventory, purchasing, sales, payments, shifts, and the existing desktop JSON import are not connected yet.

## Backup and restore

`scripts/backup.sh` creates a private-format PostgreSQL dump through the local Compose database service. `scripts/restore.sh` requires typing `RESTORE` because it replaces database contents. Before a restore, stop writes and take a safety backup. Rehearse recovery into staging and record recovery time before using a hosted pilot.

The local scripts do not provide off-site retention, encryption-at-rest configuration, scheduled backups, alerting, or a completed restore drill. Configure those in the selected hosting environment before real pharmacy data is loaded.

## Security and deployment limits

- Use HTTPS and a managed secret store in staging/production. Never use the example key or development database password outside a local environment.
- There is no login throttling, password-reset/invitation flow, MFA, refresh-token revocation, complete permission matrix, or security review yet.
- Tenant and branch scopes are enforced in the present route queries and relational keys. Isolation is not considered proven until negative cross-tenant/branch checks are run and reviewed.
- Audit records are not yet protected by a separate database role or tamper-evident storage. Do not log credentials or full sensitive request bodies.
- The country and tax-related behavior remain unset. Confirm the operating jurisdiction and local requirements before configuring a pilot.

## References

- [FastAPI OAuth2, JWT, and password hashing](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/)
- [SQLAlchemy 2.0 session basics](https://docs.sqlalchemy.org/en/20/orm/session_basics.html)
- [Alembic migration tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [PostgreSQL backup documentation](https://www.postgresql.org/docs/current/backup.html)
