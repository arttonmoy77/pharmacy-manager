# Phase 1 foundation status

## What is in this copy

The original desktop source and its existing web UI are copied into this folder; no live JSON data, `.venv`, build outputs, or executables were copied. The new `api` folder adds a separate FastAPI/PostgreSQL foundation with:

- SQLAlchemy models and an Alembic initial migration for users, tenants, branches, membership roles, and audit events.
- Email/password sign-in using Argon2 hashes and short-lived signed bearer tokens.
- Tenant and branch scoped routes, branch creation permissions, explicit country/currency/timezone fields, and request IDs in logs/audit events.
- Local development container configuration, health/readiness endpoints, first-owner setup, and documented PostgreSQL dump/restore scripts.

## Exit criteria

**Phase 1 is not complete.** The project is a source scaffold, not a deployed service. No PostgreSQL instance, staging environment, cloud secrets, domain, TLS certificate, or backup destination was provisioned. No database migration, authentication flow, tenant-isolation check, or restore drill was run. The current access controls must be reviewed and proven before real data is used.

Remaining exit work:

1. Confirm country, pilot footprint, connectivity, roles, and data handling from the Phase 0 decisions.
2. Install dependencies and run the migration against a disposable PostgreSQL database; fix any schema/runtime issues found.
3. Add and run positive and negative tenant/branch isolation checks, login checks, and audit checks.
4. Select staging hosting; provision TLS, managed secrets, restricted database networking, logs/alerts, and a backup/retention policy.
5. Run a staging backup/restore drill and record the recovered row counts and elapsed recovery time.
6. Review authentication, rate limits, password recovery, permissions, database privileges, and audit retention with a security reviewer.

No production or pilot pharmacy records should be imported into this scaffold until those items are complete and the owner approves the Phase 0 workflow/data decisions.
